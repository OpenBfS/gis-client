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
        //TODO: move to app-locale
        tooltip: 'Hilfe',
        callback: function() {
            var helpWin = Ext.ComponentQuery.query('k-window-help')[0];
            if (!helpWin) {
                helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                helpWin.on('afterlayout', function() {
                    var helpWinController = this.getController();
                    helpWinController.setTopic('layerSelection');
                }, helpWin, {single: true});
            } else {
                BasiGX.util.Animate.shake(helpWin);
                var helpWinController = helpWin.getController();
                helpWinController.setTopic('layerSelection');
            }
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
            if (rec.get('text') === 'RODOS-Prognosen') {
                return 'Rodos Filter ändern !18n';
            }
        },
        getClass: function(v, meta, rec) {
            if (rec.get('text') === 'RODOS-Prognosen') {
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
    },

    initComponent: function() {

        // try to load layerset from appContext
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var path = [
            'data',
            'merge',
            'urls',
            'layerset'
        ];
        var layerSetUrl = Koala.util.Object.getPathOr(appContext, path, 'classic/resources/layerset.json');

        var store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: layerSetUrl,
                reader: {
                    type: 'json'
                }
            }
        });
        this.store = store;
        this.callParent();
    }
});
