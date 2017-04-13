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
 * @class Koala.view.window.HelpWindow
 */
Ext.define('Koala.view.window.HelpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-help',

    requires: [
        'Ext.list.Tree',
        'Koala.view.window.HelpController',
        'Koala.view.window.HelpModel'
    ],

    controller: 'k-window-help',
    viewModel: {
        type: 'k-window-help'
    },

    bind: {
        title: '{helpWinTitle}'
    },
    constrainHeader: true,
    width: 1050,
    height: 580,
    layout: 'border',
    minWidth: 500,
    minHeight: 300,

    resizable: true,
    collapsible: true,
    maximizable: true,

    //Navigation-Panel
    items: [{
        xtype: 'panel',
        region: 'west',
        scrollable: 'vertical',
        width: 290,
        split: true,
        layout: {
            type: 'vbox'
        },
        border: false,
        items: [{
            xtype: 'treelist',
            reference: 'treelist',
            expanderOnly: false,
            bind: '{helpNavItems}'
        }]
    },
    //Content
    {
        xtype: 'panel',
        region: 'center',
        scrollable: 'vertical',
        bodyPadding: 10,
        bind: {
            html: '{selectionHtml}'
        }
    }],

    //select default node 'quick-reference'
    listeners: {
        afterlayout: function() {
            var me = this,
                treelist = me.lookupReference('treelist'),
                store = treelist.getStore(),
                selection = treelist.getSelection();
            if (store && !selection) {
                var winController = me.getController();
                winController.removeTopicByTools();
                winController.setTopic('quickRef');
            }
        }
    }
});
