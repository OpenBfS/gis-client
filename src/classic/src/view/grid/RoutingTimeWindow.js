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
 * @class Koala.view.grid.RoutingTimeWindow
 */
Ext.define('Koala.view.grid.RoutingTimeWindow', {
    extend: 'Ext.grid.Panel',
    xtype: 'k-grid-routing-time-window',

    requires: [
        'Ext.grid.column.Action',
        'Ext.form.field.Time',
        'Ext.form.field.Date',
        'Ext.Array',
        'Ext.grid.plugin.CellEditing',
        'BasiGX.util.Animate',
        'Koala.util.Date',
        'Koala.store.RoutingTimeWindows'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                startDayText: '',
                endDayText: '',
                timeText: '',
                addTimeWindowTooltip: '',
                removeTimeWindowTooltip: '',
                emptyGridText: ''
            }
        }
    },

    enableColumnHide: false,
    enableColumnMove: false,
    margin: '0 0 5 0',

    bind: {
        title: '{i18n.title}',
        emptyText: '{i18n.emptyGridText}'
    },

    store: {
        type: 'k-routingtimewindows'
    },

    columns: [
        {
            dataIndex: 'startDay',
            bind: {
                text: '{i18n.startDayText}'
            },
            renderer: function(date) {
                return Koala.util.Date.getFormattedDate(moment(date), 'L', undefined, true);
            },
            editor: {
                completeOnEnter: true,
                field: {
                    xtype: 'datefield',
                    allowBlank: false
                }
            }
        }, {
            dataIndex: 'startTime',
            bind: {
                text: '{i18n.timeText}'
            },
            renderer: function(date) {
                return Koala.util.Date.getFormattedDate(moment(date), 'LT', undefined, true);
            },
            editor: {
                completeOnEnter: true,
                field: {
                    xtype: 'timefield',
                    allowBlank: false
                }
            }
        }, {
            dataIndex: 'endDay',
            bind: {
                text: '{i18n.endDayText}'
            },
            renderer: function(date) {
                return Koala.util.Date.getFormattedDate(moment(date), 'L', undefined, true);
            },
            editor: {
                completeOnEnter: true,
                field: {
                    xtype: 'datefield',
                    allowBlank: false
                }
            }
        }, {
            dataIndex: 'endTime',
            bind: {
                text: '{i18n.timeText}'
            },
            renderer: function(date) {
                return Koala.util.Date.getFormattedDate(moment(date), 'LT', undefined, true);
            },
            editor: {
                completeOnEnter: true,
                field: {
                    xtype: 'timefield',
                    allowBlank: false
                }
            }
        }, {
            xtype: 'actioncolumn',
            width: 50,
            align: 'center',
            sortable: false,
            items: [{
                iconCls: 'x-fa fa-trash-o',
                bind: {
                    tooltip: '{i18n.removeTimeWindowTooltip}'
                },
                handler: function(grid, rowIndex) {
                    grid.getStore().removeAt(rowIndex);
                }
            }]
        }
    ],
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 1
    },
    buttons: [{
        iconCls: 'fa fa-plus',
        bind: {
            tooltip: '{i18n.addTimeWindowTooltip}'
        },
        handler: function(btn) {
            var view = btn.up('k-grid-routing-time-window');
            if (!view) {
                return;
            }

            var store = view.getStore();
            if (!store) {
                return;
            }

            store.add({
                startDay: Date.now(),
                startTime: Date.now(),
                endDay: Date.now(),
                endTime: Date.now()
            });
        }
    }]
});
