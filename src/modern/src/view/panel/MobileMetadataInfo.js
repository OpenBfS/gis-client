/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.panel.MobileMetadataInfo
 */
Ext.define('Koala.view.panel.MobileMetadataInfo', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilemetadatainfo',


    requires: [
        'Ext.grid.Grid',
        'Koala.view.panel.MobileMetadataInfoModel'
    ],

    viewModel: {
        type: 'k-panel-mobilemetadatainfo'
    },

    statics: {
        /**
         * The keys of the metadata record and their display name.
         * Translated in the local files
         */
        fieldNames: {
            fileIdentifier: '',
            abstract: '',
            contact: ''
        }
    },

    closeToolAlign: 'left',

    bodyPadding: '10px',

    scrollable: 'y',

    bind: {
        title: '{name}'
    },

    listeners: {
        show: function() {
            var viewModel = this.getViewModel();
            var dataView = this.down('dataview');
            dataView.getStore().setData(viewModel.get('data'));
        }
    },

    items: [{
        xtype: 'dataview',
        store: {
            fields: ['key', 'value']
        },
        itemTpl: '<div><b>{key} :</b></br>' +
            '{value}</div></br>'
    }]

});
