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
 * @class Koala.view.window.TimeSeriesWindowController
 */
Ext.define('Koala.view.window.TimeSeriesWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-timeserieswindow',
    requires: [
        'Koala.util.ChartAutoUpdater',
        'Koala.util.String',
        'Koala.model.Station',
        'Koala.view.component.D3Chart',
        'Koala.view.window.Print',
        'Koala.util.Print'
    ],

    /**
     * Disable UTC-Button when TimeSeriesWindow is shown.
     */
    onTimeseriesShow: function() {
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
        var timeFilter = Koala.util.Layer.getEffectiveTimeFilterFromMetadata(
            olLayer.metadata);
        var view = this.getView();
        var addFilterForm = view.getAddFilterForm();

        var startValue = this.getStartFieldValue();
        var endValue = this.getEndFieldValue();

        var startDate = addFilterForm ? startValue :
            Koala.util.Date.getUtcMoment(timeFilter.mindatetimeinstant);
        var endDate = addFilterForm ? endValue :
            Koala.util.Date.getUtcMoment(timeFilter.maxdatetimeinstant);

        var config = {
            startDate: startDate,
            endDate: endDate,
            flex: 1,
            height: '100%'
        };

        return Koala.view.component.D3Chart.create(olLayer, olFeat, config);
    },

    /**
     * Toggles the scale of the left axis back and forth between log and linear.
     */
    toggleScale: function() {
        var chart = this.getView().down('d3-chart');
        var leftAxis = chart.getAxes().left;

        var attachedSeries = chart.shapes[0].attachedSeries;
        if (attachedSeries) {
            Koala.util.ChartAxes.showToggleScaleMenu(
                attachedSeries,
                chart,
                this.getView().down('[name=btn-toggle-scale]').el,
                this.getViewModel().get('axisText')
            );
        } else {
            Koala.util.ChartAxes.toggleScaleForAxis(
                leftAxis,
                chart.getController()
            );
        }
    },

    /**
     *
     */
    layerTimeFilterToCql: function(layer, urlParamTime) {
        var cql = '';
        var util = Koala.util.Layer;
        var filter = util.getEffectiveTimeFilterFromMetadata(layer.metadata);
        var paramName = filter && filter.param;
        var filterType = filter && filter.type;
        if (filterType === 'timerange') {
            cql = paramName + ' DURING ' + urlParamTime;
        } else if (filterType === 'pointintime') {
            cql = paramName + ' = ' + urlParamTime;
        } else {
            cql = '1=1';
        }
        return cql;
    },

    /**
     *
     */
    createTimeSeriesCombo: function(olLayer) {
        var me = this;

        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var idField = Koala.util.Object.getPathStrOr(olLayer.metadata,
            'layerConfig/olProperties/featureIdentifyField', 'id');

        // first try to read out explicitly configured WFS URL
        var url = Koala.util.Object.getPathStrOr(
            olLayer.metadata,
            'layerConfig/wfs/url',
            null
        );
        if (!url) {
            // … otherwise determine from wms url
            url = (olLayer.getSource().getUrls()[0]).replace(/\/wms/g, '/wfs');
        }

        var idDataType = chartConfig.featureIdentifyFieldDataType || 'string';
        var dspField = chartConfig.featureShortDspField || 'name';

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
                    mapping: function(dataRec) {
                        return dataRec.properties[idField];
                    }
                },{
                    name: 'dspName',
                    mapping: function(dataRec) {
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
                sorterFn: function(record1, record2) {
                    var dspName1 = Koala.util.String.replaceSpecialChar(record1.data.dspName),
                        dspName2 = Koala.util.String.replaceSpecialChar(record2.data.dspName);

                    return dspName1 > dspName2 ? 1 : (dspName1 === dspName2) ? 0 : -1;
                },
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
            bind: {
                emptyText: '{selectSeriesComboEmptyText}'
            },
            queryParam: 'CQL_FILTER',
            listeners: {
                select: Ext.Function.bind(me.onTimeSeriesComboSelect,
                    me, [olLayer], true),
                beforequery: function(queryPlan) {
                    var cqlParts = [];
                    if (layerTimeFilterAsCql) {
                        cqlParts.push(layerTimeFilterAsCql);
                    }
                    if (queryPlan.query) {
                        cqlParts.push(
                            dspField + ' ILIKE \'%' + queryPlan.query + '%\''
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
                        var stationId = selectedStation.get(idField);
                        if (idDataType === 'string') {
                            stationId = '\'' + stationId + '\'';
                        }
                        stationIds.push(stationId);
                    });
                    if (stationIds.length > 0) {
                        var inPart = 'IN (' + stationIds.join(',') + ')';
                        cqlParts.push('NOT ' + idField + ' ' + inPart);
                    }
                    queryPlan.query = cqlParts.join(' AND ');
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

    setTranslatedAutorefreshData: function() {
        var view = this.getView();
        var combo = view.down('[name=autorefresh-combo]');
        var value = combo.getValue();
        var store = combo.getStore();
        var data = this.getTranslatedAutorefreshData();
        store.removeAll();
        store.add(data[0], data[1]);
        combo.setValue(value);
    },

    getTranslatedAutorefreshData: function() {
        var view = this.getView();
        var vm = view.getViewModel();
        return [
            {value: 'autorefresh-expand', title: vm.get('autorefreshExpand')},
            {value: 'autorefresh-move', title: vm.get('autorefreshMove')}
        ];
    },

    /**
     *
     */
    createTimeSeriesChartPanel: function(olLayer, olFeat) {
        var me = this;
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        var imisRoles = mapComp.appContext.data.merge.imis_user.userroles;
        var maySeeIdThresholdButton = Ext.Array.contains(imisRoles, 'imis') ||
            Ext.Array.contains(imisRoles, 'ruf');
        if (mapComp.appContext.data.merge.tools.indexOf('detectionLimitBtn') === -1) {
            maySeeIdThresholdButton = false;
        }
        var chart = me.createTimeSeriesChart(olLayer, olFeat);
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var addSeriesCombo;
        if (Koala.util.String.getBool(chartConfig.allowAddSeries)) {
            addSeriesCombo = me.createTimeSeriesCombo(olLayer);
        }
        var langCombo = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        langCombo.on('applanguagechanged', me.setTranslatedAutorefreshData.bind(me));
        var title = !Ext.isEmpty(chartConfig.titleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.titleTpl, olLayer) : olLayer.get('name');

        var autorefreshStore = Ext.create('Ext.data.Store', {
            fields: ['value', 'title'],
            data: this.getTranslatedAutorefreshData()
        });

        var rightColumnWrapper = {
            xtype: 'panel',
            header: false,
            layout: {
                type: 'vbox',
                align: 'middle',
                pack: 'center'
            },
            bodyPadding: 5,
            height: '100%',
            width: 180,
            items: [{
                xtype: 'button',
                bind: {
                    text: '{chartPrint}'
                },
                glyph: 'xf039@FontAwesome',
                iconAlign: 'right',
                handler: me.onPrintChartClicked,
                listeners: {
                    boxready: Koala.util.AppContext.generateCheckToolVisibility('irixPrintBtn')
                },
                scope: me,
                margin: '0 0 10px 0'
            }, {
                xtype: 'checkbox',
                name: 'autorefresh-checkbox',
                checked: false,
                bind: {
                    boxLabel: '{autorefresh}'
                }
            }, {
                xtype: 'combo',
                name: 'autorefresh-combo',
                displayField: 'title',
                valueField: 'value',
                store: autorefreshStore,
                bind: {
                    emptyText: '{autorefreshOptions}'
                }
            }, {
                xtype: 'button',
                bind: {
                    text: '{exportAsImageBtnText}'
                },
                handler: me.onExportAsImageClicked,
                scope: me,
                margin: '0 0 10px 0'
            }, {
                xtype: 'button',
                bind: {
                    text: '{toggleDataBelowIdentificationThreshold}'
                },
                handler: me.toggleDataBelowIdentificationThreshold,
                enableToggle: true,
                hidden: !maySeeIdThresholdButton,
                scope: me,
                margin: '0 0 10px 0'
            }, {
                xtype: 'button',
                name: 'btn-toggle-scale',
                enableToggle: true,
                bind: {
                    text: '{toggleScaleBtnText}'
                },
                handler: this.toggleScale.bind(this),
                margin: '0 10px 10px 0'
            }, {
                xtype: 'button',
                bind: {
                    text: '{undoBtnText}'
                },
                hidden: !Koala.util.String.coerce(chartConfig.allowZoom),
                handler: me.onUndoButtonClicked,
                scope: me,
                margin: '0 0 10px 0'
            }]
        };

        if (addSeriesCombo) {
            rightColumnWrapper.items.push(addSeriesCombo);
        }

        var panel = {
            xtype: 'panel',
            name: 'chart-composition',
            title: title,
            collapsible: true,
            hideCollapseTool: true,
            titleCollapse: true,
            closable: true,
            titleAlign: 'center',
            layout: {
                type: 'hbox'
            },
            items: [
                chart,
                rightColumnWrapper
            ]
        };
        return panel;
    },

    /**
     * Called when an authorized user wants to toggle visibility of the real
     * values below identification threshold.
     * @param {Ext.button.Button} btn the toggle button
     */
    toggleDataBelowIdentificationThreshold: function(btn) {
        var view = this.getView();
        var chart = view.down('d3-chart');
        chart.setShowIdentificationThresholdData(btn.pressed);
        var ctrl = chart.getController();
        ctrl.getChartData();
    },

    /**
     * Convert current chart view into PNG.
     *
     * @param {Ext.button.Button} btn The button.
     */
    onExportAsImageClicked: function(btn) {
        var chart = btn.up('[name="chart-composition"]').down('d3-chart');
        var chartCtrl = chart.getController();
        chartCtrl
            .showScaleWindow()
            .then(function(scale) {
                return chartCtrl.chartToDataUri(scale, false);
            })
            .then(function(dataUri) {
                download(dataUri, 'chart.png', 'image/png');
            });
    },

    onPrintChartClicked: function(btn) {
        var chart = btn.up('[name="chart-composition"]').down('d3-chart');
        Koala.util.Print.doChartPrint(chart);
    },

    /**
     * Zoom back out after the button has been clicked.
     *
     * @param {Ext.button.Button} btn The clicked button.
     */
    onUndoButtonClicked: function(btn) {
        var chart = btn.up('[name="chart-composition"]').down('d3-chart');
        var chartCtrl = chart.getController();
        chartCtrl.resetZoom();
    },

    /**
     *
     */
    updateTimeSeriesChart: function(olLayer, olFeat, oldChart) {
        // don't proceed if we don't get a olFeat, e.g. if we were called
        // by the selectChartLayerCombo
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chart = view.down('d3-chart[name="' + layerName + '"]');

        Koala.util.Chart.addFeatureToTimeseriesChart(olLayer, olFeat, chart, oldChart);
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
        var startDate = this.getStartFieldValue();
        var endDate = this.getEndFieldValue();

        Ext.each(charts, function(chart) {
            // update the time range for the chart
            chart.setStartDate(startDate);
            chart.setEndDate(endDate);

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
     * Returns the curent value of the combined start datefield and start
     * time spinners.
     * @return {Moment} A Moment object.
     */
    getStartFieldValue: function() {
        var view = this.getView();
        var startField = view.down('datefield[name="timeseriesStartField"]');
        var startDate = startField.getValue(true);
        startDate = Koala.util.Filter.setHoursAndMinutes(startDate, startField);
        return startDate;
    },

    /**
     * Returns the curent value of the combined end datefield and end
     * time spinners.
     * @return {Moment} A Moment object.
     */
    getEndFieldValue: function() {
        var view = this.getView();
        var endField = view.down('datefield[name="timeseriesEndField"]');
        var endDate = endField.getValue(true);
        endDate = Koala.util.Filter.setHoursAndMinutes(endDate, endField);
        return endDate;
    },

    /**
     *
     */
    bindSelectChartLayerStore: function(combo) {
        var layerStore = BasiGX.view.component.Map.guess().getStore();
        var comboStore = Ext.clone(layerStore);
        comboStore.filterBy(function(record) {
            return record.data.get('timeSeriesChartProperties') &&
               !Ext.Object.isEmpty(record.data.get('timeSeriesChartProperties'));
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
    createOrUpdateChart: function(olLayer, olFeat, oldChart) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        // if the window contains a chart rendered for a feature from the
        // same layer as the given olFeat already, load a new timeseries into
        // the existing chart
        if (layerChartRendered) {
            me.updateTimeSeriesChart(olLayer, olFeat, oldChart);
        } else {
            // otherwise create a new chart for the olFeat and add it to the
            // window and update the store
            view.add(me.createTimeSeriesChartPanel(olLayer, olFeat));
        }
        this.setTranslatedAutorefreshData();
        var optionsCombo = view.down('[name=autorefresh-combo]');
        var autorefreshBox = view.down('[name=autorefresh-checkbox]');
        var chart = view.down('d3-chart');
        var startField = view.down('[name=timeseriesStartField]');
        var endField = view.down('[name=timeseriesEndField]');
        Koala.util.ChartAutoUpdater.autorefreshTimeseries(
            chart,
            optionsCombo,
            autorefreshBox,
            olLayer,
            startField,
            endField
        );
    },

    onFilterChanged: function() {}

});
