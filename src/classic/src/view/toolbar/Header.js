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
 * @class Koala.view.toolbar.Header
 */
Ext.define('Koala.view.toolbar.Header', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'k-toolbar-header',

    requires: [
        'BasiGX.util.Animate',
        'Koala.util.Fullscreen',

        'Koala.view.toolbar.HeaderController',
        'Koala.view.toolbar.HeaderModel',
        'Koala.view.button.TimeReference',
        'Koala.view.window.HelpWindow'
    ],

    controller: 'k-toolbar-header',
    viewModel: {
        type: 'k-toolbar-header'
    },

    defaults: {
        scale: 'small'
    },

    items: [
        '->',
/*
        {
            bind: {
                text: '{btnTextFullscreen}',
                tooltip: '{btnTooltipFullscreen}'
            },
            hidden: !Koala.util.Fullscreen.isFullscreenSupported(),
            enableToggle: true,
            listeners: {
                toggle: 'toggleFullscreen'
            }
        },
*/
        {
            xtype: 'k-button-timereference'
        },
        {
            xtype: 'button',
            bind: {
                text: '{btnTextHelp}',
                tooltip: '{btnTooltipHelp}'
            },
            handler: function() {
                var win = Ext.ComponentQuery.query('k-window-help')[0];
                if (!win) {
                    Ext.create('Koala.view.window.HelpWindow').show();
                } else {
                    BasiGX.util.Animate.shake(win);
                }
            }
        },
        {
            xtype: 'button',
            bind: {
                text: '{btnTextImprint}',
                tooltip: '{btnTooltipImprint}'
            },
            handler: function() {
                var win = Ext.ComponentQuery.query('k-window-imprint')[0];
                if (!win) {
                    Ext.create('Koala.view.window.ImprintWindow').show();
                } else {
                    BasiGX.util.Animate.shake(win);
                }
            }
        },
        {
            xtype: 'k-form-field-languagecombo'
        }
    ]
});
