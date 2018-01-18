/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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

            // delete metadata.id;
            delete metadata.layerConfig.wms;
            delete metadata.barChartProperties;
            delete metadata.timeSeriesChartProperties;

            return metadata;
        },

        loginToGnos: function(context) {
            return new Ext.Promise(function(resolve) {
                var iframe = document.createElement('iframe');
                document.querySelector('body').appendChild(iframe);
                iframe.onload = function() {
                    var cookie = iframe.contentDocument.cookie;
                    var ms = cookie.match(/XSRF-TOKEN=([0-9\-a-f]+);/);
                    context.csrfToken = ms[1];
                    resolve();
                };
                iframe.setAttribute('hidden', 'true');
                iframe.setAttribute('src', context.config['metadata-base-url'] + 'srv/eng/info?type=me');
            });
        },

        cloneOldMetadata: function(context) {
            var url = context.config['metadata-base-url'];
            var me = this;

            var resolveFunc, rejectFunc;

            var promise = new Ext.Promise(function(resolve, reject) {
                resolveFunc = resolve;
                rejectFunc = reject;
            });

            Ext.Ajax.request({
                url: url + 'srv/api/0.1/records/duplicate?group=1&sourceUuid=' +
                    context.uuid + '&metadataType=METADATA&isVisibleByAllGroupMembers=false&isChildOfSource=false',
                method: 'PUT',
                username: context.config['metadata-username'],
                password: context.config['metadata-password'],
                headers: {
                    'X-XSRF-TOKEN': context.csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: true,
                params: {
                    group: 1,
                    metadataType: 'METADATA',
                    sourceUuid: context.uuid
                },
                success: function(xhr) {
                    console.log(xhr.responseText)
                    resolveFunc();
                }
            });

            return promise;
        },

        prepareMetadata: function(metadata) {
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];
            var context = {
                config: config,
                uuid: metadata.id
            }
            this.loginToGnos(context)
                .then(this.cloneOldMetadata.bind(this, context));
                // .then(this.extractCsrfToken.bind(this, context));
        }

    }

});
