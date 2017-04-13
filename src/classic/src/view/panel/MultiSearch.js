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
 * @class Koala.view.panel.MultiSearch
 */
Ext.define('Koala.view.panel.MultiSearch', {
    extend: 'Ext.panel.Panel',
    xtype: 'k-panel-multisearch',

    requires: [
        'Koala.view.panel.MultiSearchController',
        'Koala.view.panel.MultiSearchModel',

        'Koala.view.grid.SpatialSearch',
        'Koala.store.SpatialSearch',

        'Koala.view.grid.MetadataSearch',
        'Koala.store.MetadataSearch'
    ],

    controller: 'k-panel-multisearch',
    viewModel: {
        type: 'k-panel-multisearch'
    },

    layout: 'vbox',

    defaults: {
        listeners: {
            close: function() {
                var multiSearchPanel = this.up('panel');
                var visibleGrids = multiSearchPanel.query('grid[hidden=false]');
                if (visibleGrids.length < 2) {
                    var combo = Ext.ComponentQuery.query(
                        'k-form-field-searchcombo')[0];
                    combo.clearValue();
                    multiSearchPanel.hide();
                }
            }
        }
    },

    items: [{
        xtype: 'k-grid-spatialsearch',
        closable: true,
        closeAction: 'hide',
        maxHeight: 200,
        width: 600
    }, {
        xtype: 'k-grid-metadatasearch',
        closable: true,
        closeAction: 'hide',
        maxHeight: 200,
        width: 600
    }]
});
