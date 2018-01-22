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
 * @class Koala.view.window.LayerSetChooserWindow
 */
Ext.define('Koala.view.window.LayerSetChooserWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-layersetchooserwindow',
    cls: 'k-window-layersetchooserwindow',

    requires: [
        'Koala.view.window.LayerSetChooserWindowController',
        'Koala.view.window.LayerSetChooserWindowModel',

        'Koala.view.panel.LayerSetChooser'
    ],

    controller: 'k-window-layersetchooserwindow',

    viewModel: {
        type: 'k-window-layersetchooserwindow'
    },

    config: {
        helpTxt: false
    },

    bind: {
        title: '{title}'
    },

    modal: true,
    layout: 'fit',
    minWidth: 250,
    minHeight: 300,
    tools: [{
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        topic: 'profileSelection',
        parentOfTopic: 'tools',
        callback: Koala.util.Help.showHelpWindow
    }],
    items: [{
        xtype: 'k-panel-layersetchooser',
        itemId: 'k-panel-layersetchooser',
        showLayerProfiles: true,
        header: false,
        layout: 'fit'
    }],

    /**
     *
     */
    listeners: {
        beforerender: function() {
            var me = this;
            var lyrSetController = me.getController();
            if (me.getHelpTxt()) {
                lyrSetController.addHelpTxt();
            }
        }
    }
});
