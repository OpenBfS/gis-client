/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.form.RodosFilterController
 */
Ext.define('Koala.view.form.RodosFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-rodosfilter',

    requires: [
        'Koala.util.Rodos'
    ],

    /**
     * Listener for the select event of the project combobox.
     *
     * @param {Ext.form.field.ComboBox} combo The project combobox.
     * @param {Ext.data.Model} record The selected record.
     */
    onProjectSelected: function(combo, record) {
        var projectUid = record.get('project_uid');
        var name = record.get('name');
        if (!projectUid) {
            Ext.Logger.warn('No project_uid found.');
            return;
        }
        Koala.util.Rodos.requestLayersOfProject(projectUid, name);
        this.closeRodosFilter();
    },

    /**
     * Closes the window in classic. Hides the mobilepanel in modern.
     */
    closeRodosFilter: function() {
        var view = this.getView();
        // Classic
        var window = view.up('window');
        if (window) {
            window.close();
        }
        // Modern
        var mobilePanel = view.up('k-panel-mobilepanel');
        if (mobilePanel) {
            mobilePanel.hide();
        }
    }

});
