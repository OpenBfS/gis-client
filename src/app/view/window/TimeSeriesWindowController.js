/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.window.TimeSeriesWindowController
 */
Ext.define('Koala.view.window.TimeSeriesWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-timeserieswindow',
    requires: [
        'Koala.util.String',
        'Koala.model.Station',
        'Koala.view.component.D3Chart'
    ],

    /**
     * The CSS class we'll assign to 'selected' legend items.
     */
    legendSelectedCssClass: 'k-selected-chart-legend',

    /**
     * Disable UTC-Button when TimeSeriesWindow is shown.
     */
    onTimeseriesShow: function () {
        Ext.ComponentQuery.query('k-button-timereference')[0].disable();
    },

    /**
     * Removes the previousy selected feature from the select interaction
     * Enable UTC-Button when TimeSeriesWindow is closed.
     */
    onTimeseriesClose: function() {
        // TODO prepare for multi map setup
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        mapComp.removeAllHoverFeatures();

        Ext.ComponentQuery.query('k-button-timereference')[0].enable();
    },

    /**
     *
     */
    createTimeSeriesChart: function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var valFromSeq = Koala.util.String.getValueFromSequence;
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat) : "";
        var startDate = view.down('datefield[name=datestart]').getValue();
        var endDate = view.down('datefield[name=dateend]').getValue();

        var chart = {
            xtype: 'd3-chart',
            name: olLayer.get('name'),
            height: 200,
            width: 700,
            startDate: startDate,
            endDate: endDate,
            targetLayer: olLayer,
            selectedStations: [olFeat],
            chartMargin: {
                top: 10,
                right: 200,
                bottom: 20,
                left: 40
            },
            shapes: [{
                type: 'line',
                curve: 'linear',
                xField: chartConfig.xAxisAttribute,
                yField: chartConfig.yAxisAttribute,
                name: stationName,
                id: olFeat.get('id'),
                color: valFromSeq(chartConfig.colorSequence, 0, 'red'),
                opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 1),
                width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1),
                tooltipTpl: chartConfig.tooltipTpl
            }],
            grid: {
                show: true, // neue Config ?
                color: '#d3d3d3', // neue Config ?
                width: 1, // neue Config ?
                opacity: 0.7 // neue Config ?
            },
            axes: {
                left: {
                    scale: 'linear',
                    dataIndex: chartConfig.yAxisAttribute, //'value',
                    format: ',.0f',
                    label: (chartConfig.yAxisLabel || '') + ' ' + (chartConfig.dspUnit || '')
                },
                bottom: {
                    scale: 'time',
                    dataIndex: chartConfig.xAxisAttribute, //'end_measure',
                    label: chartConfig.xAxisLabel || ''
                }
            }
        };

        // if (Ext.isEmpty(chartConfig.allowCrossZoom) ||
        //     Koala.util.String.getBool(chartConfig.allowCrossZoom)) {
        //     interactions = {
        //        type: 'crosszoom',
        //        // We need the tyoe below, as there is a bug inExtJS: see this
        //        // lines: http://docs.sencha.com/extjs/6.0/6.0.0-classic/source/
        //        // /AbstractChart.html
        //        // #Ext-chart-AbstractChart-method-getInteraction
        //        // That particular bug is fixed in non-GPL 6.0.1
        //        tyoe: 'crosszoom',
        //        axes: {
        //            bottom: {
        //                maxZoom: 5,
        //                allowPan: true
        //            }
        //        }
        //    };
        // }
        // var chart = {
        //     xtype: 'k-chart-timeseries',
        //     name: olLayer.get('name'),
        //     layer: olLayer,
        //     interactions: interactions,
        //     height: 200,
        //     width: 700
        // };
        return chart;
    },

    layerTimeFilterToCql: function(layer, urlParamTime) {
        var cql = "";
        var util = Koala.util.Layer;
        var filter = util.getEffectiveTimeFilterFromMetadata(layer.metadata);
        var paramName = filter && filter.param;
        var filterType = filter && filter.type;
        if (filterType === "timerange") {
            cql = paramName + " DURING " + urlParamTime;
        } else if (filterType === "pointintime") {
            cql = paramName + " = " + urlParamTime;
        } else {
            cql = "1=1";
        }
        return cql;
    },

    /**
     *
     */
    createTimeSeriesCombo: function(olLayer) {
        var me = this;

        var chartConfig = olLayer.get('timeSeriesChartProperties');

        // first try to read out explicitly configured WFS URL
        var url = Koala.util.Object.getPathStrOr(
                olLayer.metadata,
                "layerConfig/wfs/url",
                null
            );
        if (!url) {
            // … otherwise determine from wms url
            url = (olLayer.getSource().getUrls()[0]).replace(/\/wms/g, "/wfs");
        }

        var identifyField = chartConfig.featureIdentifyField || "id";
        var idDataType = chartConfig.featureIdentifyFieldDataType || "string";
        var dspField = chartConfig.featureShortDspField || "name";

        var modelNamespace = Koala.model;
        var modelName = 'FeatureType-' + olLayer.id;
        var model;
        if (modelName in modelNamespace) {
            model = modelNamespace[modelName];
        } else {
            model = Ext.define('Koala.model.' + modelName, {
                extend: 'Ext.data.Model',
                fields: [{
                     name: 'id',
                     mapping: function(dataRec){
                         return dataRec.properties[identifyField];
                     }
                },{
                    name: 'dspName',
                    mapping: function(dataRec){
                        return dataRec.properties[dspField];
                    }
                }]
            });
        }

        var extraParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: olLayer.getSource().getParams().LAYERS,
            outputFormat: 'application/json'
        };
        var srcParams = olLayer.getSource().getParams();
        if ('viewparams' in srcParams) {
            extraParams.viewparams = srcParams.viewparams;
        }

        var layerTimeFilterAsCql;
        if ('TIME' in srcParams) {
            // could otherwise check encodeFilterInViewparams
            layerTimeFilterAsCql = me.layerTimeFilterToCql(
                olLayer, srcParams.TIME
            );
        }

        var store = Ext.create('Ext.data.Store', {
            model: model,
            sorters: [{
                property: 'dspName',
                direction: 'ASC'
            }],
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    rootProperty: 'features'
                },
                noCache: false,
                extraParams: extraParams
            }
        });
        var combo = {
            xtype: 'combo',
            name: 'add-series-combo-' + olLayer.get('name'),
            store: store,
            displayField: 'dspName',
            valueField: 'id',
            emptyText: 'Serie hinzufügen',
            queryParam: 'CQL_FILTER',
            listeners: {
                select: Ext.Function.bind(me.onTimeSeriesComboSelect,
                    me, [olLayer], true),
                beforequery: function(queryPlan){
                    var cqlParts = [];
                    if (layerTimeFilterAsCql) {
                        cqlParts.push(layerTimeFilterAsCql);
                    }
                    if (queryPlan.query) {
                        cqlParts.push(
                            dspField + " ILIKE '%" + queryPlan.query + "%'"
                        );
                    }
                    // now filter out series already in the chart
                    // var chart = this.up(
                    //         'panel[name="chart-composition"]'
                    //     ).down('chart');
                    // var selectedStations = chart.getSelectedStations();
                    var selectedStations = [];
                    var stationIds = [];
                    Ext.each(selectedStations, function(selectedStation) {
                        var stationId = selectedStation.get(identifyField);
                        if (idDataType === 'string') {
                            stationId = "'" + stationId + "'";
                        }
                        stationIds.push(stationId);
                    });
                    if (stationIds.length > 0) {
                        var inPart = "IN (" + stationIds.join(",") + ")";
                        cqlParts.push("NOT " + identifyField + " " + inPart);
                    }
                    queryPlan.query = cqlParts.join(" AND ");
                }
            }
        };
        return combo;
    },

    /**
     *
     */
    onTimeSeriesComboSelect: function(combo, rec, evt, olLayer) {
        var me = this;
        var format = new ol.format.GeoJSON();
        var olFeat = format.readFeature(rec.data);
        olFeat.set('layer', olLayer);

        me.updateTimeSeriesChart(olLayer, olFeat);
        combo.reset();
    },

    /**
     *
     */
    createTimeSeriesChartPanel: function(olLayer, olFeat) {
        var me = this;
        var viewModel = me.getViewModel();
        var chart = me.createTimeSeriesChart(olLayer, olFeat);
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var addSeriesCombo;
        if (Koala.util.String.getBool(chartConfig.allowAddSeries)) {
            addSeriesCombo = me.createTimeSeriesCombo(olLayer);
        }
        var title = !Ext.isEmpty(chartConfig.titleTpl) ?
            Koala.util.String.replaceTemplateStrings(
            chartConfig.titleTpl, olLayer) : olLayer.get('name');

        var panel = {
            xtype: 'panel',
            name: 'chart-composition',
            title: title,
            collapsible: true,
            hideCollapseTool: true,
            titleCollapse: true,
            closable: true,
            titleAlign: 'center',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [chart]
        };

        var rightColumnWrapper = {
            xtype: 'panel',
            header: false,
            layout: {
                type: 'vbox',
                align: 'middle'
            },
            bodyPadding: 5,
            items: []
        };

        var undoBtn = {
            text: viewModel.get('undoBtnText'),
            xtype: 'button',
            handler: me.onUndoButtonClicked,
            scope: me,
            margin: '0 0 10px 0'
        };

        var removeSeriesBtn = {
            text: viewModel.get('removeSeriesBtnText'),
            xtype: 'button',
            name: 'remove-series',
            disabled: true,
            handler: me.onRemoveSeriesButtonClicked,
            scope: me,
            margin: '0 0 10px 0',
            listeners: {
                afterrender: {
                    fn: me.registerFocusChangeLegendHandler,
                    single: true
                },
                beforedestroy: {
                    fn: me.unregisterFocusChangeLegendHandler,
                    single: true
                },
                scope: me
            }
        };

        rightColumnWrapper.items.push(undoBtn);
        // TODO we may want to have this being configurable as the addSeries
        //      combo below is.
        rightColumnWrapper.items.push(removeSeriesBtn);

        if (addSeriesCombo) {
            rightColumnWrapper.items.push(addSeriesCombo);
        }
        panel.items.push(rightColumnWrapper);

        return panel;
    },

    /**
     * Registers a listener for focuschange on legenditems, which enables or
     * disables the remove series button. Called after the button was rendered.
     *
     * @param {Ext.button.Button} btn The remove-series button.
     */
    registerFocusChangeLegendHandler: function(btn){
        var me = this;
        var chart = btn.up('[name="chart-composition"]').down('chart');
        var legend = chart && chart.getLegend();
        if (legend) {
            // store it in the btn, so that unregisterFocusChangeLegendHandler
            // can access it, there seems to be no way around this, as the
            // chart-composition is already destroyed at this point.
            btn.legend = legend;

            legend.on({
                itemclick: me.onLegendItemClick,
                containerclick: me.onLegendContainerClick,
                scope: me
            });
        }
    },

    /**
     * Unregisters the listener for focuschange on legenditems, which enables or
     * disables the remove series button. Called during the destroy of the
     * button
     *
     * @param {Ext.button.Button} btn The remove-series button.
     */
    unregisterFocusChangeLegendHandler: function(btn){
        var me = this;
        var legend = btn && btn.legend;
        if (legend) {
            legend.un({
                itemclick: me.onLegendItemClick,
                containerclick: me.onLegendContainerClick,
                scope: me
            });
        }
    },

    /**
     * Called when the legend container is clicked and not a specific legend
     * item, this method will visually deselect any ölegend items and also reset
     * and disable the remove series button.
     *
     * @param {Ext.chart.Legend} legend The legend.
     */
    onLegendContainerClick: function(legend) {
        var chartWrap = legend.up('[name="chart-composition"]');
        var btn = chartWrap && chartWrap.down('button[name="remove-series"]');
        if (btn) {
            btn.lastLegendSelection = null;
            btn.setDisabled(true);
            this.removeAllLegendHiglighting(legend);
        }
    },

    /**
     * Removes the CSS class #legendSelectedCssClass from any legend items which
     * are children of the passed legend.
     *
     * @param {Ext.chart.Legend} legend The legend.
     */
    removeAllLegendHiglighting: function(legend) {
        var cssClass = this.legendSelectedCssClass;
        var legendDom = legend.getEl().dom;
        var oldHighlighted = Ext.DomQuery.select(
            '.' + cssClass,
            legendDom
        );
        Ext.each(oldHighlighted, function(oldHighlight) {
            Ext.get(oldHighlight).removeCls(cssClass);
        });
    },

    /**
     * Whenever a legenditem is clicked we do three things:
     *
     * 1) Disable or enable the associated series (one series mus always be
     *    enabled).
     * 2) Visually select the clicked legend element (to tell people which
     *    series will be affected by the 'remove series' button).
     * 3) Store the record of the clicked series inside a property of the
     *    delete button, to correctly determine the layer to eventually delete.
     *
     * This method is bound to the `itemclick` event, because the previously
     * used `focuschanged` event wouldn't be so easy to understand (with regard
     * to the visual indcation of selection).
     *
     * See https://redmine-koala.bfs.de/issues/1394
     *
     * @param {Ext.chart.Legend} legend The legend.
     * @param {Ext.data.Model} record The clicked record
     */
    onLegendItemClick: function(legend, record) {
        var me = this;
        var legendDom = legend.getEl().dom;
        var chartWrap = legend.up('[name="chart-composition"]');
        var btn = chartWrap && chartWrap.down('button[name="remove-series"]');
        var cssClass = me.legendSelectedCssClass;

        // 1) disable/enable the clicked series
        if (record) {
            var doAllowToggling = false;
            var currentlyDisabled = record.get('disabled');
            if (currentlyDisabled === true) {
                doAllowToggling = true;
            } else {
                var store = legend.getStore();
                var maxDisabledCnt = store.getCount() - 1;
                var disabledCount = 0;
                store.each(function(rec) {
                    if (rec.get('disabled') === true) {
                        disabledCount++;
                    }
                });
                doAllowToggling = maxDisabledCnt > disabledCount;
            }

            if (doAllowToggling) {
                record.set('disabled', !currentlyDisabled);
            }
        }

        // 2) visually select the legendDiv
        me.removeAllLegendHiglighting(legend);
        var legDom = Ext.DomQuery.select(
            '[data-recordid=' + record.internalId + ']',
            legendDom
        )[0];
        var legElement = Ext.get(legDom);
        if (legElement) {
            legElement.addCls(cssClass);
        } else {
            Ext.log.warn('Failed to determine a legend element to highlight');
        }

        // 3) store reference for removeBtn
        if (btn) {
            btn.lastLegendSelection = record;
            btn.setDisabled(false);
        }
    },

    /**
     * This method actually removes a previously focused series of a chart. The
     * main removal logic is handled in the chart see e.g.
     * Koala.view.chart.TimeSeries#removeStation.
     *
     * @param {Ext.button.Button} btn The remove-series button.
     */
    onRemoveSeriesButtonClicked: function(removeBtn){
        var lastLegendSelection = removeBtn.lastLegendSelection;
        if (!lastLegendSelection) {
            return;
        }
        var chart = removeBtn.up('[name="chart-composition"]').down('chart');
        var series = lastLegendSelection.get('series');
        var name = lastLegendSelection.get('name');
        var viewModel = this.getViewModel();
        var questionTpl = viewModel.get('removeSeriesQuestionTpl');
        var questionTitle = viewModel.get('removeSeriesQuestionTitle');
        var question = Ext.String.format(questionTpl, name);

        Ext.Msg.confirm(questionTitle, question, function(doRemove){
            if (doRemove === "yes") {
                chart.removeStation(series);
            }
        });
    },

    /**
     * Zoom back out after the button has been clicked.
     *
     * @param {Ext.button.Button} undoBtn The clicked undo button.
     */
    onUndoButtonClicked: function(undoBtn){
        var chart = undoBtn.up('[name="chart-composition"]').down('chart');
        var crossZoomInteraction = chart.getInteraction('crosszoom');
        if (crossZoomInteraction && crossZoomInteraction.undoZoom) {
            crossZoomInteraction.undoZoom();
        }
    },

    /**
     *
     */
    updateTimeSeriesChart: function(olLayer, olFeat) {
        // don't proceed if we don't get a olFeat, e.g. if we were called
        // by the selectChartLayerCombo
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var chart = view.down('d3-chart[name="' + layerName + '"]');
        var chartController = chart.getController();
        var valFromSeq = Koala.util.String.getValueFromSequence;
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat) : "";

        // console.log(chart.getSelectedStations().length - 1)
        chartController.addShape({
            type: 'line',
            curve: 'linear',
            xField: chartConfig.xAxisAttribute, //'end_measure'
            yField: chartConfig.yAxisAttribute, //'value'
            name: stationName,
            id: olFeat.get('id'),
            color: valFromSeq(chartConfig.colorSequence, chart.getSelectedStations().length, 'red'),
            opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 0),
            width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1)
        }, olFeat, false);

    },

    /**
     *
     */
    isLayerChartRendered: function(layerName) {
        var me = this;
        var view = me.getView();
        var existingCharts = view ? view.query('d3-chart') : [];
        var isRendered = false;

        Ext.each(existingCharts, function(chart) {
            if (chart.name === layerName) {
                isRendered = true;
                return;
            }
        });

        return isRendered;
    },

    /**
     *
     */
    onSetFilterBtnClick: function() {
        var me = this;
        var staticChartController = Koala.view.component.D3ChartController;
        var view = me.getView();
        var charts = view.query('d3-chart');
        var startDate = view.down('datefield[name=datestart]').getValue();
        var endDate = view.down('datefield[name=dateend]').getValue();

        Ext.each(charts, function(chart, idx) {
            var chartController = chart.getController();

            // update the time range for the chart
            chart.setStartDate(startDate);
            chart.setEndDate(endDate);

            chartController.deleteShapeSeriesByIdx(idx);
            chartController.deleteLegendEntry(staticChartController.CSS_CLASS.PREFIX_IDX_LEGEND_GROUP + idx);

            // update the chart to reflect the changes
            chart.getController().getChartData();

            // var selectedStations = chart.getSelectedStations();
            // chart.removeAllStations();
            // chart.getStore().removeAll();
            // Ext.each(selectedStations, function(selectedStation) {
            //     me.createOrUpdateChart(chart.layer, selectedStation);
            // });
        });
    },

    /**
     *
     */
    onResetFilterBtnClick: function() {
        var me = this;
        var view = me.getView();
        var form = view.down('form');
        var setFilterBtn = form.down('button[name="btn-set-filter"]');
        if (form && form.reset) {
            form.reset();
            if (setFilterBtn) {
                me.onSetFilterBtnClick(setFilterBtn);
            }
        }
    },

    /**
     *
     */
    setAbscissaRange: function(chart, minVal, maxVal) {
        var abscissa = chart.getAxis(1);
        abscissa.setFromDate(minVal);
        abscissa.setToDate(maxVal);
        chart.redraw();
    },

    /**
     *
     */
    bindSelectChartLayerStore: function(combo) {
        var layerStore = BasiGX.view.component.Map.guess().getStore();
        var comboStore = Ext.clone(layerStore);
        comboStore.filterBy(function(record){
            if(record.data.get('timeSeriesChartProperties') &&
               !Ext.Object.isEmpty(record.data.get('timeSeriesChartProperties'))
               ){
                return true;
            } else {
                return false;
            }
        });
        combo.bindStore(comboStore);
    },

    /**
     *
     */
    onSelectChartLayerComboSelect: function(combo, rec) {
        var me = this;
        var olLayer = rec.data;
        me.createOrUpdateChart(olLayer);
        combo.reset();
    },

    /**
     *
     */
    createOrUpdateChart: function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        // if the window contains a chart rendered for a feature from the
        // same layer as the given olFeat already, load a new timeseries into
        // the existing chart
        if (layerChartRendered) {
            me.updateTimeSeriesChart(olLayer, olFeat);
        } else {
            // otherwise create a new chart for the olFeat and add it to the
            // window and update the store
            view.add(me.createTimeSeriesChartPanel(olLayer, olFeat));
            // me.updateTimeSeriesChart(olLayer, olFeat);
        }
    }

});
