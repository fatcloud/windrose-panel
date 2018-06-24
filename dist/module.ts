///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';

import _ from 'lodash';
import moment from 'moment';
import angular from 'angular';
import $ from 'jquery';

import * as Plotly from './lib/plotly.min';

class PlotlyPanelCtrl extends MetricsPanelCtrl {
  static templateUrl = 'templates/module.html';

  sizeChanged: boolean;
  initalized: boolean;
  $tooltip: any;

  defaults = {
    pconfig: {
      mapping: {
        color: null,
        size: null,
      },
      settings: {
        plot: 'scatter',
        displayModeBar: false,
        marker: {
          size: 15,
          symbol: 'circle',
          color: '#33B5E5',
          colorscale: 'YIOrRd',
          sizemode: 'diameter',
          sizemin: 3,
          sizeref: 0.2,
          showscale: true,
        },
        color_option: 'ramp',
        petals: 32,
        wind_speed_interval: 2,
      },
      layout: {
        autosize: false,
        showlegend: true,
        legend: {orientation: 'v'},
        hovermode: 'closest',
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent', // transparent?
        font: {
          color: 'rgb(0,0,0)',
          family: '"Open Sans", Helvetica, Arial, sans-serif',
        },
        polar: {
          radialaxis: {
            angle: 90,
            ticksuffix: '%',
          },
          angularaxis: {
            dtick: 22.5,
            rotation: 0,
            direction: 'counterclockwise',
          },
        },
      },
    },
  };

  traces: any;
  trace: any;
  layout: any;
  graph: any;
  seriesList: Array<any>;
  axis: Array<any>;
  segs: any;
  mouse: any;
  data: any;

  /** @ngInject **/
  constructor($scope, $injector, $window, private $rootScope, private uiSegmentSrv) {
    super($scope, $injector);

    this.sizeChanged = true;
    this.initalized = false;

    this.$tooltip = $('<div id="tooltip" class="graph-tooltip">');

    // defaults configs
    _.defaultsDeep(this.panel, this.defaults);

    // get the css rule of grafana graph axis text
    const labelStyle = this.getCssRule('div.flot-text');
    if (labelStyle) {
      let color = labelStyle.style.color || this.panel.pconfig.layout.font.color;
      // set the panel font color to grafana graph axis text color
      this.panel.pconfig.layout.font.color = 'rgb(110,110,110)'; //color;
    }

    // make color more transparent
    //   color = $.color
    //     .parse(color)
    //     .scale('a', 0.22)
    //     .toString();
    // }

    let cfg = this.panel.pconfig;
    this.trace = {};
    this.traces = [];
    this.layout = $.extend(true, {}, this.panel.pconfig.layout);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('panel-size-changed', this.onResize.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
  }

  getCssRule(selectorText) {
    const styleSheets = document.styleSheets;
    for (let idx = 0; idx < styleSheets.length; idx += 1) {
      const styleSheet = styleSheets[idx] as CSSStyleSheet;
      const rules = styleSheet.cssRules;
      for (let ruleIdx = 0; ruleIdx < rules.length; ruleIdx += 1) {
        const rule = rules[ruleIdx] as CSSStyleRule;
        if (rule.selectorText === selectorText) {
          return rule;
        }
      }
    }
  }

  onResize() {
    this.sizeChanged = true;
    console.log('sz');
  }

  onDataError(err) {
    this.seriesList = [];
    this.render([]);
    console.log('onDataError', err);
  }

  onRefresh() {
    // ignore fetching data if another panel is in fullscreen
    if (this.otherPanelInFullscreenMode()) {
      return;
    }

    if (this.graph && this.initalized) {
      Plotly.redraw(this.graph);
    }
  }

  onInitEditMode() {
    this.addEditorTab(
      'Display',
      'public/plugins/fatcloud-windrose-panel/templates/tab_display.html',
      2
    );
    //  this.editorTabIndex = 1;
    this.refresh();
    this.segs = {
      symbol: this.uiSegmentSrv.newSegment({
        value: this.panel.pconfig.settings.marker.symbol,
      }),
    };

    let cfg = this.panel.pconfig;
    this.axis = [
      {
        disp: 'Angle',
        idx: 1,
        metric: name => {
          if (name) {
            cfg.mapping.x = name;
          }
          return cfg.mapping.x;
        },
      },
      {
        disp: 'Distance',
        idx: 2,
        metric: name => {
          if (name) {
            cfg.mapping.y = name;
          }
          return cfg.mapping.y;
        },
      },
    ];
  }

  onSegsChanged() {
    this.panel.pconfig.settings.marker.symbol = this.segs.symbol.value;
    this.onConfigChanged();

    console.log(this.segs.symbol, this.panel.pconfig);
  }

  onPanelInitalized() {
    this.onConfigChanged();
  }

  onRender() {
    // ignore fetching data if another panel is in fullscreen
    if (this.otherPanelInFullscreenMode() || !this.graph) {
      return;
    }

    ////////////// WORKAROUND NOTICE: move graph down a bit to stop the title from blocking topmost angletick
    let top_padding = 22;
    $('.main-svg').css('padding-top', top_padding.toString() + 'px');

    if (!this.initalized) {
      let options = {
        showLink: false,
        displaylogo: false,
        displayModeBar: this.panel.pconfig.settings.displayModeBar,
        modeBarButtonsToRemove: ['sendDataToCloud'], //, 'select2d', 'lasso2d']
      };

      let data = this.traces;
      let rect = this.graph.getBoundingClientRect();

      this.layout = $.extend(true, {}, this.panel.pconfig.layout);
      this.layout.height = this.height; // - top_padding;
      this.layout.width = rect.width;
      Plotly.newPlot(this.graph, data, this.layout, options);
    } else {
      Plotly.redraw(this.graph);
    }

    if (this.sizeChanged && this.graph && this.layout) {
      let rect = this.graph.getBoundingClientRect();
      this.layout.height = this.height; // - top_padding;
      this.layout.width = rect.width;
      Plotly.Plots.resize(this.graph);
    }

    // if (this.sizeChanged && this.graph && this.layout) {
    //   let rect = this.graph.getBoundingClientRect();
    //   this.layout.width = rect.width;

    //   ////////////// WORKAROUND NOTICE: get rid of this error "Resize must be passed a displayed plot div element."
    //   let e = window.getComputedStyle(this.graph).display;
    //   if (!e || 'none' === e) return;
    //   Plotly.Plots.resize(this.graph);
    // }

    this.sizeChanged = false;
    this.initalized = true;
  }

  onDataSnapshotLoad(snapshot) {
    this.onDataReceived(snapshot);
  }

  onDataReceived(dataList) {
    this.data = {};
    if (dataList.length < 1) {
      console.log('No data', dataList);
    } else {
      let dmapping = {
        x: null,
        y: null,
        z: null,
      };

      // console.log( "plotly data", dataList);
      let cfg = this.panel.pconfig;
      let mapping = cfg.mapping;
      let key = {
        name: '@time',
        type: 'ms',
        missing: 0,
        idx: -1,
        points: [],
      };
      let idx = {
        name: '@index',
        type: 'number',
        missing: 0,
        idx: -1,
        points: [],
      };
      this.data[key.name] = key;
      this.data[idx.name] = idx;
      /////////////////////////////////////////////////////////////// dataList
      for (let i = 0; i < dataList.length; i++) {
        let datapoints: any[] = dataList[i].datapoints;
        if (datapoints.length > 0) {
          let val = {
            name: dataList[i].target,
            type: 'number',
            missing: 0,
            idx: i,
            points: [],
          };
          if (_.isString(datapoints[0][0])) {
            val.type = 'string';
          } else if (_.isBoolean(datapoints[0][0])) {
            val.type = 'boolean';
          }

          // Set the default mapping values
          if (i === 0) {
            dmapping.x = val.name;
          } else if (i === 1) {
            dmapping.y = val.name;
          } else if (i === 2) {
            dmapping.z = val.name;
          }

          /////////////////////////////////////////// this.data['direction'] = ....
          this.data[val.name] = val;
          if (key.points.length === 0) {
            for (let j = 0; j < datapoints.length; j++) {
              key.points.push(datapoints[j][1]);
              val.points.push(datapoints[j][0]);
              idx.points.push(j);
            }
          } else {
            for (let j = 0; j < datapoints.length; j++) {
              if (j >= key.points.length) {
                break;
              }
              // Make sure it is from the same timestamp
              if (key.points[j] === datapoints[j][1]) {
                val.points.push(datapoints[j][0]);
              } else {
                val.missing = val.missing + 1;
              }
            }
          }
        }
      }

      // Maybe overwrite?
      if (!mapping.x) {
        mapping.x = dmapping.x;
      }
      if (!mapping.y) {
        mapping.y = dmapping.y;
      }
      if (!mapping.z) {
        mapping.z = dmapping.z;
      }

      ///////////////////////////////////////// dX, dY ///// REFACTOR ME
      let dX = this.data[mapping.x];
      let dY = this.data[mapping.y];
      let dZ = null;
      let dC = null;
      let dS = null;
      let dT = null;

      if (!dX) {
        throw {message: 'Unable to find X: ' + mapping.x};
      }
      if (!dY) {
        dY = dX;
        dX = '@time';
      }

      this.trace.ts = key.points; //// <===========

      //////////////////////////////////// this.trace.x, this.trace.y
      if (cfg.settings.plot === 'scatter') {
        this.trace.theta = dX.points;
        this.trace.r = dY.points;
        this.trace.marker = $.extend(true, {}, cfg.settings.marker);
        // this.trace.line = $.extend(true, {}, cfg.settings.line);

        if (mapping.size) {
          dS = this.data[mapping.size];
          if (!dS) {
            throw {message: 'Unable to find Size: ' + mapping.size};
          }
          this.trace.marker.size = dS.points; //// <===========
        }

        // Set the marker colors
        if (cfg.settings.color_option === 'ramp') {
          if (!mapping.color) {
            mapping.color = idx.name;
          }
          dC = this.data[mapping.color];
          if (!dC) {
            throw {message: 'Unable to find Color: ' + mapping.color};
          }
          this.trace.marker.color = dC.points; //// <===========
        }

        this.trace.fill = 'None';
        this.trace.type = 'scatterpolar';
        this.traces = [this.trace];
      } else if (cfg.settings.plot === 'windrose') {
        // classify all the datapoint into n directions
        let theta = dX.points;
        let r = dY.points;
        let num_points = theta.length;

        let points_on_dir = [];
        let num_angle = cfg.settings.petals;
        let angle = 360 / num_angle;

        for (let i = 0; i < num_angle; i++) points_on_dir.push([]);

        // classify points into it
        for (let p = 0; p < num_points; p++) {
          let angle_idx = Math.floor((theta[p] / angle + 0.5) % num_angle);
          points_on_dir[angle_idx].push(r[p]);
        }

        // compute m levels for all n directions

        let petals = [];

        // find max wind speed and speed levels
        let max_speed = Math.max(...r);
        let bin_size = cfg.settings.wind_speed_interval; //  max_speed / bin_num);
        let bin_num = Math.ceil(max_speed / bin_size);
        let speed_levels = [];
        for (let bin_idx = 0; bin_idx <= bin_num; bin_idx++) {
          let level = bin_size * bin_idx;
          speed_levels.push(level);
        }

        // prepare base lengths
        let base_lengths = [];
        base_lengths.length = num_angle;
        base_lengths.fill(0);

        // compute the petal lengths
        for (let bin_idx = 0; bin_idx < bin_num; bin_idx++) {
          petals.push([]);

          for (let angle_idx = 0; angle_idx < num_angle; angle_idx++) {
            let pts = points_on_dir[angle_idx];
            let bin_counter = 0;

            for (let idx = 0; idx < pts.length; idx++) {
              if (
                pts[idx] >= speed_levels[bin_idx] &&
                pts[idx] < speed_levels[bin_idx + 1]
              )
                bin_counter++;
            }

            let total_length = pts.length / num_points;
            let delta_length = bin_counter / pts.length * total_length;
            base_lengths[angle_idx] += 100 * delta_length;
            petals[bin_idx].push(base_lengths[angle_idx]);
          }
        }

        // generate m traces
        this.traces = [];

        // prepare the angles
        let thetas = [];
        for (let angle_idx = 0; angle_idx < num_angle; angle_idx++) {
          thetas.push(angle_idx * angle - 0.5 * angle);
        }

        let angs = [];
        for (let i = 0; i < bin_num; i++) {
          let arr = this.expand_to_fan(thetas, petals[i]);
          angs = arr[0];
          petals[i] = arr[1];
        }
        thetas = angs;

        // and then the traces
        for (let bin_idx = 0; bin_idx < bin_num; bin_idx++) {
          var trace = {};
          let lower_level = speed_levels[bin_idx];
          let upper_level = speed_levels[bin_idx + 1];
          trace['name'] =
            lower_level.toString() + ' - ' + upper_level.toString() + ' m/s';
          trace['type'] = 'scatterpolar';
          trace['mode'] = 'lines';
          trace['theta'] = thetas;
          trace['r'] = petals[bin_idx];
          trace['fill'] = 'toself';
          trace['opacity'] = 1;
          trace['line'] = {
            color: 'rgb(0,0,0)',
            width: 0,
          };
          trace['fillcolor'] =
            'hsl(' + (255 * (1 - bin_idx / (bin_num - 1))).toString() + ',100% ,60%)'; //',' + (50 + 50 * (1 - bin_idx / (bin_num - 1))).toString() + '% ,60%)';
          this.traces.unshift(trace);
        }
      }
    }
    this.render();
  }

  expand_to_fan(ang_arr, r_arr) {
    let pt_num = 15;
    let ang_arr_360 = ang_arr.slice();
    ang_arr_360.push(360);
    let new_ang_arr = [];
    let new_r_arr = [];
    for (let p = 0; p < ang_arr.length; p++) {
      let d_ang = (ang_arr_360[p + 1] - ang_arr[p]) / pt_num;
      for (let i = 0; i < pt_num; i++) {
        let ang = ang_arr[p] + d_ang * i;
        new_ang_arr.push(ang);
        new_r_arr.push(r_arr[p]);
      }
      new_ang_arr.push(0);
      new_r_arr.push(0);
    }

    return [new_ang_arr, new_r_arr];
  }

  onConfigChanged() {
    if (this.graph && this.initalized) {
      Plotly.Plots.purge(this.graph);
      this.graph.innerHTML = '';
      this.initalized = false;
    }

    // this.trace.type = 'scatterpolar';
    let plot_type = this.panel.pconfig.settings.plot;

    let plotmapping = {
      scatter: 'markers',
      windrose: 'lines',
    };
    this.trace.mode = plotmapping[plot_type];

    let legendmapping = {
      scatter: false,
      windrose: true,
    };
    this.panel.pconfig.layout.showlegend = legendmapping[plot_type];

    let radialaxismapping = {
      scatter: {ticksuffix: ' m/s', angle: 90},
      windrose: {ticksuffix: '%', angle: 90},
    };
    this.panel.pconfig.layout.polar.radialaxis = radialaxismapping[plot_type];

    this.refresh();
  }

  link(scope, elem, attrs, ctrl) {
    this.graph = elem.find('.plotly-spot')[0];
    this.initalized = false;
    elem.on('mousemove', evt => {
      this.mouse = evt;
    });
  }

  //---------------------------

  getSymbolSegs() {
    let txt = [
      'circle',
      'circle-open',
      'circle-dot',
      'circle-open-dot',
      'square',
      'square-open',
      'square-dot',
      'square-open-dot',
      'diamond',
      'diamond-open',
      'diamond-dot',
      'diamond-open-dot',
      'cross',
      'cross-open',
      'cross-dot',
      'cross-open-dot',
      'x',
      'x-open',
      'x-dot',
      'x-open-dot',
      'triangle-up',
      'triangle-up-open',
      'triangle-up-dot',
      'triangle-up-open-dot',
      'triangle-down',
      'triangle-down-open',
      'triangle-down-dot',
      'triangle-down-open-dot',
      'triangle-left',
      'triangle-left-open',
      'triangle-left-dot',
      'triangle-left-open-dot',
      'triangle-right',
      'triangle-right-open',
      'triangle-right-dot',
      'triangle-right-open-dot',
      'triangle-ne',
      'triangle-ne-open',
      'triangle-ne-dot',
      'triangle-ne-open-dot',
      'triangle-se',
      'triangle-se-open',
      'triangle-se-dot',
      'triangle-se-open-dot',
      'triangle-sw',
      'triangle-sw-open',
      'triangle-sw-dot',
      'triangle-sw-open-dot',
      'triangle-nw',
      'triangle-nw-open',
      'triangle-nw-dot',
      'triangle-nw-open-dot',
      'pentagon',
      'pentagon-open',
      'pentagon-dot',
      'pentagon-open-dot',
      'hexagon',
      'hexagon-open',
      'hexagon-dot',
      'hexagon-open-dot',
      'hexagon2',
      'hexagon2-open',
      'hexagon2-dot',
      'hexagon2-open-dot',
      'octagon',
      'octagon-open',
      'octagon-dot',
      'octagon-open-dot',
      'star',
      'star-open',
      'star-dot',
      'star-open-dot',
      'hexagram',
      'hexagram-open',
      'hexagram-dot',
      'hexagram-open-dot',
      'star-triangle-up',
      'star-triangle-up-open',
      'star-triangle-up-dot',
      'star-triangle-up-open-dot',
      'star-triangle-down',
      'star-triangle-down-open',
      'star-triangle-down-dot',
      'star-triangle-down-open-dot',
      'star-square',
      'star-square-open',
      'star-square-dot',
      'star-square-open-dot',
      'star-diamond',
      'star-diamond-open',
      'star-diamond-dot',
      'star-diamond-open-dot',
      'diamond-tall',
      'diamond-tall-open',
      'diamond-tall-dot',
      'diamond-tall-open-dot',
      'diamond-wide',
      'diamond-wide-open',
      'diamond-wide-dot',
      'diamond-wide-open-dot',
      'hourglass',
      'hourglass-open',
      'bowtie',
      'bowtie-open',
      'circle-cross',
      'circle-cross-open',
      'circle-x',
      'circle-x-open',
      'square-cross',
      'square-cross-open',
      'square-x',
      'square-x-open',
      'diamond-cross',
      'diamond-cross-open',
      'diamond-x',
      'diamond-x-open',
      'cross-thin',
      'cross-thin-open',
      'x-thin',
      'x-thin-open',
      'asterisk',
      'asterisk-open',
      'hash',
      'hash-open',
      'hash-dot',
      'hash-open-dot',
      'y-up',
      'y-up-open',
      'y-down',
      'y-down-open',
      'y-left',
      'y-left-open',
      'y-right',
      'y-right-open',
      'line-ew',
      'line-ew-open',
      'line-ns',
      'line-ns-open',
      'line-ne',
      'line-ne-open',
      'line-nw',
      'line-nw-open',
    ];

    let segs = [];
    _.forEach(txt, val => {
      segs.push(this.uiSegmentSrv.newSegment(val));
    });
    return this.$q.when(segs);
  }
}

export {PlotlyPanelCtrl as PanelCtrl};
