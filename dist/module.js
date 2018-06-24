System.register(["app/plugins/sdk", "lodash", "jquery", "./lib/plotly.min"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    var sdk_1, lodash_1, jquery_1, Plotly, PlotlyPanelCtrl;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (Plotly_1) {
                Plotly = Plotly_1;
            }
        ],
        execute: function () {
            PlotlyPanelCtrl = (function (_super) {
                __extends(PlotlyPanelCtrl, _super);
                function PlotlyPanelCtrl($scope, $injector, $window, $rootScope, uiSegmentSrv) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.$rootScope = $rootScope;
                    _this.uiSegmentSrv = uiSegmentSrv;
                    _this.defaults = {
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
                                legend: { orientation: 'v' },
                                hovermode: 'closest',
                                plot_bgcolor: 'transparent',
                                paper_bgcolor: 'transparent',
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
                    _this.sizeChanged = true;
                    _this.initalized = false;
                    _this.$tooltip = jquery_1.default('<div id="tooltip" class="graph-tooltip">');
                    lodash_1.default.defaultsDeep(_this.panel, _this.defaults);
                    var labelStyle = _this.getCssRule('div.flot-text');
                    if (labelStyle) {
                        var color = labelStyle.style.color || _this.panel.pconfig.layout.font.color;
                        _this.panel.pconfig.layout.font.color = 'rgb(110,110,110)';
                    }
                    var cfg = _this.panel.pconfig;
                    _this.trace = {};
                    _this.traces = [];
                    _this.layout = jquery_1.default.extend(true, {}, _this.panel.pconfig.layout);
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('render', _this.onRender.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-error', _this.onDataError.bind(_this));
                    _this.events.on('panel-initialized', _this.onPanelInitalized.bind(_this));
                    _this.events.on('panel-size-changed', _this.onResize.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));
                    _this.events.on('refresh', _this.onRefresh.bind(_this));
                    return _this;
                }
                PlotlyPanelCtrl.prototype.getCssRule = function (selectorText) {
                    var styleSheets = document.styleSheets;
                    for (var idx = 0; idx < styleSheets.length; idx += 1) {
                        var styleSheet = styleSheets[idx];
                        var rules = styleSheet.cssRules;
                        for (var ruleIdx = 0; ruleIdx < rules.length; ruleIdx += 1) {
                            var rule = rules[ruleIdx];
                            if (rule.selectorText === selectorText) {
                                return rule;
                            }
                        }
                    }
                };
                PlotlyPanelCtrl.prototype.onResize = function () {
                    this.sizeChanged = true;
                    console.log('sz');
                };
                PlotlyPanelCtrl.prototype.onDataError = function (err) {
                    this.seriesList = [];
                    this.render([]);
                    console.log('onDataError', err);
                };
                PlotlyPanelCtrl.prototype.onRefresh = function () {
                    if (this.otherPanelInFullscreenMode()) {
                        return;
                    }
                    if (this.graph && this.initalized) {
                        Plotly.redraw(this.graph);
                    }
                };
                PlotlyPanelCtrl.prototype.onInitEditMode = function () {
                    this.addEditorTab('Display', 'public/plugins/fatcloud-windrose-panel/templates/tab_display.html', 2);
                    this.refresh();
                    this.segs = {
                        symbol: this.uiSegmentSrv.newSegment({
                            value: this.panel.pconfig.settings.marker.symbol,
                        }),
                    };
                    var cfg = this.panel.pconfig;
                    this.axis = [
                        {
                            disp: 'Angle',
                            idx: 1,
                            metric: function (name) {
                                if (name) {
                                    cfg.mapping.x = name;
                                }
                                return cfg.mapping.x;
                            },
                        },
                        {
                            disp: 'Distance',
                            idx: 2,
                            metric: function (name) {
                                if (name) {
                                    cfg.mapping.y = name;
                                }
                                return cfg.mapping.y;
                            },
                        },
                    ];
                };
                PlotlyPanelCtrl.prototype.onSegsChanged = function () {
                    this.panel.pconfig.settings.marker.symbol = this.segs.symbol.value;
                    this.onConfigChanged();
                    console.log(this.segs.symbol, this.panel.pconfig);
                };
                PlotlyPanelCtrl.prototype.onPanelInitalized = function () {
                    this.onConfigChanged();
                };
                PlotlyPanelCtrl.prototype.onRender = function () {
                    if (this.otherPanelInFullscreenMode() || !this.graph) {
                        return;
                    }
                    var top_padding = 22;
                    jquery_1.default('.main-svg').css('padding-top', top_padding.toString() + 'px');
                    if (!this.initalized) {
                        var options = {
                            showLink: false,
                            displaylogo: false,
                            displayModeBar: this.panel.pconfig.settings.displayModeBar,
                            modeBarButtonsToRemove: ['sendDataToCloud'],
                        };
                        var data = this.traces;
                        var rect = this.graph.getBoundingClientRect();
                        this.layout = jquery_1.default.extend(true, {}, this.panel.pconfig.layout);
                        this.layout.height = this.height;
                        this.layout.width = rect.width;
                        Plotly.newPlot(this.graph, data, this.layout, options);
                    }
                    else {
                        Plotly.redraw(this.graph);
                    }
                    if (this.sizeChanged && this.graph && this.layout) {
                        var rect = this.graph.getBoundingClientRect();
                        this.layout.height = this.height;
                        this.layout.width = rect.width;
                        Plotly.Plots.resize(this.graph);
                    }
                    this.sizeChanged = false;
                    this.initalized = true;
                };
                PlotlyPanelCtrl.prototype.onDataSnapshotLoad = function (snapshot) {
                    this.onDataReceived(snapshot);
                };
                PlotlyPanelCtrl.prototype.onDataReceived = function (dataList) {
                    this.data = {};
                    if (dataList.length < 1) {
                        console.log('No data', dataList);
                    }
                    else {
                        var dmapping = {
                            x: null,
                            y: null,
                            z: null,
                        };
                        var cfg = this.panel.pconfig;
                        var mapping = cfg.mapping;
                        var key = {
                            name: '@time',
                            type: 'ms',
                            missing: 0,
                            idx: -1,
                            points: [],
                        };
                        var idx = {
                            name: '@index',
                            type: 'number',
                            missing: 0,
                            idx: -1,
                            points: [],
                        };
                        this.data[key.name] = key;
                        this.data[idx.name] = idx;
                        for (var i = 0; i < dataList.length; i++) {
                            var datapoints = dataList[i].datapoints;
                            if (datapoints.length > 0) {
                                var val = {
                                    name: dataList[i].target,
                                    type: 'number',
                                    missing: 0,
                                    idx: i,
                                    points: [],
                                };
                                if (lodash_1.default.isString(datapoints[0][0])) {
                                    val.type = 'string';
                                }
                                else if (lodash_1.default.isBoolean(datapoints[0][0])) {
                                    val.type = 'boolean';
                                }
                                if (i === 0) {
                                    dmapping.x = val.name;
                                }
                                else if (i === 1) {
                                    dmapping.y = val.name;
                                }
                                else if (i === 2) {
                                    dmapping.z = val.name;
                                }
                                this.data[val.name] = val;
                                if (key.points.length === 0) {
                                    for (var j = 0; j < datapoints.length; j++) {
                                        key.points.push(datapoints[j][1]);
                                        val.points.push(datapoints[j][0]);
                                        idx.points.push(j);
                                    }
                                }
                                else {
                                    for (var j = 0; j < datapoints.length; j++) {
                                        if (j >= key.points.length) {
                                            break;
                                        }
                                        if (key.points[j] === datapoints[j][1]) {
                                            val.points.push(datapoints[j][0]);
                                        }
                                        else {
                                            val.missing = val.missing + 1;
                                        }
                                    }
                                }
                            }
                        }
                        if (!mapping.x) {
                            mapping.x = dmapping.x;
                        }
                        if (!mapping.y) {
                            mapping.y = dmapping.y;
                        }
                        if (!mapping.z) {
                            mapping.z = dmapping.z;
                        }
                        var dX = this.data[mapping.x];
                        var dY = this.data[mapping.y];
                        var dZ = null;
                        var dC = null;
                        var dS = null;
                        var dT = null;
                        if (!dX) {
                            throw { message: 'Unable to find X: ' + mapping.x };
                        }
                        if (!dY) {
                            dY = dX;
                            dX = '@time';
                        }
                        this.trace.ts = key.points;
                        if (cfg.settings.plot === 'scatter') {
                            this.trace.theta = dX.points;
                            this.trace.r = dY.points;
                            this.trace.marker = jquery_1.default.extend(true, {}, cfg.settings.marker);
                            if (mapping.size) {
                                dS = this.data[mapping.size];
                                if (!dS) {
                                    throw { message: 'Unable to find Size: ' + mapping.size };
                                }
                                this.trace.marker.size = dS.points;
                            }
                            if (cfg.settings.color_option === 'ramp') {
                                if (!mapping.color) {
                                    mapping.color = idx.name;
                                }
                                dC = this.data[mapping.color];
                                if (!dC) {
                                    throw { message: 'Unable to find Color: ' + mapping.color };
                                }
                                this.trace.marker.color = dC.points;
                            }
                            this.trace.fill = 'None';
                            this.trace.type = 'scatterpolar';
                            this.traces = [this.trace];
                        }
                        else if (cfg.settings.plot === 'windrose') {
                            var theta = dX.points;
                            var r = dY.points;
                            var num_points = theta.length;
                            var points_on_dir = [];
                            var num_angle = cfg.settings.petals;
                            var angle = 360 / num_angle;
                            for (var i = 0; i < num_angle; i++)
                                points_on_dir.push([]);
                            for (var p = 0; p < num_points; p++) {
                                var angle_idx = Math.floor((theta[p] / angle + 0.5) % num_angle);
                                points_on_dir[angle_idx].push(r[p]);
                            }
                            var petals = [];
                            var max_speed = Math.max.apply(Math, r);
                            var bin_size = cfg.settings.wind_speed_interval;
                            var bin_num = Math.ceil(max_speed / bin_size);
                            var speed_levels = [];
                            for (var bin_idx = 0; bin_idx <= bin_num; bin_idx++) {
                                var level = bin_size * bin_idx;
                                speed_levels.push(level);
                            }
                            var base_lengths = [];
                            base_lengths.length = num_angle;
                            base_lengths.fill(0);
                            for (var bin_idx = 0; bin_idx < bin_num; bin_idx++) {
                                petals.push([]);
                                for (var angle_idx = 0; angle_idx < num_angle; angle_idx++) {
                                    var pts = points_on_dir[angle_idx];
                                    var bin_counter = 0;
                                    for (var idx_1 = 0; idx_1 < pts.length; idx_1++) {
                                        if (pts[idx_1] >= speed_levels[bin_idx] &&
                                            pts[idx_1] < speed_levels[bin_idx + 1])
                                            bin_counter++;
                                    }
                                    var total_length = pts.length / num_points;
                                    var delta_length = bin_counter / pts.length * total_length;
                                    base_lengths[angle_idx] += 100 * delta_length;
                                    petals[bin_idx].push(base_lengths[angle_idx]);
                                }
                            }
                            this.traces = [];
                            var thetas = [];
                            for (var angle_idx = 0; angle_idx < num_angle; angle_idx++) {
                                thetas.push(angle_idx * angle - 0.5 * angle);
                            }
                            var angs = [];
                            for (var i = 0; i < bin_num; i++) {
                                var arr = this.expand_to_fan(thetas, petals[i]);
                                angs = arr[0];
                                petals[i] = arr[1];
                            }
                            thetas = angs;
                            for (var bin_idx = 0; bin_idx < bin_num; bin_idx++) {
                                var trace = {};
                                var lower_level = speed_levels[bin_idx];
                                var upper_level = speed_levels[bin_idx + 1];
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
                                    'hsl(' + (255 * (1 - bin_idx / (bin_num - 1))).toString() + ',100% ,60%)';
                                this.traces.unshift(trace);
                            }
                        }
                    }
                    this.render();
                };
                PlotlyPanelCtrl.prototype.expand_to_fan = function (ang_arr, r_arr) {
                    var pt_num = 15;
                    var ang_arr_360 = ang_arr.slice();
                    ang_arr_360.push(360);
                    var new_ang_arr = [];
                    var new_r_arr = [];
                    for (var p = 0; p < ang_arr.length; p++) {
                        var d_ang = (ang_arr_360[p + 1] - ang_arr[p]) / pt_num;
                        for (var i = 0; i < pt_num; i++) {
                            var ang = ang_arr[p] + d_ang * i;
                            new_ang_arr.push(ang);
                            new_r_arr.push(r_arr[p]);
                        }
                        new_ang_arr.push(0);
                        new_r_arr.push(0);
                    }
                    return [new_ang_arr, new_r_arr];
                };
                PlotlyPanelCtrl.prototype.onConfigChanged = function () {
                    if (this.graph && this.initalized) {
                        Plotly.Plots.purge(this.graph);
                        this.graph.innerHTML = '';
                        this.initalized = false;
                    }
                    var plot_type = this.panel.pconfig.settings.plot;
                    var plotmapping = {
                        scatter: 'markers',
                        windrose: 'lines',
                    };
                    this.trace.mode = plotmapping[plot_type];
                    var legendmapping = {
                        scatter: false,
                        windrose: true,
                    };
                    this.panel.pconfig.layout.showlegend = legendmapping[plot_type];
                    var radialaxismapping = {
                        scatter: { ticksuffix: ' m/s', angle: 90 },
                        windrose: { ticksuffix: '%', angle: 90 },
                    };
                    this.panel.pconfig.layout.polar.radialaxis = radialaxismapping[plot_type];
                    this.refresh();
                };
                PlotlyPanelCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
                    var _this = this;
                    this.graph = elem.find('.plotly-spot')[0];
                    this.initalized = false;
                    elem.on('mousemove', function (evt) {
                        _this.mouse = evt;
                    });
                };
                PlotlyPanelCtrl.prototype.getSymbolSegs = function () {
                    var _this = this;
                    var txt = [
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
                    var segs = [];
                    lodash_1.default.forEach(txt, function (val) {
                        segs.push(_this.uiSegmentSrv.newSegment(val));
                    });
                    return this.$q.when(segs);
                };
                PlotlyPanelCtrl.templateUrl = 'templates/module.html';
                return PlotlyPanelCtrl;
            }(sdk_1.MetricsPanelCtrl));
            exports_1("PanelCtrl", PlotlyPanelCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map