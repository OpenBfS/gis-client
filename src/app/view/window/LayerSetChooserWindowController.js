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
        var appLocaleUrlTpl = 'resources/locale/app-locale-{0}.json';
        var langCombo = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        var langComboController = (langCombo) ? langCombo.getController() : undefined;
        var locale = (langComboController) ? langComboController.locale : 'de';
        var appLocaleUrl = Ext.util.Format.format(appLocaleUrlTpl, locale);

        Ext.Ajax.request({
            method: 'GET',
            url: appLocaleUrl,
            success: function(response) {
                var respObj,
                    helpModel,
                    profileHelpTxt;
                // try to parse the given string as JSON
                try {
                    respObj = Ext.decode(response.responseText);
                    helpModel = Koala.util.Object.getPathStrOr(respObj, "Koala.view.window.HelpModel");
                    profileHelpTxt = helpModel.config.data.profileSelection.html;
                } catch (err) {
                    Ext.log.error('error parsing app-locale-{0}.json at addHelpTxt()');
                    return false;
                }
                finally {
                    if (profileHelpTxt) {
                        var view = me.getView();
                        var helpPanel = view.down('[itemId=k-panel-layersetHelpTxt]');
                        //delete image
                        profileHelpTxt = profileHelpTxt.replace(/<img[\s\S]*?>/, '');
                        helpPanel.setHtml(profileHelpTxt);
                        view.center();
                    }
                }
            },
            failure: function(response) {
                var msg = 'server-side failure with status code ' +
                    response.status;
                Ext.log.error(msg);
            },
            scope: me
        });
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
            flex: 1
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
