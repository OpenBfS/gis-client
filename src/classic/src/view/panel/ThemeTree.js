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

    cls: 'k-panel-themetree',

    bind: {
        title: '{title}'
    },

    rootVisible: false,

    autoScroll: true,

    height: 400,

    header: {
        overCls: 'k-over-clickable',
        items: [{
            xtype: 'k-component-texttool',
            connectedToolType: 'collapse',
            bind: {
                html: '{tooltext}'
            }
        }]
    },

    tools: [{
        type: 'collapse',
        bind: {
            tooltip: '{toggleLayerSetTooltip}'
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
    }, {
        type: 'close',
        bind: {
            tooltip: '{closeTooltip}'
        },
        handler: function() {
            this.up('k-panel-themetree').hide();
        }
    }],

    fbar: [{
        type: 'button',
        name: 'collapseAll',
        handler: 'collapseAll',
        minWidth: 20,
        glyph: 'xf147@FontAwesome',
        bind: {
            tooltip: '{tooltipCollapseAll}'
        }
    }, {
        type: 'button',
        name: 'expandAll',
        handler: 'expandAll',
        glyph: 'xf196@FontAwesome',
        minWidth: 20,
        bind: {
            tooltip: '{tooltipExpandAll}'
        }
    }, {
        type: 'button',
        name: 'resetThemeTree',
        bind: {
            text: '{btnTextResetThemeTreeFiltering}',
            tooltip: '{btnTooltipResetThemeTreeFiltering}'
        },
        handler: 'resetThemeTreeFiltering',
        disabled: true
    }],

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
            } else if (rec.data.isImportNode) {
                return 'x-fa fa-refresh';
            } else {
                return 'hide-action-column';
            }
        },
        handler: 'handleActionColumn'
    }],

    listeners: {
        select: 'setupShowFilterWinCheck',
        itemdblclick: 'addLayerWithDefaultFilters'
    },

    initComponent: function() {
        this.callParent();
        this.rebuildTree();
        window.setTimeout(this.rebuildTree.bind(this), 300000);
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
                                    children: config,
                                    isImportNode: true
                                });
                                var store = Ext.create('Ext.data.TreeStore', {
                                    root: {
                                        expanded: true,
                                        children: data
                                    }
                                });
                                me.reconfigure(store);
                                me.getViewModel().bind({
                                    bindTo: '{importedLayersTitle}'
                                }, function(title) {
                                    if (!data) {
                                        return;
                                    }
                                    data[data.length - 1].text = title;
                                    store = Ext.create('Ext.data.TreeStore', {
                                        root: {
                                            expanded: true,
                                            children: data
                                        }
                                    });
                                    me.reconfigure(store);
                                });
                            });
                    });
            });
    }

});
