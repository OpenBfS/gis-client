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
 * @class Koala.view.window.StyleSelectWindowController
 */
Ext.define('Koala.view.window.StyleSelectWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-styleselect',
    requires: [
        'Koala.util.AppContext',
        'Koala.util.Layer',
        'Koala.util.Object'
    ],

    /**
     * Updates the tab with the styles of the selected template.
     *
     * @param {Ext.form.field.ComboBox} combo the combo
     * @param {String} value the selected value
     */
    selectVectorTemplate: function(combo, value) {
        var viewModel = this.getViewModel();
        Koala.util.Layer.getMetadataFromUuid(value).then(function(metadata) {
            var styles = Koala.util.Object.getPathStrOr(metadata,
                'layerConfig/olProperties/styleReference');
            if (styles) {
                styles = styles.split(',')
                    .map(function(style) {
                        return style.trim();
                    });
                viewModel.set('stylesAvailable', true);
                viewModel.set('templateStyles', styles);
                viewModel.set('selectedTemplateStyle', styles[0]);
            } else {
                viewModel.set('stylesAvailable', false);
                viewModel.set('templateStyles', []);
                viewModel.set('selectedTemplateStyle', undefined);
            }
        });
    },

    /**
     * Closes the window.
     */
    onCancel: function() {
        this.getView().close();
    },

    /**
     * Fills environment field combo values.
     */
    attributeSelected: function(combo, value) {
        var feats = this.getView().getFeatures();
        var values = Koala.util.Data.extractDistinctValues(feats, value);
        var ctx = Koala.util.AppContext.getAppContext().data.merge;
        var url = ctx.urls['style-service'];
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            params: {
                ids: values.join(',')
            },
            success: this.updateEnvironmentFieldStyleCombo.bind(this)
        });
    },

    /**
     * Updates the environment field style combo with values from the style service.
     *
     * @param {Object} response the ajax response
     */
    updateEnvironmentFieldStyleCombo: function(response) {
        var list = JSON.parse(response.responseText);
        var store = Ext.create('Ext.data.Store', {
            data: list,
            fields: ['dsp', 'val']
        });
        var combo = this.getView().down('[name=environmentFieldStyles]');
        combo.setStore(store);
    },

    /**
     * Calls the callback with the geostyler default style SLD and closes the window.
     */
    useGeoStylerDefault: function() {
        var view = this.getView();
        view.getSetStyleCallback(Koala.util.Clone.defaultStyle);
        view.close();
    },

    /**
     * Reads in the file and calls the callback with its contents.
     *
     * @param {Object} tab the file tab
     */
    applyFileStyle: function(tab) {
        var view = this.getView();
        var file = tab.el.dom.querySelector('input[type=file]').files[0];
        var reader = new FileReader();
        reader.addEventListener('load', function(event) {
            var sld = event.target.result;
            view.getSetStyleCallback()(sld);
            view.close();
        });
        reader.readAsText(file);
    },

    /**
     * Calls the setSelectedTemplateStyle callback with the selected style.
     */
    applyTemplateStyle: function() {
        var view = this.getView();
        view.getSetSelectedTemplateStyle()(this.getViewModel().get('selectedTemplateStyle'));
        view.close();
    },

    /**
     * Calls the setSelectedTemplateStyle callback with the selected
     * environment field style.
     */
    applyEnvironmentFieldStyle: function() {
        var view = this.getView();
        view.getSetSelectedTemplateStyle()(this.getViewModel().get('selectedEnvironmentFieldStyle'));
        view.close();
    },

    /**
     * Apply the style of the selected tab.
     */
    applyStyle: function() {
        var view = this.getView();
        var tab = view.down('tabpanel').getActiveTab();
        switch (tab.name) {
            case 'fileTab':
                this.applyFileStyle(tab);
                break;
            case 'environmentFieldTab':
                this.applyEnvironmentFieldStyle();
                break;
            case 'templateTab':
                this.applyTemplateStyle(tab);
                break;
        }
    }

});
