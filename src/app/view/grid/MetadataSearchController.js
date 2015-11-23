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
/**
 * @class Koala.view.grid.MetadataSearchController
 */
Ext.define('Koala.view.grid.MetadataSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-metadatasearch',

    requires: [
        "Koala.view.window.MetadataInfo"
    ],

    addToMap: function(grid, rowIndex, colIndex, btn, evt, record){
        // TODO, get better
        Koala.util.Layer.addLayerByUuid(record.get('fileIdentifier'));
    },

    getInfo: function(grid, rowIndex, colIndex, btn, evt, record){
        Ext.create('Koala.view.window.MetadataInfo', {
            title: record.get('name'),
            layout: 'fit',
            record: record
        }).show();
    }
//
//    getLegendUrlFromRecord: function(record){
//        var legendURL = record.get('source') +
//            '?service=' + record.get('serviceType').split(' ')[0] +
//            '&version=' + record.get('serviceType').split(' ')[1] +
//            '&request=GetLegendGraphic&layer=WMS&width=40&height=40&format=image/png';
//        return legendURL;
//    }
});
