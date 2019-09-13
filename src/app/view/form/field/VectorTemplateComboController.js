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
* @class Koala.view.form.field.VectorTemplateComboController
*/
Ext.define('Koala.view.form.field.VectorTemplateComboController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-field-vectortemplatecombo',

    requires: [
        'Koala.util.Object'
    ],

    /**
     *
     */
    beforeVectorTemplateComboRendered: function(combo) {
        var viewModel = this.getViewModel();
        var store = combo.getStore();
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        var map = Ext.ComponentQuery.query('k-component-map')[0].map;
        var templates = appContext.data.merge.vectorTemplates.slice();
        var path = 'metadata/layerConfig/olProperties/allowClone';
        if (this.getView().getIncludeCloneLayers()) {
            Ext.each(map.getLayers().getArray(), function(layer) {
                if (layer.metadata && Koala.util.Object.getPathStrOr(layer, path)) {
                    templates.push({
                        uuid: layer.metadata.id,
                        label: layer.get('name') || layer.metadata.treeTitle
                    });
                }
            });
        }
        store.setData(templates);
        viewModel.set('templateUuid', store.first().get('uuid'));
    }

});
