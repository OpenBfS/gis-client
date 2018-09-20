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
 * @class Koala.util.MetadataQuery
 */
Ext.define('Koala.util.MetadataQuery', {

    requires: [
        'Koala.util.AppContext',
        'Koala.util.XML'
    ],

    statics: {

        // request to get all metadata sets of previously imported layer
        // Please note that the GNOS takes care of giving us only records we
        // have access to.
        importedLayersRequest: '<GetRecords ' +
            'xmlns="http://www.opengis.net/cat/csw/2.0.2" ' +
            'xmlns:bfs="http://geonetwork.org/bfs" ' +
            'service="CSW" version="2.0.2" maxRecords="1000" ' + // TODO max value? default is 10
            'resultType="results" outputFormat="application/xml" ' +
            'outputSchema="http://www.isotc211.org/2005/gmd">' +
            '<Query typeNames="gmd:MD_Metadata">' +
            '<ElementSetName typeNames="gmd:MD_Metadata">full</ElementSetName>' +
            '<Constraint version="1.1.0">' +
            '<Filter xmlns="http://www.opengis.net/ogc" ' +
            ' xmlns:gmd="http://www.isotc211.org/2005/gmd" ' +
            ' xmlns:gco="http://www.isotc211.org/2005/gco">' +
            '<PropertyIsEqualTo>' +
            // unfortunately, I did't find a way to properly filter on the
            // keyword, so we'll have to request loosely here and post filter
            '<PropertyName>AnyText</PropertyName>' +
            '<Literal>importLayer</Literal>' +
            '</PropertyIsEqualTo>' +
            '</Filter>' +
            '</Constraint>' +
            '</Query> ' +
            '</GetRecords>',

        /**
         * Extracts layer tree info from metadata.
         * @param  {Document} doc    the document
         * @param  {Node} node   the metadata root node
         * @param  {Object} config the config object to write the layer tree
         * info to
         */
        extractLayerInfo: function(doc, node, config) {
            var getText = Koala.util.XML.getText;
            var xpath = 'bfs:layerInformation/bfs:MD_Layer/bfs:legendTitle/gco:CharacterString/text()';
            config.text = getText(doc, xpath, node);
            xpath = 'gmd:fileIdentifier/gco:CharacterString/text()';
            config.uuid = getText(doc, xpath, node);
            config.leaf = true;
            xpath = 'bfs:layerInformation/bfs:MD_Layer/bfs:olProperty/bfs:MD_Property' +
                '[bfs:propertyName/gco:CharacterString/text()="workspace"]' +
                '/bfs:propertyValue/gco:CharacterString/text()';
            config.workspace = getText(doc, xpath, node);
        },

        /**
         * Post processes the metadata. The metadata is filtered again to make
         * sure the loose metadata search did not hit false positives, then
         * extracts the layer tree info.
         * @param  {Node[]} docs the metadata nodes
         * @return {Object[]}      the processed information to use in the
         * layer tree
         */
        postProcessMetadata: function(docs) {
            var filtered = [];
            var ns = Koala.util.XML.namespaceResolver();
            Ext.each(docs, function(doc) {
                var node = doc;
                doc = node.ownerDocument;
                var xpath = 'gmd:identificationInfo/gmd:MD_DataIdentification/' +
                    'gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/' +
                    'gco:CharacterString[text()="importLayer"]';
                var keywords = doc.evaluate(xpath, node, ns);
                if (keywords.iterateNext()) {
                    var layer = {};
                    filtered.push(layer);
                    Koala.util.MetadataQuery.extractLayerInfo(doc, node, layer);
                }
            });
            return filtered;
        },

        /**
         * Get layer tree information for all previously imported layers by
         * querying the GNOS for metadata and then processing it.
         * @return {Promise} a promise that resolves to a list of layer tree
         * config objects
         */
        getImportedLayers: function() {
            var config = Koala.util.AppContext.getAppContext();
            var url = config.data.merge.urls['metadata-search'];

            var resolveFunc;

            var promise = new Ext.Promise(function(resolve) {
                resolveFunc = resolve;
            });

            Ext.Ajax.request({
                url: url,
                method: 'POST',
                xmlData: Koala.util.MetadataQuery.importedLayersRequest,
                success: function(xhr) {
                    var xml = xhr.responseXML;
                    var docs = xml.documentElement.querySelectorAll('MD_Metadata');
                    var layers = Koala.util.MetadataQuery.postProcessMetadata(docs);
                    resolveFunc(layers);
                }
            });

            return promise;
        }

    }

});
