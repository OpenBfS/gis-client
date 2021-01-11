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
        'BasiGX.util.Animate',
        'Koala.view.window.RoutingVehicle'
    ],

    enableColumnHide: false,
    enableColumnMove: false,

    bind: {
        title: '{i18n.vehiclesGridTitle}',
        emptyText: '{i18n.emptyVehiclesText}'
    },

    // store: {
    //     // TODO create store, add to requires
    //     type: 'k-routingvehicles'
    // },

    columns: {
        items: []
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
                window.destroy();
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
