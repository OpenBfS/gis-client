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
        'Koala.util.AppContext',
        'Koala.util.XML'
    ],

    statics: {

        /**
         * Rewrites/updates the metadata document to prepare the new metadata.
         * @param  {Object} context a context object containing config
         */
        getCswUpdate: function(context) {
            var XML = Koala.util.XML;

            var ms = /(^http[s]?:\/\/[^/]+)?(.+)/g.exec(context.config.baseUrl);
            var host = window.location.origin;
            var path = ms[2] + 'ows';
            var bfs = XML.defaultNamespaces.bfs;
            var gmd = XML.defaultNamespaces.gmd;
            var gco = XML.defaultNamespaces.gco;
            var workspace = context.config.workspace;
            var datastore = context.config.datastore;
            var name = context.metadata.newLayerName;
            var doc = context.metadataDocument;
            var ns = XML.namespaceResolver();
            var xpath = 'bfs:layerInformation/bfs:MD_Layer';
            var node = doc.evaluate(xpath, doc.documentElement, ns).iterateNext();
            XML.addOlProperty(node, 'workspace', workspace);
            XML.addOlProperty(node, 'param_typename', datastore + ':' + name);
            XML.addOlProperty(node, 'persisted', 'true');
            XML.addOlProperty(node, 'allowEdit', 'true');
            XML.removeNodes(doc, 'bfs:olProperty[bfs:MD_Property/bfs:propertyName/gco:CharacterString/text()=styleReference]', node);
            XML.addOlProperty(node, 'styleReference', context.newUuid);
            xpath = 'bfs:timeSeriesChartProperty';
            XML.removeNodes(doc, xpath, node);
            xpath = 'bfs:barChartProperty';
            XML.removeNodes(doc, xpath, node);
            xpath = 'bfs:legendTitle';
            XML.removeNodes(doc, xpath, node);
            xpath = 'bfs:printTitle';
            XML.removeNodes(doc, xpath, node);
            XML.addCharacterString(doc, node, bfs, 'bfs:printTitle', name);
            XML.addCharacterString(doc, node, bfs, 'bfs:legendTitle', name);
            xpath = 'bfs:layerType/bfs:MD_WMSLayerType';
            var layerNode = doc.evaluate(xpath, node, ns).iterateNext();
            if (layerNode) {
                layerNode.remove();
            }
            xpath = 'bfs:layerType/bfs:MD_VectorLayerType/bfs:URL';
            layerNode = doc.evaluate(xpath, node, ns).iterateNext();
            if (!layerNode) {
                layerNode = XML.addOrGet(doc, node, bfs, 'bfs:layerType');
                layerNode = XML.addOrGet(doc, layerNode, bfs, 'bfs:MD_VectorLayerType');
                var tmp = layerNode;
                layerNode = XML.addOrGet(doc, layerNode, bfs, 'bfs:URL');
                var tmp2 = XML.addOrGet(doc, tmp, bfs, 'bfs:format');
                tmp2.setAttributeNS(gco, 'nilReason', 'missing');
                tmp2 = XML.addOrGet(doc, tmp, bfs, 'bfs:params');
                tmp2.setAttributeNS(gco, 'nilReason', 'missing');
            }
            XML.removeNodes(doc, 'bfs:host', layerNode);
            XML.removeNodes(doc, 'bfs:path', layerNode);
            XML.addCharacterString(doc, layerNode, bfs, 'bfs:host', host);
            XML.addCharacterString(doc, layerNode, bfs, 'bfs:path', path);
            xpath = 'bfs:wfs/bfs:URL';
            node = doc.evaluate(xpath, node, ns).iterateNext();
            xpath = 'bfs:host';
            XML.removeNodes(doc, xpath, node);
            xpath = 'bfs:path';
            XML.removeNodes(doc, xpath, node);
            XML.addCharacterString(doc, node, bfs, 'bfs:host', host);
            XML.addCharacterString(doc, node, bfs, 'bfs:path', path);
            xpath = 'gmd:identificationInfo/gmd:MD_DataIdentification';
            node = doc.evaluate(xpath, doc.documentElement, ns).iterateNext();
            xpath = 'gmd:citation/gmd:CI_Citation/gmd:title';
            XML.updateText(doc, xpath, node, name);
            node = XML.addOrGet(doc, node, gmd, 'gmd:descriptiveKeywords');
            node = XML.addOrGet(doc, node, gmd, 'gmd:MD_Keywords');
            XML.addCharacterString(doc, node, gmd, 'gmd:keyword', 'importLayer');
            var type = doc.createElementNS(gmd, 'gmd:type');
            var code = doc.createElementNS(gmd, 'gmd:MD_KeywordTypeCode');
            code.setAttribute('codeList', '');
            code.setAttribute('codeListValue', '');
            node.appendChild(type);
            type.appendChild(code);
        },

        /**
         * Prepares/clones a metadata object for cloned layers. This will delete
         * some properties out of the metadata object so it can be stored in
         * GNOS for a newly created layer.
         * @param  {Object} metadata the metadata to clones
         * @return {Object}          the cloned metadata
         */
        prepareClonedMetadata: function(metadata) {
            if (!metadata) {
                return metadata;
            }
            metadata = Ext.clone(metadata);

            metadata.filters = [];
            delete metadata.layerConfig.wms;
            delete metadata.layerConfig.wfs;
            delete metadata.barChartProperties;
            delete metadata.timeSeriesChartProperties;
            // always allow cloned layers to be editable afterwards
            metadata.layerConfig.olProperties.allowEdit = true;

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
                var url = context.config.metadataBaseUrl;

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
            var url = context.config.metadataBaseUrl;

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/duplicate?group=1&sourceUuid=' +
                    context.uuid + '&metadataType=METADATA&isVisibleByAllGroupMembers=false&isChildOfSource=false&hasCategoryOfSource=false',
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
            var url = context.config.metadataBaseUrl;

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/' + context.newId,
                method: 'GET',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Accept': 'application/xml'
                },
                success: function(xhr) {
                    var doc = xhr.responseXML;
                    var xpath = 'gmd:fileIdentifier/gco:CharacterString/text()';
                    var uuid = Koala.util.XML.getText(doc, xpath, doc.documentElement);
                    context.newUuid = uuid;
                    context.metadataDocument = doc;
                    resolveFunc();
                }
            });

            return promise;
        },

        /**
         * Wraps the metadata document in an update transaction with a filter on
         * the uuid.
         * @param  {Object} context the context with the metadata document
         */
        prepareTransaction: function(context) {
            var XML = Koala.util.XML;
            var csw = XML.defaultNamespaces.csw;
            var ogc = XML.defaultNamespaces.ogc;
            var doc = context.metadataDocument;
            var root = doc.documentElement;
            root.remove();
            var node = doc.createElementNS(csw, 'csw:Transaction');
            node.setAttribute('service', 'CSW');
            node.setAttribute('version', '2.0.2');
            doc.appendChild(node);
            node = doc.createElementNS(csw, 'csw:Update');
            doc.documentElement.appendChild(node);
            node.appendChild(root);
            root = node;
            node = doc.createElementNS(csw, 'csw:Constraint');
            node.setAttribute('version', '1.1.0');
            root.appendChild(node);
            root = node;
            node = doc.createElementNS(ogc, 'ogc:Filter');
            root.appendChild(node);
            root = node;
            node = doc.createElementNS(ogc, 'ogc:PropertyIsEqualTo');
            root.appendChild(node);
            root = node;
            node = doc.createElementNS(ogc, 'ogc:PropertyName');
            node.textContent = 'Identifier';
            root.appendChild(node);
            node = doc.createElementNS(ogc, 'ogc:Literal');
            node.textContent = context.newUuid;
        },

        /**
         * Updates the metadata in the GNOS via CSW-T.
         * @param  {Object} context the context object with config and uuid.
         * @return {Promise}         the xhr promise
         */
        updateMetadata: function(context) {
            var url = context.config.metadataBaseUrl;

            this.getCswUpdate(context);
            this.prepareTransaction(context);

            return Ext.Ajax.request({
                url: url + 'srv/eng/csw-publication',
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Content-Type': 'application/xml'
                },
                xmlData: context.metadataDocument
            });

        },

        /**
         * Fetch groups.
         * @param  {Object} context the context object
         * @return {Promise}  the promise resolving once the groups have been
         * fetched
         */
        fetchGroups: function(context) {
            var url = context.config.metadataBaseUrl;

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/groups',
                method: 'GET',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Accept': 'application/json'
                },
                success: function(xhr) {
                    var groups = JSON.parse(xhr.responseText);
                    context.groups = groups;
                    resolveFunc();
                }
            });

            return promise;
        },

        /**
         * Share the metadata set with the users' groups.
         * @param  {Object} context the context object with the id and the groups
         * @return {Promise} the promise resolving once the privileges have been set
         */
        setMetadataGroups: function(context) {
            var url = context.config.metadataBaseUrl;

            var body = {
                clear: true,
                privileges: []
            };

            Ext.each(context.groups, function(group) {
                if (group.name === context.role) {
                    body.privileges.push({
                        group: group.id,
                        operations: {
                            download: true,
                            view: true,
                            dynamic: true
                        }
                    });
                }
            });

            var resolveFunc;
            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/' + context.newId + '/sharing',
                method: 'PUT',
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                jsonData: body,
                success: function() {
                    resolveFunc(context);
                }
            });

            return promise;
        },

        /**
         * Prepares the metadata for a cloned layer.
         * @param  {Object} metadata the original metadata Object
         * @param  {String} role the role with which to create metadata
         */
        prepareMetadata: function(metadata, role) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge.import;
            var context = {
                config: config[role],
                uuid: metadata.id,
                metadata: metadata,
                role: role
            };
            return this.loginToGnos(context)
                .then(this.cloneOldMetadata.bind(this, context))
                .then(this.determineNewUuid.bind(this, context))
                .then(this.updateMetadata.bind(this, context))
                .then(this.fetchGroups.bind(this, context))
                .then(this.setMetadataGroups.bind(this, context));
        },

        /**
         * Returns a CSW constraint XML snippet filtering by uuid
         * @param  {String} uuid the uuid to filter for
         * @return {String}      the XML snippet
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
         * Returns an XML string with a delete transaction request.
         * @param  {String} uuid the uuid of the record to delete
         * @return {String}      the request
         */
        getDeleteRequest: function(uuid) {
            return '<csw:Transaction service="CSW" ' +
               'version="2.0.2" ' +
               'xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" ' +
               'xmlns:gmd="http://www.isotc211.org/2005/gmd" ' +
               'xmlns:gco="http://www.isotc211.org/2005/gco" ' +
               'xmlns:ogc="http://www.opengis.net/ogc">' +
               '<csw:Delete typeName="gmd:MD_Metadata">' +
               this.getCswFilter(uuid) +
               '</csw:Delete>' +
               '</csw:Transaction>';
        },

        /**
         * Performs the actual request to delete a metadata record.
         * @param  {Object} context the context containing url, uuid etc.
         * @return {Ext.Promise} the promise resolving once deleting is done
         */
        deleteRecord: function(context) {
            var url = context.config.metadataBaseUrl;

            return Ext.Ajax.request({
                url: url + 'srv/eng/csw-publication',
                method: 'POST',
                xmlData: this.getDeleteRequest(context.uuid),
                headers: {
                    'Content-Type': 'application/xml'
                }
            });
        },

        /**
         * Deletes a metadata record by uuid.
         * @param  {String} uuid the uuid
         * @param  {String} role the role the layer belongs to
         * @return {Ext.Promise} the promise resolving once the record is
         * deleted
         */
        deleteMetadata: function(uuid, role) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge.import;
            var context = {
                config: config[role],
                uuid: uuid
            };
            return this.deleteRecord(context);
        }

    }

});
