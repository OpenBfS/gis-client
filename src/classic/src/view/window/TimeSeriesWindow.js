/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
Ext.define("Koala.view.window.TimeSeriesWindow", {
    extend: "Ext.window.Window",
    xtype: "k-window-timeserieswindow",

    requires: [
        "Koala.view.window.TimeSeriesWindowController",
        "Koala.view.window.TimeSeriesWindowModel",

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
        layout: 'vbox',
        autoScroll: true,
        maxHeight: 600,
        addFilterForm: true
    },

    items: [],

    initComponent: function() {
        if (this.addFilterForm) {
            this.items.push({
                xtype: 'form',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                padding: 5,
                defaults: {
                    padding: '0 10 0 10'
                },
                items: [{
                    // https://github.com/gportela85/DateTimeField
                    xtype: 'datefield',
                    bind: {
                        fieldLabel: '{dateFieldStartLabel}',
                        value: '{startDateValue}',
                        maxValue: '{startDateMaxValue}'
                    },
                    labelWidth: 35,
                    name: 'datestart',
                    format: 'j F Y, H:i'
                }, {
                    xtype: 'datefield',
                    bind: {
                        fieldLabel: '{dateFieldEndLabel}',
                        value: '{endDateValue}'
                    },
                    labelWidth: 38,
                    name: 'dateend',
                    format: 'j F Y, H:i'
                }, {
                    xtype: 'button',
                    bind: {
                        text: '{setFilterBtnText}'
                    },
                    handler: 'onSetFilterBtnClick'
                }, {
                    xtype: 'button',
                    bind: {
                        text: '{resetFilterBtnText}'
                    },
                    handler: 'onResetFilterBtnClick'
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
                    }
                }]
            });
        }
        this.callParent(arguments);
    }
});
