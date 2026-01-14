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
                    split('%7C')[0];
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
            var authHeader = Koala.util.Authentication.getAuthenticationHeader(context);
            var layerConfig = context.data.merge.mapLayers.slice();

            // If we have a route the Routing util will take care of this
            if (window.location.href.indexOf('%7Clayers') === -1) {
                // insert first backgroundLayer (if defined in appContext)
                var initialBackground = {
                    uuid: context.data.merge.backgroundLayers[0].uuid,
                    visible: true
                };
                if (initialBackground) {
                    layerConfig.splice(0, 0, initialBackground);
                }
            } else {
                return;
            }

            Ext.each(layerConfig, function(layer, index) {
                var visibility = layer.visible;
                var uuid = layer.uuid || layer;
                // ATTENTION
                // This is somewhat fragile code, see the notes
                // NOTE: need to use xhr and not Ext.Ajax, else we can't override below
                // We also cannot use Ext.Ajax with the binary option (as in Layer.js)
                // because that flag cannot be used in synchronous requests...
                var req = new XMLHttpRequest();
                req.open('GET', context.data.merge.urls['metadata-xml2json'] + uuid, false);
                req.setRequestHeader('Authorization', authHeader);
                req.setRequestHeader('Accept', 'application/json');
                // NOTE: this makes sure the browser doesn't try to utf8-decode our
                // precious iso-8859-1 string thus losing the umlauts
                // see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
                req.overrideMimeType('text/plain; charset=x-user-defined');
                req.addEventListener('loadend', function() {
                    var response = req;
                    var obj;
                    // NOTE: we cannot use a FileReader here, else we fall back to async
                    // so we just copy the bytes manually
                    var responseBytes = new Uint8Array(response.responseText.length);
                    for (var i = 0; i < response.responseText.length; ++i) {
                        responseBytes[i] = response.responseText[i].charCodeAt(0) & 0xff;
                    }
                    try {
                        var txt;

                        // ATTENTION
                        // GNOS seems to send json via REST API ISO-8859-1
                        // encoded, so we're trying to fix it here.
                        // For IE browsers a polyfill is used.
                        if (window.TextDecoder) {
                            try {
                                var decoder = new TextDecoder('ISO-8859-1');
                                txt = decoder.decode(responseBytes);
                            } catch (e) {
                                Ext.log.error(e);
                                // fallback to utf-8
                                decoder = new TextDecoder('UTF-8');
                                txt = decoder.decode(responseBytes);
                            }
                        } else {
                            txt = response.responseText;
                        }

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

                        txt = txt.replace(escapedCurlyOpen, '[[');
                        txt = txt.replace(escapedCurlyClose, ']]');
                        obj = Ext.decode(txt);
                        obj = Koala.util.MetadataParser.parseMetadata(obj);
                    } catch (ex) {
                        Ext.log.error(ex);
                        // TODO i18n
                        Ext.toast('Metadaten JSON konnte nicht dekodiert werden.');
                    } finally {
                        if (Koala.util.Layer.minimumValidMetadata(obj)) {
                            var isVisible = visibility;
                            layer = Koala.util.Layer.layerFromMetadata(obj);
                            if (initialBackground && (obj.id === initialBackground.uuid)) {
                                layer.isBackground = true;
                            }

                            var olProps = layer.getProperties();
                            if (olProps.attribution) {
                                var ctrl = new ol.control.Attribution({html: olProps.attribution});
                                me.map.addControl(ctrl);
                            }

                            //set visibility according to appContext
                            layer.set('visible',isVisible);

                            var layers = me.map.getLayers();
                            layers.insertAt(index, layer);
                        } else {
                            // TODO i18n
                            Ext.toast('Für den Datensatz scheinen nicht' +
                                  'ausreichend Metadaten vorzuliegen.');
                        }
                    }
                });
                req.addEventListener('error', function() {
                    var msg = 'server-side failure with status code ' +
                    req.status;
                    Ext.log.error(msg);
                });
                req.send();
            });
        }
    }

    // Your overrided methods/properties
});
