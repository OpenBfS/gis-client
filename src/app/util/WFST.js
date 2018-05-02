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
 * @class Koala.util.WFST
 */
Ext.define('Koala.util.WFST', {

    requires: [
        'BasiGX.util.Map',
        'Koala.util.Object'
    ],

    statics: {

        /**
         * The duration for a feature lock in minutes
         */
        lockTime: 1,

        /**
         * Flag holding the state if features are currently locked.
         * Will get set to false after running out the `lockTime`
         */
        lockAquired: false,

        /**
         * Starts a WFS Transaction for the given feature arrays
         *
         * @param {ol.layer} layer The layer the features come from
         * @param {Array} wfstInsert The Array holding the features to insert
         * @param {Array} wfstUpdates The Array holding the features to update
         * @param {Array} wfstDeletes The Array holding the features to delete
         * @param {Function} wfstSuccessCallback The callback on success
         * @param {Function} wfstFailureCallback The callback on failure
         */
        transact: function(layer, wfstInserts, wfstUpdates, wfstDeletes,
            wfstSuccessCallback, wfstFailureCallback) {
            var format = new ol.format.WFS;
            var map = BasiGX.util.Map.getMapComponent().map;
            var projection = map.getView().getProjection().getCode();
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];
            var url = Koala.util.Object.getPathStrOr(layer.metadata,
                'layerConfig/wfs/url');
            var layerName = Koala.util.Object.getPathStrOr(layer.metadata,
                'newLayerName');
            if (!layerName) {
                layerName = Koala.util.Object.getPathStrOr(
                    layer.metadata, 'layerConfig/wms/layers');
                layerName = layerName.split(':')[1];
            }

            var nsUri = config['target-workspace-uri'];

            var opts = {
                featureNS: nsUri,
                featurePrefix: config['target-workspace'],
                featureType: layerName,
                srsName: projection
            };
            var xml = format.writeTransaction(
                wfstInserts,
                wfstUpdates,
                wfstDeletes,
                opts
            );
            var serializer = new XMLSerializer();
            xml = serializer.serializeToString(xml);

            // override the geometryname, as its hardcoded through OpenLayers
            // to `geometry`
            var gname = layer.get('geometryFieldName');
            xml = xml.replace(
                /<Property><Name>geometry<\/Name>/g,
                '<Property><Name>' + gname + '</Name>');
            xml = xml.replace(/<geometry>/g, '<' + gname + '>');
            xml = xml.replace(/<\/geometry>/g, '</' + gname + '>');
            // insert the lockId, if available
            if (Koala.util.WFST.lockId) {
                // TODO fails on FF, XML seems to be serialized differently
                xml = xml.replace(/(http:\/\/schemas.opengis.net\/wfs\/1.1.0\/wfs.xsd">)/g,
                    function($1) {
                        return $1 + '<LockId>' + Koala.util.WFST.lockId + '</LockId>';
                    });
                xml = xml.replace('XMLSchema-instance">',
                    'XMLSchema-instance"><LockId>' +
                Koala.util.WFST.lockId + '</LockId>');
            }

            Ext.Ajax.request({
                url: url,
                xmlData: xml,
                method: 'POST',
                success: function(xhr) {
                    var res = xhr.responseText;
                    var transactionResponse = format.readTransactionResponse(xhr.responseText);
                    if (Ext.isEmpty(transactionResponse) ||
                        res.indexOf('<ows:ExceptionText>') > 0) {
                        var msg = 'Unspecified error occured.';
                        if (res.indexOf('<ows:ExceptionText>') > 0) {
                            msg = res.split('<ows:ExceptionText>')[1].
                                split('</ows:ExceptionText>')[0];
                        }
                        wfstFailureCallback.call(this, msg);
                        return;
                    }

                    var result = transactionResponse.transactionSummary;
                    if ((result.totalDeleted && result.totalDeleted > 0) ||
                        (result.totalInserted && result.totalInserted > 0) ||
                        (result.totalUpdated && result.totalUpdated > 0)) {
                        // TODO: layer needs to be transformed to real WFS layer
                        layer.getSource().refresh();
                    }
                    wfstSuccessCallback.call(this, transactionResponse);
                },
                failure: function(xhr) {
                    var res = xhr.responseText;
                    var transactionResponse = format.readTransactionResponse(res);
                    var msg = 'Unspecified error occured.' + transactionResponse;
                    if (res.indexOf('<ows:ExceptionText>') > 0) {
                        msg = res.split('<ows:ExceptionText>')[1].
                            split('</ows:ExceptionText>')[0];
                    }
                    wfstFailureCallback.call(this, msg);
                }
            });
        },

        /**
         * Issues a WFS-T LockFeature
         *
         * @param {ol.layer} layer The layer the lock should be aquired for
         * @return {Ext.Promise} The AJAX Request as a promise
         */
        lockFeatures: function(layer) {
            var layerName = Koala.util.Object.getPathStrOr(layer.metadata,
                'newLayerName');
            if (!layerName) {
                layerName = Koala.util.Object.getPathStrOr(
                    layer.metadata, 'layerConfig/wms/layers');
                layerName = layerName.split(':')[1];
            }
            var config = Koala.util.AppContext.getAppContext();
            config = config.data.merge['import'];
            var nsUri = config['target-workspace-uri'];
            var url = Koala.util.Object.getPathStrOr(layer.metadata,
                'layerConfig/wfs/url');
            var xmlTemplate = '<LockFeature ' +
                'xmlns="http://www.opengis.net/wfs" ' +
                'xmlns:ns="{0}" ' +
                'service="WFS" ' +
                'expiry="' + Koala.util.WFST.lockTime + '" ' +
                'version="1.1.0">' +
                '<Lock typeName="ns:{1}"/>' +
                '</LockFeature>';
            var xml = Ext.String.format(xmlTemplate, nsUri, layerName);
            return Ext.Ajax.request({
                url: url,
                xmlData: xml,
                method: 'POST'
            });
        },

        /**
         * Handles the response from the LockFeature request.
         * If it was successful, the `lockAquired` flag will be set to true
         * and automatically set to false after the lock has expired
         *
         * @param {Object} response The XHR response of the request
         * @return {String} A message if the request was successful
         */
        handleLockFeaturesResponse: function(response) {
            var resText = response.responseText;
            var msg;
            if (resText.indexOf('<wfs:LockId>') > 0) {
                var lockId = resText.split(
                    '<wfs:LockId>')[1].split('</wfs:LockId>')[0];
                Koala.util.WFST.lockAquired = true;
                Koala.util.WFST.lockId = lockId;
                var task = new Ext.util.DelayedTask(function() {
                    Koala.util.WFST.lockAquired = false;
                    Koala.util.WFST.lockId = undefined;
                });
                task.delay(Koala.util.WFST.lockTime * 1000 * 60);
                Ext.log.info('WFS-T Lock aquired with id ' + lockId +
                    ', will time out in ' + Koala.util.WFST.lockTime +
                    ' minutes'
                );
                msg = lockId;
            } else {
                msg = 'Could not aquire an WFST-Lock';
            }
            return msg;
        }
    }
});
