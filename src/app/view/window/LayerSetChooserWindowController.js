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
 * @class Koala.view.window.LayerSetChooserWindowController
 */
Ext.define('Koala.view.window.LayerSetChooserWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-layersetchooserwindow',

    /**
     *
     */
    addHelpTxt: function() {
        var me = this;
        var view = me.getView();

        //helpTxt-panel
        var helpPanel = {
            xtype: 'panel',
            itemId: 'k-panel-layersetHelpTxt',
            bodyPadding: 5,
            header: false,
            layout: 'fit',
            width: '100%',
            minWidth: 150,
            minHeight: 80,
            scrollable: 'vertical',
            flex: 1,
            bind: {
                html: '{helpHtml}'
            }
        };

        //adjust layersetchooser-panel
        var lyrSetPanel = {
            xtype: 'k-panel-layersetchooser',
            showLayerProfiles: true,
            header: false,
            width: '100%',
            layout: 'fit',
            flex: 2
        };

        //adjust window, add panels
        view.setLayout({type: 'vbox', align: 'center'});
        view.setWidth(430);
        view.remove('k-panel-layersetchooser');
        view.insert(helpPanel);
        view.insert(lyrSetPanel);
    }
});
