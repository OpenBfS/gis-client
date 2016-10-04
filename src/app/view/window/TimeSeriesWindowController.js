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
        var view = this.getView();
        var start = view.down('datefield[name=datestart]').getValue();
        var end = view.down('datefield[name=dateend]').getValue();
        return Koala.view.component.D3Chart.create(olLayer, olFeat, start, end);
    },

    /**
     *
     */
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

        rightColumnWrapper.items.push(undoBtn);

        if (addSeriesCombo) {
            rightColumnWrapper.items.push(addSeriesCombo);
        }
        panel.items.push(rightColumnWrapper);

        return panel;
    },

    /**
     * Zoom back out after the button has been clicked.
     *
     * @param {Ext.button.Button} undoBtn The clicked undo button.
     */
    onUndoButtonClicked: function(undoBtn){
        var chart = undoBtn.up('[name="chart-composition"]').down('d3-chart');
        var chartCtrl = chart.getController();
        chartCtrl.resetZoom();
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
        var StringUtil = Koala.util.String;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var chart = view.down('d3-chart[name="' + layerName + '"]');
        var chartController = chart.getController();
        var valFromSeq = StringUtil.getValueFromSequence;
        var coerce = StringUtil.coerce;
        var stationName = "";
        if(!Ext.isEmpty(chartConfig.seriesTitleTpl)) {
            stationName =StringUtil.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat
            );
        }
        var currentSeqIndex = chart.getSelectedStations().length;
        var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, "");
        if (!color) {
            color = chartController.getRandomColor();
        }

        chartController.addShape({
            type: chartConfig.shapeType || 'line',
            curve: chartConfig.curveType || 'linear',
            xField: chartConfig.xAxisAttribute,
            yField: chartConfig.yAxisAttribute,
            name: stationName,
            id: olFeat.get('id'),
            color: color,
            opacity: coerce(chartConfig.strokeOpacity) || 1,
            width: coerce(chartConfig.strokeWidth) || 1,
            tooltipTpl: chartConfig.tooltipTpl
        }, olFeat, false);
    },

    /**
     *
     */
    isLayerChartRendered: function(layerName) {
        var view = this.getView();
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
        var view = me.getView();
        var charts = view.query('d3-chart');
        var startDate = view.down('datefield[name=datestart]').getValue();
        var endDate = view.down('datefield[name=dateend]').getValue();

        Ext.each(charts, function(chart) {
            var chartController = chart.getController();

            // update the time range for the chart
            chart.setStartDate(startDate);
            chart.setEndDate(endDate);

            var shapes = chart.getShapes();

            Ext.each(shapes, function(shape) {
                chartController.deleteShapeSeriesById(shape.id);
                chartController.deleteLegendEntry(shape.id);
            });

            // update the chart to reflect the changes
            chart.getController().getChartData();
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
        }
    }

});
