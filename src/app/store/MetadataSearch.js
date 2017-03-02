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
 * @class Koala.store.MetadataSearch
 */
Ext.define('Koala.store.MetadataSearch', {
    extend: 'Ext.data.Store',

    requires: 'Koala.model.MetadataRecord',

    alias: 'store.k-metadatasearch',

    storeId: 'metadatasearch',

    model: 'Koala.model.MetadataRecord',

    groupField: 'type',

    /**
     * Stores the last request to be able to abort it manually.
     * @private
     */
    _lastRequest: null,

    constructor: function() {
        this.callParent(arguments);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var merge = appContext.data.merge;
        var urls = merge.urls;

        this.proxy.url = urls['metadata-search'];
        this.proxy.username = merge.application_user.username || null;
        this.proxy.password = merge.application_user.password || null;

        if(this.proxy.username && this.proxy.password){
            var tok = this.proxy.username + ':' + this.proxy.password;
            // TODO we may want to use something UTF-8 safe:
            // https://developer.mozilla.org/de/docs/Web/API/WindowBase64/btoa#Unicode-Zeichenketten
            var hash = btoa(tok);
            this.proxy.headers = {};
            this.proxy.headers.Authorization = "Basic " + hash;
        }
    },

    proxy: {
        type: 'ajax',
        url: null, // set in constructor
        startParam: 'from',
        limitParam: 'to',
        pageParam: '', // Hack to satisfy GNos: empty string > do not send it
        noCache: false,
        extraParams: {
            service: 'CSW',
            fast: 'index',
            _content_type: 'json',
            // Only include Metadata which actually comes from bfs-schema, they
            // have (probably) all the needed data to be actually included in
            // this application.
            // This paramter is AFAICT not documented, and was derived from
            // using the catalog search of the GNOS.
            //
            // Sadly this only works if we search against the API under URL
            // `…/q?…` not against standard `…/csw?…`
            // _schema: 'iso19139.bfs',
            version: '2.0.2',
            request: 'GetRecords',
            resultType: 'results',
            constraintLanguage: 'CQL_TEXT',
            constraint_language_version: '1.1.0',
            outputSchema: 'http://www.isotc211.org/2005/gmd',
            typeNames: 'csw:Record'
        },
        reader: {
            type: 'json',
            rootProperty: function(data){
                var root = {};
                // This is shared acros both results
                var result = data['csw:SearchResults'];
                // The namespace aliases we'll test in order
                // the first that matches will be used
                var namespaces = [
                    'gmd',
                    'bfs'
                ];
                Ext.each(namespaces, function(namespace){
                    var candidateKey = namespace + ':MD_Metadata';
                    if (result[candidateKey]) {
                        root = result[candidateKey];
                        return false; // return early
                    }
                });
                if(Ext.Object.isEmpty(root)){
                    return null;
                } else {
                    return root;
                }
            }
        }
    }
});
