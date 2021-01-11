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
        'Koala.util.Date'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                startDayText: '',
                startTimeText: '',
                endDayText: '',
                endTimeText: '',
                addTimeWindowTooltip: '',
                removeTimeWindowTooltip: '',
                emptyGridText: ''
            }
        }
    },

    enableColumnHide: false,
    enableColumnMove: false,

    bind: {
        title: '{i18n.title}',
        emptyText: '{i18n.emptyGridText}'
    },

    store: {
        fields: [
            { name: 'startDay', type: 'date', dateFormat: 'time' },
            { name: 'startTime', type: 'date', dateFormat: 'time' },
            { name: 'endDay', type: 'date', dateFormat: 'time' },
            { name: 'endTime', type: 'date', dateFormat: 'time' }
        ],

        getAllAsTimestamp: function () {
            var me = this;
            var timeWindows = Ext.Array.map(me.getData().items, function (d) {
                var startDay = moment(d.get('startDay'));
                var endDay = moment(d.get('endDay'));
                var startTime = moment(d.get('startTime'));
                var endTime = moment(d.get('endTime'));

                var start = startDay.clone()
                    .hour(startTime.hour())
                    .minute(startTime.minute());

                var end = endDay.clone()
                    .hour(endTime.hour())
                    .minute(endTime.minute());

                var startUtc = Koala.util.Date.getUtcMoment(start);
                var endUtc = Koala.util.Date.getUtcMoment(end);
                return [startUtc.valueOf(), endUtc.valueOf()];
            });
            return timeWindows;
        },

        setAllFromTimestamp: function(timestamps) {
            var me = this;
            var dates = Ext.Array.map(timestamps, function(t) {
                return {
                    startDay: t[0],
                    startTime: t[0],
                    endDay: t[1],
                    endTime: t[1]
                };
            });
            me.loadRawData(dates);
        }
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
                text: '{i18n.startTimeText}'
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
                text: '{i18n.endTimeText}'
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
