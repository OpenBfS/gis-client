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
 * @class Koala.view.form.RoutingSettingsController
 */
Ext.define('Koala.view.form.RoutingSettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-routing-settings',

    /**
     * Initialize the UI.
     *
     * Add listener that updates UI when
     * the waypoint store is changing.
     */
    onBoxReady: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        // build initial UI
        me.setFormEntries();

        var wayPointStore = vm.get('waypoints');
        wayPointStore.on('datachanged', me.setFormEntries.bind(me));
    },

    /**
     * Add an empty via point to the store
     * which also will be visible in the UI.
     */
    addEmptyViaPoint: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var wayPointStore = vm.get('waypoints');

        wayPointStore.addViaPoint(wayPointStore.dummyViaPoint);
    },

    /**
     * Activate singleclick event.
     * On map click the first possible polygon
     * is used as avoid area.
     */
    selectAvoidAreaFromLayer: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var parentComponent = me.getView().up('k-window-routing');
        var map = parentComponent.map;

        if (!map) {
            return;
        }

        map.once('singleclick',function(evt) {

            var aLayerHasBeenFound = map.forEachLayerAtPixel(
                evt.pixel,
                function(layer) {
                    // returns true if an appropriate layer has been found
                    // a true value breaks the forEach loop
                    return me.handleEachLayer(layer, evt.coordinate);
                },
                me,
                // pre-filter the layers to check
                me.layerFilter);
            if (!aLayerHasBeenFound) {
                Ext.toast(vm.get('i18n.errorNoLayerFound'));
            }
        });
    },

    /**
     * Check if input layer contains a valid avoid area.
     *
     * @param {ol.layer.Layer} layer The layer to check.
     * @param {ol.Coordinate} coordinate The coordinate where the user clicked.
     *
     * @returns {boolean} If the layer contains usable features for the avoid area.
     */
    handleEachLayer: function(layer, coordinate) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var parentComponent = me.getView().up('k-window-routing');
        var map = parentComponent.map;

        if (!map) {
            return;
        }

        var mapView = map.getView();

        var source = layer.getSource();
        // TODO: maybe change if/else structure with a final "return true"
        if (layer instanceof ol.layer.Tile) {

            var resolution = mapView.getResolution();
            var mapProjection = mapView.getProjection().getCode();

            if (source instanceof ol.source.TileWMS | source instanceof ol.source.ImageWMS) {
                var url = source.getGetFeatureInfoUrl(coordinate, resolution, mapProjection,
                    {
                        INFO_FORMAT: 'application/json'
                    });
                if (url) {
                    Ext.Ajax.request({
                        url: url,
                        success: function(response) {
                            var geoJson = Ext.decode(response.responseText);
                            var format = new ol.format.GeoJSON();
                            var features = format.readFeatures(geoJson);
                            me.handleNewAvoidFeatureCandidates(features);
                        },
                        failure: function(err) {
                            var str = 'An error occured: ' + err;
                            Ext.Logger.log(str);
                            Ext.toast(vm.get('i18n.errorGetFeatureInfo'));
                        }
                    }
                    );
                }
            }
            return true;
        }
        if (layer instanceof ol.layer.Vector) {

            var vectorFeatures = source.getFeaturesAtCoordinate(coordinate);
            me.handleNewAvoidFeatureCandidates(vectorFeatures);
            return true;
        }
    },

    /**
     * Check if a layer is suitable for checking if
     * it contains candidates for avoid area features.
     *
     * @param {ol.layer.Layer} layer The layer to check.
     * @returns {boolean} If layer fulfills conditions.
     */
    layerFilter: function (layer) {
        var source = layer.getSource();

        // the BKG Topplus basemap causes a CORS error that prevents
        // the forEachLayerAtPixel function from execution
        if (source instanceof ol.source.WMTS && layer.get('name') === 'Hintergrundkarte - TopPlus') {
            return false;
        }
        if (layer instanceof ol.layer.Tile || layer instanceof ol.layer.Vector) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Process the retrieved feature candidates from other layers.
     * Finally use one feature as avoid area.
     *
     * @param {Array.<ol.Feature>} features The feature candiates of the other layer.
     */
    handleNewAvoidFeatureCandidates: function(features) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var parentComponent = me.getView().up('k-window-routing');
        var map = parentComponent.map;

        if (!map) {
            return;
        }

        var avoidAreaLayer = me.getAvoidAreaLayer();

        if (!avoidAreaLayer) {
            return;
        }

        var avoidSource = avoidAreaLayer.getSource();
        var mapView = map.getView();

        if (features.length === 0) {
            return;
        }

        var feature = features[0];
        var geom = feature.getGeometry();

        var geomCorrect = geom instanceof ol.geom.MultiPolygon || geom instanceof ol.geom.Polygon;

        if (!geomCorrect) {
            Ext.toast(vm.get('i18n.errorNoPolygonChosen'));
            return;
        }

        if (me.isPolygonTooBig(geom)) {
            Ext.toast(vm.get('i18n.errorAreaTooBig'));
            return;
        }

        avoidSource.clear();
        avoidSource.addFeature(feature);
        mapView.fit(feature.getGeometry().getExtent());
    },

    /**
     * Check if polygon is too big for the openrouteservice API.
     *
     * @param {ol.geom.Geometry} polygon The polygon or multipolygon geometry in EPSG:3857 projection.
     * @returns {boolean} If the polygon is too big.
     */
    isPolygonTooBig: function(polygon) {
        var me = this;

        var parentComponent = me.getView().up('k-window-routing');
        var map = parentComponent.map;
        if (!map) {
            return;
        }
        var mapView = map.getView();

        // check area
        var wgs84Sphere= new ol.Sphere(6378137);
        var mapProjection = mapView.getProjection().getCode();
        var tmpPolygon = polygon.clone().transform(mapProjection, 'EPSG:4326');
        if (polygon instanceof ol.geom.MultiPolygon) {
            // take the first polygon of a Multipolygon
            tmpPolygon = tmpPolygon.getPolygon(0);
        }
        var coordinates = tmpPolygon.getLinearRing(0).getCoordinates();
        var area = wgs84Sphere.geodesicArea(coordinates);

        // Openrouteservice has an area requirement:
        // "The area of a polygon to avoid must not exceed 2.0E8 square meters."
        return area > 200000000;
    },

    /**
     * Initiate the file handling listener.
     *
     * @param {Ext.form.field.File} field The file field.
     */
    uploadButtonAfterRender: function(field) {

        var me = this;
        field.fileInputEl.on('change', me.handleUploadedFile.bind(me) );
    },

    /**
     * Process the uploaded GeoJSON file.
     *
     * @param {event} event The change event of the file selector.
     */
    handleUploadedFile: function(event) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var file = event.target.files[0];

        if (file) {
            // check file extension
            var fileName = file.name.toLowerCase();
            var correctFileExtension = (fileName.endsWith('.json') || fileName.endsWith('.geojson'));

            if (!correctFileExtension) {
                Ext.toast(vm.get('i18n.errorUploadedFileExtension'));
                return;
            }

            file.text().then(function(text) {

                var parentComponent = me.getView().up('k-window-routing');

                // GeoJSON must be in EPSG:4326
                var map = parentComponent.map;
                var sourceProjection = map.getView().getProjection().getCode();

                var avoidFeatures = new ol.format.GeoJSON().readFeatures(text,
                    {
                        featureProjection: sourceProjection
                    }
                );

                if (avoidFeatures.length === 0) {
                    Ext.toast(vm.get('i18n.errorZeroFeatures'));
                    return;
                }

                if (avoidFeatures.length > 1) {
                    Ext.toast(vm.get('i18n.errorTooManyFeatures'));
                    return;
                }

                var feat = avoidFeatures[0];
                if (!(feat.getGeometry() instanceof ol.geom.Polygon )) {
                    Ext.toast(vm.get('i18n.errorUploadedGeometryType'));
                    return;
                }

                var avoidAreaLayer = me.getAvoidAreaLayer();
                if (!avoidAreaLayer) {
                    return;
                }
                var source = avoidAreaLayer.getSource();
                source.clear();
                source.addFeatures(avoidFeatures);

                // the value must be reset after chosing a file
                var fileField = view.down('filebutton');
                fileField.fileInputEl.dom.value = '';

            }).catch(function(err) {
                Ext.toast(vm.get('i18n.errorFileUpload'));
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
            });

        }
    },


    /**
     * Activate drawing of avoid area. Set listener
     * to stop drawing once the first feature is finished.
     */
    drawAvoidArea: function() {
        var me = this;
        var view = me.getView();

        // clear existing features
        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (!avoidAreaLayer) {
            return;
        }
        var source = avoidAreaLayer.getSource();
        source.clear();

        // activate draw interaction
        var parentComponent = view.up('k-window-routing');
        var avoidAreaDrawInteraction = parentComponent.avoidAreaDrawInteraction;
        avoidAreaDrawInteraction.setActive(true);

        // finish draw after first feature is finished
        source.on('addfeature', function() {
            avoidAreaDrawInteraction.setActive(false);
        });
    },

    clearAvoidAreaSource: function() {
        var me = this;
        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (avoidAreaLayer) {
            var source = avoidAreaLayer.getSource();
            source.clear();
        }
    },

    /**
     * Get the avoid area Layer.
     */
    getAvoidAreaLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.avoidAreaLayerName) {
            return;
        }
        return BasiGX.util.Layer.getLayerByName(view.avoidAreaLayerName);
    },

    /**
     * Update the values in the user interface.
     */
    setFormEntries: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');

        var count = wayPointStore.count();

        // set initial records if required
        if (count === 0) {
            wayPointStore.add(wayPointStore.dummyStartPoint);
            wayPointStore.add(wayPointStore.dummyEndPoint);
        }

        // calculate count again
        count = wayPointStore.count();

        view.removeAll();

        wayPointStore.each(function(rec, index) {

            var label = vm.get('i18n.viaFieldTitle');

            if (index === (count - 1)) {
                label = vm.get('i18n.endFieldTitle');
            }
            if (index === 0) {
                label = vm.get('i18n.startFieldTitle');
            }
            var address = rec.get('address');

            // temporary store for geocoding results
            // it is necessary to fill the current value
            // otherwise the combobox cannot have it as default value
            var geoCodingSuggestions = Ext.create('Ext.data.Store', {
                fields: [
                    {name: 'address', type: 'string'},
                    {name: 'latitude', type: 'float'},
                    {name: 'longitude', type: 'float'}
                ],
                data: [
                    {
                        'address': address,
                        'latitude': rec.get('latitude'),
                        'longitude': rec.get('longitude')
                    }
                ]
            });

            view.add(
                // TODO: consider moving to own class
                {
                    xtype: 'container',
                    wayPointContainer: true,
                    layout: 'hbox',
                    storeIdx: index,
                    margin: '0 0 5 0',
                    items: [{
                        xtype: 'combobox',
                        fieldLabel: label,
                        flex: 1,
                        store: geoCodingSuggestions,
                        displayField: 'address',
                        value: address,
                        hideTrigger: true,
                        listeners: {
                            select: function(combo, record) {
                                var newPointJson = {
                                    address: record.get('address'),
                                    latitude: record.get('latitude'),
                                    longitude: record.get('longitude')
                                };
                                wayPointStore.replacePoint(index, newPointJson);
                            },
                            change: function(combo, newValue) {
                                me.onComboChange(newValue, geoCodingSuggestions);
                            }
                        }
                    }, {
                        xtype: 'button',
                        iconCls: 'x-fa fa-trash-o',
                        margin: '0 0 0 5',
                        handler: function() {
                            me.deleteRoutingPoint(index);
                        }
                    }],
                    listeners: {
                        afterrender: function(container) {
                            me.enableDragDrop(container, index);
                        }
                    }
                }
            );
        });
    },

    /**
     * Check if input is coordinate or place description.
     * Provide geocoding suggestions in the combobox for
     * both cases.
     *
     * @param {string} The value written in the Combobox.
     * @param {Ext.data.Store} geoCodingSuggestions The store that contains geocoding suggestions.
     */
    onComboChange: function(newValue, geoCodingSuggestions, recId) {
        var me = this;

        // return if input string is too short
        if (newValue.length < 3) {
            return;
        }

        // check if input is coordinate or address string
        var split = newValue.split(',');

        var hasTwoParts = (split.length === 2);

        var longitude = parseFloat(split[0]);
        var latitude = parseFloat(split[1]);

        var isValidCoordinate = hasTwoParts && !isNaN(longitude) && !isNaN(latitude);

        if (isValidCoordinate) {

            // TODO: add language argument
            // find address of coordinate
            Koala.util.Geocoding.doReverseGeocoding(longitude, latitude)
                .then(function(resultJson) {
                    // empty geocoding suggestions
                    geoCodingSuggestions.removeAll();
                    me.createGeoCodingSuggestions(resultJson, geoCodingSuggestions, recId);
                })
                .catch(function() {
                    // TODO: add user feedback
                    geoCodingSuggestions.removeAll();
                });
        } else {

            // return if input starts with number
            var firstChar = newValue[0];
            if (parseInt(firstChar, 10)) {
                return;
            }

            // TODO: add language argument
            Koala.util.Geocoding.doGeocoding(newValue)
                .then(function(resultJson) {
                    // empty geocoding suggestions
                    geoCodingSuggestions.removeAll();
                    me.createGeoCodingSuggestions(resultJson, geoCodingSuggestions, recId);
                })
                .catch(function() {
                // TODO: add user feedback
                    geoCodingSuggestions.removeAll();
                });
        }
    },

    /**
     * Convert the geocoding results to records and
     * add them to the store for the comboxbox.
     *
     * @param {object} resultJson The response of the Photon geocoding API.
     * @param {Ext.data.Store} geoCodingSuggestions The store that contains geocoding suggestions.
     */
    createGeoCodingSuggestions: function(resultJson, geoCodingSuggestions, recId) {

        Ext.each(resultJson.features, function(feature) {

            var coords = feature.geometry.coordinates;
            var longitude = coords[0];
            var latitude = coords[1];

            var address = Koala.util.Geocoding.createPlaceString(feature.properties);

            var suggestion = {
                'address': address,
                'latitude': latitude,
                'longitude': longitude
            };

            if (recId !== undefined) {
                suggestion.waypointId = recId;
            }

            geoCodingSuggestions.add(suggestion);
        });
    },

    /**
     * Delete a waypoint at a given position.
     *
     * @param {integer} index The index of the waypoint that shall be deleted.
     */
    deleteRoutingPoint: function(index) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var wayPointStore = vm.get('waypoints');
        var count = wayPointStore.count();

        if (count <= 2) {
            if (index === 0) {
                // start point
                wayPointStore.setStartPoint(wayPointStore.dummyStartPoint);

            } else if (index === 1) {
                // end point
                wayPointStore.setEndPoint(wayPointStore.dummyEndPoint);
            }
        } else {
            wayPointStore.removeAt(index);
        }
    },

    /**
     * Enable Drag&Drop in the waypoint fields.
     *
     * @param {Ext.container.Container} container
     * @param {integer} waypointIdx
     */
    enableDragDrop: function(container, waypointIdx) {

        var me = this;
        var vm = me.getViewModel();
        var wayPointStore = vm.get('waypoints');

        new Ext.drag.Source({
            element: container.el,
            // for identification
            storeIdx: waypointIdx,
            // necessary drag to invalid area
            revert: true,
            constrain: {
                element: true
            }
        });

        new Ext.drag.Target({
            element: container.el,
            // for identification
            storeIdx: waypointIdx,
            listeners: {
                drop: function(target, info) {
                    var sourceRec = wayPointStore.getAt(info.source.storeIdx);
                    wayPointStore.removeAt(info.source.storeIdx);
                    wayPointStore.insert(target.storeIdx, sourceRec);
                }
            }
        });
    },

    /**
     * Trigger new routing request.
     */
    onRoutingButtonPressed: function() {
        var me = this;
        var view = me.getView();

        var routingWindow = view.up('k-window-routing');
        if (routingWindow) {
            routingWindow.fireEvent('makeRoutingRequest', undefined, undefined);
        }
    }

});
