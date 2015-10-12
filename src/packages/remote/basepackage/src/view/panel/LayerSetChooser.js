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
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * LayerSetChooser Panel
 *
 * Used to show different sets of layers to swap the thematic focus of the
 * application, e.g. by changing the visibility of layers.
 * The events fired ('itemclick' and 'itemdblclick') will hand over the
 * selected record
 *
 * Example:
 *      {
            xtype: 'base-panel-layersetchooser',
            layerSetUrl: 'classic/resources/layerset.json',
            listeners: {
                itemclick: this.handleLayerSetClick
            }
        }
 *
 */
Ext.define("Basepackage.view.panel.LayerSetChooser", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-layersetchooser",

    requires: [
        "Basepackage.view.view.LayerSet"
    ],

    viewModel: {
        data: {
            title: 'Themen Auswahl'
        }
    },

    bind: {
        title: '{title}'
    },

    /**
     *
     */
    region: 'center',

    /**
     *
     */
    layout: 'fit',

    /**
     *
     */
    minWidth: 150,

    /**
     *
     */
    minHeight: 170,

    /**
     *
     */
    cls: 'img-chooser-dlg',

    /**
     *
     */
    layerSetUrl: null,

    /**
     *
     */
    scrollable: 'y',

    /**
     *
     */
    bbar: [
        {
            xtype: 'textfield',
            name: 'filter',
            fieldLabel: 'Filter',
            labelAlign: 'left',
            labelWidth: 45,
            flex: 1
        }
    ],

    /**
     *
     */
    initComponent: function() {

        if(Ext.isEmpty(this.items)) {
            this.items = [{
                xtype: 'base-view-layerset',
                scrollable: true,
                layerSetUrl: this.layerSetUrl
            }];
        }

        this.callParent(arguments);

        // add listeners
        this.down('base-view-layerset').on(
            'select', this.onLayerSetSelect);
        this.down('base-view-layerset').on(
                'itemclick', this.onLayerSetClick);
        this.down('base-view-layerset').on(
            'itemdblclick', this.onLayerSetDblClick);
    },


    /**
     * Just firing an event on the panel.
     * Listen to the select event to implement custom handling
     */
    onLayerSetSelect: function (view, rec, index, opts) {
        this.up('base-panel-layersetchooser').fireEvent(
            'select', view, rec, index, opts);
    },

    /**
     * Just firing an event on the panel.
     * Listen to the itemclick event to implement custom handling
     */
    onLayerSetClick: function (view, rec, item, index, evt, opts) {
        view.up('base-panel-layersetchooser').fireEvent(
            'itemclick', view, rec, item, index, evt, opts);
    },

    /**
     * Just firing an event on the panel.
     * Listen to the itemdblclick event to implement custom handling
     */
    onLayerSetDblClick: function (view, rec, item, index, evt, opts) {
        view.up('base-panel-layersetchooser').fireEvent(
            'itemdblclick', view, rec, item, index, evt, opts);
    },

    /**
     *
     */
    filterLayerSetsByText: function(textfield, newVal, oldval, listener) {
        var layerProfileView = listener.scope.down('base-view-layerset'),
            store = layerProfileView.getStore();
        store.getFilters().replaceAll({
            property: 'name',
            anyMatch: true,
            value: newVal
        });
    }
});
