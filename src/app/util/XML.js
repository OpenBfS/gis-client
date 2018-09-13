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
 * @class Koala.util.XML
 */
Ext.define('Koala.util.XML', {

    statics: {

        // add prefix/namespaces as you need it
        defaultNamespaces: {
            gmd: 'http://www.isotc211.org/2005/gmd',
            gco: 'http://www.isotc211.org/2005/gco',
            bfs: 'http://geonetwork.org/bfs',
            csw: 'http://www.opengis.net/cat/csw/2.0.2',
            ogc: 'http://www.opengis.net/ogc'
        },

        /**
         * Returns a namespace resolver function to use in xpath evaluations.
         * @param  {Object} map maps prefixes to namespaces. Uses the
         * defaultNamespaces if not given
         * @return {String} the namespace it resolves to or undefined if unknown
         */
        namespaceResolver: function(map) {
            if (!map) {
                map = Koala.util.XML.defaultNamespaces;
            }
            return function(prefix) {
                return map[prefix];
            };
        },

        /**
         * Extract a piece of text from XML via xpath.
         * @param  {Document} doc   the document
         * @param  {String} xpath the xpath to query
         * @param  {Node} node  the context node from where to query
         * @return {String}       the extracted text
         */
        getText: function(doc, xpath, node) {
            var ns = Koala.util.XML.namespaceResolver();
            return doc.evaluate(xpath, node, ns).iterateNext().textContent;
        },

        /**
         * Remove nodes from XML via xpath.
         * @param  {Document} doc   the document
         * @param  {String} xpath the xpath to query
         * @param  {Node} node  the context node from where to query
         */
        removeNodes: function(doc, xpath, node) {
            var ns = Koala.util.XML.namespaceResolver();
            node = doc.evaluate(xpath, node, ns).iterateNext();
            while (node) {
                node.parentNode.removeChild(node);
                node = doc.evaluate(xpath, node, ns).iterateNext();
            }
        },

        /**
         * Add a new olProperty to a metadata document.
         * @param  {Element} node  an MD_Layer node
         * @param  {String} key   the property name
         * @param  {String} value the property value
         */
        addOlProperty: function(node, key, value) {
            var doc = node.ownerDocument;
            var bfs = Koala.util.XML.defaultNamespaces.bfs;
            var prop = doc.createElementNS(bfs, 'bfs:olProperty');
            node.appendChild(prop);
            Koala.util.XML.addCharacterString(doc, prop, bfs, 'bfs:propertyName', key);
            Koala.util.XML.addCharacterString(doc, prop, bfs, 'bfs:propertyValue', value);
        },

        /**
         * Add new node/gco:CharacterString combination.
         * @param  {Document} doc       the document
         * @param  {Element} node      the node to append to
         * @param  {String} namespace the new node's namespace
         * @param  {String} name      the new node's name
         * @param  {String} value     the gco:CharacterString node's text content
         */
        addCharacterString: function(doc, node, namespace, name, value) {
            var gco = Koala.util.XML.defaultNamespaces.gco;
            var nameNode = doc.createElementNS(namespace, name);
            var val = doc.createElementNS(gco, 'gco:CharacterString');
            val.textContent = value;
            node.appendChild(nameNode);
            nameNode.appendChild(val);
        },

        /**
         * Updates a text node.
         * @param  {Document} doc   the document
         * @param  {String} xpath the xpath to the text node to change
         * @param  {Element} node  the xpath context node
         * @param  {String} value the new value
         */
        updateText: function(doc, xpath, node, value) {
            var ns = Koala.util.XML.namespaceResolver();
            xpath += '/gco:CharacterString';
            node = doc.evaluate(xpath, node, ns).iterateNext();
            node.textContent = value;
        },

        /**
         * Gets a node or creates it, if it does not exist.
         * @param  {Document} doc       the document
         * @param  {Element} node      the xpath context node
         * @param  {String} namespace namespace of the node
         * @param  {String} name      name of the node
         * @return {Element}           the found node, or the newly created one
         */
        addOrGet: function(doc, node, namespace, name) {
            var ns = Koala.util.XML.namespaceResolver();
            var newNode = doc.evaluate(name, node, ns).iterateNext();
            if (!newNode) {
                newNode = doc.createElementNS(namespace, name);
                node.appendChild(newNode);
            }
            return newNode;
        }

    }

});
