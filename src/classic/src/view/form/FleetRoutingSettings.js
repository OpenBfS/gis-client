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
 * @class Koala.view.form.FleetRoutingSettings
 */
Ext.define('Koala.view.form.FleetRoutingSettings', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-fleet-routing-settings',

    requires: [
        'Koala.view.grid.RoutingJobs'
    ],

    width: '100%',

    bodyPadding: 10,

    items: [{
        xtype: 'k-grid-routing-jobs'
    }

    // TODO: add vehicle input table
    ]
});
