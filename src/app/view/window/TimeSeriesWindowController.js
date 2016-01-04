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
        'Koala.model.Station'
    ],

    /**
     * The delay in milliseconds to wait before disabling the remove series
     * button after a legend item has been deselected. This is needed so that a
     * click on the remove series button can have any effect at all, otherwise
     * the eventhandlers on the legend would be disabling the button as soon as
     * it is clicked since the legend item obviously lost the focus (the button
     * has the focus now).
     */
    disableRemoveSeriesBtnDelay: 300,

    /**
     * Removes the previousy selected feature from the select interaction
     */
    onTimeseriesClose: function() {
        // TODO prepare for multi map setup
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        var p = mapComp && mapComp.getPlugin('hover');
        var i = p && p.getHoverVectorLayerInteraction();
        var f = i && i.getFeatures();
        if (f) {
            f.clear();
        }
    },

    /**
     *
     */
    createTimeSeriesChart: function(olLayer) {
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var interactions = null;
        if (Ext.isEmpty(chartConfig.allowCrossZoom) ||
            Koala.util.String.getBool(chartConfig.allowCrossZoom)) {
            interactions = {
               type: 'crosszoom',
               // We need the tyoe below, as there is a bug inExtJS: see this
               // lines: http://docs.sencha.com/extjs/6.0/6.0.0-classic/source/
               // /AbstractChart.html
               // #Ext-chart-AbstractChart-method-getInteraction
               // That particular bug is fixed in non-GPL 6.0.1
               tyoe: 'crosszoom',
               axes: {
                   bottom: {
                       maxZoom: 5,
                       allowPan: true
                   }
               }
           };
        }
        var chart = {
            xtype: 'k-chart-timeseries',
            name: olLayer.get('name'),
            layer: olLayer,
            interactions: interactions,
            height: 200,
            width: 700
        };
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
                    var chart = this.up(
                            'panel[name="chart-composition"]'
                        ).down('chart');
                    var selectedStations = chart.getSelectedStations();
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
    createTimeSeriesChartPanel: function(olLayer) {
        var me = this;
        var viewModel = me.getViewModel();
        var chart = me.createTimeSeriesChart(olLayer);
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
        var chart = btn.up('[name="chart-composition"]').down('chart');
        var legend = chart && chart.getLegend();
        if (legend) {
            // store it in the btn, so that unregisterFocusChangeLegendHandler
            // can access it, there seems to be no way around this, as the
            // chart-composition is already destroyed at this point.
            btn.legend = legend;
            legend.on('focuschange', this.onLegendItemFocusChange, this);
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
        var legend = btn && btn.legend;
        // cancel any existing disable tasks first
        if (btn && btn.disableTask) {
            btn.disableTask.cancel();
        }
        if (legend) {
            legend.un('focuschange', this.onLegendItemFocusChange, this);
        }
    },

    /**
     * Whenever the focus of the legend items changes, this method disables or
     * enables the correct remove-series button.
     *
     * @param {Ext.selection.Model} selModel The selection model.
     * @param {Ext.data.Model} oldFocused The previously focused record
     * @param {Ext.data.Model} newFocused The newly focused record
     */
    onLegendItemFocusChange: function(selModel, oldFocused, newFocused){
        var legend = selModel.view;
        var chartWrap = legend && legend.up('[name="chart-composition"]');
        var btn = chartWrap && chartWrap.down('button[name="remove-series"]');
        var btnNowDisabled = !newFocused;
        if (!btn){
            return;
        }
        // cancel any existing disable tasks first
        if (btn.disableTask) {
            btn.disableTask.cancel();
        }
        // save the actual selection in the button, so the click handler
        // there has a chance of knowing the last selection
        if (newFocused) {
            btn.lastLegendSelection = newFocused;
        }

        if (btnNowDisabled) {
            // delay disabling so that clicks actually occur
            var task = new Ext.util.DelayedTask(function(){
                btn.setDisabled(true);
            });
            btn.disableTask = task;
            task.delay(this.disableRemoveSeriesBtnDelay);
        } else {
            // enable fast!
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
        var chart = view.down('chart[name="' + layerName + '"]');
        var controller = chart.getController();

        var added = chart.addStation(olFeat);
        if (!added) {
            // chart already contains series for the new feature.
            return;
        }

        controller.prepareTimeSeriesLoad(olFeat);
    },

    /**
     *
     */
    isLayerChartRendered: function(layerName) {
        var me = this;
        var view = me.getView();
        var existingCharts = view ? view.query('chart') : [];
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
        var view = me.getView();
        var charts = view.query('chart');
        Ext.each(charts, function(chart) {
            var selectedStations = chart.getSelectedStations();
            chart.removeAllStations();
            chart.getStore().removeAll();
            Ext.each(selectedStations, function(selectedStation) {
                me.createOrUpdateChart(chart.layer, selectedStation);
            });
        });
    },

    /**
     *
     */
    onResetFilterBtnClick: function() {
        var me = this;
        var view = me.getView();
        var charts = view.query('chart');

        Ext.each(charts, function(chart) {
            var store = chart.getStore();
            var storeData = store.getData();
            var xField = chart.getSeries()[0].getXField();
            var minVal = Date.parse(storeData.minItem(xField).get(xField));
            var maxVal = Date.parse(storeData.maxItem(xField).get(xField));
            me.setAbscissaRange(chart, minVal, maxVal);
        });
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
            view.add(me.createTimeSeriesChartPanel(olLayer));
            me.updateTimeSeriesChart(olLayer, olFeat);
        }
    }

});
