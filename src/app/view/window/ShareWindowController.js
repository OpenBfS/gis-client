/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.ShareWindowController
 */
Ext.define('Koala.view.window.ShareWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-share',

    requires: [
        'Koala.view.form.field.VectorTemplateCombo',
        'Koala.util.Geoserver'
    ],

    /**
     * Handle a click on the cancel button. Just closes the window.
     */
    cancelHandler: function() {
        this.getView().close();
    },

    /**
     * Commence cloning action, then close the window.
     */
    shareHandler: function() {
        var view = this.getView();
        var oldLayer = view.getSourceLayer();
        var name = view.down('textfield').getValue();
        var uuid = oldLayer.metadata.id;
        var oldRole;
        var config = Koala.util.AppContext.getAppContext();
        var oldWorkspace = oldLayer.metadata.layerConfig.olProperties.workspace;
        config = config.data.merge.import;
        Ext.iterate(config, function(key, item) {
            if (oldWorkspace === item.workspace) {
                oldRole = key;
            }
        });

        var promise = Koala.util.Clone.cloneLayer(
            view.getSourceLayer(),
            name,
            undefined,
            undefined,
            view.getSourceLayer(),
            uuid
        );

        promise.then(function(newLayer) {
            var role = view.down('[name=rolescombo]').getValue();
            Koala.util.Import.importOrUpdateLayer(
                newLayer,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                role
            );
            Koala.util.Geoserver.deleteLayer(oldLayer);
            Koala.util.Metadata.deleteMetadata(oldLayer.metadata.id, oldRole);
            view.close();
            var map = BasiGX.view.component.Map.guess().getMap();
            map.removeLayer(oldLayer);
        });
    }

});
