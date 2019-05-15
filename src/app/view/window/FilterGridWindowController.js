/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.FilterGridWindowController
 */
Ext.define('Koala.view.window.FilterGridWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-filtergrid',

    requires: [
    ],

    checkDuplicates: function() {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var features = view.getLayer().getSource().getFeatures();
        var duplicates = BasiGX.util.Geometry.getGeometryDuplicates(features);
        var text;
        if (duplicates.length > 0) {
            text = '<br>' + viewModel.get('duplicateFeaturesText');
            view.setHeight(255);
        } else {
            text = '<br>' + viewModel.get('noDuplicateFeaturesText');
            view.setHeight(220);
        }
        view.down('[name=duplicateText]').setHtml(text);
    }

});
