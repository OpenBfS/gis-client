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
 * @class Koala.view.window.RoutingVehicle
 */
Ext.define('Koala.view.window.RoutingVehicle', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-routing-vehicle',

    requires: [
        'Ext.panel.Panel',
        'Ext.form.Panel',
        'Ext.form.field.TextArea',
        'Ext.form.field.Date',
        'Ext.form.field.Time',
        'Ext.form.Label',
        'Ext.container.Container',
        'Ext.data.Store',
        'Koala.view.form.field.GeocodingCombo',
        'Koala.view.panel.RoutingBreaks'
    ],

    controller: 'k-window-routing-vehicle',

    viewModel: {
        data: {
            i18n: {
                title: '',
                submitText: '',
                cancelText: '',
                profileLabel: '',
                descriptionLabel: '',
                descriptionPlaceholder: '',
                startLabel: '',
                startPlaceholder: '',
                endLabel: '',
                endPlaceholder: '',
                startDayLabel: '',
                dayPlaceholder: '',
                timePlaceholder: '',
                endDayLabel: '',
                breaksLabel: ''
            }
        }
    },

    bind: {
        title: '{i18n.title}'
    },

    minHeight: 100,
    maxHeight: 800,
    width: 500,

    collapsible: false,
    resizable: false,
    constrainHeader: true,
    scrollable: true,

    layout: 'fit',

    vehicle: null,

    items: [{
        xtype: 'form',
        name: 'vehicle-form',
        padding: 10,
        defaults: {
            anchor: '100%'
        },
        items: [{
            xtype: 'textarea',
            name: 'description',
            bind: {
                fieldLabel: '{i18n.descriptionLabel}',
                emptyText: '{i18n.descriptionPlaceholder}'
            }
        }, {
            xtype: 'k-form-field-geocodingcombo',
            name: 'start',
            bind: {
                fieldLabel: '{i18n.startLabel}',
                emptyText: '{i18n.startPlaceholder}'
            }
        }, {
            xtype: 'k-form-field-geocodingcombo',
            name: 'end',
            bind: {
                fieldLabel: '{i18n.endLabel}',
                emptyText: '{i18n.endPlaceholder}'
            }
        }, {
            xtype: 'panel',
            name: 'time_window',
            defaults: {
                margin: '0 0 5 0'
            },
            items: [{
                xtype: 'container',
                name: 'start',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'startday',
                    flex: 1,
                    bind: {
                        fieldLabel: '{i18n.startDayLabel}',
                        emptyText: '{i18n.dayPlaceholder}'
                    }
                }, {
                    xtype: 'timefield',
                    name: 'starttime',
                    bind: {
                        emptyText: '{i18n.timePlaceholder}'
                    }
                }]
            }, {
                xtype: 'container',
                name: 'end',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'endday',
                    flex: 1,
                    bind: {
                        fieldLabel: '{i18n.endDayLabel}',
                        emptyText: '{i18n.dayPlaceholder}'
                    }
                }, {
                    xtype: 'timefield',
                    name: 'endtime',
                    bind: {
                        emptyText: '{i18n.timePlaceholder}'
                    }
                }]
            }]
        }, {
            xtype: 'label',
            bind: {
                text: '{i18n.breaksLabel}:'
            }
        }, {
            xtype: 'k-panel-routing-breaks',
            header: false,
            name: 'breaks',
            maxHeight: 400
        }]
    }],

    buttons: [{
        bind: {
            text: '{i18n.cancelText}',
            handler: 'onCancel'
        }
    }, {
        bind: {
            text: '{i18n.submitText}',
            handler: 'onSubmit'
        }
    }],

    listeners: {
        setStart: function(address) {
            var me = this;
            if (!address) {
                return;
            }

            var field = me.down('[name=start]');
            if (!field) {
                return;
            }
            var store = field.getStore();
            if (store) {
                field.suspendEvents();
                store.loadRawData([address]);
                field.setSelection(store.first());
                field.resumeEvents();
            }
        },
        setEnd: function(address) {
            var me = this;
            if (!address) {
                return;
            }

            var field = me.down('[name=end]');
            if (!field) {
                return;
            }
            var store = field.getStore();
            if (store) {
                field.suspendEvents();
                store.loadRawData([address]);
                field.setSelection(store.first());
                field.resumeEvents();
            }
        },
        beforedestroy: function() {
            var fleetRoutingWindow = Ext.ComponentQuery.query('k-window-fleet-routing')[0];
            if (fleetRoutingWindow) {
                fleetRoutingWindow.fireEvent('resetContextMenu');
            }
        }
    },

    initComponent: function() {
        var me = this;
        me.callParent();

        var form = me.down('[name=vehicle-form]');
        if (!form) {
            return;
        }

        if (me.vehicle) {
            Ext.Object.each(me.vehicle, function(k, v) {
                var field = form.down('[name=' + k + ']');
                if (!field) {
                    return false;
                }
                switch (k) {
                    case 'end':
                    case 'start':
                        var store = field.getStore();
                        if (store) {
                            field.suspendEvents();
                            store.loadRawData([v]);
                            field.setSelection(store.first());
                            field.resumeEvents();
                        }
                        break;
                    case 'time_window':
                        if (!Ext.isArray(v) || v.length !== 2) {
                            break;
                        }
                        var startDay = field.down('[name=startday]');
                        var startTime = field.down('[name=starttime]');
                        var endDay = field.down('[name=endday]');
                        var endTime = field.down('[name=endtime]');
                        if (startDay) {
                            startDay.setValue(new Date(v[0]));
                        }
                        if (startTime) {
                            startTime.setValue(new Date(v[0]));
                        }
                        if (endDay) {
                            endDay.setValue(new Date(v[1]));
                        }
                        if (endTime) {
                            endTime.setValue(new Date(v[1]));
                        }
                        break;
                    case 'breaks':
                        field.fireEvent('overwriteStore', v);
                        break;
                    default:
                        field.setValue(v);
                        break;
                }
            });
        }

        var fleetRoutingWindow = Ext.ComponentQuery.query('k-window-fleet-routing') [0];
        if (fleetRoutingWindow) {
            fleetRoutingWindow.fireEvent('setContextMenuType', 'vehicle');
        }
    }
});
