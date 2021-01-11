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
 * @class Koala.view.panel.RoutingOptimization
 */
Ext.define('Koala.view.panel.RoutingOptimization', {
    extend: 'Ext.panel.Panel',

    xtype: 'k-panel-routing-optimization',

    requires: [
        'Ext.form.field.Checkbox',
        'Koala.view.grid.RoutingJobs'
    ],

    bind: {
        title: '{i18n.optimizationLabel}'
    },

    defaults: {
        padding: '0 10',
    },

    collapsible: true,

    items: [
        {
            xtype: 'checkbox',
            bind: {
                fieldLabel: '{i18n.enableOptimizationLabel}'
            }
        },
        // vehicles grid
        // jobs grid
        {
            xtype: 'k-grid-routing-jobs',
            // bind: {
            //     store: '{waypoints}'
            // }
        }
    ]
});
