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
        'Ext.button.Button',
        'Ext.button.Segmented',
        'BasiGX.util.Animate',
        'Koala.view.window.RoutingVehicle',
        'Koala.store.RoutingVehicles',
        'Koala.view.button.RoutingProfile'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                emptyVehiclesText: '',
                descriptionColumnText: '',
                startColumnText: '',
                endColumnText: '',
                addVehicleTooltip: '',
                idColumnText: '',
                downloadTooltip: '',
                uploadTooltip: ''
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
            dataIndex: 'id',
            bind: {
                text: '{i18n.idColumnText}'
            }
        }, {
            dataIndex: 'start',
            sortable: false,
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
            sortable: false,
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
            dataIndex: 'description',
            sortable: false,
            bind: {
                text: '{i18n.descriptionColumnText}'
            },
            renderer: function(description) {
                return '<span data-qtip="' + description + '">' + description + '</span>';
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
                            vehicle: vehicle,
                            listeners: {
                                updatedVehicle: {
                                    fn: function(data, updatedVehicle) {
                                        var me = this;
                                        var vehiclesGrid = me.up('k-grid-routing-vehicles');
                                        vehiclesGrid.onUpdatedVehicle(data, updatedVehicle);
                                    },
                                    scope: this
                                }
                            }
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
        xtype: 'k-button-routing-profile'
    }, '->', {
        xtype: 'segmentedbutton',
        allowToggle: false,
        defaults: {
            padding: '3 10'
        },
        items: [{
            xtype: 'filebutton',
            iconCls: 'fa fa-upload',
            bind: {
                tooltip: '{i18n.uploadTooltip}'
            },
            listeners: {
                afterrender: 'afterVehicleUploadRender'
            }
        }, {
            xtype: 'button',
            iconCls: 'fa fa-download',
            bind: {
                tooltip: '{i18n.downloadTooltip}'
            },
            handler: 'exportVehicles'
        }]
    }, {
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
                    xtype: 'k-window-routing-vehicle',
                    listeners: {
                        updatedVehicle: {
                            fn: function(data, updatedVehicle) {
                                var me = this;
                                var grid = me.up('k-grid-routing-vehicles');
                                grid.onUpdatedVehicle(data, updatedVehicle);
                            },
                            scope: this
                        }
                    }
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
        addVehicle: function(data) {
            var me = this;
            var store = me.getStore();
            if (store) {
                if (data) {
                    store.add(data);
                } else {
                    store.add({});
                }
            }
        },
        itemmouseenter: function() {
            this.onGridMouseEnter.apply(this, arguments);
        },
        itemmouseleave: function() {
            this.onGridMouseLeave.apply(this, arguments);
        }
    },

    onUpdatedVehicle: function(data, vehicle) {
        var me = this;
        var store = me.getStore();
        if (store) {
            if (vehicle) {
                // TODO: remove undefined properties in record
                //       - maybe inside model

                var rec = store.getById(vehicle.id);
                rec.set(data);
            } else {
                store.add(data);
            }
        }
    },

    onGridMouseEnter: function(grid, rec) {
        var routing = Ext.ComponentQuery.query('k-window-fleet-routing')[0];
        var routingController = routing.getController();
        var layer = routingController.getWaypointLayer();
        var features = layer.getSource().getFeatures();
        Ext.each(features, function(feat) {
            feat.set('highlighted', false);
            var type = feat.get('type');

            if (type !== 'job' && type !== 'job-unassigned' && feat.get('originalId') === rec.data.id) {
                feat.set('highlighted', true);
            }
        });
    },

    onGridMouseLeave: function() {
        var routing = Ext.ComponentQuery.query('k-window-fleet-routing')[0];
        var routingController = routing.getController();
        var layer = routingController.getWaypointLayer();
        var features = layer.getSource().getFeatures();
        Ext.each(features, function(feat) {
            feat.set('highlighted', false);
        });
    }

});
