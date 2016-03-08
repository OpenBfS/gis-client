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
 * @class Koala.view.panel.ThemeTree
 */
Ext.define("Koala.view.panel.ThemeTree", {
    extend: "Ext.tree.Panel",
    xtype: 'k-panel-themetree',

    requires: [
        "Koala.view.component.TextTool",
        "Koala.view.panel.ThemeTreeController",
        "Koala.view.panel.ThemeTreeModel"
    ],

    controller: "k-panel-themetree",
    viewModel: {
        type: "k-panel-themetree"
    },

    bind: {
        title: '{title}'
    },

    rootVisible: false,

    autoScroll: true,

    height: 400,

    header: {
        items: [
            {
                xtype: 'k-component-texttool',
                connectedToolType: 'collapse',
                bind: {
                    html: '{tooltext}'
                }
            }
        ]
    },

    tools: [{
        type: 'collapse',
        bind: {
            tooltip: '{tooltip}'
        },
        handler: 'toggleLayerSetView'
    }],

    initComponent: function(){
        var store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: 'classic/resources/layerset.json',
                reader: {
                    type: 'json'
                }
            }
        });
        this.store = store;
        this.callParent();
    }
});
