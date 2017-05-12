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
    ],

    /**
     * Listener for the select event of the project combobox.
     *
     * @param {Ext.form.field.ComboBox} combo The project combobox.
     * @param {Ext.data.Model} record The selected record.
     */
    onProjectSelected: function(combo, record) {
        var projectUid = record.get('project_uid');
        if (!projectUid) {
            Ext.Logger.warn('No project_uid found.');
            return;
        }
        this.requestLayersOfProject(projectUid);
    },

    /**
     * Requests the layers of the selected project.
     *
     * @param {String} projectUid The project_uid of the selected project.
     */
    requestLayersOfProject: function(projectUid) {
        var me = this;
        var viewModel = this.getViewModel();
        var baseUrl = viewModel.get('rodosResultsUrl');

        Ext.Ajax.request({
            url: baseUrl + projectUid,
            success: function(response) {
                var obj = Ext.decode(response.responseText);
                if (obj && obj.rodos_results) {
                    me.setRodosLayers(obj.rodos_results);
                }
                me.closeRodosFilter();
            },
            failure: function(response) {
                Ext.Logger.warn('No RODOS-layers found for project '
                    + projectUid + ': ' + response.status);
            }
        });
    },

    /**
     * Sets the layers of the "RODOS-Prognosen" folder. It replaces the current
     * layers with the given layers.
     *
     * @param {Object} results the resultobject of the request to the RODOS
     *                         servlet for a specfic project.
     */
    setRodosLayers: function(results) {
        var layers = results.layers;
        var queryString = Ext.isModern ?
            'k-panel-treepanel > treelist' :
            'k-panel-themetree';
        var treeStore = Ext.ComponentQuery.query(queryString)[0].getStore();
        // TODO The name may change when a projected ist selected
        var rodosFolder = treeStore.findRecord('text', 'RODOS-Prognosen');
        var selectedProject = this.getViewModel().get('selectedProject');
        var projectName = selectedProject.get('name');
        var newText = Ext.String.format('RODOS-Prognosen ({0})', projectName);
        rodosFolder.set('text', newText);

        // Remove all current layers from tree;
        rodosFolder.removeAll();

        Ext.each(layers, function(layer) {
            var treeNodeObj = {
                leaf: true,
                isRodosLayer: true,
                rodosFilters: layer.filters,
                text: layer.name,
                uuid: layer.gnos_uid,
                description: results.description
            };

            if (treeNodeObj.uuid && treeNodeObj.text) {
                rodosFolder.appendChild(treeNodeObj);
            }
        });
    },

    /**
     * Removes all layers from the "RODOS-Prognosen" folder
     */
    removeRodosLayers: function() {
        var me = this;
        var queryString = Ext.isModern ?
            'k-panel-treepanel > treelist' :
            'k-panel-themetree';
        var treeStore = Ext.ComponentQuery.query(queryString)[0].getStore();
        var rodosFolder = treeStore.findRecord('text', 'RODOS-Prognosen');
        rodosFolder.removeAll();
        me.closeRodosFilter();
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
