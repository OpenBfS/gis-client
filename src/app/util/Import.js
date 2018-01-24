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
        'Koala.util.Metadata'
    ],

    statics: {

        /**
         * Import the given layer.
         * @param  {ol.layer.Vector} layer the vector layer to import
         */
        importLayer: function(layer) {
            this.importData(layer);
        },

        /**
         * Prepares the initial empty import.
         * @param  {Object} config config object
         * @return {Promise} the promise resolving once the import is created
         */
        prepareImport: function(config) {
            var url = config['base-url'] + 'rest/imports';
            return Ext.Ajax.request({
                url: url,
                method: 'POST',
                username: config.username,
                password: config.password,
                withCredentials: true,
                isUpload: true,
                jsonData: {
                    import: {
                        targetWorkspace: {
                            workspace: {
                                name: config['target-workspace']
                            }
                        },
                        targetStore: {
                            dataStore: {
                                name: config['target-store']
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
            var url = importMetadata.config['base-url'] + 'rest/imports/' + importId + '/tasks';
            var data = new FormData();
            var bytes = Uint8Array.from(atob(importMetadata.bytes), function(c) {
                return c.charCodeAt(0);
            });
            data.set(name + '.zip', new Blob([bytes]), name + '.zip');
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
            var url = importMetadata.config['base-url'] + 'rest/imports/' + importMetadata.importId;
            return Ext.Ajax.request({
                url: url,
                method: 'POST',
                username: importMetadata.config.username,
                password: importMetadata.config.password,
                withCredentials: true
            });
        },

        /**
         * Fetch the task info to get the new layer name.
         * @param  {Object} context context with config
         * @return {Promise} a promise that resolves once the newLayerName is
         * set on the layer object
         */
        getLayerName: function(context) {
            var url = context.config['base-url'] + 'rest/imports/' + context.importId + '/tasks/0';
            return Ext.Ajax.request({
                url: url,
                method: 'GET',
                username: context.config.username,
                password: context.config.password,
                withCredentials: true,
                success: function(xhr) {
                    var data = JSON.parse(xhr.responseText);
                    context.layer.metadata.newLayerName = data.task.layer.name;
                }
            });
        },

        /**
         * Imports the given layer. Generates a blob in shape file format and
         * uses the Geoserver importer extension to import it into the db.
         * @param  {ol.layer.Vector} layer the layer to imports
         */
        importData: function(layer) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];
            var features = layer.getSource().getFeatures();
            var fmt = new ol.format.GeoJSON();
            var geojson = fmt.writeFeaturesObject(features, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            var bytes = shpwrite.zip(geojson, {
                types: {
                    polygon: layer.get('name') + '_polygons',
                    line: layer.get('name') + '_lines',
                    point: layer.get('name') + '_points'
                }
            });
            var importMetadata = {
                config: config,
                bytes: bytes,
                layer: layer
            };
            this.prepareImport(config)
                .then(this.prepareTask.bind(this, importMetadata))
                .then(this.performImport.bind(this, importMetadata))
                .then(this.getLayerName.bind(this, importMetadata))
                .then(Koala.util.Metadata.prepareMetadata.bind(Koala.util.Metadata, layer.metadata));
        }

    }

});
