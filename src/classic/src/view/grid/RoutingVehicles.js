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
 * @class Koala.view.grid.RoutingVehicles
 */
Ext.define('Koala.view.grid.RoutingVehicles', {
    extend: 'Ext.grid.Panel',
    xtype: 'k-grid-routing-vehicles',

    requires: [
        'Ext.grid.column.Action',
        'BasiGX.util.Animate',
        'Koala.view.window.RoutingVehicle',
        'Koala.store.RoutingVehicles'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                emptyVehiclesText: '',
                descriptionColumnText: '',
                startColumnText: '',
                endColumnText: '',
                addVehicleTooltip: ''
            }
        }
    },

    enableColumnHide: false,
    enableColumnMove: false,

    bind: {
        title: '{i18n.title}',
        emptyText: '{i18n.emptyVehiclesText}'
    },

    store: {
        type: 'k-routingvehicles'
    },

    columns: {
        items: [{
            dataIndex: 'profile',
            renderer: function(profile) {
                var icon;
                switch (profile) {
                    case 'driving-car':
                        icon = 'fa fa-car';
                        break;
                    case 'cycling-regular':
                        icon = 'fa fa-bicycle';
                        break;
                    case 'foot-walking':
                        icon = 'fa fa-male';
                        break;
                    default:
                        icon = 'fa fa-question-circle';
                        break;
                }
                return '<i class="' + icon + '" aria-hidden="true"></i>';
            }
        }, {
            dataIndex: 'description',
            flex: 1,
            bind: {
                text: '{i18n.descriptionColumnText}'
            },
            renderer: function(description) {
                return '<span data-qtip="' + description + '">' + description + '</span>';
            }
        }, {
            dataIndex: 'start',
            flex: 1,
            bind: {
                text: '{i18n.startColumnText}'
            },
            renderer: function(start) {
                if (start) {
                    return '<span data-qtip="' + start.address + '">' + start.address + '</span>';
                }
            }
        }, {
            dataIndex: 'end',
            flex: 1,
            bind: {
                text: '{i18n.endColumnText}'
            },
            renderer: function(end) {
                if (end) {
                    return '<span data-qtip="' + end.address + '">' + end.address + '</span>';
                }
            }
        }, {
            xtype: 'actioncolumn',
            width: 50,
            items: [{
                iconCls: 'x-fa fa-cog',
                // TODO tooltips are not bindable here, so we have to find a simple
                //      way of adding them here.
                name: 'edit-vehicle-action',
                handler: function(grid, rowIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    // make sure there is always only a single window opened
                    var win = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];

                    if (!win) {
                        var vehicle = Ext.clone(rec.getData());
                        Ext.create({
                            xtype: 'k-window-routing-vehicle',
                            vehicle: vehicle
                        }).show();
                    } else {
                        BasiGX.util.Animate.shake(win);
                    }

                }
            }, {
                iconCls: 'x-fa fa-trash-o',
                // TODO tooltips are not bindable here, so we have to find a simple
                //      way of adding them here.
                name: 'remove-vehicle-action',
                handler: function(grid, rowIndex) {
                    var win = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];

                    if (!win) {
                        grid.getStore().removeAt(rowIndex);
                    } else {
                        BasiGX.util.Animate.shake(win);
                    }

                }
            }]
        }]
    },

    buttons: [{
        iconCls: 'fa fa-plus',
        bind: {
            tooltip: '{i18n.addVehicleTooltip}'
        },
        handler: function(btn) {
            var view = btn.up('k-grid-routing-vehicles');
            if (!view) {
                return;
            }

            var win = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];

            if (!win) {
                Ext.create({
                    xtype: 'k-window-routing-vehicle'
                }).show();
            } else {
                BasiGX.util.Animate.shake(win);
            }
        }
    }],

    listeners: {
        beforedestroy: function() {
            var win = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];
            if (win) {
                win.close();
            }
        },
        applyVehicle: function(data, vehicle) {
            var me = this;
            var store = me.getStore();
            if (store) {
                if (vehicle) {
                    var rec = store.getById(vehicle.id);
                    rec.set(data);
                } else {
                    store.add(data);
                }
            }
        }
    }

});
