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
 * @class Koala.view.panel.ThemeTree
 */
Ext.define('Koala.view.panel.ThemeTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'k-panel-themetree',

    requires: [
        'Koala.util.MetadataQuery',
        'Koala.util.Geoserver',
        'Koala.util.Help',
        'Koala.view.component.TextTool',
        'Koala.view.panel.ThemeTreeController',
        'Koala.view.panel.ThemeTreeModel'
    ],

    controller: 'k-panel-themetree',
    viewModel: {
        type: 'k-panel-themetree'
    },

    bind: {
        title: '{title}'
    },

    rootVisible: false,

    autoScroll: true,

    height: 400,

    header: {
        overCls: 'k-over-clickable',
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
    }, {
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        callback: function() {
            Koala.util.Help.showHelpWindow('layerSelection');
        }
    }],

    fbar: [
        {
            type: 'button',
            name: 'resetThemeTree',
            bind: {
                text: '{btnTextResetThemeTreeFiltering}',
                tooltip: '{btnTooltipResetThemeTreeFiltering}'
            },
            handler: 'resetThemeTreeFiltering',
            disabled: true
        }
    ],

    columns: [{
        xtype: 'treecolumn',
        dataIndex: 'text',
        flex: 1,
        sortable: true
    }, {
        xtype: 'actioncolumn',
        iconCls: 'x-fa fa-filter',
        width: 25,
        getTip: function(v, meta, rec) {
            if (rec.get('text').indexOf('RODOS-Prognosen') > -1) {
                return 'Rodos Filter ändern !18n';
            }
        },
        getClass: function(v, meta, rec) {
            if (rec.get('text').indexOf('RODOS-Prognosen') > -1) {
                return 'x-fa fa-filter';
            } else {
                return 'hide-action-column';
            }
        },
        handler: 'showRodosFilter'
    }],

    listeners: {
        select: 'setupShowFilterWinCheck',
        itemdblclick: 'addLayerWithDefaultFilters'
        //enable text selection
        // afterlayout: function() {
        //     this.el.selectable();
        //     this.el.select('.x-unselectable').selectable();
        // }
    },

    initComponent: function() {
        this.rebuildTree();

        var store = Ext.create('Ext.data.TreeStore', {
        });
        this.store = store;
        this.callParent();
    },

    rebuildTree: function() {
        var me = this;
        // try to load layerset from appContext
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var path = [
            'data',
            'merge',
            'urls',
            'layerset'
        ];
        var layerSetUrl = Koala.util.Object.getPathOr(appContext, path, 'classic/resources/layerset.json');

        Ext.Ajax.request({
            url: layerSetUrl
        })
            .then(function(xhr) {
                var data = JSON.parse(xhr.responseText);
                Koala.util.MetadataQuery.getImportedLayers()
                    .then(function(layers) {
                        Koala.util.Geoserver.filterDeletedLayers(layers)
                            .then(function(config) {
                                data.push({
                                    text: me.getViewModel().get('importedLayersTitle'),
                                    isLayerProfile: false,
                                    children: config
                                });
                                me.getStore().setData(data);
                                me.getViewModel().bind({
                                    bindTo: '{importedLayersTitle}'
                                }, function(title) {
                                    if (!data) {
                                        return;
                                    }
                                    data[data.length - 1].text = title;
                                    me.getStore().setData(data);
                                });
                            });
                    });
            });
    }

});
