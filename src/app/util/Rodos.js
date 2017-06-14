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
 * @class Koala.util.Rodos
 */
Ext.define('Koala.util.Rodos', {

    statics: {
        /**
         * Requests the layers of the selected project.
         *
         * @param {String} projectUid The project_uid of the selected project.
         */
        requestLayersOfProject: function(projectUid) {
            var me = this;
            var appContext = Koala.util.AppContext.getAppContext();
            var baseUrl = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/rodos-results', false
            );

            if (baseUrl && projectUid) {
                Ext.Ajax.request({
                    url: baseUrl + projectUid,
                    success: function(response) {
                        var obj = Ext.decode(response.responseText);
                        if (obj && obj.rodos_results) {
                            me.setRodosLayers(projectUid, obj.rodos_results);
                        }
                    },
                    failure: function(response) {
                        Ext.Logger.warn('No RODOS-layers found for project '
                        + projectUid + ': ' + response.status);
                    }
                });
            }
        },

        /**
         * Sets the layers of the "RODOS-Prognosen" folder. It replaces the current
         * layers with the given layers.
         *
         * @param {Object} results the resultobject of the request to the RODOS
         *                         servlet for a specfic project.
         */
        setRodosLayers: function(projectUid, results) {
            var appContext = Koala.util.AppContext.getAppContext();
            var rodosFolderName = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/rodosFolderName', 'RODOS-Prognosen');
            var layers = results.layers;
            var queryString = Ext.isModern ?
                'k-panel-treepanel > treelist' :
                'k-panel-themetree';
            var treePanel = Ext.ComponentQuery.query(queryString)[0];
            var treePanelViewModel = treePanel.getViewModel();
            var treeStore = treePanel.getStore();
            // `findRecord` finds a record where the first param BEGINS with the
            // second one.
            var rodosFolder = treeStore.findRecord('text', rodosFolderName);
            var projectName = results.name;
            var newText = Ext.String.format('{0} ({1})',rodosFolderName, projectName);
            treePanelViewModel.set('selectedRodosProject', projectUid);
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
        }
    }
});
