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
 * @class Koala.view.window.TimeSeriesWindow
 */
Ext.define("Koala.view.window.TimeSeriesWindow", {
    extend: "Ext.window.Window",
    xtype: "k-window-timeserieswindow",

    requires: [
        "Koala.view.window.TimeSeriesWindowController",
        "Koala.view.window.TimeSeriesWindowModel",
        "Koala.util.Duration",
        "Koala.util.Date",
        "Koala.util.String",

        "Ext.form.field.Date"
    ],

    controller: "k-window-timeserieswindow",

    viewModel: {
        type: "k-window-timeserieswindow"
    },

    bind: {
        title: '{title}'
    },

    config: {
        name: 'timeserieswin',
        constrainHeader: true,
        collapsible: true,
        maxHeight: 800,
        width: 900,
        autoScroll: true,
        layout: {
            type: 'vbox'
        },
        defaults: {
            flex: 1,
            minHeight: 300,
            width: '100%'
        },
        addFilterForm: true
    },

    listeners:{
        close: 'onTimeseriesClose'
    },

    /**
     * The olLayer we were constructed with
     */
    initOlLayer: null,

    items: [],

    statics: {
        /**
         */
        getStartEndFilterFromMetadata: function(metadata){
            var timeseriesCfg = metadata.layerConfig.timeSeriesChartProperties;
            var endDate = Koala.util.String.coerce(timeseriesCfg.end_timestamp);
            if (Ext.isString(endDate)) {
                var format = timeseriesCfg.end_timestamp_format;
                if (!format) {
                    format = Koala.util.Date.ISO_FORMAT;
                }
                endDate = Ext.Date.parse(endDate, format);
            }
            var duration = timeseriesCfg.duration;
            var startDate = Koala.util.Duration.dateSubtractAbsoluteDuration(
                endDate,
                duration
            );
            var filter = {
                parameter: timeseriesCfg.xAxisAttribute,
                mindatetimeinstant: startDate,
                maxdatetimeinstant: endDate
            };
            return filter;
        }
    },

    /**
     * Initializes the component.
     */
    initComponent: function() {
        var me = this;
        var metadata = me.initOlLayer.metadata;
        var timeRangeFilter = me.self.getStartEndFilterFromMetadata(metadata);
        if (me.addFilterForm) {
            me.items = [{
                xtype: 'form',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                padding: 5,
                defaults: {
                    padding: 5
                },
                width: '100%',
                height: 40,
                maxHeight: 40,
                minHeight: 40,
                items: [{
                    // https://github.com/gportela85/DateTimeField
                    xtype: 'datefield',
                    bind: {
                        fieldLabel: '{dateFieldStartLabel}',
                        maxValue: '{startDateMaxValue}'
                    },
                    value: timeRangeFilter.mindatetimeinstant,
                    labelWidth: 35,
                    name: 'datestart',
                    format: 'j F Y, H:i',
                    flex: 1
                }, {
                    xtype: 'datefield',
                    bind: {
                        fieldLabel: '{dateFieldEndLabel}'
                    },
                    value: timeRangeFilter.maxdatetimeinstant,
                    labelWidth: 38,
                    name: 'dateend',
                    format: 'j F Y, H:i',
                    flex: 1
                }, {
                    xtype: 'button',
                    bind: {
                        text: '{setFilterBtnText}'
                    },
                    handler: 'onSetFilterBtnClick',
                    margin: '0 3px 0 0'
                }, {
                    xtype: 'button',
                    bind: {
                        text: '{resetFilterBtnText}'
                    },
                    handler: 'onResetFilterBtnClick',
                    margin: '0 3px 0 0'
                }, {
                    xtype: 'combo',
                    displayField: 'text',
                    queryMode: 'local',
                    emptyText: 'Chart hinzufügen',
                    bind: {
                        fieldLabel: '{selectChartLayerComboLabel}'
                    },
                    listeners: {
                        select: 'onSelectChartLayerComboSelect',
                        beforerender: 'bindSelectChartLayerStore'
                    },
                    flex: 1
                }]
            }];
        }
        me.callParent();
    }
});
