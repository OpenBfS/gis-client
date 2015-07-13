/*global Ext, ol*/
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
 * ConfigParser Util
 * 
 * parses an application context in JSON Format
 * in order to generate ol3 based layers and map with the given configuration.
 * Currently, only the SHOGun 1 syntax a.k.a. OpenLayers 2 is supported
 * 
 * Example appContext response from SHOGun 1:
 
        {
            "data": {
                "merge": {
                    "id": 3841,
                    "created_at": "04.05.2015 12:05:29",
                    "updated_at": "04.05.2015 12:05:29",
                    "app_user": "default",
                    "name": "test",
                    "language": "DE",
                    "open": false,
                    "active": true,
                    "css": "ext-all.css",
                    "description": null,
                    "shortdescription": null,
                    "url": "client/gisclient/index-dev.html",
                    "startCenter": "385067,5535472",
                    "startZoom": "0",
                    "startResolution": "560",
                    "startBbox": "-106720,4973280,1040160,6406880",
                    "specialinstance": false,
                    "zoomslider": true,
                    "applicationheader": true,
                    "initiallegendvisibility": true,
                    "editableForCurrentUser": false,
                    "initiallyactivetoolpertab": "t_pan_button",
                    "initialwestpanelstate": 300,
                    "initialstatusbarstate": "full",
                    "mapLayers": [
                        {
                            "id": 230,
                            "created_at": "16.03.2015 11:55:48",
                            "updated_at": "16.03.2015 11:55:48",
                            "app_user": "auto-create-on-init",
                            "name": "(mainz) Klimatische Wasserbilanz",
                            "type": "WMS",
                            "isBaseLayer": false,
                            "alwaysInRange": null,
                            "visibility": true,
                            "displayInLayerSwitcher": true,
                            "attribution": null,
                            "gutter": null,
                            "projection": null,
                            "units": null,
                            "scales": null,
                            "resolutions": null,
                            "maxExtent": null,
                            "minExtent": null,
                            "maxResolution": null,
                            "minResolution": null,
                            "maxScale": null,
                            "minScale": null,
                            "numZoomLevels": null,
                            "displayOutsideMaxExtent": false,
                            "transitionEffect": null,
                            "metadata": [],
                            "groups": [
                                20,
                                19,
                                23
                            ],
                            "owner": null,
                            "additionalOwners": [],
                            "url": "/GDAWasser/geoserver.action",
                            "layers": "GDA_Wasser:WRRL_WASSERBILANZ_EINSTUFUNG",
                            "transparent": true,
                            "singleTile": false,
                            "ratio": null,
                            "format": "image/png8",
                            "language": "de",
                            "description": null,
                            "exportable": true,
                            "queryableInfoFormat": null,
                            "editableForCurrentUser": false,
                            "sysLayer": true,
                            "digiLayer": false,
                            "specialLayer": false,
                            "specialLayerUrlTemplate": null,
                            "specialLayerWinWidth": null,
                            "specialLayerWinHeight": null,
                            "hoverField": "{{GEMEINDE_BEZ}}",
                            "dataLayerWindowTitle": null,
                            "layerStyleConfigurable": null,
                            "temporaryLayer": false,
                            "rasterLayer": false,
                            "rasterLayerFeatureInfo": null,
                            "dataLayer": false,
                            "waterCourseLevel": 0,
                            "geometryType": null,
                            "layerGroupName": null,
                            "tiled": true
                        }
                    ],
                    "grantedOverviewMapLayers": null,
                    "overviewMapLayers": [],
                    "grantedMapLayers": null,
                    "mapConfig": {
                        "id": 13,
                        "created_at": "16.03.2015 11:55:49",
                        "updated_at": "16.03.2015 11:55:49",
                        "app_user": "auto-create-on-init",
                        "name": "default-mapconfig",
                        "mapId": "stdmap",
                        "title": "Map",
                        "projection": "EPSG:25832",
                        "units": "m",
                        "maxResolution": 560,
                        "maxExtent": "-106720,4973280,1040160,6406880",
                        "center": "385067,5535472",
                        "resolutions": "560, 280, 140, 70, 28, 14, 7, 2.8, 1.4",
                        "scales": null,
                        "zoom": 0
                    },
                    "grantedMapConfig": null,
                    "modules": [
                        {
                            "id": 1,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "layertreepanel",
                            "module_fullname": "Standard Layer Tree",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        },
                        {
                            "id": 3,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "overviewmappanel",
                            "module_fullname": "Standard Overview Map",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        },
                        {
                            "id": 2,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "layerlistpanel",
                            "module_fullname": "Standard Layer List",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        }
                    ],
                    "grantedModules": null,
                    "groups": [],
                    "grantedGroups": null,
                    "orderedMapTools": [
                        {
                            "id": 3847,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 4,
                                "created_at": "16.03.2015 11:55:49",
                                "updated_at": "16.03.2015 11:55:49",
                                "app_user": "auto-create-on-init",
                                "module_name": "navigation_select",
                                "module_fullname": "Werkzeuge zum Navigieren",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 0
                        },
                        {
                            "id": 3848,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 5,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "query_evaluate",
                                "module_fullname": "Werkzeuge zum Abfragen",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 1
                        },
                        {
                            "id": 3849,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 6,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "print_load_save",
                                "module_fullname": "Werkzeuge zum Drucken",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 2
                        },
                        {
                            "id": 3850,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 7,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "annotate",
                                "module_fullname": "Werkzeuge zum Zeichnen",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 3
                        },
                        {
                            "id": 3851,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 9,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "special_tools",
                                "module_fullname": "verschiedene Werkzeuge",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 4
                        }
                    ],
                    "publicSearchLayer": null,
                    "publicResponsiveSearchLayer": 3,
                    "layerTreeConfig": "{\"id\":2537,\"name\":\"Root\",\"...",
                    "annotationGeometries": null,
                    "owner": 1254,
                    "ownerName": "Till Adams",
                    "additionalOwners": [],
                    "additionalOwnerIds": null,
                    "wpsActions": [],
                    "targetGroup": "gisclient",
                    "maxResolution": 560,
                    "minResolution": 0.14
                },
                "loggedInDspfUserId": "6815",
                "loggedInUser": "Herr Till Adams",
                "preferences": {}
            },
            "total": 1,
            "success": true
        }

     * Example of a simple broken down appcontext:
     
         {
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
                        "topic": false,
                    }
                ],
                "mapConfig": {
                    "projection": "EPSG:3857",
                    "resolutions": [156543.03390625, 78271.516953125, ...],
                    "zoom": 0
                }
            }
        }
        
 */
Ext.define('Basepackage.util.ConfigParser', {

    statics: {

        /**
         * This method gets called internally by the setupMap method, so there
         * should be no need to call this directly
         *
         * @param context
         * @returns {Array} layerArray - An array holding the ol3-Layers
         */
        setupLayers: function(context) {
            var layerArray = [],
                layerConfig;

            if (!context || !context.data || !context.data.merge ||
                !context.data.merge.mapLayers) {
                    Ext.log.warn('Invalid context given to configParser!');
                    return;
            }

            Ext.log("generating layers...");

            layerConfig = context.data.merge.mapLayers;

            Ext.each(layerConfig, function(layer) {
                var layerObj,
                    layerType,
                    sourceType;

                if (layer.type === "WMS" || layer.type === "ImageWMS") {
                    layerType = "Image";
                    sourceType = "ImageWMS";
                } else if (layer.type === "TileWMS") {
                    layerType = "Tile";
                    sourceType = "TileWMS";
                } else if (layer.type === "XYZ") {
                    layerType = "Tile";
                    sourceType = "XYZ";
                }

                var olLayerConfig = {
                    name: layer.name || 'No Name given',
                    topic: layer.topic || false,
                    legendUrl: layer.legendUrl || null,
                    legendHeight: layer.legendHeight || 128,
                    minResolution: layer.minResolution || undefined,
                    maxResolution: layer.maxResolution || undefined,
                    opacity: layer.opacity || 1,
                    visible: (layer.visibility === false) ? false : true,
                    source: new ol.source[sourceType]({
                        url: layer.url,
                        attributions: layer.attribution ?
                            [new ol.Attribution({html: layer.attribution})] :
                            undefined,
                        crossOrigin: layer.crossOrigin,
                        params: {
                            LAYERS: layer.layers,
                            TILED: layerType === "Tile" ? true : false
                        }
                    })
                };

                // apply custom params of layer from appContext
                if(layer.customParams) {
                    Ext.applyIf(olLayerConfig, layer.customParams);
                }

                layerObj = new ol.layer[layerType](olLayerConfig);

                if (!Ext.isEmpty(layerObj)) {
                    layerArray.push(layerObj);
                }
            });
            return layerArray;
        },

        /**
         * @param context
         * @returns {ol.Map} map - An ol3-map
         */
        setupMap: function(context) {
            var map,
                mapConfig,
                mapLayers,
                config;

            if (!context || !context.data || !context.data.merge ||
                !context.data.merge.mapConfig) {
                    Ext.log.warn('Invalid context given to configParser!');
                    return;
            }

            config = context.data.merge;
            mapLayers = this.setupLayers(context);

            Ext.log("generating the map...");

            map = new ol.Map({
                layers: mapLayers,
                controls: [new ol.control.ScaleLine()], // TODO add attribution
                view: new ol.View({
                  center: this.convertStringToIntArray(config.startCenter),
                  zoom: config.startZoom || 2,
                  maxResolution: config.maxResolution,
                  minResolution: config.minResolution,
                  projection: config.mapConfig.projection || 'EPSG:3857',
                  units: 'm',
                  resolutions: this.convertStringToIntArray(
                      config.mapConfig.resolutions)
                })
            });
            return map;
        },
        
        /**
         * Method turns a comma separated string into an array
         * containing intergers
         */
        convertStringToIntArray: function(string) {
            if (Ext.isEmpty(string) || Ext.isArray(string)) {
                return string;
            }
            var arr = [];
            Ext.each(string.split(','), function(part) {
                arr.push(parseInt(part,10));
            });
            return arr;
        }
    }
});