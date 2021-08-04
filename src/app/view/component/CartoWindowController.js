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
 * @class Koala.view.component.CartoWindowController
 */
Ext.define('Koala.view.component.CartoWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-cartowindow',

    requires: [
        'Ext.util.CSV',
        'Ext.Promise',
        'Ext.Ajax',
        'Ext.panel.Panel',
        'BasiGX.util.Layer',
        'Koala.util.AppContext',
        'Koala.util.Carto',
        'Koala.util.Chart',
        'Koala.util.ChartAxes',
        'Koala.util.ChartConstants',
        'Koala.util.ChartData',
        'Koala.util.Grid',
        'Koala.util.Object',
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Print',
        'Koala.view.window.Print',
        'Koala.view.menu.ChartSettingsMenu'
    ],

    constructor: function() {
        // store bound version of method
        // see https://github.com/terrestris/BasiGX/wiki/Update-application-to-ol-6.5.0,-geoext-4.0.0,-BasiGX-3.0.0#removal-of-opt_this-parameters
        this.onLayerVisibilityChange = this.onLayerVisibilityChange.bind(this);
        this.onLayerRemove = this.onLayerRemove.bind(this);

        this.callParent(arguments);
    },

    /**
     * Called on initialize event. Only used in modern toolkit.
     *
     * @private
     */
    onInitialize: function() {
        var me = this;
        var view = me.getView();
        var feature = view.getFeature();
        var layer = view.getLayer();

        // Cleanup hover artifacts
        var mapComponent = Ext.ComponentQuery.query('k-component-map')[0];

        var hoverPlugin = mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.cleanupHoverArtifacts();
        }

        // Add toolkitname (modern/classic) as css class to the view
        view.addCls(Ext.isModern ? 'modern' : 'classic');

        // If the feature has no layer set as property (like in modern) we add one
        if (!feature.get('layer')) {
            feature.set('layer', layer);
        }

        me.createTabs();

        me.createOverlay(layer);
        me.correctPosition();

        me.getOrCreateLineLayer();

        me.createLineFeature();
        me.updateLineFeature();

        me.createLayerListeners();
    },

    /**
     * Create the Tabs.
     */
    createTabs: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        me.createCloseElement();

        if (Koala.util.Layer.isTimeseriesChartLayer(layer)) {
            me.createTimeSeriesTab();
            if (Koala.util.Layer.showTimeseriesGrid(layer)) {
                me.createGridTab(me.timeserieschart);
            }
        }

        if (Koala.util.Layer.isBarChartLayer(layer)) {
            me.createBarChartTab();
            if (Koala.util.Layer.showBarChartGrid(layer)) {
                me.createGridTab(me.barChart);
            }
        }

        if (Koala.util.Layer.isTableLayer(layer)) {
            //me.createTableTab();
            //me.createGridTabFromUrl();
        }

        if (Koala.util.Layer.isHtmlLayer(layer)) {
            me.createHtmlTab();
        }

        if (layer.get('hoverTpl')) {
            me.createHoverTemplateTab();
        }

        me.updateCloseElementPosition();
    },

    /**
     * Creates the closeElement and adds it to the tabwindow.
     */
    createCloseElement: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var cartoWindowId = view.getCartoWindowId();
        var closeElement = Ext.DomHelper.createDom({
            tag: 'div',
            html: '<i class="fa fa-times-circle  fa-2x" aria-hidden="true"></i>',
            cls: cartoWindowId + ' closeElement'
        });

        closeElement.addEventListener('click', function() {
            view.destroy();
        });

        el.appendChild(closeElement);
    },

    /**
     * onCartoWindowMouseEnter listener
     *
     */
    disableMapInteractions: function() {
        if (this.interactionsDisabled) {
            return;
        }
        var element = this.getView().getEl().dom;
        if (!Koala.view.component.CartoWindowController.currentZIndex) {
            Koala.view.component.CartoWindowController.currentZIndex = 0;
        }
        element.style.zIndex = '' + ++Koala.view.component.CartoWindowController.currentZIndex;
        var map = this.getView().getMap();
        var me = this;
        this.interactionActiveList = [];
        this.interactionsDisabled = true;
        map.getInteractions().forEach(function(interaction) {
            me.interactionActiveList.push(interaction.getActive());
            interaction.setActive(false);
        });
    },

    /**
     *onCartoWindowMouseLeave listener
     *
     **/
    enableMapInteractions: function(force) {
        var view = this.getView();
        var map = BasiGX.util.Map.getMapComponent().map;
        var mouseDown = view && view.mouseDown;
        var me = this;

        if (mouseDown && !force) {
            return;
        }
        map.getInteractions().forEach(function(interaction, idx) {
            var active = me.interactionActiveList ? me.interactionActiveList[idx] : true;
            interaction.setActive(active);
        });
        this.interactionsDisabled = false;
    },

    /**
     * Updates the position of the close element due to the amount of rendered
     * tabs.
     */
    updateCloseElementPosition: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var tabs = viewModel.get('tabs');
        var tabIndex = tabs.length;
        var closeElement = view.el.down('.closeElement');
        closeElement.setStyle('left', (tabIndex*100) + 'px');
    },

    /**
     * Create the tab which contains the rendered TimeSeries and adds it to the
     * tabwindow.
     */
    createTimeSeriesTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var feature = view.getFeature();
        var timeFilter = Koala.util.Filter.getStartEndFilterFromMetadata(
            layer.metadata);

        var timeSeriesTab = me.createTabElement({
            //title: 'Timeseries',
            title: '<i class="fa fa-line-chart  fa-2x" aria-hidden="true"></i>',
            className: 'timeseries-tab',
            active: true
        });

        var tabElm = timeSeriesTab.getElementsByTagName('div')[0];
        var topRow = document.createElement('div');
        topRow.style.display = 'flex';
        tabElm.appendChild(topRow);

        var config = {
            startDate: timeFilter.mindatetimeinstant,
            endDate: timeFilter.maxdatetimeinstant,
            width: Koala.util.String.coerce(layer.metadata.layerConfig.timeSeriesChartProperties.chartWidth) || 500,
            height: Koala.util.String.coerce(layer.metadata.layerConfig.timeSeriesChartProperties.chartHeight) || 250,
            renderTo: tabElm
        };

        var chartObj = Koala.view.component.D3Chart.create(layer, feature, config);

        this.createTimeSeriesButtons(topRow);
        this.createCombineTimeseriesButton(topRow);

        var langCombo = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        langCombo.on('applanguagechanged', me.setTranslatedAutorefreshData.bind(me));

        el.appendChild(timeSeriesTab);
        this.timeserieschart = Ext.create(chartObj);

        //this.createDownloadChartDataButton(tabElm, this.timeserieschart);
        this.createIrixPrintButton(topRow, this.timeserieschart);
        this.createExportToPngButton(topRow, this.timeserieschart);
        this.createChartSettingsMenuButton(topRow);
        this.createAutorefreshUI(topRow);
    },

    /**
     * Sets up the autorefresh button & related UI elements.
     *
     * @param {HTMLElement} topRow the button row element
     */
    createAutorefreshUI: function(topRow) {
        var view = this.getView();
        var autorefreshStore = Ext.create('Ext.data.Store', {
            fields: ['value', 'title'],
            data: this.getTranslatedAutorefreshData()
        });
        var menu = Ext.create('Ext.menu.Menu', {
            closeAction: 'method-hide',
            listeners: {
                beforehide: function() {
                    this.lastHidden = new Date().getTime();
                }
            },
            items: [{
                xtype: 'checkbox',
                name: 'autorefresh-checkbox',
                checked: false,
                padding: 3,
                bind: {
                    boxLabel: view.getViewModel().get('autorefresh')
                }
            }]
        });

        this.autorefreshCombo = Ext.create({
            xtype: 'combo',
            name: 'autorefresh-combo',
            displayField: 'title',
            padding: 3,
            valueField: 'value',
            store: autorefreshStore,
            queryMode: 'local',
            bind: {
                emptyText: view.getViewModel().get('autorefreshOptions')
            }
        });
        menu.add(this.autorefreshCombo);

        Koala.util.ChartAutoUpdater.autorefreshTimeseries(
            this.timeserieschart,
            this.autorefreshCombo,
            menu.down('[name=autorefresh-checkbox]'),
            view.getLayer()
        );
        var button = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'autorefresh-button',
            iconCls: 'fa fa-refresh',
            bind: {
                tooltip: this.view.getViewModel().get('autorefresh')
            },
            renderTo: topRow,
            handler: function() {
                var timeDiff = new Date().getTime() - menu.lastHidden;
                // make sure to keep the menu closed if it was just shown
                // (e.g. when clicking on the button again)
                if (timeDiff > 150 || isNaN(timeDiff)) {
                    menu.showBy(this);
                }
            }
        };
        Ext.create(button);
    },

    setTranslatedAutorefreshData: function() {
        var combo = this.autorefreshCombo;
        if (!combo) {
            // destroyed already
            return;
        }
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
     * Create buttons to scroll/expand the timeseries start/end date.
     * @param {Element} elm element to render the buttons to
     */
    createTimeSeriesButtons: function(elm) {
        var left = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesLeft',
            glyph: 'xf104@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('expandToLeft')
            },
            renderTo: elm
        };
        var right = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesRight',
            glyph: 'xf105@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('expandToRight')
            },
            renderTo: elm
        };
        var maxExtent = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesLeft',
            glyph: 'xf0b2@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('maxExtent')
            },
            renderTo: elm
        };
        left = Ext.create(left);
        left.el.dom.addEventListener('click', this.scrollTimeseriesLeft.bind(this));
        right = Ext.create(right);
        right.el.dom.addEventListener('click', this.scrollTimeseriesRight.bind(this));
        maxExtent = Ext.create(maxExtent);
        maxExtent.el.dom.addEventListener('click', this.zoomToMaxExtent.bind(this));
    },

    /**
     * Show the chart settings menu.
     * @param {Object} btn the button/component to show the menu by
     */
    showChartSettingsMenu: function(btn) {
        var timeDiff = new Date().getTime() - this.chartSettingsMenu.lastHidden;
        // make sure to keep the menu closed if it was just shown
        // (e.g. when clicking on the button again)
        if (timeDiff > 150 || isNaN(timeDiff)) {
            this.chartSettingsMenu.showBy(btn);
        }
    },

    zoomToMaxExtent: function() {
        var chartCtrl = this.timeserieschart.getController();
        chartCtrl.resetZoom();
    },

    /**
     * Create button to combine all timeseries carto windows.
     * @param {Element} elm element to render the button to
     */
    createCombineTimeseriesButton: function(elm) {
        var combine = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesCombine',
            glyph: 'xf066@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('combineSeries')
            },
            renderTo: elm
        };
        combine = Ext.create(combine);
        combine.el.dom.addEventListener('click', this.combineTimeseries.bind(this));
    },

    /**
     * Create button to start an irix print.
     * @param {Element} elm element to render the button to
     */
    createIrixPrintButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'irixPrintBtn',
            glyph: 'xf039@FontAwesome',
            iconAlign: 'right',
            bind: {
                tooltip: this.view.getViewModel().get('irixPrintTooltip'),
                text: this.view.getViewModel().get('irixPrintText')
            }
        };
        this.IrixPrintButton = Ext.create(btn);
        this.IrixPrintButton.on('beforerender', Koala.util.AppContext.generateCheckToolVisibility('irixPrintBtn'));
        this.IrixPrintButton.render(elm, chart.xtype === 'd3-chart' ? 5 : 3);
        this.IrixPrintButton.el.dom.addEventListener('click', Koala.util.Print.doChartPrint.bind(this, chart));
    },

    /**
     * Create button to downloadChartData.
     * valid for timerseries / barcharts / grids
     * @param {Element} elm element to render the button to
     */
    createDownloadChartDataButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'downloadChartDataBtn',
            glyph: 'xf019@FontAwesome',
            iconAlign: 'right',
            bind: {
                tooltip: this.view.getViewModel().get('downloadChartDataTooltip')
            }
        };
        this.DownloadChartDataButton = Ext.create(btn);
        this.DownloadChartDataButton.render(elm, chart.xtype === 'd3-chart' ? 5 : 3);
        this.DownloadChartDataButton.el.dom.addEventListener('click', this.downloadChartData.bind(this, chart));
    },

    /**
     * configure chart data download.
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chart]
     */
    downloadChartData: function(chart) {
        var me = this;
        var viewModel = me.getViewModel();
        var feature = me.getView().getFeature();
        var fileName = 'chartData';
        var errMsg;
        if (feature.getProperties().locality_name) {
            fileName = feature.getProperties().locality_name.replace(/,/g,'').replace(/ /g,'_');
        } else if (feature.getProperties().id) {
            fileName = feature.getProperties().id;
        }

        var win = Ext.create('Ext.window.Window', {
            title: viewModel.get('downloadAllChartDataMsgTitle'),
            name: 'downloaddatawin',
            width: 330,
            layout: 'fit',
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                items: [{
                    xtype: 'textfield',
                    width: '100%',
                    fieldLabel: viewModel.get('downloadFilenameText'),
                    labelWidth: 120,
                    value: fileName,
                    allowBlank: false,
                    minLength: 3,
                    validator: function(val) {
                        errMsg = viewModel.get('filenameNotValidText');
                        return ((val.length > 3) && (val.search(/ /) === -1)) ? true : errMsg;
                    }
                },{
                    xtype: 'combo',
                    id: 'formatCombo',
                    width: '100%',
                    fieldLabel: viewModel.get('outputFormatText'),
                    labelWidth: 120,
                    value: 'csv',
                    forceSelection: true,
                    store: [
                        ['csv','csv'],
                        ['application/json','json']
                    ],
                    listeners: {
                        'select': me.onDownloadFormatSelected
                    }
                },{
                    xtype: 'combo',
                    id: 'delimiterCombo',
                    width: '100%',
                    hidden: false, //initially visible because default value of formatCombo === 'csv'
                    fieldLabel: viewModel.get('delimiterText'),
                    labelWidth: 120,
                    value: ',',
                    forceSelection: true,
                    store: [
                        [',', ','],
                        [';', ';'],
                        ['|', '|'],
                        ['\t', 'tab']
                    ]
                },{
                    xtype: 'checkbox',
                    id: 'quoteCheckbox',
                    hidden: false, //initially visible because default value of formatCombo === 'csv'
                    fieldLabel: viewModel.get('quoteText'),
                    labelWidth: 120,
                    value: true
                }]
            }],
            bbar: [{
                text: viewModel.get('downloadAllChartDataMsgButtonYes'),
                name: 'confirm-timeseries-download',
                handler: me.doChartDataDownload.bind(me, chart)
            }, {
                text: viewModel.get('downloadAllChartDataMsgButtonNo'),
                name: 'abort-timeseries-download',
                handler: function() {
                    this.up('window').close();
                }
            }]
        });
        win.show();
    },

    onDownloadFormatSelected: function(combo, record) {
        var me = this;
        var delimiterCombo = me.up().down('combo[id="delimiterCombo"]');
        var quoteCheckbox = me.up().down('checkbox[id="quoteCheckbox"]');

        if (record.get('field2') === 'csv') {
            delimiterCombo.setHidden(false);
            quoteCheckbox.setHidden(false);
        } else {
            delimiterCombo.setHidden(true);
            quoteCheckbox.setHidden(true);
        }
    },

    /**
     * configure chart data download.
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chart]
     * @param {button} btn
     *          Download Button from "downloaddatawin"
     */
    doChartDataDownload: function(chart, btn) {
        var me = this;
        var viewModel = me.getViewModel();
        var win = btn.up('window');
        var formatCombo = win.down('combo[id="formatCombo"]');
        var delimiterCombo = win.down('combo[id="delimiterCombo"]');
        var quoteCheckbox = win.down('checkbox[id="quoteCheckbox"]');
        var textbox = win.down('textfield');
        if (textbox.getValue().length < 3) {
            Ext.Msg.show({
                title: 'Info',
                msg: viewModel.get('MsgNoValidFilenameText'),
                icon: Ext.MessageBox.INFO,
                buttons: Ext.MessageBox.OK
            });
            return;
        }

        var mimetype = formatCombo.getSelectedRecord().get('field1');
        var fileEnding = formatCombo.getSelectedRecord().get('field2');
        var filename = textbox.getRawValue().replace(/ /g,'_');
        var fullFilename = filename +'.'+ fileEnding;
        var chartCtrl;
        var data;

        if (chart.xtype === 'd3-chart' || chart.xtype === 'd3-barchart' ) {
            chartCtrl = chart.getController();
        } else if (chart.xtype === 'grid') {
            chartCtrl = chart.chartElement.getController();
        }

        data = chartCtrl.rawData;

        if (mimetype==='csv' || mimetype==='application/vnd.ms-excel') {
            try {
                data = Ext.decode(data).features;
            } catch (err) {
                Ext.log.error('Could not parse raw data: ', err);
            }

            var featArray = [];
            Ext.each(data, function(record) {
                var geojsonReader = new jsts.io.GeoJSONReader;
                var wktWriter = new jsts.io.WKTWriter();
                var geom = geojsonReader.read(record.geometry);
                var geomWKT = wktWriter.write(geom);
                var props = record.properties;

                props['geometry'] = geomWKT;
                featArray.push(props);
            });

            var delimiter = delimiterCombo.getSelectedRecord().get('field1');
            var quoteStrings = quoteCheckbox.getValue();
            var config = {
                delimiter: delimiter,
                quotes: quoteStrings,
                quoteChar: '"',
                fastMode: false
            };

            data = Papa.unparse(featArray, config);
        }
        var encoder = new TextEncoder();
        data = encoder.encode(data);
        download(data, fullFilename, mimetype);
        win.close();
    },

    /**
     * Create export to png button.
     * @param {Element} elm element to render the button to
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chart
     */
    createExportToPngButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'exportToPng',
            glyph: 'xf1c5@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('exportToPngText')
            }
        };
        this.exportToPngButton = Ext.create(btn);
        this.exportToPngButton.render(elm, chart.xtype === 'd3-chart' ? 5 : 3);
        this.exportToPngButton.el.dom.addEventListener('click',
            this.exportToPng.bind(this, chart));
    },

    /**
     * Creates the bar chart toggle button to switch axes.
     * @param {Element} elm element to render the button to
     * @param {Koala.view.component.D3BarChart} chart the chart to toggle
     */
    createBarChartToggleButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            enableToggle: true,
            name: 'toggleGroupingButton',
            glyph: 'xf080@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('toggleGrouping')
            }
        };
        this.toggleGrouping = Ext.create(btn);
        this.toggleGrouping.render(elm, 3);
        this.toggleGrouping.el.dom.addEventListener('click',
            this.toggleBarChartGrouping.bind(this, chart));
    },

    /**
     * Toggles the bar charts axes.
     * @param {Koala.view.component.D3BarChart} chart the chart to toggle axes on
     */
    toggleBarChartGrouping: function(chart) {
        var ctrl = chart.getController();
        ctrl.groupPropToggled = !ctrl.groupPropToggled;
        ctrl.getChartData();
    },

    /**
     * Exports the chart to PNG and starts a download.
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chartion]
     */
    exportToPng: function(chart) {
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

    /**
     * Create the tab which contains the rendererd BarChart and adds it to the
     * tabwindow.
     */
    createBarChartTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var feature = view.getFeature();

        var barChartTab = me.createTabElement({
            //title: 'Bar Chart',
            title: '<i class="fa fa-bar-chart  fa-2x" aria-hidden="true"></i>',
            className: 'barchart-tab',
            active: true
        });

        var tabElm = barChartTab.getElementsByTagName('div')[0];

        var config = {
            width: Koala.util.String.coerce(layer.metadata.layerConfig.barChartProperties.chartWidth) || 500,
            height: Koala.util.String.coerce(layer.metadata.layerConfig.barChartProperties.chartHeight) || 250,
            flex: 1,
            renderTo: tabElm
        };

        var chartObj = Koala.view.component.D3BarChart.create(
            layer, feature, config);


        el.appendChild(barChartTab);
        this.barChart = Ext.create(chartObj);
        this.createBarChartToggleButton(tabElm, this.barChart);
        this.createIrixPrintButton(tabElm, this.barChart);
        this.createExportToPngButton(tabElm, this.barChart);
        this.createDownloadChartDataButton(tabElm, this.barChart);
        this.createChartSettingsMenuButton(tabElm);
    },

    createChartSettingsMenuButton: function(elm) {
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        var imisRoles = mapComp.appContext.data.merge.imis_user.userroles;
        var maySeeIdThresholdButton = Ext.Array.contains(imisRoles, 'imis') ||
            Ext.Array.contains(imisRoles, 'ruf');
        if (mapComp.appContext.data.merge.tools.indexOf('detectionLimitBtn') === -1) {
            maySeeIdThresholdButton = false;
        }

        this.chartSettingsMenu = Ext.create('Koala.view.menu.ChartSettingsMenu', {
            chart: this.timeserieschart || this.barChart,
            isTimeseries: !!this.timeserieschart,
            maySeeIdThresholdButton: maySeeIdThresholdButton
        });
        this.chartSettingsMenu.getViewModel().set('isTimeseries', !!this.timeserieschart);
        this.chartSettingsMenu.getViewModel().set('maySeeIdThresholdButton', maySeeIdThresholdButton);
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'chartSettings',
            glyph: 'xf013@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('chartSettings')
            },
            handler: this.showChartSettingsMenu.bind(this)
        };
        btn = Ext.create(btn);
        btn.render(elm, this.timeserieschart ? 5 : 3);
    },

    /**
     * Create the tab which contains the table content and adds it to the
     * tabwindow.
     */
    createTableTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        Koala.util.Carto.getTableData(view.layer, view.feature).then(function(data) {
            var html = Koala.util.Carto.convertData(data);

            var timeSeriesTab = me.createTabElement({
                //title: 'Table',
                title: '<i class="fa fa-table  fa-2x" aria-hidden="true"></i>',
                innerHTML: html,
                className: 'table-tab'
            });

            el.appendChild(timeSeriesTab);
            me.updateCloseElementPosition();
        });
    },

    /**
     * Create the tab which contains the table content as grid and adds it to the
     * tabwindow.
     */
    createGridTab: function(chart) {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var title;
        var gridTableTab;
        var tabElm;

        if (!chart) {
            return;
        }
        //title = (chart === me.timeserieschart) ? 'TS Table' : (chart === me.barChart) ? 'BC Table' : '';
        title = (chart === me.timeserieschart) ? '<i class="fa fa-table  fa-2x" aria-hidden="true"></i>' : (chart === me.barChart) ? '<i class="fa fa-table  fa-2x" aria-hidden="true"></i>' : '';

        gridTableTab = me.createTabElement({
            title: title,
            className: 'gridtable-tab',
            active: true
        });
        tabElm = gridTableTab.getElementsByTagName('div')[0];

        Ext.create('Ext.data.Store', {
            storeId: 'GridTabStore',
            autoLoad: true,
            data: []
        });

        var gridInTab = {
            xtype: 'grid',
            header: false,
            layout: 'fit',
            store: Ext.data.StoreManager.lookup('GridTabStore'),
            plugins: 'gridfilters',
            chartElement: chart,
            listeners: {
                boxready: function() {
                    chart.getController().on('chartdataprepared', function() {
                        var chartController = this.chartElement.getController();
                        var gridFeatures = chartController.gridFeatures;
                        this.rawData = chartController.rawData;
                        Koala.util.Grid.updateGridFeatures(this, gridFeatures);
                    }.bind(this));
                }
            }
        };
        el.appendChild(gridTableTab);
        me.updateCloseElementPosition();
        this.createDownloadChartDataButton(tabElm, gridInTab);

        Ext.create({
            xtype: 'panel',
            layout: 'fit',
            width: '500px',
            height: '300px',
            renderTo: tabElm,
            items: [gridInTab]
        });
    },

    /**
     * Create the tab which contains the table content from URL as grid and adds it to the
     * tabwindow.
     */
    createGridTabFromUrl: function() {
        var me = this;
        var view = this.getView();
        Koala.util.Carto.getTableData(view.layer, view.feature).then(function() {
            var gridTableTab = me.createTabElement({
                //title: 'GridTable',
                title: '<i class="fa fa-table  fa-2x" aria-hidden="true"></i>',
                className: 'gridtable-tab',
                active: true
            });
            var tabElm = gridTableTab.getElementsByTagName('div')[0];

            var store = Ext.create('Ext.data.Store', {
                storeId: 'GridTabStore',
                autoLoad: true,
                //data: tableData,
                proxy: {
                    type: 'ajax',
                    url: 'http://dev-pom-fr.lab.bfs.de/gis_client_configs/tableContentExample.json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            });
            var gridTab = {
                xtype: 'grid',
                header: false,
                store: Ext.data.StoreManager.lookup('GridTabStore'),
                columns: {
                    items: []
                },
                height: '400px',
                width: '400px',
                flex: 1,
                renderTo: tabElm
            };


            store.on('metachange',function(str, meta) {
                //TODO: if metachange -> new grid?! -> seems wrong
                gridTab = Ext.create(gridTab);
                gridTab.reconfigure(str, meta.columns);
            });

            tabElm.appendChild(gridTableTab);
            me.updateCloseElementPosition();
        });
    },

    /**
     * Create the tab which contains the html content and adds it to the
     * tabwindow.
     */
    createHtmlTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        Koala.util.Carto.getHtmlData(view.layer, view.feature).then(function(data) {
            var htmlTab = me.createTabElement({
                title: '<i class="fa fa-leanpub  fa-2x" aria-hidden="true"></i>',
                innerHTML: data,
                className: 'html-tab'
            });

            el.appendChild(htmlTab);
            me.updateCloseElementPosition();
        });
    },

    /**
     * Create the tab which contains the hovertemplate and adds it to the
     * tabwindow.
     */
    createHoverTemplateTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var features = view.getFeatureGroup().slice().reverse();
        var hoverPlugin = BasiGX.view.component.Map.guess().getPlugin('hoverBfS');
        var innerHTML = hoverPlugin.getToolTipHtml(layer, features);
        var timeSeriesTab = me.createTabElement({
            title: '<i class="fa fa-info-circle fa-2x" aria-hidden="true"></i>',
            innerHTML: innerHTML,
            className: 'hoverTpl-tab'
        });

        el.appendChild(timeSeriesTab);
    },

    /**
     * Create a tab for the tabwindow.
     *
     * @param {Object} config An config object which can contain these params:
     *               {String} title The title of the tab.
     *               {String} innerHtml The htmlcontent of the tab.
     *               {String} className A css class added to the tab.
     * @return {HTMLDivElement} The returned div element.
     */
    createTabElement: function(config) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var tabs = viewModel.get('tabs');
        var tabIndex = tabs.length;
        var cartoWindowId = view.getCartoWindowId();
        var tabIdString = cartoWindowId + '__cartowindow-tab-label-'+ tabIndex;

        var tab = Ext.DomHelper.createDom({
            tag: 'div',
            cls: cartoWindowId + ' cartowindow-tab ' + config.className,
            children: [{
                tag: 'label',
                for: tabIdString,
                tabIndex: tabIndex,
                style: {
                    position: 'absolute',
                    top: '-2em',
                    left: (tabIndex * 100) + 'px'
                }
            }, {
                tag: 'input',
                id: tabIdString,
                type: 'radio',
                name: cartoWindowId + '_tabs',
                checked: config.active || false,
                'aria-hidden': true
            }, {
                tag: 'h2',
                html: config.title,
                style: {
                    position: 'absolute',
                    top: '-2em',
                    left: (tabIndex * 100) + 'px'
                }
            }, {
                tag: 'div',
                cls: 'content tab-' + tabIndex,
                html: config.innerHTML || ''
            }]
        });

        tab.addEventListener('click', function() {
            var chartTab = this.classList.contains('timeseries-tab') ||
                this.classList.contains('barchart-tab');
            if (chartTab) {
                return;
            }
            var menu = Ext.ComponentQuery.query('k-menu-layersettings')[0];
            if (menu) {
                var ctrl = menu.getController();
                if (ctrl.cartoWindowsMinimized) {
                    ctrl.toggleMinimize();
                }
            }
        });

        if (!Ext.isModern) {
            var resizer = Ext.create('Ext.resizer.Resizer', {
                target: tab.querySelector('.content'),
                handles: 'se s e'
            });
            resizer.on('resize', function(self, width, height) {
                var newWidth = Math.max(width, view.contentMinWidth);
                var newHeight = Math.max(height, view.contentMinHeight);

                var chartContainerEl = self.el.down('[id^=d3-chart]') ||
                        self.el.down('[id^=d3-barchart]');
                if (chartContainerEl) {
                    var chart = Ext.getCmp(chartContainerEl.id);
                    chart.setWidth(newWidth - 20);
                    chart.setHeight(newHeight - 40);
                }
                var grid = self.el.down('.x-panel');
                if (grid) {
                    grid.setSize(newWidth - 20, newHeight - 20);
                    grid = grid.component.down('grid');
                    grid.setSize(newWidth - 20, newHeight - 20);
                }
                var htmlObject = self.el.down('object');
                if (htmlObject) {
                    htmlObject.setSize(newWidth - 20, newHeight - 20);
                }
                me.updateLineFeature();
            });
        }

        var input = tab.querySelector('input');
        input.addEventListener('change', function() {
            me.updateLineFeature.bind(me)();
        });

        tabs.push(tab);
        return tab;
    },

    /**
     * Return a positioning configuration object that has appropriate values at
     * the keys `offset` and `positioning` for the passed pixel, div and
     * mapComponent. The returned object is ready to be used to configure an
     * `ol.Overlay` which shall hold the content of `div` and be placed at
     * `pixel` within the `mapComponent`.
     *
     * The passed pixel location can also be outside of the map, i.e. negative
     * or bigger than the map's pixel bounds.
     *
     * Copied from BasiGX to prevent a positioning of 'right' for carto windows.
     *
     * @param {Array<Number>} pixel The pixel location where the overlay shall
     *     eventually be positioned.
     * @param {HTMLDivElement} div The div which is to be placed inside the
     *     popup. This is expected to be not already rendered inside the page.
     * @param {BasiGX.view.component.Map} mapComponent The map component, where
     *     the overlay will be placed.
     * @return {Object} An object with `offset` and `positioning` information.
     */
    getPositioningConfig: function(pixel, div, mapComponent) {
        var hoverPlugin = mapComponent.getPlugin('hoverBfS');

        // measure the passed div first:
        div.style.display = 'table-cell'; // so we can measure it!
        var divEl = Ext.get(Ext.getBody().dom.appendChild(div));
        var divDims = [divEl.getWidth(), divEl.getHeight()];
        div.style.display = ''; // undo styling,
        div.parentNode.removeChild(div);

        var mapEl = mapComponent.getEl();
        var mapDims = [mapEl.getWidth(), mapEl.getHeight()];

        // have some padding so that popups might be considered near whatever,
        // when technically they are not.
        var threshold = hoverPlugin.getMapPaddingPositioning();
        var dimLeftRight = divDims[0] + threshold;
        var dimTopBottom = divDims[1] + threshold;

        // fallback positioning
        var positioning = ['top', 'left'];
        var offset = [15, 0];

        if (pixel[0] >= mapDims[0] - dimLeftRight) {
            // near the right
            offset[0] = -1 * (offset[0] + divDims[0]);
            if (pixel[0] > mapDims[0]) {
                offset[0] += mapDims[0] - pixel[0];
            }
        } else if (pixel[0] <= dimLeftRight) {
            // near the left
            if (pixel[0] < 0) {
                offset[0] += Math.abs(pixel[0]);
            }
        }

        if (pixel[1] >= mapDims[1] - dimTopBottom) {
            // near the bottom
            offset[1] = -1 * (offset[1] + divDims[1]);
            if (pixel[1] > mapDims[1]) {
                offset[1] += mapDims[1] - pixel[1];
            }
        } else if (pixel[1] <= dimTopBottom) {
            // near the top
            positioning[0] = 'bottom';
            offset[1] = offset[1] + divDims[1];
            if (pixel[1] < 0) {
                offset[1] += Math.abs(pixel[1]);
            }
        }

        return {
            positioning: positioning.join('-'),
            offset: offset
        };
    },

    /**
     * Creates the ol.Overlay which contains the tabwindow, adds it to the map
     * and stores it as an attribute of the view.
     */
    createOverlay: function(layer) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var feature = view.getFeature();
        var coords = this.getFeatureAnchorPoint(feature);
        var mapComponent = Ext.ComponentQuery.query('k-component-map')[0];
        var pixel = map.getPixelFromCoordinate(coords);
        var olPropPath = 'metadata/layerConfig/olProperties/';
        var xOffset = parseInt(Koala.util.Object.getPathStrOr(layer, olPropPath + 'cartoXOffset', 0), 10);
        var yOffset = parseInt(Koala.util.Object.getPathStrOr(layer, olPropPath + 'cartoYOffset', 0), 10);

        // add the offset to the desired pixel...
        pixel[0] += parseInt(xOffset, 10);
        pixel[1] += parseInt(yOffset, 10);

        var cartoWindowId = view.getCartoWindowId();
        var positioning = this.getPositioningConfig(pixel, view.el.dom, mapComponent);

        // ...and to the coordinate of the overlay
        coords = map.getCoordinateFromPixel(pixel);

        var overlay = new ol.Overlay({
            id: cartoWindowId,
            position: coords,
            positioning: positioning.positioning,
            offset: positioning.offset,
            element: view.el.dom,
            stopEvent: false,
            dragging: false
        });

        map.addOverlay(overlay);

        viewModel.set('overlay', overlay);
    },

    /**
     * Corrects the y position in case the top of the carto window is
     * not visible on the map.
     */
    correctPosition: function() {
        var overlay = this.getViewModel().get('overlay');
        var position = overlay.getPosition();
        var map = this.getView().getMap();
        var offset = overlay.getOffset();
        var yPosition = map.getPixelFromCoordinate(position)[1];
        var upperLeft = map.getCoordinateFromPixel([0, 0]);
        if (yPosition + offset[1] < 0) {
            // 30 pixels extra for the carto window header
            overlay.setOffset([offset[0], 30]);
            overlay.setPosition([position[0], upperLeft[1]]);
        }
    },

    /**
     * gets features anchorPoint
     * e.g. to anchor cartoWindows
     */
    getFeatureAnchorPoint: function(feature) {
        var coords, bbox, mid;
        if (feature.getGeometry().getType() === 'Polygon') {
            feature = turf.polygon([feature.getGeometry().getCoordinates()[0]]);
            bbox = turf.bbox(feature);
            mid = bbox[0] + (bbox[2] - bbox[0]) / 2;
            coords = [mid, bbox[1]];
        } else if (feature.getGeometry().getType() === 'MultiPolygon') {
            feature = turf.polygon(feature.getGeometry().getCoordinates()[0]);
            bbox = turf.bbox(feature);
            mid = bbox[0] + (bbox[2] - bbox[0]) / 2;
            coords = [mid, bbox[1]];
        } else if (feature.getGeometry().getType() === 'Point') {
            coords = feature.getGeometry().getCoordinates();
        } else if (feature.getGeometry().getType() === 'Line') {
            feature = turf.lineString(feature.getGeometry().getCoordinates()[0]);
            coords = turf.along(feature, 0, 'meters').geometry.coordinates;
        }
        return coords;
    },

    /**
     * This method creates a vectorlayer which stores the lineFeatures of the
     * carto-windows. If the layer allready exists it will use this one instead.
     */
    getOrCreateLineLayer: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var lineLayer = BasiGX.util.Layer.getLayerByName('carto-window-lines');

        if (!lineLayer) {
            var lineStyle = view.getLayer().get('cartoWindowLineStyle') || '#294d71,4';
            lineLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: lineStyle.split(',')[0],
                        width: parseInt(lineStyle.split(',')[1], 10)
                    })
                }),
                zIndex: 800,
                name: 'carto-window-lines',
                printSpecial: true
            });
            lineLayer.set(BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER, false);
            map.addLayer(lineLayer);
        }
        viewModel.set('lineLayer', lineLayer);
        return lineLayer;
    },

    /**
     * Creates the lineFeature adds it to a layer and adds this layer to the map.
     * It also adds the Drag functionality to the cartowindow. The feature is
     * stored as a attribute of the view.
     */
    createLineFeature: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var mapComponent = Ext.ComponentQuery.query('k-component-map')[0];
        var hoverPlugin = mapComponent.getPlugin('hoverBfS');
        var map = view.getMap();
        var feature = view.getFeature();
        var coords = this.getFeatureAnchorPoint(feature);
        var el = view.el.dom;
        var overlay = viewModel.get('overlay');
        var cartoWindowId = view.getCartoWindowId();

        var lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString([coords, coords])
        });

        lineFeature.setId(cartoWindowId);

        var downEvent = Ext.isModern ? 'touchstart': 'mousedown';
        var upEvent = Ext.isModern ? 'touchend': 'mouseup';
        var previousEvent;

        el.addEventListener(downEvent, function(event) {
            if (event.target.tagName === 'LABEL') {
                overlay.set('dragging', true);
                hoverPlugin.setPointerRest(false);
            } else if (Ext.Array.contains(event.target.classList, 'x-resizable-handle')) {
                overlay.set('resizing', true);
                me.resizeTarget = Ext.get(event.target).up('.cartowindow-tab').down('.content');
            }
            previousEvent = event;
        });

        me.onMouseUp = function() {
            if (overlay.get('dragging') === true) {
                overlay.set('dragging', false);
                hoverPlugin.setPointerRest(true);
            }
        };

        me.onMouseUpWindow = function() {
            overlay.set('resizing', false);
            overlay.set('dragging', false);
        };

        me.pointerMoveListener = function(event) {
            if (overlay.get('dragging') === true) {
                var position = overlay.getPosition();
                var res = overlay.getMap().getView().getResolution();
                var xDiff = event.originalEvent.screenX - previousEvent.screenX;
                var yDiff = event.originalEvent.screenY - previousEvent.screenY;
                position[0] += xDiff * res;
                position[1] -= yDiff * res;
                overlay.setPosition(position);
                me.updateLineFeature();
                previousEvent = event.originalEvent;
            }
        };

        el.addEventListener(upEvent, me.onMouseUp);
        el.addEventListener('mouseleave', function(event) {
            var mapEl = Ext.DomQuery.select('canvas.ol-unselectable')[0];
            if (event.relatedTarget !== mapEl) {
                overlay.set('dragging', false);
                hoverPlugin.setPointerRest(true);
            }
        });
        window.addEventListener(upEvent, me.onMouseUpWindow);
        map.on('pointermove', me.pointerMoveListener);
        // register additional listeners to solve the issue that when an
        // object tag is used in the cartowindow, exisiting events will not
        // fire anymore. Fixes issues when dragging a cartowindow with
        // object tag in browsers like firefox, which render slowly
        // and mouse goes over the object tag while dragging
        window.addEventListener('pointermove', function(evt) {
            if (overlay.get('dragging') === true) {
                var obj = el.querySelector('object');
                if (obj && !me.objectTagMouseOverListenerRegistered) {
                    obj.addEventListener('mouseover', function(event) {
                        evt = {};
                        evt.originalEvent = event;
                        me.pointerMoveListener(evt);
                    });
                    me.objectTagMouseOverListenerRegistered = true;
                }
            }
        });

        viewModel.get('lineLayer').getSource().addFeature(lineFeature);
        viewModel.set('lineFeature', lineFeature);
    },

    /**
     * Create listeners for 'change:visible' on the layer and 'remove' on the
     * layerCollection to sync layer, overlay and feature visibility.
     */
    createLayerListeners: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var map = view.getMap();
        var layerCollection = map.getLayers();

        layer.on('change:visible', me.onLayerVisibilityChange);
        layerCollection.on('remove', me.onLayerRemove);
    },

    /**
     * Handler for the layers 'change:visible' event. It syncs visibility changes
     * between the layer and the overlay/lineFeature.
     * @param {ol.Object.Event} evt The change:visible event.
     */
    onLayerVisibilityChange: function(evt) {
        var me = this;
        var viewModel = me.getViewModel();
        var overlay = viewModel.get('overlay');
        var lineFeature = viewModel.get('lineFeature');
        var lineLayer = BasiGX.util.Layer.getLayerByName('carto-window-lines');

        if (lineFeature && lineLayer && overlay) {
            var el = overlay.getElement();
            var lineSource = lineLayer.getSource();

            if (evt.target.get('visible')) {
                if (!lineSource.getFeatureById(lineFeature.getId())) {
                    lineSource.addFeature(lineFeature);
                    el.classList.remove('x-hidden');
                }
            } else {
                el.classList.add('x-hidden');
                lineSource.removeFeature(lineFeature);
                var hover = BasiGX.view.component.Map.guess().getPlugin('hoverBfS');
                hover.hoverVectorLayerInteraction.getFeatures().clear();
            }
        }
    },

    /**
     * Handler for the maps 'remove' event. It removes the overlay and lineFeature
     * when the layer is removed.
     * @param {ol.Collection.Event} evt The remove event.
     */
    onLayerRemove: function(evt) {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var removedLayer = evt.element;

        if (layer === removedLayer) {
            try {
                view.destroy();
            } catch (e) {
                // silently ignore, view was probably destroyed somewhere else
            }
            // clean up hover artifacts and carto window lines, if any
            var layers = ['hoverVectorLayer'];
            Ext.each(layers, function(name) {
                layer = BasiGX.util.Layer.getLayerByName(name);
                if (layer) {
                    layer.getSource().clear();
                }
            });
            var hover = BasiGX.view.component.Map.guess().getPlugin('hoverBfS');
            hover.hoverVectorLayerInteraction.getFeatures().clear();
        }
    },

    /**
     * Updates the coordinates of the drawn lineFeature. And sets the
     * centerCoords property on the overlay.
     */
    updateLineFeature: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var feature = view.getFeature();
        var lineFeature = viewModel.get('lineFeature');
        var featureStartCoords = this.getFeatureAnchorPoint(feature);
        var overlay = viewModel.get('overlay');
        var overlayCoords = overlay.getPosition();
        var element = overlay.getElement();
        var realOverlayWidth = element.clientWidth;
        var realOverlayHeight = element.clientHeight;
        if (element.style.visibility === 'hidden') {
            element = element.querySelector('svg');
        }
        var overlayWidth = element.clientWidth;
        var overlayHeight = element.clientHeight;
        var offset = overlay.getOffset();
        var pixels = map.getPixelFromCoordinate(overlayCoords);
        var positioning = overlay.getPositioning().split('-');
        // correct for offset
        pixels[0] += offset[0];
        pixels[1] += offset[1];
        // correct for positioning
        if (positioning[0] === 'bottom') {
            pixels[1] -= realOverlayHeight;
        }
        if (positioning[1] === 'right') {
            pixels[0] -= realOverlayWidth;
        }
        overlayCoords = map.getCoordinateFromPixel(pixels);

        var overlayTopLeftPixel = map.getPixelFromCoordinate(overlayCoords);
        var overlayTopRightPixel = [overlayTopLeftPixel[0] + overlayWidth, overlayTopLeftPixel[1]];
        var overlayBottomRightPixel = [overlayTopLeftPixel[0] + overlayWidth, overlayTopLeftPixel[1] + overlayHeight];
        var overlayBottomLeftPixel = [overlayTopLeftPixel[0], overlayTopLeftPixel[1] + overlayHeight];
        var overlayTopPixel = [overlayTopLeftPixel[0] + overlayWidth/2, overlayTopLeftPixel[1]];
        var overlayRightPixel = [overlayTopLeftPixel[0] + overlayWidth, overlayTopLeftPixel[1] + overlayHeight/2];
        var overlayBottomPixel = [overlayTopLeftPixel[0] + overlayWidth/2, overlayTopLeftPixel[1] + overlayHeight];
        var overlayLeftPixel = [overlayTopLeftPixel[0], overlayTopLeftPixel[1] + overlayHeight/2];

        var overlayTopLeftCoords = map.getCoordinateFromPixel(overlayTopLeftPixel);
        var overlayTopRightCoords = map.getCoordinateFromPixel(overlayTopRightPixel);
        var overlayBottomRightCoords = map.getCoordinateFromPixel(overlayBottomRightPixel);
        var overlayBottomLeftCoords = map.getCoordinateFromPixel(overlayBottomLeftPixel);
        var overlayTopCoords = map.getCoordinateFromPixel(overlayTopPixel);
        var overlayRightCoords = map.getCoordinateFromPixel(overlayRightPixel);
        var overlayBottomCoords = map.getCoordinateFromPixel(overlayBottomPixel);
        var overlayLeftCoords = map.getCoordinateFromPixel(overlayLeftPixel);

        var centerPixel = [overlayWidth/2 + overlayTopLeftPixel[0],
            overlayHeight/2 + overlayTopLeftPixel[1]];
        var centerCoords = map.getCoordinateFromPixel(centerPixel);

        //could be adjusted to snap corners only
        var pointsWGS84 = turf.featureCollection([
            turf.toWgs84(turf.point(overlayTopLeftCoords)),
            turf.toWgs84(turf.point(overlayTopRightCoords)),
            turf.toWgs84(turf.point(overlayBottomLeftCoords)),
            turf.toWgs84(turf.point(overlayBottomRightCoords)),
            turf.toWgs84(turf.point(overlayTopCoords)),
            turf.toWgs84(turf.point(overlayRightCoords)),
            turf.toWgs84(turf.point(overlayBottomCoords)),
            turf.toWgs84(turf.point(overlayLeftCoords))
        ]);

        var featureStartPointWGS84 = turf.toWgs84(turf.point(featureStartCoords));
        var nearestCornerCoordsWGS84 = turf.nearestPoint(featureStartPointWGS84, pointsWGS84);
        var nearestCornerCoords = turf.toMercator(nearestCornerCoordsWGS84);

        lineFeature.getGeometry().setCoordinates([featureStartCoords, nearestCornerCoords.geometry.coordinates]);
        overlay.centerCoords = centerCoords;
    },

    scrollTimeseriesLeft: function() {
        this.scrollTimeseries('min', 'startDate', 'subtract');
    },

    scrollTimeseriesRight: function() {
        this.scrollTimeseries('max', 'endDate', 'add');
    },

    scrollTimeseries: function(minOrMax, startOrEndDate, addOrSubtract) {
        var controller = this.timeserieschart.getController();
        var zoom = controller.currentDateRange;
        var hasZoom = zoom[minOrMax] !== null;

        var changedDate = this.timeserieschart.getConfig(startOrEndDate);
        if (hasZoom) {
            changedDate = moment(zoom[minOrMax]);
        }

        var layer = this.getView().layer;
        var duration = Koala.util.Object.getPathStrOr(
            layer,
            'metadata/layerConfig/timeSeriesChartProperties/duration'
        );
        changedDate[addOrSubtract](moment.duration(duration));

        // only change start/end date if needed
        var start = this.timeserieschart.getConfig('startDate');
        var end = this.timeserieschart.getConfig('endDate');
        if (!start.isBefore(changedDate) || !end.isAfter(changedDate)) {
            this.timeserieschart.setConfig(startOrEndDate, changedDate);
        }

        if (hasZoom) {
            zoom[minOrMax] = changedDate.valueOf();
        }
        controller.keepColors = true;
        controller.getChartData();
        if (hasZoom) {
            var min = zoom.min;
            var max = zoom.max;
            controller.on('chartdataprepared', function() {
                // unfortunately, d3 has an internal timer resetting
                // the zoom frequently in the first few hundred ms after
                // creation
                window.setTimeout(function() {
                    controller.zoomToInterval(min, max);
                }, 800);
            });
        }
    },

    combineTimeseries: function() {
        var newStations = [];
        var newStationIds = [];
        var oldCharts = {};
        var layer = this.timeserieschart.getTargetLayer();
        var idField = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/olProperties/featureIdentifyField', 'id');

        var allCharts = Ext.ComponentQuery.query('d3-chart');
        Ext.each(allCharts, function(chart) {
            Ext.each(chart.selectedStations, function(station) {
                var id = station.get(idField);
                if (newStationIds.indexOf(id) === -1) {
                    newStations.push(station);
                    newStationIds.push(id);
                    oldCharts[id] = chart.getController().chartConfig;
                    var renderer = chart.getController().chartRenderer;
                    oldCharts[id].initialZoom = renderer.chartConfig.components[0].getCurrentZoom();
                }
            });
        });
        var win;
        Ext.each(newStations, function(station, idx) {
            win = Koala.util.Chart.openTimeseries(station, oldCharts[idx]);
        });
        var chart = win.down('d3-chart');
        chart.getController().getChartData(oldCharts);
        var cartos = Ext.ComponentQuery.query('k-component-cartowindow');
        Ext.each(cartos, function(carto) {
            carto.destroy();
        });
        this.enableMapInteractions(true);
    },

    /**
     * onBeforeDestroy listener. It removes the lineLayer before destroy and
     * removes the pointerMoveListener.
     */
    onBeforeDestroy: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var map = view.getMap();
        var layerCollection = map.getLayers();
        var viewModel = me.getViewModel();
        var lineLayer = viewModel.get('lineLayer');
        var lineFeature = viewModel.get('lineFeature');
        var upEvent = Ext.isModern ? 'touchend': 'mouseup';
        var overlay = viewModel.get('overlay');
        map.removeOverlay(overlay);

        layer.un('change:visible', me.onLayerVisibilityChange);
        layerCollection.un('remove', me.onLayerRemove);
        map.un('pointermove', me.pointerMoveListener);
        window.removeEventListener(upEvent, me.onMouseUpWindow);
        lineLayer.getSource().removeFeature(lineFeature);

        me.enableMapInteractions(map);

        if (this.timeserieschart) {
            this.timeserieschart.destroy();
        }
        if (this.barChart) {
            this.barChart.destroy();
        }
    }

});
