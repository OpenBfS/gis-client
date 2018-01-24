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

            var opts = {
                featureNS: config['target-workspace'],
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

                    // TODO: extract feature ids from possible inserts and
                    // assign them to the corresponding features with `setId`.
                    // Alternatively, reload the layers source...
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
        }
    }
});
