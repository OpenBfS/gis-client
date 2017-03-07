Ext.define('Koala.override.basigx.ConfigParser', {
    override: 'BasiGX.util.ConfigParser',

    requires: [
      'Koala.util.Layer'
    ],

    statics: {
      setupMap: function(context){
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
                resolutions: me.convertStringToNumericArray(
                  'float', config.mapConfig.resolutions)
            }),
            logo: false
        });

        var username = context.data.merge.application_user.username;
        var password = context.data.merge.application_user.password;
        var auth;

        if(username && password){
            var tok = username + ':' + password;
            // TODO we may want to use something UTF-8 safe:
            // https://developer.mozilla.org/de/docs/Web/API/WindowBase64/btoa#Unicode-Zeichenketten
            var hash = btoa(tok);
            auth = "Basic " + hash;
        }

        var layerConfig = context.data.merge.mapLayers;

        Ext.each(layerConfig, function(layerUuid, index){
          Ext.Ajax.request({
              url: context.data.merge.urls["metadata-xml2json"],
              params: {
                  uuid: layerUuid
              },
              // TODO Add this to the Layer Util aswell
              defaultHeaders: {
                Authorization: auth
              },
              method: 'GET',
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
                  } catch(ex) {
                      // TODO i18n
                      Ext.toast('Metadaten JSON konnte nicht dekodiert werden.');
                  } finally {
                      if (Koala.util.Layer.minimumValidMetadata(obj)) {
                          var layer = Koala.util.Layer.layerFromMetadata(obj);
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

        return me.map;
      }
    }

    // Your overrided methods/properties
});
