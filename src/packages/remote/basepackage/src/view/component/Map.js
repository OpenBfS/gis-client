/*global Ext, ol, Basepackage, document*/
/*jshint curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80*/
/**
 *      _                             _        _          
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___     
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<     
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/     
 *                                                        
 *   _                                 _                  
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___ 
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'     
 *
 * Map Component
 * 
 * Setting up a ol3-map by calling the config parser with the given appContext.
 * If no appContext is found, a default one will be loaded.
 * Class usually instanciated in map container.
 * 
 */
Ext.define("Basepackage.view.component.Map",{
    extend: "GeoExt.component.Map",
    xtype: "base-component-map",

    requires: [
        "Basepackage.util.ConfigParser"
    ],

    statics: {
        guess: function(){
            return Ext.ComponentQuery.query('base-component-map')[0];
        }
    },

//    layers: [],

    /**
     * The app context
     */
    appContext: null,

    /**
     * The URL to the app Context resource.
     * Gets requested via AJAX, can be a local file or an webinterface
     */
    appContextPath: 'resources/appContext.json',

    /**
     * The appContext to use when no real context could be retrieved
     */
    fallbackAppContext: {
        "data": {
            "merge": {
                "startCenter": [1163261,6648489],
                "startZoom": 5,
                "mapLayers": [
                    {
                        "name": "OSM WMS",
                        "type": "TileWMS",
                        "url": "http://ows.terrestris.de/osm/service?",
                        "layers": "OSM-WMS",
                        "topic": false
                    }
                ],
                "mapConfig": {
                    "projection": "EPSG:3857",
                    "resolutions": [
                        156543.03390625,
                        78271.516953125,
                        39135.7584765625,
                        19567.87923828125,
                        9783.939619140625,
                        4891.9698095703125,
                        2445.9849047851562,
                        1222.9924523925781,
                        611.4962261962891,
                        305.74811309814453,
                        152.87405654907226,
                        76.43702827453613,
                        38.218514137268066,
                        19.109257068634033,
                        9.554628534317017,
                        4.777314267158508,
                        2.388657133579254,
                        1.194328566789627,
                        0.5971642833948135
                    ],
                    "zoom": 0
                }
            }
        }
    },

    pendingRequest: null,

    /**
     * If this class is extended by an application that uses controllers,
     * this property should be set to false and the corresponding methods
     * (e.g. onHoverFeatureClick) have to be implemented in the controller.
     */
    defaultListenerScope: true,

    config: {
        pointerRest: true,
        pointerRestInterval: 500,
        pointerRestPixelTolerance: 5,
        // TODO: is this really a config?
        hoverVectorLayerSource: null,
        hoverVectorLayer: null,
        hoverVectorLayerInteraction: null
    },

    listeners: {
        pointerrest: 'onPointerRest'
    },

    constructor: function(config) {
        var me = this;

        if (!me.getMap()){

            Ext.Ajax.request({
                // need to handle config first as its not applied yet
                url: config.appContextPath || me.appContextPath,
                async: false,
                success: function(response){
                    if(Ext.isString(response.responseText)) {
                        me.appContext = Ext.decode(response.responseText);
                    } else if(Ext.isObject(response.responseText)) {
                        me.appContext = response.responseText;
                    } else {
                        Ext.log.error("Error! Could not parse appContext!");
                    }
                },
                failure: function(response) {
                    Ext.log.error("Error! No application " +
                        "context found, example loaded");
                    me.appContext = me.fallbackAppContext;
                }
            });

            var olMap = Basepackage.util.ConfigParser.setupMap(me.appContext);
            me.setMap(olMap);
        }
        me.callParent([config]);
    },

    /**
     *
     */
    initComponent: function(){
        var me = this;

        me.addHoverVectorLayerSource();
        me.addHoverVectorLayer();
        me.addHoverVectorLayerInteraction();

        me.callParent();
    },

    /**
    *
    */
   addHoverVectorLayerInteraction: function() {
       var me = this;

       if (!me.getHoverVectorLayerInteraction()) {
           var interaction = new ol.interaction.Select({
               layers: [me.getHoverVectorLayer()]
           });
           var featureCollecion = interaction.getFeatures();

           featureCollecion.on('add', this.onFeatureClicked, this);

           me.getMap().addInteraction(interaction);
           me.setHoverVectorLayerInteraction(interaction);
       }
   },

   /**
    *
    */
   onFeatureClicked: function(olEvt) {
       var me = this;
       var olFeat = olEvt.target.getArray()[0];
       me.fireEvent('hoverfeatureclick', olFeat);
   },

   /**
    *
    */
   addHoverVectorLayerSource: function() {
       var me = this;
       if (!me.getHoverVectorLayerSource()) {
           me.setHoverVectorLayerSource(new ol.source.Vector());
       }
   },

   /**
    *
    */
   addHoverVectorLayer: function() {
       var me = this;
       var map = me.getMap();
       var hoverVectorLayer = me.getHoverVectorLayer();

       if (!hoverVectorLayer) {
           hoverVectorLayer = new ol.layer.Vector({
               name: 'hoverVectorLayer',
               source: me.getHoverVectorLayerSource()
           });
           map.addLayer(hoverVectorLayer);
           me.setHoverVectorLayer(hoverVectorLayer);
       }
   },

   /**
    *
    */
   clearPendingRequests: function() {
       var me = this;
       if(me.pendingRequest) {
           Ext.Ajax.abort(me.pendingRequest);
       }
   },

   /**
    *
    */
   requestAsynchronously: function(url, cb) {
       var me = this;

       me.pendingRequest = Ext.Ajax.request({
           url: url,
           callback: function(){
               me.pendingRequest = null;
           },
           success: cb,
           failure: function(resp) {
               Ext.log.error('Couldn\'t get FeatureInfo');
           }
       });
   },

   /**
    */
   onPointerRest: function(evt){
       this.clearPendingRequests();

       var me = this;
       var map = me.getMap();
       var mapView = map.getView();
       var pixel = evt.pixel;
       var maxTolerance = me.maxTolerance;
       var hoverLayers = [];
       var hoverFeatures = [];

       me.getHoverVectorLayerSource().clear();
       map.getOverlays().forEach(function(o) {
           map.removeOverlay(o);
       });

       map.forEachLayerAtPixel(pixel, function(layer) {
           var source = layer.getSource();
           var resolution = mapView.getResolution();
           var projCode = mapView.getProjection().getCode();
           var url = source.getGetFeatureInfoUrl(
                   evt.coordinate,
                   resolution,
                   projCode,
                   {
                       'INFO_FORMAT' : 'application/json'
                   });

           var hoverable = layer.get('hoverable');

           // a layer will NOT be requested for hovering if there is a
           // "hoverable" property set to false. If this property is not set
           // or has any other value than "false", the layer will be
           // requested
           if(hoverable !== false) {
               me.requestAsynchronously(url, function(resp) {
                   // TODO: replace evt/coords with real response geometry
                   var respFeatures = (new ol.format.GeoJSON())
                       .readFeatures(resp.responseText);
                   me.showHoverFeature(layer, respFeatures);

                   hoverLayers.push(layer);
                   hoverFeatures.push(respFeatures[0]);

                   me.showHoverToolTip(evt, hoverLayers, hoverFeatures);

                   me.on('hoverfeatureclick', me.onHoverFeatureClick, me);
               });
           }

       }, this, function(candidate) {
           var considerLayer = candidate.get('topic');
           return considerLayer;
       });

   },

   /**
    *
    */
   showHoverFeature: function(layer, features) {
       var me = this;
       Ext.each(features, function(feat){
           feat.set('layer', layer);
           var g = feat.getGeometry();
           if(g){
               g.transform('EPSG:4326', me.getMap().getView().getProjection());
           }

           me.getHoverVectorLayerSource().addFeature(feat);
       });

   },

   /**
    *
    */
   showHoverToolTip: function(evt, layers, features) {
       var me = this;
       var map = me.getMap();
       var coords = evt.coordinate;

       map.getOverlays().forEach(function(o) {
           map.removeOverlay(o);
       });

       var div = document.createElement('div');
       div.className = 'feature-hover-popup';

       div.innerHTML = this.getToolTipHtml(layers, features);

       var overlay = new ol.Overlay({
           position: coords,
           offset: [10, -30],
           element: div
       });

       map.addOverlay(overlay);
   },

   /**
    *
    */
   getToolTipHtml: function(layers, features){
       var innerHtml = '';

       Ext.each(layers, function(layer, index, allItems){
           var hoverfield = layer.get('hoverfield');

           // fallback if hoverfield is not configured
           if(!hoverfield) {
               // try to use "id" as fallback.
               // if "id" is not available, the value will be "undefined"
               hoverfield = 'id';
           }

           innerHtml += '<b>'+layer.get('name')+'</b>';
           Ext.each(features, function(feat){
               // we check for existing feature here as there maybe strange
               // situations (e.g. when zooming in unfavorable situations)
               // where feat is undefined
               if(feat) {
                   var hoverfieldValue = feat.get(hoverfield);
                   if(feat.get('layer') === layer){
                       innerHtml += '<br />' + hoverfieldValue + '<br />';
                   }
               }
           });
           if(index+1 !== allItems.length) {
               innerHtml += '<br />';
           }
       });

       return innerHtml;
   },

   /**
    *
    */
   onHoverFeatureClick: function(olFeat) {
       // could be implemented in a subclass
   }
});