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
 * @class Koala.util.Import
 */
Ext.define('Koala.util.Import', {

    requires: [
        'Koala.util.AppContext',
        'Koala.util.Metadata',
        'Koala.util.WFST'
    ],

    statics: {

        /**
         * Import the given layer.
         * @param  {ol.layer.Vector} layer the vector layer to import
         */
        importOrUpdateLayer: function(layer, wfstInserts, wfstUpdates,
            wfstDeletes, wfstSuccessCallback, wfstFailureCallback, role) {
            // persisted flag gets set explicitly to false on layer clone
            var persisted = layer.get('persisted');
            if (persisted === false) {
                this.importData(layer, role);
            } else {
                var count = wfstDeletes.length + wfstInserts.length +
                    wfstUpdates.length;
                if (count > 0) {
                    Koala.util.WFST.transact(layer, wfstInserts, wfstUpdates,
                        wfstDeletes, wfstSuccessCallback, wfstFailureCallback);
                }
                var sld = layer.get('SLD');
                var uuid = layer.metadata.id;
                var config = Koala.util.AppContext.getAppContext();
                config = config.data.merge.import[role];
                this.updateStyle(uuid, sld, config);
            }
        },

        /**
         * Insert or update the style for a layer.
         * @param {String} uuid the layer uuid
         * @param {String} sld the sld string
         * @param {Object} config context object with urls
         */
        updateStyle: function(uuid, sld, config) {
            if (sld) {
                var url = config.baseUrl + 'rest/styles';

                var update = function() {
                    Ext.Ajax.request({
                        url: url + '/' + uuid,
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/vnd.ogc.sld+xml'
                        },
                        xmlData: sld
                    });
                };

                var insert = function() {
                    Ext.Ajax.request({
                        url: url,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/xml'
                        },
                        xmlData: '<style><name>' + uuid + '</name><filename>' + uuid + '.sld</filename></style>'
                    }).then(update);
                };

                Ext.Ajax.request({
                    url: url + '/' + uuid + '.sld',
                    method: 'GET'
                })
                    .then(update, insert);
            }
        },

        /**
         * Prepares the initial empty import.
         * @param  {Object} context the context object
         * @param  {Blob} bytes the zip file blob
         * @return {Promise} the promise resolving once the import is created
         */
        prepareImport: function(context, bytes) {
            context.bytes = bytes;
            var config = context.config;
            var url = config.baseUrl + 'rest/imports';

            return Ext.Ajax.request({
                url: url,
                method: 'POST',
                isUpload: true,
                jsonData: {
                    import: {
                        targetWorkspace: {
                            workspace: {
                                name: config.workspace
                            }
                        },
                        targetStore: {
                            dataStore: {
                                name: config.datastore
                            }
                        }
                    }
                }
            });
        },

        /**
         * Prepares the actual import task by uploading the data.
         * @param  {Object} importMetadata context object with the config
         * @param  {XMLHttpRequest} xhr request containing the import id
         * @return {Promise} promise resolving once the upload has completed
         */
        prepareTask: function(importMetadata, xhr) {
            var response = JSON.parse(xhr.responseText);
            var importId = response.import.id;
            importMetadata.importId = importId;
            var name = importMetadata.layer.get('name');
            var url = importMetadata.config.baseUrl + 'rest/imports/' + importId + '/tasks';
            var data = new FormData();
            data.set(name + '.zip', importMetadata.bytes, name + '.zip');
            var request = new XMLHttpRequest();

            request.open('POST', url);

            var resolveFunc;
            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            request.onreadystatechange = function() {
                if (request.readyState === XMLHttpRequest.DONE && request.status === 201) {
                    resolveFunc();
                }
            };
            request.send(data);
            return promise;
        },

        /**
         * Triggers the actual import.
         * @param  {Object} importMetadata config object
         * @return {Promise} promise resolving once the import is done
         */
        performImport: function(importMetadata) {
            var url = importMetadata.config.baseUrl + 'rest/imports/' + importMetadata.importId;
            return Ext.Ajax.request({
                url: url,
                method: 'POST'
            });
        },

        /**
         * Fetch the task info to get the new layer name.
         * @param  {Object} context context with config
         * @return {Promise} a promise that resolves once the newLayerName is
         * set on the layer object
         */
        getLayerName: function(context) {
            var url = context.config.baseUrl + 'rest/imports/' + context.importId + '/tasks/0';
            return Ext.Ajax.request({
                url: url,
                method: 'GET',
                success: function(xhr) {
                    var data = JSON.parse(xhr.responseText);
                    context.layer.metadata.newLayerName = data.task.layer.name;
                }
            });
        },

        /**
         * Extracts the data from the layer and converts it to a shape file zip.
         * @param {ol.layer.Vector} layer the layer to extract the data from
         * @param {Object} context the context object
         */
        prepareData: function(layer, context) {
            var features = layer.getSource().getFeatures();
            var fmt = new ol.format.GeoJSON();
            var geojson = fmt.writeFeaturesObject(features, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            context.geojson = geojson;
            return shpwrite.zip(geojson, {
                types: {
                    polygon: layer.get('name') + '_polygons',
                    line: layer.get('name') + '_lines',
                    point: layer.get('name') + '_points'
                }
            });
        },

        /**
         * Imports the given layer. Generates a blob in shape file format and
         * uses the Geoserver importer extension to import it into the db.
         * @param  {ol.layer.Vector} layer the layer to imports
         * @param  {String} role the role with which to perform the import
         */
        importData: function(layer, role) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge.import[role];
            var importMetadata = {
                config: config,
                layer: layer
            };
            this.prepareData(layer, importMetadata)
                .then(this.prepareImport.bind(this, importMetadata))
                .then(this.prepareTask.bind(this, importMetadata))
                .then(this.performImport.bind(this, importMetadata))
                .then(this.getLayerName.bind(this, importMetadata))
                .then(this.persistToRodosService.bind(this, importMetadata))
                .then(Koala.util.Metadata.prepareMetadata.bind(
                    Koala.util.Metadata,
                    layer.metadata,
                    role
                ))
                .then(this.importStyle.bind(this, layer))
                .then(this.readdLayer.bind(this, layer))
                .then(this.setPersistedFlag.bind(this, layer))
                .then(this.closeFeatureGrid.bind(this));
        },

        /**
         * Persist the features to the rodos service.
         * @param {Object} context the context object
         */
        persistToRodosService: function(context) {
            if (context.layer.metadata.wasRodosLayer) {
                var config = Koala.util.AppContext.getAppContext().data.merge;
                var tablename = context.layer.metadata.rodosTablename;
                return Ext.Ajax.request({
                    url: config.urls['rodos-upload-service'] + tablename,
                    method: 'POST',
                    jsonData: context.geojson,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            return Ext.Promise.resolve();
        },

        /**
         * Import the sld style for the layer.
         * @param {ol.layer.Vector} layer the layer containing the sld to save
         * @param {Object} context the context object with the new uuid
         */
        importStyle: function(layer, context) {
            this.updateStyle(context.newUuid, layer.get('SLD'), context.config);
            return context;
        },

        /**
         * Remove the old cloned layer and add its persisted pendant.
         * @param {ol.layer.Vector} layer the old layer whose persisted replacement to add
         * @param {Object} context the context object with the new uuid
         */
        readdLayer: function(layer, context) {
            var map = Ext.ComponentQuery.query('basigx-component-map')[0]
                .getMap();
            map.removeLayer(layer);
            Koala.util.Layer.addLayerByUuid(context.newUuid);
            return context;
        },

        /**
         * Sets the persisted flag on the layer in order to determine if we
         * can updated via WFS-T
         */
        setPersistedFlag: function(layer) {
            layer.set('persisted', true);
        },

        /**
         * Close all open featuregrid windows.
         */
        closeFeatureGrid: function() {
            var wins = Ext.ComponentQuery.query('k-panel-featuregrid');
            if (wins.length > 0) {
                Ext.each(wins, function(win) {
                    win.close();
                });
            }
            var tree = Ext.ComponentQuery.query('k-panel-themetree')[0];
            tree.rebuildTree();
        }
    }

});
