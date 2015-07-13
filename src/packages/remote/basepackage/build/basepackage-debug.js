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
            if (!context || !context.data || !context.data.merge || !context.data.merge.mapLayers) {
                Ext.log.warn('Invalid context given to configParser!');
                return;
            }
            Ext.log("generating layers...");
            layerConfig = context.data.merge.mapLayers;
            Ext.each(layerConfig, function(layer) {
                var layerObj, layerType, sourceType;
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
                            attributions: layer.attribution ? [
                                new ol.Attribution({
                                    html: layer.attribution
                                })
                            ] : undefined,
                            crossOrigin: layer.crossOrigin,
                            params: {
                                LAYERS: layer.layers,
                                TILED: layerType === "Tile" ? true : false
                            }
                        })
                    };
                // apply custom params of layer from appContext
                if (layer.customParams) {
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
            var map, mapConfig, mapLayers, config;
            if (!context || !context.data || !context.data.merge || !context.data.merge.mapConfig) {
                Ext.log.warn('Invalid context given to configParser!');
                return;
            }
            config = context.data.merge;
            mapLayers = this.setupLayers(context);
            Ext.log("generating the map...");
            map = new ol.Map({
                layers: mapLayers,
                controls: [
                    new ol.control.ScaleLine()
                ],
                // TODO add attribution
                view: new ol.View({
                    center: this.convertStringToIntArray(config.startCenter),
                    zoom: config.startZoom || 2,
                    maxResolution: config.maxResolution,
                    minResolution: config.minResolution,
                    projection: config.mapConfig.projection || 'EPSG:3857',
                    units: 'm',
                    resolutions: this.convertStringToIntArray(config.mapConfig.resolutions)
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
                arr.push(parseInt(part, 10));
            });
            return arr;
        }
    }
});

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
 * AddWms FormPanel
 * 
 * Used to add an WMS to the map
 * 
 */
Ext.define("Basepackage.view.form.AddWms", {
    extend: "Ext.form.Panel",
    xtype: 'base-form-addwms',
    requires: [
        'Ext.button.Button'
    ],
    viewModel: {
        data: {
            errorIncompatibleWMS: 'Der angefragte WMS ist nicht kompatibel zur Anwendung',
            errorRequestFailedS: 'Die angegebene URL konte nicht abgefragt werden',
            errorCouldntParseResponse: 'Die erhaltene Antwort konnte nicht erfolgreich geparst werden',
            addCheckedLayers: 'Ausgewählte Layer hinzufügen'
        }
    },
    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    scrollable: true,
    items: [
        {
            xtype: 'fieldset',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Anfrageparameter',
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'WMS-URL',
                    name: 'url',
                    allowBlank: false,
                    value: 'http://ows.terrestris.de/osm/service'
                },
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Version',
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'v1.1.1',
                            name: 'version',
                            inputValue: '1.1.1',
                            id: 'v111-radio'
                        },
                        {
                            boxLabel: 'v1.3.0',
                            name: 'version',
                            inputValue: '1.3.0',
                            id: 'v130-radio',
                            checked: true
                        }
                    ]
                },
                {
                    xtype: 'hiddenfield',
                    name: 'request',
                    value: 'GetCapabilities'
                },
                {
                    xtype: 'hiddenfield',
                    name: 'service',
                    value: 'WMS'
                }
            ]
        },
        {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Verfügbare Layer'
        }
    ],
    // Reset and Submit buttons
    buttons: [
        {
            text: 'Zurücksetzen',
            handler: function(btn, e) {
                var view = btn.up('base-form-addwms');
                view.getForm().reset();
                view.emptyAvailableLayersFieldset();
            }
        },
        '->',
        {
            text: 'Verfügbare Layer abfragen',
            formBind: true,
            //only enabled once the form is valid
            disabled: true,
            handler: function(btn, e) {
                var view = btn.up('base-form-addwms');
                var viewModel = view.getViewModel();
                var form = view.getForm();
                if (form.isValid()) {
                    view.emptyAvailableLayersFieldset();
                    var values = form.getValues();
                    var url = values.url;
                    delete values.url;
                    Ext.Ajax.request({
                        url: url,
                        method: 'GET',
                        params: values,
                        success: function(response, opts) {
                            var parser = new ol.format.WMSCapabilities();
                            var result;
                            try {
                                result = parser.read(response.responseText);
                            } catch (e) {
                                view.showWarning(viewModel.get('errorCouldntParseResponse'));
                                return;
                            }
                            var compatibleLayers = view.isCompatibleCapabilityResponse(result);
                            if (!compatibleLayers) {
                                view.showWarning(viewModel.get('errorIncompatibleWMS'));
                                return;
                            }
                            view.fillAvailableLayersFieldset(compatibleLayers);
                        },
                        failure: function(response, opts) {
                            view.showWarning(viewModel.get('errorRequestFailedS'));
                        }
                    });
                }
            }
        }
    ],
    emptyAvailableLayersFieldset: function() {
        var fs = this.down('[name="fs-available-layers"]');
        fs.removeAll();
    },
    showWarning: function(msg) {
        Ext.Msg.show({
            title: 'Warnung',
            message: 'Ein Fehler trat auf: ' + msg,
            width: 300,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },
    isCompatibleCapabilityResponse: function(capabilities) {
        if (!capabilities) {
            return false;
        }
        var version = capabilities.version;
        if (version !== '1.1.1' && version !== '1.3.0') {
            return false;
        }
        var compatible = [];
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var mapProj = map.getView().getProjection().getCode();
        var layers = capabilities.Capability.Layer.Layer;
        //same in both versions
        var url = capabilities.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource;
        Ext.each(layers, function(layer) {
            if (version === '1.3.0' && !Ext.Array.contains(layer.CRS, mapProj)) {
                // only available for 1.3.0
                return;
            }
            var olSource = new ol.source.TileWMS({
                    url: url,
                    params: {
                        LAYERS: layer.Name,
                        STYLES: layer.Style[0].Name,
                        VERSION: version
                    }
                });
            var olLayer = new ol.layer.Tile({
                    topic: true,
                    name: layer.Title,
                    source: olSource,
                    legendUrl: layer.Style[0].LegendURL[0].OnlineResource
                });
            compatible.push(olLayer);
        });
        return compatible.length > 0 ? compatible : false;
    },
    fillAvailableLayersFieldset: function(layers) {
        this.emptyAvailableLayersFieldset();
        var view = this;
        var fs = view.down('[name="fs-available-layers"]');
        var viewModel = this.getViewModel();
        Ext.each(layers, function(layer) {
            fs.add({
                xtype: 'checkbox',
                boxLabel: layer.get('name'),
                checked: true,
                olLayer: layer
            });
        });
        fs.add({
            xtype: 'button',
            text: viewModel.get('addCheckedLayers'),
            margin: 10,
            handler: this.addCheckedLayers,
            scope: this
        });
    },
    addCheckedLayers: function() {
        var fs = this.down('[name="fs-available-layers"]');
        var checkboxes = fs.query('checkbox[checked=true][disabled=false]');
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        Ext.each(checkboxes, function(checkbox) {
            map.addLayer(checkbox.olLayer);
            checkbox.setDisabled(true);
        });
    }
});

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
 * AddWms Button
 * 
 * Button used to instanciate the base-form-addwms in order to add a
 * WMS to the map
 * 
 */
Ext.define("Basepackage.view.button.AddWms", {
    extend: "Ext.button.Button",
    xtype: 'base-button-addwms',
    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.AddWms'
    ],
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    /**
     *
     */
    handler: function() {
        Ext.create('Ext.window.Window', {
            title: 'WMS hinzufügen',
            width: 500,
            height: 400,
            layout: 'fit',
            items: [
                {
                    xtype: 'base-form-addwms'
                }
            ]
        }).show();
    },
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'WMS hinzufügen\u2026',
            text: 'WMS <span style="font-size: 1.7em; ' + 'font-weight: normal;">⊕</span>'
        }
    }
});

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
Ext.define("Basepackage.view.component.Map", {
    extend: "GeoExt.component.Map",
    xtype: "base-component-map",
    requires: [
        "Basepackage.util.ConfigParser"
    ],
    statics: {
        guess: function() {
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
                "startCenter": [
                    1163261,
                    6648489
                ],
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
        if (!me.getMap()) {
            Ext.Ajax.request({
                // need to handle config first as its not applied yet
                url: config.appContextPath || me.appContextPath,
                async: false,
                success: function(response) {
                    if (Ext.isString(response.responseText)) {
                        me.appContext = Ext.decode(response.responseText);
                    } else if (Ext.isObject(response.responseText)) {
                        me.appContext = response.responseText;
                    } else {
                        Ext.log.error("Error! Could not parse appContext!");
                    }
                },
                failure: function(response) {
                    Ext.log.error("Error! No application " + "context found, example loaded");
                    me.appContext = me.fallbackAppContext;
                }
            });
            var olMap = Basepackage.util.ConfigParser.setupMap(me.appContext);
            me.setMap(olMap);
        }
        me.callParent([
            config
        ]);
    },
    /**
     *
     */
    initComponent: function() {
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
                    layers: [
                        me.getHoverVectorLayer()
                    ]
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
        if (me.pendingRequest) {
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
            callback: function() {
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
    onPointerRest: function(evt) {
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
            var url = source.getGetFeatureInfoUrl(evt.coordinate, resolution, projCode, {
                    'INFO_FORMAT': 'application/json'
                });
            var hoverable = layer.get('hoverable');
            // a layer will NOT be requested for hovering if there is a
            // "hoverable" property set to false. If this property is not set
            // or has any other value than "false", the layer will be
            // requested
            if (hoverable !== false) {
                me.requestAsynchronously(url, function(resp) {
                    // TODO: replace evt/coords with real response geometry
                    var respFeatures = (new ol.format.GeoJSON()).readFeatures(resp.responseText);
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
        Ext.each(features, function(feat) {
            feat.set('layer', layer);
            var g = feat.getGeometry();
            if (g) {
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
                offset: [
                    10,
                    -30
                ],
                element: div
            });
        map.addOverlay(overlay);
    },
    /**
    *
    */
    getToolTipHtml: function(layers, features) {
        var innerHtml = '';
        Ext.each(layers, function(layer, index, allItems) {
            var hoverfield = layer.get('hoverfield');
            // fallback if hoverfield is not configured
            if (!hoverfield) {
                // try to use "id" as fallback.
                // if "id" is not available, the value will be "undefined"
                hoverfield = 'id';
            }
            innerHtml += '<b>' + layer.get('name') + '</b>';
            Ext.each(features, function(feat) {
                // we check for existing feature here as there maybe strange
                // situations (e.g. when zooming in unfavorable situations)
                // where feat is undefined
                if (feat) {
                    var hoverfieldValue = feat.get(hoverfield);
                    if (feat.get('layer') === layer) {
                        innerHtml += '<br />' + hoverfieldValue + '<br />';
                    }
                }
            });
            if (index + 1 !== allItems.length) {
                innerHtml += '<br />';
            }
        });
        return innerHtml;
    },
    /**
    *
    */
    onHoverFeatureClick: function(olFeat) {}
});
// could be implemented in a subclass

/*global Ext, ol, GeoExt*/
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
 * Print FormPanel
 * 
 * Used to show an Mapfish Print v3 compatible print panel
 * 
 */
Ext.define("Basepackage.view.form.Print", {
    extend: "Ext.form.Panel",
    xtype: "base-form-print",
    requires: [
        "Ext.window.Toast",
        "Ext.form.action.StandardSubmit",
        "GeoExt.data.MapfishPrintProvider"
    ],
    defaultListenerScope: true,
    viewModel: {
        data: {
            title: 'Drucken',
            labelDpi: 'DPI',
            printButtonSuffix: 'anfordern',
            printFormat: 'pdf',
            genericFieldSetTitle: 'Einstellungen'
        }
    },
    bind: {
        title: '{title}'
    },
    maxHeight: 250,
    autoScroll: true,
    config: {
        url: null,
        store: null
    },
    borderColors: [
        '#FF5050',
        '#00CCFF',
        '#FFFF99',
        '#CCFF66'
    ],
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    bodyPadding: '0 5px 0 0',
    extentLayer: null,
    provider: null,
    defaultType: 'textfield',
    initComponent: function() {
        var store;
        var url = this.getUrl();
        if (!url) {
            this.html = 'No Url provided!';
            this.callParent();
            return;
        }
        this.callParent();
        var appsStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                proxy: {
                    type: 'jsonp',
                    url: url + 'apps.json',
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: function(store, records) {
                        var rawValues = [];
                        Ext.each(records, function(rec) {
                            rawValues.push(rec.raw);
                        });
                        this.down('combo[name=appCombo]').setStore(rawValues);
                    },
                    scope: this
                }
            });
        this.add({
            xtype: 'combo',
            name: 'appCombo',
            allowBlank: false,
            forceSelection: true,
            store: appsStore,
            listeners: {
                select: 'onAppSelected',
                scope: this
            }
        });
        this.on('afterrender', this.addExtentLayer, this);
        this.on('afterrender', this.addParentCollapseExpandListeners, this);
    },
    bbar: [
        {
            xtype: 'button',
            name: 'createPrint',
            bind: {
                text: '{printFormat:uppercase} {printButtonSuffix}'
            },
            formBind: true,
            handler: function() {
                var spec = {};
                var view = this.up('base-form-print');
                var mapComponent = view.getMapComponent();
                var mapView = mapComponent.getMap().getView();
                var layout = view.down('combo[name="layout"]').getValue();
                var format = view.down('combo[name="format"]').getValue();
                var attributes = {};
                var projection = mapView.getProjection().getCode();
                var rotation = mapView.getRotation();
                var printLayers = Ext.Array.filter(mapComponent.getLayers().getArray(), function(layer) {
                        if (layer.checked && layer.get('name') && layer.get('name') !== "hoverVectorLayer") {
                            return true;
                        } else {
                            return false;
                        }
                    });
                var serializedLayers = GeoExt.data.MapfishPrintProvider.getSerializedLayers(printLayers);
                var fieldsets = view.query('fieldset[name!="generic-fieldset"] fieldset');
                Ext.each(fieldsets, function(fs) {
                    var name = fs.name;
                    // TODO double check when rotated
                    var featureBbox = fs.extentFeature.getGeometry().getExtent();
                    var dpi = fs.down('[name="dpi"]').getValue();
                    attributes[name] = {
                        bbox: featureBbox,
                        dpi: dpi,
                        // TODO Order of Layers in print seems to be reversed.
                        layers: serializedLayers.reverse(),
                        projection: projection,
                        rotation: rotation
                    };
                }, this);
                // Get all Fields except the DPI Field
                // TODO This query should be optimized or changed into some
                // different kind of logic
                var additionalFields = view.query('fieldset[name!="generic-fieldset"]>field[name!=dpi]');
                Ext.each(additionalFields, function(field) {
                    if (field.getName() === 'legend') {
                        attributes.legend = view.getLegendObject();
                    } else if (field.getName() === 'scalebar') {
                        attributes.scalebar = view.getScaleBarObject();
                    } else if (field.getName() === 'northArrow') {
                        attributes.scalebar = view.getNorthArrowObject();
                    } else {
                        attributes[field.getName()] = field.getValue();
                    }
                }, this);
                var url = view.getUrl();
                var app = view.down('combo[name=appCombo]').getValue();
                spec.attributes = attributes;
                spec.layout = layout;
                var submitForm = Ext.create('Ext.form.Panel', {
                        standardSubmit: true,
                        url: url + app + '/buildreport.' + format,
                        method: 'POST',
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'spec',
                                value: Ext.encode(spec)
                            }
                        ]
                    });
                submitForm.submit();
            },
            disabled: true
        }
    ],
    listeners: {
        collapse: 'cleanupPrintExtent',
        resize: 'renderAllClientInfos'
    },
    addParentCollapseExpandListeners: function() {
        var parent = this.up();
        parent.on({
            collapse: 'cleanupPrintExtent',
            expand: 'renderAllClientInfos',
            scope: this
        });
    },
    /**
     *
     */
    addExtentLayer: function() {
        var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
        Ext.ComponentQuery.query('gx_map')[0].addLayer(layer);
        this.extentLayer = layer;
    },
    getMapComponent: function() {
        return Ext.ComponentQuery.query('gx_component_map')[0];
    },
    onPrintProviderReady: function(provider) {
        var view = this;
        this.addGenericFieldset(provider);
    },
    onAppSelected: function(appCombo) {
        this.provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            url: this.getUrl() + appCombo.getValue() + '/capabilities.json',
            listeners: {
                ready: 'onPrintProviderReady',
                scope: this
            }
        });
    },
    removeGenericFieldset: function() {
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            view.remove(fs);
        }
    },
    addGenericFieldset: function(provider) {
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            fs.removeAll();
        } else {
            view.add({
                xtype: 'fieldset',
                bind: {
                    title: '{genericFieldSetTitle}'
                },
                name: 'generic-fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                }
            });
        }
        this.addLayoutCombo(provider);
        this.addFormatCombo(provider);
    },
    addFormatCombo: function(provider) {
        var fs = this.down('fieldset[name=generic-fieldset]');
        var formatStore = provider.capabilityRec.get('formats');
        var formatCombo = {
                xtype: 'combo',
                name: 'format',
                displayField: 'name',
                editable: false,
                forceSelection: true,
                queryMode: 'local',
                valueField: 'name',
                store: formatStore,
                bind: {
                    value: '{printFormat}'
                }
            };
        fs.add(formatCombo);
    },
    addLayoutCombo: function(provider) {
        var fs = this.down('fieldset[name=generic-fieldset]');
        var layoutStore = provider.capabilityRec.layouts();
        var layoutCombo = {
                xtype: 'combo',
                name: 'layout',
                displayField: 'name',
                editable: false,
                forceSelection: true,
                queryMode: 'local',
                valueField: 'name',
                store: layoutStore,
                listeners: {
                    change: this.onLayoutSelect,
                    scope: this
                }
            };
        layoutCombo = fs.add(layoutCombo);
        layoutCombo.select(layoutStore.getAt(0));
    },
    // TODO REMOVE EXTENT
    onLayoutSelect: function(combo, layoutname) {
        var view = this,
            attributesFieldset = view.down('fieldset[name=attributes]'),
            layoutRec = combo.findRecordByValue(layoutname),
            attributeFieldset;
        view.remove(attributesFieldset);
        // add the layout attributes fieldset:
        attributeFieldset = view.add({
            xtype: 'fieldset',
            title: 'Eigenschaften',
            name: 'attributes',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            }
        });
        layoutRec.attributes().each(function(attribute, cnt) {
            this.addAttributeFields(attribute, attributeFieldset);
        }, this);
        this.renderAllClientInfos();
        view.down('button[name="createPrint"]').enable();
    },
    getMapAttributeFields: function(attributeRec) {
        var clientInfo = attributeRec.get('clientInfo');
        var mapTitle = attributeRec.get('name') + ' (' + clientInfo.width + ' × ' + clientInfo.height + ')';
        var fs = {
                xtype: 'fieldset',
                clientInfo: Ext.clone(clientInfo),
                title: mapTitle,
                name: attributeRec.get('name'),
                items: {
                    xtype: 'combo',
                    name: 'dpi',
                    editable: false,
                    forceSelection: true,
                    bind: {
                        fieldLabel: '{labelDpi}'
                    },
                    queryMode: 'local',
                    labelWidth: 40,
                    grow: true,
                    value: clientInfo.dpiSuggestions[0],
                    store: clientInfo.dpiSuggestions
                }
            };
        return fs;
    },
    getCheckBoxAttributeFields: function(attributeRec) {
        return {
            xtype: 'checkbox',
            name: attributeRec.get('name'),
            checked: true,
            fieldLabel: attributeRec.get('name'),
            boxLabel: '\u2026verwenden?'
        };
    },
    getNorthArrowAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getLegendAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getScalebarAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getStringField: function(attributeRec) {
        return {
            xtype: 'textfield',
            name: attributeRec.get('name'),
            fieldLabel: attributeRec.get('name'),
            allowBlank: false
        };
    },
    addAttributeFields: function(attributeRec, fieldset) {
        var view = this;
        var olView = this.getMapComponent().getMap().getView();
        var attributeFields;
        switch (attributeRec.get('type')) {
            case "MapAttributeValues":
                attributeFields = this.getMapAttributeFields(attributeRec);
                olView.on('propertychange', this.renderAllClientInfos, this);
                break;
            case "NorthArrowAttributeValues":
                attributeFields = this.getNorthArrowAttributeFields(attributeRec);
                break;
            case "ScalebarAttributeValues":
                attributeFields = this.getScalebarAttributeFields(attributeRec);
                break;
            case "LegendAttributeValue":
                attributeFields = this.getLegendAttributeFields(attributeRec);
                break;
            case "String":
                attributeFields = this.getStringField(attributeRec);
                break;
            case "DataSourceAttributeValue":
                Ext.toast('Data Source not ye supported');
                attributeFields = this.getStringField(attributeRec);
                break;
            default:
                break;
        }
        if (attributeFields) {
            fieldset.add(attributeFields);
        }
    },
    /**
     * TODO: NB: Enhance performance! This method seems to be called too often!
     */
    renderAllClientInfos: function() {
        var view = this;
        if (view._renderingClientExtents || view.getCollapsed() !== false) {
            return;
        }
        view._renderingClientExtents = true;
        view.extentLayer.getSource().clear();
        var fieldsets = view.query('fieldset[name!="generic-fieldset"] fieldset');
        Ext.each(fieldsets, function(fieldset) {
            var feat = GeoExt.data.MapfishPrintProvider.renderPrintExtent(this.getMapComponent(), view.extentLayer, fieldset.clientInfo);
            fieldset.extentFeature = feat;
        }, this);
        delete view._renderingClientExtents;
    },
    cleanupPrintExtent: function() {
        var view = this;
        view.extentLayer.getSource().clear();
    },
    getLegendObject: function() {
        var view = this;
        var layerStore = this.getMapComponent().getStore();
        var classes = [];
        layerStore.each(function(rec) {
            var name = rec.get('text');
            var layer = rec.getOlLayer();
            var source = layer.getSource();
            if (source instanceof ol.source.TileWMS) {
                var url = source.getUrls()[0];
                var iconString = url + "?" + "TRANSPARENT=TRUE&" + "VERSION=1.1.1&" + "SERVICE=WMS&" + "REQUEST=GetLegendGraphic&" + "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" + "FORMAT=image%2Fgif&" + "SCALE=6933504.262556662&" + "LAYER=";
                iconString += source.getParams().LAYERS;
                classes.push({
                    icons: [
                        iconString
                    ],
                    name: name
                });
            }
        }, this);
        var legendObj = {
                classes: classes,
                name: ""
            };
        return legendObj;
    },
    getNorthArrowObject: function() {
        // TODO
        var northArrowObject = {};
        return northArrowObject;
    },
    getScaleBarObject: function() {
        // TODO
        var scaleBarObj = {};
        return scaleBarObj;
    },
    getLayoutRec: function() {
        var combo = this.down('combo[name="layout"]');
        var value = combo.getValue();
        var rec = combo.findRecordByValue(value);
        return rec;
    }
});

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
 * Header Panel
 * 
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 * 
 */
Ext.define("Basepackage.view.panel.Header", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-header",
    requires: [
        "Ext.Img"
    ],
    config: {
        addLogo: true,
        logoUrl: 'resources/images/logo.png',
        logoAltText: 'Logo',
        logoHeight: 80,
        logoWidth: 200,
        additionalItems: []
    },
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    padding: 5,
    cls: 'basepackage-header',
    items: [],
    /**
    *
    */
    initComponent: function() {
        var me = this;
        // add logo
        if (me.getAddLogo() === true) {
            me.addLogoItem();
        }
        var additionalItems = me.getAdditionalItems();
        // add additional items
        if (!Ext.isEmpty(additionalItems) && Ext.isArray(additionalItems)) {
            Ext.each(additionalItems, function(item) {
                me.items.push(item);
            });
        }
        me.callParent();
    },
    /**
     *
     */
    addLogoItem: function() {
        var me = this;
        var logo = {
                xtype: 'image',
                margin: '0 50px',
                alt: me.getLogoAltText(),
                src: me.getLogoUrl(),
                height: me.getLogoHeight(),
                width: me.getLogoWidth()
            };
        me.items.push(logo);
    }
});

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
 * LegendTree Panel
 * 
 * Used to build a TreePanel with layer legends.
 * 
 */
Ext.define("Basepackage.view.panel.LegendTree", {
    extend: "GeoExt.tree.Panel",
    xtype: "base-panel-legendtree",
    requires: [],
    viewModel: {
        data: {}
    },
    layout: 'fit',
    width: 250,
    height: 300,
    collapsible: true,
    collapsed: true,
    hideCollapseTool: true,
    collapseDirection: 'bottom',
    titleCollapse: true,
    titleAlign: 'center',
    rootVisible: false,
    allowDeselect: true,
    selModel: {
        mode: 'MULTI'
    },
    cls: 'base-legend-panel',
    /**
     * @private
     */
    initiallyCollapsed: null,
    /**
     * Take care of the collapsed configuration.
     *
     * For some reason, for the legend panel we cannot have the configuration
     *
     *     {
     *         collapsed: true,
     *         hideCollapseTool: true
     *     }
     * because the the showing on header click does not work. We have this one
     * time listener, that tells us what we originally wanted.
     */
    initComponent: function() {
        var me = this;
        if (me.collapsed && me.hideCollapseTool) {
            me.collapsed = false;
            me.initiallyCollapsed = true;
            Ext.log.info('Ignoring configuration "collapsed" and instead' + ' setup a one-time afterlayout listener that will' + ' collapse the panel (this is possibly due to a bug in' + ' ExtJS 6)');
        }
        me.hideHeaders = true;
        me.lines = false;
        me.features = [
            {
                ftype: 'rowbody',
                setupRowData: function(rec, rowIndex, rowValues) {
                    var headerCt = this.view.headerCt,
                        colspan = headerCt.getColumnCount(),
                        isChecked = rec.get('checked'),
                        layer = rec.data,
                        hasLegend = isChecked && !(layer instanceof ol.layer.Group),
                        legendUrl = hasLegend && layer.get && layer.get('legendUrl'),
                        legendHtml = "",
                        legendHeight;
                    legendHeight = layer.get('legendHeight');
                    if (!legendUrl) {
                        legendUrl = "http://geoext.github.io/geoext2/" + "website-resources/img/GeoExt-logo.png";
                    }
                    legendHtml = '<img class="base-legend" src="' + legendUrl + '"';
                    if (legendHeight) {
                        legendHtml += ' height="' + legendHeight + '"';
                    }
                    legendHtml += ' />';
                    // Usually you would style the my-body-class in CSS file
                    Ext.apply(rowValues, {
                        rowBody: hasLegend ? legendHtml : "",
                        rowBodyCls: "my-body-class",
                        rowBodyColspan: colspan
                    });
                }
            }
        ];
        // call parent
        me.callParent();
        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed) {
            me.on('afterlayout', function() {
                this.collapse();
            }, me, {
                single: true,
                delay: 100
            });
            me.initiallyCollapsed = null;
        }
    }
});

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
 * Menu Panel
 * 
 * Used to show a menu containing different panels of your choice, e.g.
 * the print form panel
 * 
 */
Ext.define("Basepackage.view.panel.Menu", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-menu",
    requires: [
        "Ext.layout.container.Accordion",
        "Basepackage.view.form.Print",
        "Basepackage.view.button.AddWms"
    ],
    viewModel: {
        data: {
            closedMenuTitle: 'Menu schließen',
            openedMenuTitle: 'Menu anzeigen'
        }
    },
    defaultListenerScope: true,
    headerPosition: 'bottom',
    collapsible: true,
    hideCollapseTool: true,
    titleCollapse: true,
    titleAlign: 'center',
    activeItem: 1,
    defaults: {
        // applied to each contained panel
        hideCollapseTool: true,
        titleCollapse: true
    },
    layout: {
        // layout-specific configs go here
        type: 'accordion',
        titleCollapse: false,
        animate: true
    },
    items: [],
    listeners: {
        collapse: 'setTitleAccordingToCollapsedState',
        expand: 'setTitleAccordingToCollapsedState',
        afterrender: 'setTitleAccordingToCollapsedState'
    },
    setTitleAccordingToCollapsedState: function(menu) {
        if (menu.getCollapsed() === false) {
            menu.setBind({
                title: '{closedMenuTitle}'
            });
        } else {
            menu.setBind({
                title: '{openedMenuTitle}'
            });
        }
    }
});

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
 * MapContainer Panel
 *
 * Represents a main viewport which holds the map and other map related
 * components. Using this container leads to a map with integrated or
 * overlapping components, instead of arranging them in a border layout.
 *
 */
Ext.define("Basepackage.view.panel.MapContainer", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-mapcontainer",
    requires: [
        "Ext.dom.Query",
        "GeoExt.data.TreeStore",
        "GeoExt.component.OverviewMap",
        "Basepackage.view.component.Map",
        "Basepackage.view.panel.LegendTree",
        "Basepackage.view.panel.Menu"
    ],
    /**
     *
     */
    viewModel: {
        data: {
            titleLegendPanel: 'Legende'
        }
    },
    /**
     *
     */
    layout: 'absolute',
    /**
     *
     */
    header: false,
    /**
     * The mapPanel containing the map.
     */
    mapPanel: null,
    /**
     * Config
     */
    config: {
        mapComponentConfig: {
            xtype: 'base-component-map',
            anchor: '100% 100%'
        },
        menuConfig: {
            xtype: 'base-panel-menu',
            width: 300,
            items: []
        },
        toolbarConfig: {
            xtype: 'toolbar',
            vertical: true,
            width: 50,
            cls: 'base-map-tools',
            x: 0,
            y: 0,
            defaults: {
                scale: 'large'
            }
        },
        overviewMapConfig: {
            xtype: 'gx_overviewmap',
            magnification: 10,
            width: 400,
            height: 150,
            padding: 5,
            cls: 'base-overview-map',
            hidden: true,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.MapQuest({
                        layer: 'sat'
                    })
                })
            ]
        },
        overviewMapToggleButtonConfig: {
            xtype: 'button',
            scale: 'large',
            cls: 'base-overview-map-button',
            glyph: 'xf0ac@FontAwesome',
            enableToggle: true
        },
        legendPanelConfig: {
            xtype: 'base-panel-legendtree',
            width: 250,
            height: 300,
            layout: 'fit',
            collapsible: true,
            collapsed: true,
            hideCollapseTool: true,
            collapseDirection: 'bottom',
            titleCollapse: true,
            titleAlign: 'center',
            rootVisible: false,
            bind: {
                title: '{titleLegendPanel}'
            }
        },
        /* use this property for additional items that can not be added
         * to "items" immediately as they depend on the map or
         * other components that are built in the MapContainer and should be
         * instanciated first
         */
        additionalItems: []
    },
    /**
     * Init
     */
    initComponent: function() {
        var me = this;
        // call parent (we can use this.add() after this call)
        me.callParent();
        /* add the map component and set it as member
         * the map should be built first as some other components
         * depend on it
         */
        me.addMapComponent();
        // add the menu. TODO: make optional based on config and pass menuItems
        me.addMenu();
        // add the toolbar. TODO: make optional based on config
        me.addToolbar();
        // add the overview map. TODO make optional based on config
        me.addOverviewMap();
        // add the overview map toggle button. TODO make optional
        me.addOverviewMapToggleButton();
        /* add additional items (that possibly depend on the map or other
         * components that were built in the lines before)
         */
        me.addAdditionalItems();
        // TODO make optional based on config
        me.on('afterrender', me.addLegendPanel, me, {
            single: true
        });
    },
    /**
     *
     */
    addMapComponent: function() {
        var me = this;
        var mapComponent = me.getMapComponentConfig();
        me.add(mapComponent);
        // query the mapPanel we just built to set it as a member
        me.mapPanel = me.down(mapComponent.xtype);
    },
    /**
     *
     */
    addMenu: function() {
        var me = this;
        var menu = me.getMenuConfig();
        me.add(menu);
    },
    /**
     *
     */
    addToolbar: function() {
        var me = this;
        var toolbar = me.getToolbarConfig();
        toolbar.items = me.buildToolbarItems();
        me.add(toolbar);
    },
    /**
     *
     */
    addOverviewMap: function() {
        var me = this;
        var overviewMap = me.getOverviewMapConfig();
        // set the overviewmap parent map
        if (!overviewMap.parentMap && me.mapPanel) {
            overviewMap.parentMap = me.mapPanel.getMap();
        }
        me.add(overviewMap);
    },
    /**
     *
     */
    addOverviewMapToggleButton: function() {
        var me = this;
        var overviewMapToggleButton = me.getOverviewMapToggleButtonConfig();
        // set the toggleHandler if not configured
        if (!overviewMapToggleButton.toggleHander && me.toggleOverviewMap) {
            overviewMapToggleButton.toggleHandler = me.toggleOverviewMap;
        }
        // set the scope (e.g. for handler or toggleHandler)
        if (!overviewMapToggleButton.scope) {
            overviewMapToggleButton.scope = me;
        }
        me.add(overviewMapToggleButton);
    },
    /**
     *
     */
    addAdditionalItems: function() {
        var me = this;
        var additionalItems = me.getAdditionalItems();
        me.add(additionalItems);
    },
    /**
     *
     */
    addLegendPanel: function() {
        var me = this;
        var legendTreeConfig = me.getLegendPanelConfig();
        // set the store if not configured
        if (!legendTreeConfig.store && me.mapPanel) {
            var treeStore = Ext.create('GeoExt.data.TreeStore', {
                    layerGroup: me.mapPanel.getMap().getLayerGroup(),
                    showLayerGroupNode: false,
                    filters: [
                        // filter out vector layers
                        function(rec) {
                            if (rec.data instanceof ol.layer.Vector) {
                                return false;
                            }
                            return true;
                        }
                    ]
                });
            // set the store
            legendTreeConfig.store = treeStore;
        }
        // add the legend panel
        me.add(legendTreeConfig);
    },
    /**
     *
     */
    buildToolbarItems: function() {
        var me = this;
        var toolbarItems = [];
        // Zoom in
        var zoomInTool = {
                glyph: 'xf00e@FontAwesome',
                handler: me.zoomIn
            };
        // Zoom out
        var zoomOutTool = {
                glyph: 'xf010@FontAwesome',
                handler: me.zoomOut
            };
        // Zoom to extent
        var zoomToExtentTool = {
                glyph: 'xf0b2@FontAwesome',
                handler: me.zoomToExtent
            };
        // Toggle legend
        var toggleLegendPanelTool = {
                glyph: 'xf022@FontAwesome',
                handler: me.toggleLegendPanel
            };
        // TODO make configurable/optional
        toolbarItems.push(zoomInTool);
        toolbarItems.push(zoomOutTool);
        toolbarItems.push(zoomToExtentTool);
        toolbarItems.push(toggleLegendPanelTool);
        return toolbarItems;
    },
    /**
     *
     */
    toggleLegendPanel: function(button) {
        var legendPanel = button.up("base-panel-mapcontainer").down('base-panel-legendtree');
        if (legendPanel.getCollapsed()) {
            legendPanel.expand();
        } else {
            legendPanel.collapse();
        }
        button.blur();
    },
    /**
     *
     */
    toggleOverviewMap: function(button, pressed) {
        var ovm = button.up("base-panel-mapcontainer").down('gx_overviewmap');
        if (pressed) {
            ovm.show();
        } else {
            ovm.hide();
        }
        button.blur();
        this.toggleScalineAdjustment();
    },
    /**
     *
     */
    toggleScalineAdjustment: function() {
        var scalelineElem = Ext.get(Ext.dom.Query.select('.ol-scale-line')[0]);
        scalelineElem.toggleCls('base-scaline-adjusted');
    },
    /**
     *
     */
    zoomIn: function(button) {
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution(),
                duration: 500
            });
        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() / 2);
    },
    /**
     *
     */
    zoomOut: function(button) {
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution(),
                duration: 500
            });
        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() * 2);
    },
    /**
     *
     */
    zoomToExtent: function(button) {
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var gerCenter = [
                1234075.4566814213,
                6706481.04685707
            ];
        var gerResolution = 2445.98490512564;
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
        olMap.beforeRender(pan);
        olMap.beforeRender(zoom);
        olView.setCenter(gerCenter);
        olView.setResolution(gerResolution);
    }
});

