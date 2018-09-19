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
        var name = view.down('textfield').getValue();
        var templateCombo = view.down('k-form-field-vectortemplatecombo');
        var uuid = templateCombo.getViewModel().get('templateUuid');

        var promise = Koala.util.Clone.cloneLayer(
            view.getSourceLayer(),
            name,
            undefined,
            undefined,
            view.getSourceLayer(),
            uuid
        );

        promise.then(function(newLayer) {
            var context = Koala.util.AppContext.getAppContext().data.merge;
            var imisRoles = context.imis_user.userroles;
            var role = imisRoles[0];
            Koala.util.Import.importOrUpdateLayer(
                newLayer,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                role
            );
            view.close();
        });
    }

});
