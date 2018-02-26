Ext.define('Koala.override.basigx.ConfigParser', {
    override: 'BasiGX.util.ConfigParser',

    requires: [
        'Koala.util.Authentication',
        'Koala.util.Layer',
        'Koala.util.MetadataParser'
    ],

    statics: {
        setupMap: function(context) {
            var me = this;
            var config;
            if (!context || !context.data || !context.data.merge ||
                !context.data.merge.mapConfig || !context.data.merge.mapLayers) {
                Ext.log.warn('Invalid context given to configParser!');
                return null;
            }

            config = context.data.merge;
            me.appContext = config;

            // TODO Refactor
            if (window.location.hash.indexOf('center') > 0) {
                var centerString = location.hash.split('center/')[1].
                    split('|')[0];
                config.startCenter = centerString;
            }

            me.map = new ol.Map({
                controls: [new ol.control.ScaleLine()], // TODO add attribution
                view: new ol.View({
                    center: this.convertStringToNumericArray(
                        'int', config.startCenter),
                    zoom: config.startZoom || 2,
                    maxResolution: config.maxResolution,
                    minResolution: config.minResolution,
                    projection: config.mapConfig.projection || 'EPSG:3857',
                    units: 'm',
                    resolutions: config.mapConfig.resolutions ?
                        me.convertStringToNumericArray(
                            'float', config.mapConfig.resolutions)
                        : undefined
                }),
                logo: false
            });

            return me.map;
        },

        postprocessMap: function(context) {
            if (!context) {
                return;
            }
            var me = this;
            var defaultHeaders;
            var authHeader = Koala.util.Authentication.getAuthenticationHeader(context);
            if (authHeader) {
                defaultHeaders = {
                    Authorization: authHeader//,
                    // Accept: 'application/json'
                };
            }
            var layerConfig = context.data.merge.mapLayers;

            Ext.each(layerConfig, function(layerUuid, index) {
                Ext.Ajax.request({
                    // url: context.data.merge.urls['metadata-xml2json'] + layerUuid,
                    url: context.data.merge.urls['metadata-xml2json'],
                    params: {
                        uuid: layerUuid
                    },
                    defaultHeaders: defaultHeaders,
                    method: 'GET',
                    async: false,
                    success: function(response) {
                        var obj;
                        try {
                            // replace any occurencies of \{\{ (as it may still be
                            // stored in db) with the new delimiters [[
                            //
                            // These arrive here as \\{\\{ (the backslash has been
                            // escaped for the JSON format)
                            //
                            // Since both { and \ have a special meaning in regular
                            // expressions, we need to escape them again with a \
                            var escapedCurlyOpen = /\\\\\{\\\\\{/g;
                            var escapedCurlyClose = /\\\\\}\\\\\}/g;
                            var txt = response.responseText;

                            txt = txt.replace(escapedCurlyOpen, '[[');
                            txt = txt.replace(escapedCurlyClose, ']]');
                            obj = Ext.decode(txt);
                            // obj = Koala.util.MetadataParser.parseMetadata(obj);
                        } catch (ex) {
                            // TODO i18n
                            Ext.toast('Metadaten JSON konnte nicht dekodiert werden.');
                        } finally {
                            if (Koala.util.Layer.minimumValidMetadata(obj)) {
                                var layer = Koala.util.Layer.layerFromMetadata(obj);

                                //set ol.Attribution
                                var olProps = layer.getProperties();
                                var attributions = olProps.attribution ? [new ol.Attribution({html: olProps.attribution})] : undefined;
                                var source = layer.getSource();
                                source.setAttributions(attributions);

                                layer.set('treeId', 'bkg'); // Do we need this?
                                var layers = me.map.getLayers();
                                layers.insertAt(index, layer);
                            } else {
                                // TODO i18n
                                Ext.toast('Für den Datensatz scheinen nicht' +
                                      'ausreichend Metadaten vorzuliegen.');
                            }
                        }
                    },
                    failure: function(response) {
                        var msg = 'server-side failure with status code ' +
                        response.status;
                        Ext.log.error(msg);
                    }
                });
            });
        }
    }

    // Your overrided methods/properties
});
