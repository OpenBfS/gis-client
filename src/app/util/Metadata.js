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
 * @class Koala.util.Metadata
 */
Ext.define('Koala.util.Metadata', {

    requires: [
        'Koala.util.AppContext'
    ],

    statics: {

        /**
         * Get a CSW filter filtering by uuid.
         * @param  {String} uuid the uuid to filter on
         * @return {String}      a CSW/filter encoding snippet
         */
        getCswFilter: function(uuid) {
            return '<csw:Constraint version="1.1.0">' +
                '<ogc:Filter>' +
                '<ogc:PropertyIsEqualTo>' +
                '<ogc:PropertyName>Identifier</ogc:PropertyName>' +
                '<ogc:Literal>' + uuid + '</ogc:Literal>' +
                '</ogc:PropertyIsEqualTo>' +
                '</ogc:Filter>' +
                '</csw:Constraint>';
        },

        /**
         * Get a CSW property update snippet.
         * @param  {String} property property path to update
         * @param  {String} value    the new values
         * @param  {Boolean} add whether to create an 'add' node
         * @return {String}          the CSW property snippet
         */
        getPropertyUpdate: function(property, value, add) {
            return '<csw:RecordProperty>' +
                '<csw:Name>' + property + '</csw:Name>' +
                '<csw:Value>' + (add ? '<gn_add>' : '' + value) +
                (add ? '</gn_add>' : '') + '</csw:Value>' +
                '</csw:RecordProperty>';
        },

        /**
         * Constructs a CSW update transaction to prepare the new metadata.
         * @param  {Object} context a context object containing config
         * @return {String}         an XML transaction request
         */
        getCswUpdate: function(context) {
            var ms = /(^http[s]?:\/\/[^/]+)(.+)/g.exec(context.config['base-url']);
            var host = ms[1];
            var path = ms[2] + 'ows';

            return '<?xml version="1.0" encoding="UTF-8"?>' +
                '<csw:Transaction service="CSW" version="2.0.2" ' +
                'xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" ' +
                'xmlns:ogc="http://www.opengis.net/ogc" ' +
                'xmlns:gmd="http://www.isotc211.org/2005/gmd" ' +
                'xmlns:bfs="http://geonetwork.org/bfs" ' +
                'xmlns:gco="http://www.isotc211.org/2005/gco">' +
                '<csw:Update>' +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation' +
                    '/bfs:MD_WMSLayerType/bfs:layerType/bfs:MD_WMSLayerType/' +
                    'bfs:layer/gco:CharacterString', context.newLayerName) +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:timeSeriesChartProperty', '') +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:barChartProperty', '') +
                this.getPropertyUpdate('/bfs:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString', context.newLayerName) +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:legendTitle/gco:CharacterString', context.newLayerName) +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:printTitle/gco:CharacterString', context.newLayerName) +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:wfs/bfs:URL/bfs:host/gco:CharacterString', host) +
                this.getPropertyUpdate('/bfs:MD_Metadata/bfs:layerInformation/bfs:MD_Layer/bfs:wfs/bfs:URL/bfs:path/gco:CharacterString', path) +
                this.getPropertyUpdate('/bfs:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString', 'importLayer') +
                this.getCswFilter(context.newUuid) +
                '</csw:Update>' +
                '</csw:Transaction>';
        },

        /**
         * Prepares/clones a metadata object for cloned layers. This will delete
         * some properties out of the metadata object so it can be stored in
         * GNOS for a newly created layer.
         * @param  {Object} metadata the metadata to clones
         * @return {Object}          the cloned metadata
         */
        prepareClonedMetadata: function(metadata) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];

            if (!metadata) {
                return metadata;
            }
            metadata = Ext.clone(metadata);

            // delete metadata.id;//id will get overriden after GNOS insert...
            delete metadata.layerConfig.wms;
            delete metadata.barChartProperties;
            delete metadata.timeSeriesChartProperties;
            // always allow cloned layers to be editable afterwards
            metadata.layerConfig.olProperties.allowEdit = true;
            metadata.layerConfig.wfs.url = config['base-url'] + 'ows';

            return metadata;
        },

        /**
         * Log into the GNOS. In order to get the CSRF token:
         * * an unsuccessful POST must be made
         * * an iframe has to be loaded with a GNOS URL to access the cookie
         *
         * Unfortunately this seems to be the only way to access the token. See
         * also the official docs:
         * https://geonetwork-opensource.org/manuals/3.4.x/en/customizing-application/misc.html#invalid-csrf-token
         * @param  {Object} context context object with the config
         * @return {Promise} a promise that resolves once the token has been
         * extracted
         */
        loginToGnos: function(context) {
            return new Ext.Promise(function(resolve) {
                var url = context.config['metadata-base-url'];

                var iframe = document.createElement('iframe');
                document.querySelector('body').appendChild(iframe);
                iframe.onload = function() {
                    var req = Ext.Ajax.request({
                        url: url + 'srv/eng/info',
                        method: 'POST'
                    });

                    req.then(function() {
                        // request will always fail
                    }, function() {
                        var cookie = iframe.contentDocument.cookie;
                        var ms = cookie.match(/XSRF-TOKEN=([0-9\-a-f]+)/);
                        context.csrfToken = ms[1];
                        resolve();
                    });
                };
                iframe.setAttribute('hidden', 'true');
                iframe.setAttribute('src', url + 'catalog/components/viewer/wmsimport/partials/kmlimport.html');
            });
        },

        /**
         * Duplicates the old metadata record via REST API.
         * @param  {Object} context context object with config and old uuid
         * @return {Promise} a promise resolving once duplication has been done
         */
        cloneOldMetadata: function(context) {
            var url = context.config['metadata-base-url'];

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/duplicate?group=1&sourceUuid=' +
                    context.uuid + '&metadataType=METADATA&isVisibleByAllGroupMembers=false&isChildOfSource=false',
                method: 'PUT',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                success: function(xhr) {
                    var id = xhr.responseText;
                    context.newId = id;
                    resolveFunc();
                }
            });

            return promise;
        },

        /**
         * Determines the new uuid using the new integer id.
         * @param  {Object} context the context object with config and id
         * @return {Promise}  the promise resolving once the uuid has been found
         */
        determineNewUuid: function(context) {
            var url = context.config['metadata-base-url'];

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/' + context.newId,
                method: 'GET',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Accept': 'application/json'
                },
                success: function(xhr) {
                    var metadata = JSON.parse(xhr.responseText);
                    context.newUuid = metadata['gmd:fileIdentifier']['gco:CharacterString']['#text'];
                    resolveFunc();
                }
            });

            return promise;
        },

        /**
         * Updates the metadata in the GNOS via CSW-T.
         * @param  {Object} context the context object with config and uuid.
         * @return {Promise}         the xhr promise
         */
        updateMetadata: function(context) {
            var url = context.config['metadata-base-url'];
            var xml = this.getCswUpdate(context);

            return Ext.Ajax.request({
                url: url + 'srv/eng/csw-publication',
                method: 'POST',
                xmlData: xml
            });
        },

        /**
         * Prepares the metadata for a cloned layer.
         * @param  {Object} metadata the original metadata Object
         */
        prepareMetadata: function(metadata) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];
            var context = {
                config: config,
                uuid: metadata.id,
                newLayerName: metadata.legendTitle + ' (' + metadata.newLayerName + ')'
            };
            return this.loginToGnos(context)
                .then(this.cloneOldMetadata.bind(this, context))
                .then(this.determineNewUuid.bind(this, context))
                .then(this.updateMetadata.bind(this, context));
        }

    }

});
