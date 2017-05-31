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
 * @class Koala.view.button.PermalinkController
 */
Ext.define('Koala.view.button.PermalinkController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-permalink',

    requires: [
        'Koala.view.form.Permalink'
    ],

    /**
     *
     */
    onClick: function() {
        var win = Ext.ComponentQuery.query('[name=permalink-window]')[0];
        if (!win) {
            Ext.create('Ext.window.Window', {
                name: 'permalink-window',
                title: this.getViewModel().get('windowTitle'),
                layout: 'fit',
                constrain: true,
                maxWidth: Ext.getBody().getViewSize().width,
                tools: [{
                    type: 'help',
                    //TODO: move to app-locale
                    tooltip: 'Hilfe',
                    callback: function() {
                        var helpWin = Ext.ComponentQuery.query('k-window-help')[0];
                        if (!helpWin) {
                            helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                            helpWin.on('afterlayout', function() {
                                var helpWinController = this.getController();
                                helpWinController.setTopic('mapNavigationPermalink', 'mapNavigation');
                            }, helpWin, {single: true});
                        } else {
                            BasiGX.util.Animate.shake(helpWin);
                            var helpWinController = helpWin.getController();
                            helpWinController.setTopic('mapNavigationPermalink', 'mapNavigation');
                        }
                    }
                }],
                items: [{
                    xtype: 'k-form-permalink'
                }]
            }).show();
        } else {
            BasiGX.util.Animate.shake(win);
        }
    }

});
