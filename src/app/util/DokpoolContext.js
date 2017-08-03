/* Copyright (c) 2017-present BfS Bundesamt fuer Strahlenschutz
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
 * A utility class to work with a dokpool context
 *
 * @class Koala.util.DokpoolContext
 */
Ext.define('Koala.util.DokpoolContext', {
    requires: [
        BasiGX.view.component.Map
    ],
    config: {
        // can be overriden via appContext.json: urls/dokpool-context
        dokpoolContextUrl: 'resources/dokpoolContext.json'
    },

    DOKPOOL_NAME: 'bund',

    init: function() {
        var me = this;
        me.callParent();

        var appContext = BasiGX.view.component.Map.guess().appContext;
        if (appContext) {
            var configuredDokpoolContext = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/dokpool-context', false
            );
            if (configuredDokpoolContext) {
                me.setDokpoolContextUrl(configuredDokpoolContext);
            }
        }

        Ext.Ajax.request({
            url: me.dokpoolContextUrl,

            success: function(response) {
                var json = Ext.decode(response.responseText);
                me.raw = json;
                me.add(me.createFields(json.data.fields));
            },

            failure: function(response) {
                Ext.raise('server-side failure with status code ' + response.status);
            }
        });
    },

    /**
     * Get all the DokpoolContentTypes from a DokpoolContext object
     * @return [List] The found DokpoolContentTypes.
     */
     getDokpoolContentTypes: function(){
         return Object.keys(dokpoolContext.DOKPOOL_NAME.bund.DokpoolContentType);
     },

     /**
      * Get the path for a specific confidentiality and dokpoolContentType
      * from a DokpoolContext object
      * @param "String" confidentiality
      * @param "String" dokpoolContentType
      * @return [List] The found path.
      */
     getPath: function(confidentiality, dokpoolContentType){
         return dokpoolContext["DokpoolName"][DOKPOOL_NAME]["DokpoolContentType"][dokpoolContentType]["Confidentiality"][confidentiality];
     },

     /**
     * Get the confidentialities for a specific dokpoolContentType
     * from a DokpoolContext object
     * @param "String" dokpoolContentType
     * @return [List] The found confidentialities.
      */
     getConfidentialitiesFromDokpoolcontenttype: function(dokpoolContentType){
         return Array.from(new Set(Object.keys(dokpoolContext.DokpoolName.DOKPOOL_NAME.DokpoolContentType[dokpoolContentType].Confidentiality)));
     },

     /**
     * Get the dokpoolContentTypes for a specific confidentiality
     * from a DokpoolContext object
     * @param "String" confidentiality
     * @return [List] The found dokpoolContentTypes.
      */
    getDokpoolcontenttypeFromConfidentialities: function(confidentiality){
         var mylist = [];
         Object.keys(dokpoolContext.DokpoolName.DOKPOOL_NAME.DokpoolContentType).forEach(function(e){
             mylist.push(dokpoolContext.DokpoolName.DOKPOOL_NAME.DokpoolContentType[e].Confidentiality[confidentiality]);
         });
         //remove duplicates
         return Array.from(new Set(mylist));
     }

});
