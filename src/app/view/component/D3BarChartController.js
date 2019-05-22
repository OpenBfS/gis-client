/* Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.view.component.D3BarChartController
 */
Ext.define('Koala.view.component.D3BarChartController', {
    extend: 'Koala.view.component.D3BaseController',
    alias: 'controller.component-d3barchart',

    requires: [
        'Koala.util.Ogc',
        'Koala.util.String'
    ],

    /**
     *
     */
    scales: {},
    shapes: [],
    axes: {},
    gridAxes: {},
    tooltipCmp: null,
    initialPlotTransform: null,
    data: {},
    rawData: null,
    chartRendered: false,
    ajaxCounter: 0,
    chartConfig: null,
    featureProps: null,
    showUncertainty: true,
    colorsByKey: {},
    disabledSubCategories: [],
    gridFeatures: null,
    labels: [],

    /**
     * The default chart margin to apply.
     *
     * @type {Object}
     */
    defaultChartMargin: {
        top: 50,
        right: 200,
        bottom: 50,
        left: 50
    },

    /**
     * Called on painted event. Only used in modern toolkit.
     *
     * @private
     */
    onPainted: function() {
        var me = this;
        me.onBoxReady();
    },

    /**
     * Returns the request params for a given station.
     *
     * @param {ol.Feature} station The station to build the request for.
     * @return {Object} The request object.
     */
    getChartDataRequestParams: function(station) {
        var Ogc = Koala.util.Ogc;
        var me = this;
        var view = me.getView();
        var targetLayer = view.getTargetLayer();
        var chartConfig = targetLayer.get('barChartProperties');
        var filters = targetLayer.metadata.filters;
        var timeField;

        // Get the viewparams configured for the layer
        var layerViewParams = Koala.util.Object.getPathStrOr(
            targetLayer, 'metadata/layerConfig/olProperties/param_viewparams', '');

        // Get the request params configured for the chart
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, 'param_', true);

        // Merge the layer viewparams to the chart params
        if (paramConfig.viewparams) {
            paramConfig.viewparams += ';' + layerViewParams;
        } else {
            paramConfig.viewparams = layerViewParams;
        }

        // Replace all template strings
        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, station);
        });

        var requestFilter;

        Ext.each(filters, function(filter) {
            if (filter.type === 'pointintime') {
                var dateString;
                dateString = filter.effectivedatetime.toISOString();
                timeField = filter.param;
                requestFilter = Ogc.getPointInTimeFilter(dateString, timeField);
                return false;
            } else if (filter.type === 'timerange') {
                var startString = filter.effectivemindatetime.toISOString();
                var endString = filter.effectivemaxdatetime.toISOString();
                timeField = filter.param;
                requestFilter = Ogc.getDateTimeRangeFilter(
                    startString, endString, timeField);
                return false;
            }
        });

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: chartConfig.dataFeatureType,
            outputFormat: 'application/json',
            filter: requestFilter,
            sortBy: timeField
        };

        Ext.apply(requestParams, paramConfig);

        return requestParams;
    },

    onChartDataRequestSuccess: function(chartDataResponse) {
        var me = this;
        var view = me.getView();
        me.rawData = chartDataResponse.responseText;

        if (!view) {
            me.onDataComplete(chartDataResponse);
            return;
        }
        var barChartProperties = view.getTargetLayer().get('barChartProperties');
        if (!barChartProperties.colorMapping || Ext.isEmpty(
            barChartProperties.colorMapping)) {
            me.onDataComplete(chartDataResponse);
            return;
        }
        var promise;
        if (Ext.String.startsWith(barChartProperties.colorMapping, 'url:')) {
            promise = Koala.util.String.replaceTemplateStringsWithPromise(
                barChartProperties.colorMapping
            );
        } else {
            promise = new Ext.Promise(function(resolve) {
                resolve(barChartProperties.colorMapping);
            });
        }

        promise.then(function(colorMap) {
            if (Ext.isString(colorMap)) {
                try {
                    colorMap = Ext.decode(colorMap);
                } catch (err) {
                    Ext.log.error('Could not parse the color data response: ', err);
                }
            }
            me.onDataComplete(chartDataResponse, colorMap);
        });
    },

    /**
     * Function to be called on request success.
     *
     * @param {Object} reponse The response object.
     */
    onDataComplete: function(chartDataResponse, colorMap) {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        if (!view) {
            return;
        }
        var labelFunc = view.getLabelFunc() || me.getFallBackIdentity();
        var barChartProperties = view.getTargetLayer().get('barChartProperties');
        var groupProp = barChartProperties.groupAttribute || 'end_measure';
        var keyProp = barChartProperties.xAxisAttribute;
        // looks strange to toggle if !toggled, but that's actually the desired
        // behaviour
        if (!this.groupPropToggled) {
            var h = groupProp;
            groupProp = keyProp;
            keyProp = h;
        }
        var valueProp = barChartProperties.yAxisAttribute;
        var detectionLimitProp = barChartProperties.detectionLimitAttribute
                || 'nachweisgrenze';

        var uncertaintyProp = barChartProperties.uncertaintyAttribute
                || 'uncertainty';
        var colors = [];
        if (view.getShape().color) {
            colors = view.getShape().color.split(',');
        }
        var jsonObj;

        var seriesData = [];

        if (chartDataResponse && chartDataResponse.responseText) {
            try {
                jsonObj = Ext.decode(chartDataResponse.responseText);
            } catch (err) {
                Ext.log.error('Could not parse the chart data response: ', err);
                return false;
            }
        }

        //used for grid table in CartoWindowController
        me.gridFeatures = jsonObj.features;

        me.colorsByKey = {};
        me.labels = [];
        me.customColors = [];
        me.disabledSubCategories = [];

        var ids = [];

        Ext.each(jsonObj.features, function(feature) {
            var id = feature.properties.id;
            if (ids.indexOf(id) === -1) {
                ids.push(id);
            }
        });

        Ext.each(jsonObj.features, function(feature) {
            var dataObj = {};
            var groupKey = feature.properties[groupProp];

            var createSeries = true;
            dataObj.key = feature.properties[keyProp];

            if (!me.colorsByKey[groupKey]) {
                me.colorsByKey[groupKey] =
                    me.customColors[groupKey] ||
                    (colorMap && colorMap[groupKey] ? colorMap[groupKey].color : null) ||
                    colors[0] ||
                    staticMe.getRandomColor();
                Ext.Array.removeAt(colors, 0);
            }

            var pushObj = dataObj;
            Ext.each(seriesData, function(tuple) {
                if (tuple.key === feature.properties[keyProp]) {
                    pushObj = tuple;
                    createSeries = false;
                    return false;
                }
            });

            if (!Ext.isObject(pushObj[groupKey])) {
                pushObj[groupKey] = {};
            }

            if (colorMap && colorMap[groupKey]) {
                pushObj[groupKey].color = colorMap[groupKey].color;
            } else {
                pushObj[groupKey].color = me.customColors[groupKey] || me.colorsByKey[groupKey];
            }
            pushObj[groupKey].value = feature.properties[valueProp];
            pushObj[groupKey].key = feature.properties[groupProp];
            pushObj[groupKey].detection_limit = feature.properties[detectionLimitProp];
            pushObj[groupKey].uncertainty = feature.properties[uncertaintyProp];
            pushObj[groupKey].group = feature.properties[keyProp];
            pushObj[groupKey].label = labelFunc(pushObj[groupKey].value, pushObj[groupKey], groupProp, keyProp);

            if (createSeries) {
                seriesData.push(pushObj);
                me.labels.push(pushObj.key);
            }
        });

        me.data = seriesData;
        me.chartDataAvailable = true;

        me.ajaxCounter++;
        if (me.ajaxCounter === view.getSelectedStations().length) {
            if (view.getShowLoadMask() && view.setLoading) {
                view.setLoading(false);
            }
            var config = me.getView().getConfig();
            var chartSize = me.getViewSize();
            if (config.title) {
                config.title.label = Koala.util.Chart.getChartTitle(this.getView().getTargetLayer());
                var titleTpl = 'titleTpl' in barChartProperties ? barChartProperties.titleTpl : '';
                config.title.label = Koala.util.String.replaceTemplateStrings(titleTpl, this.getView().getSelectedStations()[0]);
            }
            this.chartConfig = Koala.util.ChartData.getChartConfiguration(
                config,
                chartSize,
                'bar',
                this.data,
                this.labels,
                this.getView().getSelectedStations()
            );
            me.fireEvent('chartdataprepared');
        }
    },

    /**
     *
     */
    drawChart: function() {
        if (!this.chartConfig) {
            return;
        }
        var config = this.getView().getConfig();
        var gnosConfig = config.targetLayer.metadata.layerConfig.barChartProperties;
        var me = this;
        var margin = this.getView().getChartMargin();
        var svg = document.querySelector('#' + this.getView().getId());
        var container = svg.querySelector('.k-barchart-container');
        var legendContainer = svg.querySelector('.k-barchart-legend-container');
        var barContainer = svg.querySelector('.k-barchart-chart-container');
        this.updateSize();
        if (!container) {
            container = document.createElement('div');
            container.classList.add('k-barchart-container');
            container.style.width = '100%';
            container.style.height = '100%';
            svg.append(container);
            legendContainer = document.createElement('div');
            barContainer = document.createElement('div');
            container.append(barContainer);
            container.append(legendContainer);
            legendContainer.classList.add('k-barchart-legend-container');
            barContainer.classList.add('k-barchart-chart-container');
        }
        var barComponent = new D3Util.BarComponent(this.chartConfig.barComponentConfig);
        var legend = this.getLegendComponent(barComponent);
        var viewSize = this.getViewSize();
        viewSize[0] = viewSize[0] - parseInt(margin.left, 10) - parseInt(margin.right, 10) - 15;
        viewSize[1] = viewSize[1] - parseInt(margin.top, 10) - parseInt(margin.bottom, 10);
        var width = viewSize[0];
        if (legend) {
            width = width - parseInt(gnosConfig.legendEntryMaxLength, 10);
        }
        if (width > this.chartConfig.barComponentConfig.size[0]) {
            this.chartConfig.barComponentConfig.size[0] = width - parseInt(margin.left, 10) - parseInt(margin.right, 10);
            this.chartConfig.chartRendererConfig.size[0] = width;
        }

        legendContainer.style.width = gnosConfig.legendEntryMaxLength + 'px';
        legendContainer.style.height = viewSize[1] + 'px';
        legendContainer.style['overflow-y'] = 'auto';
        legendContainer.style['overflow-x'] = 'hidden';
        legendContainer.style.position = 'absolute';
        legendContainer.style.right = '0px';
        legendContainer.style['margin-top'] = margin.top + 'px';
        legendContainer.style['margin-bottom'] = margin.bottom + 'px';
        barContainer.style.overflow = 'auto';
        barContainer.style.width = width + 'px';
        barContainer.style.position = 'absolute';
        barContainer.style.margin = margin.top + 'px ' + margin.left + 'px ' + margin.bottom + 'px ' + margin.left + 'px';

        me.currentDateRange = {
            min: null,
            max: null
        };

        this.chartConfig.chartRendererConfig.components = [];
        var legendChartConfig = Ext.clone(this.chartConfig.chartRendererConfig);
        this.chartConfig.chartRendererConfig.components = [barComponent];
        this.chartRenderer = new D3Util.ChartRenderer(this.chartConfig.chartRendererConfig);
        this.chartRenderer.render(barContainer);

        if (legend) {
            // uses dynamic height
            legendChartConfig.size[0] = gnosConfig.legendEntryMaxLength;
            legendChartConfig.components = [legend];
            legendChartConfig.dynamicSize = true;
            this.legendChartRenderer = new D3Util.ChartRenderer(legendChartConfig);
            this.legendChartRenderer.render(legendContainer);
        }
    },

    /**
     * Constructs a new legend component based on current config, or undefined,
     * if we have no legend config.
     * @param  {D3Util.BarComponent} series the corresponding bar chart
     * component
     * @return {D3Util.LegendComponent} the new legend component, or undefined
     */
    getLegendComponent: function(barComponent) {
        if (!this.chartConfig.legendComponentConfig) {
            return;
        }
        var me = this;
        var Const = Koala.util.ChartConstants;
        var CSS = Const.CSS_CLASS;
        this.chartConfig.legendComponentConfig.position[0] = 0;
        Ext.each(this.chartConfig.legendComponentConfig.items, function(legend) {
            legend.onClick = function(event) {
                var list = event.target.classList;
                if (list.contains(CSS.COLOR_ICON) ||
                    list.contains(CSS.DELETE_ICON)) {
                    return;
                }
                var item = event.target;
                while (item.nodeName !== 'g') {
                    item = item.parentNode;
                }
                list = item.classList;
                if (list.contains('k-d3-disabled')) {
                    list.remove('k-d3-disabled');
                } else {
                    list.add('k-d3-disabled');
                }
                if (legend.groupIndex) {
                    barComponent.toggleGroup(legend.groupIndex);
                }
                if (legend.groupedIndex) {
                    barComponent.toggleGrouped(legend.groupedIndex);
                }
            };
            legend.customRenderer = function(node) {
                if (!Ext.isModern && legend.type === 'background') {
                    node.append('text')
                        // fa-paint-brush from FontAwesome, see http://fontawesome.io/cheatsheet/
                        .text('\uf1fc')
                        .attr('class', CSS.COLOR_ICON)
                        .attr('text-anchor', 'start')
                        .attr('dy', '1')
                        .attr('dx', '150') // TODO Discuss, do we need this dynamically?
                        .on('click', function() {
                            me.handleColorChange(legend);
                        });
                }
                node.append('text')
                    // ✖ from FontAwesome, see http://fontawesome.io/cheatsheet/
                    .text('')
                    .attr('class', CSS.DELETE_ICON)
                    .attr('text-anchor', 'start')
                    .attr('dy', '1')
                    .attr('dx', '170') // TODO Discuss, do we need this dynamically?
                    .on('click', function() {
                        me.handleDelete(legend);
                    });
            };
        });
        return new D3Util.LegendComponent(this.chartConfig.legendComponentConfig);
    },

    /**
     * Handle deletion of bars/groups from the legend.
     * @param  {Object} legend the legend configuration containing info about
     * what to delete
     */
    handleDelete: function(legend) {
        var me = this;
        if (legend.groupIndex) {
            me.chartConfig.barComponentConfig.data.data =
                me.chartConfig.barComponentConfig.data.data
                    .filter(function(group) {
                        return group.value !== legend.groupIndex;
                    });
            me.chartConfig.legendComponentConfig.items =
                me.chartConfig.legendComponentConfig.items
                    .filter(function(item) {
                        return item.groupIndex !== legend.groupIndex;
                    });
        }
        if (legend.groupedIndex) {
            me.chartConfig.barComponentConfig.data.grouped =
                me.chartConfig.barComponentConfig.data.grouped
                    .filter(function(value) {
                        return value !== legend.groupedIndex;
                    });
            Ext.each(me.chartConfig.barComponentConfig.data.data
                ,function(group) {
                    group.values = group.values.filter(function(value) {
                        return value.index !== legend.groupedIndex;
                    });
                });
            me.chartConfig.barComponentConfig.data.data =
                me.chartConfig.barComponentConfig.data.data
                    .filter(function(group) {
                        return group.value !== legend.groupIndex;
                    });
            me.chartConfig.legendComponentConfig.items =
                me.chartConfig.legendComponentConfig.items
                    .filter(function(item) {
                        return item.groupedIndex !== legend.groupedIndex;
                    });
        }
        me.drawChart();
    },

    /**
     * Handle the color change button.
     * @param  {Object} legend the corresponding legend config
     */
    handleColorChange: function(legend) {
        var me = this;
        var color;
        if (legend.groupedIndex) {
            Ext.each(me.chartConfig.barComponentConfig.data.data,
                function(group) {
                    Ext.each(group.values, function(value) {
                        if (value.index === legend.groupedIndex) {
                            color = value.color;
                        }
                    });
                });
            this.showColorPicker(color, function(newColor) {
                Ext.each(me.chartConfig.barComponentConfig.data.data,
                    function(group) {
                        Ext.each(group.values, function(value) {
                            if (value.index === legend.groupedIndex) {
                                value.color = newColor;
                            }
                        });
                    });
                legend.style.fill = newColor;
            });
        }
    },

    /**
     * Recalculates the size of the chart components and sets them in the config.
     */
    updateSize: function() {
        var config = this.getView().getConfig();
        var gnosConfig = config.targetLayer.metadata.layerConfig.barChartProperties;
        var barConfig = this.chartConfig.barComponentConfig;
        var chartSize = this.getViewSize();
        var margin = this.getView().getChartMargin();
        chartSize[0] = chartSize[0] - parseInt(gnosConfig.legendEntryMaxLength, 10) - parseInt(margin.left, 10) - parseInt(margin.right, 10);
        chartSize[1] = chartSize[1] - parseInt(margin.top, 10) * 2 - parseInt(margin.bottom, 10);

        // calculate the size
        var maxCount = barConfig.data.grouped.length;
        this.chartConfig.chartRendererConfig.size[0] =
            this.getView().getBarWidth() * maxCount * barConfig.data.data.length;

        barConfig.size[0] = this.chartConfig.chartRendererConfig.size[0];

        // set the size
        // extra 15 for the horizontal scroll bar
        barConfig.size[1] = chartSize[1] - 15;
        barConfig.position = [0, 0];
        if (this.chartConfig.legendComponentConfig) {
            this.chartConfig.legendComponentConfig.position = [0, 0];
        }
        // extra 15 for the horizontal scroll bar
        this.chartConfig.chartRendererConfig.size = [barConfig.size[0], chartSize[1] - 15];
    },

    /**
     * Update the chart configuration with the new size and redraw.
     */
    handleResize: function() {
        if (!this.chartConfig) {
            return;
        }
        this.drawChart();
    },

    /**
     * This sets the visibility of the uncertainty marker-bars.
     * @param {boolean} visible Wheather to show the uncertainty or not.
     */
    setUncertaintyVisibility: function(visible) {
        var barComponent = this.chartConfig.chartRendererConfig.components[0];
        barComponent.setUncertaintyVisible(visible);
        this.showUncertainty = visible;
    },

    toggleUncertainty: function() {
        this.setUncertaintyVisibility(!this.showUncertainty);
    }

});
