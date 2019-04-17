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
 * @class Koala.view.window.ImprintWindow
 */
Ext.define('Koala.view.window.AboutWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-about',

    requires: [
        'Koala.view.window.AboutController',
        'Koala.view.window.AboutModel',
        'Koala.util.AppContext'
    ],

    controller: 'k-window-about',
    viewModel: {
        type: 'k-window-about'
    },

    bind: {
        title: '{aboutWinTitle}'
    },
    constrainHeader: true,
    width: 300,
    height: 350,
    minWidth: 250,
    minHeight: 250,

    resizable: true,
    maximizable: false,
    scrollable: true,

    initComponent: function() {
        var me = this;
        var currentViewSize = Ext.getBody().getViewSize();
        //var username = Koala.util.AppContext.getAppContext().data.merge.imis_user.username || '';
        var softwareversion = (Ext.manifest) ? Ext.manifest.version : '???';
        me.items = [{
            xtype: 'panel',
            border: false,
            layout: 'fit',
            //width: '100%',
            //height: '100%',
            bodyPadding: 20,
            bind: {
                html: '<p><b>' +
                    //username +
                    '</b><br />' +
                    '{loginText}' +
                    '<br /><b>' +
                    Koala.util.AppContext.getAppContext().data.merge.imis_user.uid +
                    '</b></p>' +
                    '<p>' +
                    '{rolesText}' +
                    '<br /><b>' +
                    me.arrayToHtml(Koala.util.AppContext.getAppContext().data.merge.imis_user.userroles) +
                    '</b></p>' +
                    '<p>' +
                    '{softwareVersionText}' +
                    '<br /><b>' +
                    softwareversion +
                    '</b></p>'
            }
        }];


        me.callParent();

        // me.setHeight(currentViewSize.height - 400);
        // me.setWidth(currentViewSize.width - 400);
    },

    /**
     * This function converts an Array into HTML-paragraphs
     */
    arrayToHtml: function(array) {
        var list = '';

        var i;
        for (i in array) {
            list += array[i] + '<br />';
        }
        return list;
    }
});
