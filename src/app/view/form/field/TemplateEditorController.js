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
 * @class Koala.view.form.field.TemplateEditorController
 */
Ext.define('Koala.view.form.field.TemplateEditorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-field-templateeditor',

    /**
     * Updates the view model with the selected template's value.
     *
     * @param {Ext.form.field.ComboBox} combo the template combo
     * @param {String} newValue the new value
     */
    templateSelected: function(combo, newValue) {
        var view = this.getView();
        var idx = view.getTemplates().indexOf(newValue);
        var property = view.getProperties()[idx];
        var value = view.getMetadata()[property];
        view.getViewModel().set('templateValue', value);
    },

    /**
     * Updates the metadata with the new value.
     *
     * @param {Ext.form.field.TextField} field the text field
     * @param {String} newValue the new value
     */
    templateEdited: function(field, newValue) {
        var view = this.getView();
        var viewModel = view.getViewModel();
        var metadata = view.getMetadata();
        var tpl = viewModel.get('selectedTemplate');
        var idx = view.getTemplates().indexOf(tpl);
        var property = view.getProperties()[idx];

        // It is a really bad idea to edit the templates with eval
        // functions with the HTML editor. It randomly SGML quotes
        // characters it doesn't like and we have to revert them back here.
        // Also, markup is sometimes inserted if there was none yet.
        if (property === 'yAxisLabel' || property === 'seriesTitleTpl') {
            // IIRC this happens when the template DOESN'T contain markup yet
            newValue = newValue.replace(/<\/?div>|<br>|&nbsp;/g, '');
        }
        // corresponds to && expressions in JS code
        newValue = newValue.replace(/&amp;&amp;/g, '&&');
        // corresponds mainly to the NWG check (checking whether the value of
        // a field equals the character <)
        newValue = newValue.replace(/'&lt;'/g, '\'<\'');
        metadata[property] = newValue;
        try {
            this.getView().getCallback()(this.getView());
        } catch (e) {
            // ignore errors, these may happen in case an eval template is not (yet) valid while
            // editing
            Ext.log('Ignoring error when evaluating template, probably the JS syntax is not valid.');
        }
    },

    /**
     * Inserts the selected value into the htmleditor.
     *
     * @param {Ext.form.field.ComboBox} combo the combo
     * @param {String} newValue the new value
     */
    attributeSelected: function(combo, newValue) {
        var editor = this.getView().down('htmleditor');
        var iframe = editor.el.dom.querySelector('iframe');
        if (iframe.contentWindow.getSelection().rangeCount) {
            editor.insertAtCursor('[[' + newValue + ']]');
            editor.setValue(editor.getValue());
        } else {
            editor.setValue(editor.getValue() + '[[' + newValue + ']]');
        }
    }

});
