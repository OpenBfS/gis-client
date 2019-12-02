/* Copyright (c) 2017 Bundesamt fuer Strahlenschutz
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
 * Header Panel
 *
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 *
 * @class Koala.view.panel.Header
 */
Ext.define('Koala.view.panel.Header', {
    extend: 'Ext.panel.Panel',
    xtype: 'k-panel-header',

    requires: [
        'Koala.view.panel.HeaderController',
        'Koala.view.panel.HeaderModel',
        'Koala.view.button.ElanScenarioButton',
        'Ext.Img'
    ],

    controller: 'k-panel-header',
    viewModel: {
        type: 'k-panel-header'
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: '0 5px',

    cls: 'basigx-header',

    items: [{
        xtype: 'title',
        textAlign: 'center',
        width: 300,
        bind: {
            text: '{headerTitle}'
        },
        autoEl: {
            tag: 'a',
            href: null
        },
        cls: 'k-application-title'
    }, {
        xtype: 'container',
        flex: 1,
        layout: {
            type: 'hbox',
            align: 'center',
            pack: 'left'
        },
        items: [{
            xtype: 'k-form-field-searchcombo',
            flex: 1
        }, {
            xtype: 'button',
            glyph: 'xf057@FontAwesome',
            style: {
                borderRadius: 0
            },
            handler: function(btn) {
                btn.up().down('k-form-field-searchcombo').clearValue();
                var multiSearchPanel = this.up('k-panel-header')
                    .down('k-panel-multisearch');
                if (multiSearchPanel) {
                    multiSearchPanel.hide();
                }
            }
        }, {
            xtype: 'k-panel-multisearch',
            width: 600,
            x: 0,
            y: 60,
            hidden: true,
            border: true,
            floating: true
        }]
    }, {
        xtype: 'container',
        layout: {
            type: 'hbox',
            align: 'center',
            pack: 'right'
        },
        items: [{
            xtype: 'elanscenariobutton',
            action: 'elanscenarios',
            hidden: false
        }, {
            xtype: 'k-toolbar-header'
        }]
    }, {
        xtype: 'image',
        bind: {
            title: '{logoTooltip}'
        },
        src: 'classic/resources/img/bfs-logo-75pct.png',
        alt: 'BfS',
        autoEl: {
            tag: 'a',
            href: 'http://www.bfs.de/DE/home/home_node.html',
            target: '_blank'
        },
        listeners: {
            afterrender: function() {
                var me = this;
                window.setTimeout(function() {
                    me.updateLayout();
                }, 1);
            },
            boxready: function() {
                // var tools = Koala.util.AppContext.getAppContext().data.merge.tools;
                // if (tools.indexOf('ScenarioAlertBtn') !== -1) {
                //     //run once to get immediate information
                //     Koala.util.DokpoolRequest.updateActiveElanScenarios();
                //     window.setInterval(function() {
                //         Koala.util.DokpoolRequest.updateActiveElanScenarios();
                //     }, 30000);
                // }
            }
        }
    }]
});
