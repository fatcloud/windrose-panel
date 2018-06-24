/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
declare class PlotlyPanelCtrl extends MetricsPanelCtrl {
    private $rootScope;
    private uiSegmentSrv;
    static templateUrl: string;
    sizeChanged: boolean;
    initalized: boolean;
    $tooltip: any;
    defaults: {
        pconfig: {
            mapping: {
                color: any;
                size: any;
            };
            settings: {
                plot: string;
                displayModeBar: boolean;
                marker: {
                    size: number;
                    symbol: string;
                    color: string;
                    colorscale: string;
                    sizemode: string;
                    sizemin: number;
                    sizeref: number;
                    showscale: boolean;
                };
                color_option: string;
                petals: number;
                wind_speed_interval: number;
            };
            layout: {
                autosize: boolean;
                showlegend: boolean;
                legend: {
                    orientation: string;
                };
                hovermode: string;
                plot_bgcolor: string;
                paper_bgcolor: string;
                font: {
                    color: string;
                    family: string;
                };
                polar: {
                    radialaxis: {
                        angle: number;
                        ticksuffix: string;
                    };
                    angularaxis: {
                        dtick: number;
                        rotation: number;
                        direction: string;
                    };
                };
            };
        };
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
    constructor($scope: any, $injector: any, $window: any, $rootScope: any, uiSegmentSrv: any);
    getCssRule(selectorText: any): CSSStyleRule;
    onResize(): void;
    onDataError(err: any): void;
    onRefresh(): void;
    onInitEditMode(): void;
    onSegsChanged(): void;
    onPanelInitalized(): void;
    onRender(): void;
    onDataSnapshotLoad(snapshot: any): void;
    onDataReceived(dataList: any): void;
    expand_to_fan(ang_arr: any, r_arr: any): any[][];
    onConfigChanged(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
    getSymbolSegs(): any;
}
export { PlotlyPanelCtrl as PanelCtrl };
