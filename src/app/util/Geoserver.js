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
 * @class Koala.util.Geoserver
 */
Ext.define('Koala.util.Geoserver', {

    requires: [
        'Koala.util.AppContext'
    ],

    statics: {

        /**
         * Filter out non existing layers from a list of candidates.
         * @param  {String[]} workspaces list of workspaces
         * @param  {String[]} datastores corresponding list of datastores
         * @param  {Object[]} candidates a list of layer tree config candidates
         * @param  {String[]} baseUrls a list of base urls
         * @return {Ext.Promise} a promise that resolves to the list of filtered
         * layer tree config objects
         */
        checkAgainstGeoserver: function(workspaces, datastores, candidates, baseUrls) {
            var resultList = [];
            var promises = [];

            Ext.each(datastores, function(datastore, index) {
                var workspace = workspaces[index];
                var promise = new Ext.Promise(function(resolve) {
                    Ext.Ajax.request({
                        url: baseUrls[index] + 'rest/workspaces/' + workspace + '/datastores/' + datastore + '/featuretypes.json',
                        method: 'GET'
                    })
                        .then(function(xhr) {
                            var data = JSON.parse(xhr.responseText);
                            Ext.each(candidates, function(candidate) {
                                if (candidate.workspace !== workspace) {
                                    return;
                                }
                                candidate.datastore = datastore;
                                Ext.each(data.featureTypes.featureType, function(featureType) {
                                    if (featureType.name === candidate.text) {
                                        resultList.push(candidate);
                                    }
                                });
                            });
                            resolve();
                        });
                });
                promises.push(promise);
            });

            return new Ext.Promise(function(resolve) {
                Ext.Promise.all(promises)
                    .then(function() {
                        resolve(resultList);
                    });
            });
        },

        /**
         * Function to filter out layers that don't exist in Geoserver any more.
         * @param  {Object[]} layerTreeConfig layer tree configurations
         * @return {Ext.Promise} a promise that resolves with a filtered list
         * of layer tree config objects
         */
        filterDeletedLayers: function(layerTreeConfig) {
            var config = Koala.util.AppContext.getAppContext().data.merge.import;
            var candidates = Ext.Array.filter(layerTreeConfig, function(cfg) {
                return cfg.workspace;
            });
            var baseUrls = [];
            var workspaces = [];
            var datastores = [];
            Ext.each(candidates, function(candidate) {
                if (workspaces.indexOf(candidate.workspace) < 0) {
                    workspaces.push(candidate.workspace);
                    var found = false;
                    Ext.iterate(config, function(role, data) {
                        if (data.workspace === candidate.workspace) {
                            datastores.push(data.datastore);
                            baseUrls.push(data.baseUrl);
                            found = true;
                        }
                    });
                    if (!found) {
                        workspaces.pop();
                    }
                }
            });

            return Koala.util.Geoserver.checkAgainstGeoserver(
                workspaces,
                datastores,
                candidates,
                baseUrls
            );
        },

        /**
         * Deletes a layer from the geoserver.
         * @param  {ol.layer.Vector} layer a layer to delete
         * @return {Ext.Promise} a promise that resolves once the layer has
         * been deleted
         */
        deleteLayer: function(layer) {
            var config = Koala.util.AppContext.getAppContext().data.merge.import;
            var props = layer.metadata.layerConfig.olProperties;
            var baseUrl;
            Ext.iterate(config, function(idx, item) {
                if (item.workspace === props.workspace) {
                    baseUrl = item.baseUrl;
                    return false;
                }
            });
            var name = props.param_typename;
            return Ext.Ajax.request({
                url: baseUrl + 'rest/layers/' + name,
                method: 'DELETE'
            });
        }

    }

});
