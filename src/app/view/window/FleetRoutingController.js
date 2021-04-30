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
 * @class Koala.view.window.FleetRoutingController
 */
Ext.define('Koala.view.window.FleetRoutingController', {
    extend: 'Koala.view.window.RoutingController',
    alias: 'controller.k-window-fleet-routing',
    requires: [
        'Ext.Array',
        'Koala.util.VroomFleetRouting',
        'Koala.util.OpenRouteService',
        'Koala.util.Geocoding',
        'Koala.util.RoutingVehicles',
        'Koala.util.Export',
        'BasiGX.util.Layer'
    ],

    /**
     * Reference to openContextMenu function
     * with the controller's "this" in the scope.
     * Necessary for properly removing the listener
     * again.
     */
    boundOpenContextMenu: null,

    onBoxReady: function() {
        var me = this;
        me.callParent(arguments);

        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        // context menu
        var mapViewport = map.getViewport();
        me.boundOpenContextMenu = me.openContextMenu.bind(me);
        mapViewport.addEventListener('contextmenu', me.boundOpenContextMenu);

        // waypoint creation
        var jobsStore = vm.get('routingjobs');
        if (!jobsStore) {
            return;
        }
        jobsStore.on('datachanged',
            function() {
                view.fireEvent('updateWayPointLayer');
                view.fireEvent('updateOptimizeTrigger');
            }
        );
        jobsStore.on('update',
            function() {
                view.fireEvent('updateWayPointLayer');
                view.fireEvent('updateOptimizeTrigger');
            }
        );

        // waypoint creation
        var vehicleStore = vm.get('routingvehicles');
        if (!vehicleStore) {
            return;
        }
        vehicleStore.on('datachanged',
            function() {
                view.fireEvent('updateWayPointLayer');
                view.fireEvent('updateOptimizeTrigger');
            }
        );
        vehicleStore.on('update',
            function() {
                view.fireEvent('updateWayPointLayer');
                view.fireEvent('updateOptimizeTrigger');
            }
        );
    },

    /**
    * Extend the original 'fillViewModel' method by
    * adding the jobMarkerStyle to the viewModel.
    */
    fillViewModel: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.callParent(arguments);

        var routingOpts = vm.get('routingOpts');
        if (!routingOpts) {
            return;
        }

        // define defaults
        var jobMarkerStyleSize = 38;
        var jobMarkerStyleColor = 'black';
        var jobMarkerStyleColorUnassigned = 'gray';

        if (routingOpts.jobMarkerStyle) {
            if (routingOpts.jobMarkerStyle.markerSize) {
                jobMarkerStyleSize = routingOpts.jobMarkerStyle.markerSize;
            }
            if (routingOpts.jobMarkerStyle.color) {
                jobMarkerStyleColor = routingOpts.jobMarkerStyle.color;
            }
            if (routingOpts.jobMarkerStyle.colorUnassigned) {
                jobMarkerStyleColorUnassigned = routingOpts.jobMarkerStyle.colorUnassigned;
            }
        }

        // set style for job marker layer
        vm.set('jobMarkerStyle',
            new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome map-marker
                    text: '\uf041',
                    font: 'normal ' + jobMarkerStyleSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: jobMarkerStyleColor
                    }),
                    textBaseline: 'bottom'
                })
            })
        );
        vm.set('jobUnassignedMarkerStyle',
            new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome map-marker
                    text: '\uf041',
                    font: 'normal ' + jobMarkerStyleSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: jobMarkerStyleColorUnassigned
                    }),
                    textBaseline: 'bottom'
                })
            })
        );

        // define defaults
        var startEndMarkerSize = 15;
        var startEndMarkerColor = 'black';
        if (routingOpts.startEndMarkerStyle) {
            if (routingOpts.startEndMarkerStyle.markerSize) {
                startEndMarkerSize = routingOpts.startEndMarkerStyle.markerSize;
            }
            if (routingOpts.startEndMarkerStyle.color) {
                startEndMarkerColor = routingOpts.startEndMarkerStyle.color;
            }
        }

        vm.set('startMarkerStyle',
            new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome stop-circle-o
                    text: '\uf28e',
                    font: 'normal ' + startEndMarkerSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: startEndMarkerColor
                    }),
                    textBaseline: 'bottom'
                })
            })
        );

        vm.set('endMarkerStyle',
            new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome stop-circle
                    text: '\uf28d',
                    font: 'normal ' + startEndMarkerSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: startEndMarkerColor
                    }),
                    textBaseline: 'bottom'
                })
            })
        );
    },

    /**
     * Extend the original 'createRoutingLayers' method by
     * adding the wayPointLayer for fleet routing.
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();

        me.callParent(arguments);

        // create custom waypoint layer for fleetRouting
        if (!me.getWaypointLayer()) {
            var layerName = view.waypointLayerName;

            var map = view.map;
            if (!map) {
                return;
            }

            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;

            var source = new ol.source.Vector();
            var layer = new ol.layer.Vector({
                source: source,
                style: me.getWayPointStyle.bind(me)
            });
            layer.set(displayInLayerSwitcherKey, false);
            layer.set('name', layerName);

            map.addLayer(layer);

            // click event
            if (view.map !== null) {
                view.map.on('singleclick', me.onWaypointClick, me);
            }
        }
    },

    /**
     * Create the content of the popup.
     *
     * It will display the address in any case. If available
     * the description will be displayed as well.
     *
     * @param {ol.Feature} feature The popup's feature.
     * @returns {String} The HTML content of the popup.
     */
    getWaypointPopupContent: function(feature) {
        var popupTooltip = '<div class="popup-tip-container">' +
            '<div class="popup-tip"></div></div>';

        // TODO: add job information
        // if (feature.get('type') === 'job' && feature.get('arrival')) {
        //     content = feature.get('arrival');
        // }

        var content = '<p><strong>';
        var description = feature.get('description');
        if (description) {
            content += description + '<br><br>';
        }
        content += feature.get('address');
        content += '</strong></p>';

        return content + popupTooltip;
    },

    /**
     * Assign the style depending on the waypoint type.
     *
     * @param {ol.Feature} pointFeature The point to style.
     * @return {ol.StyleFunction} The styling function.
     */
    getWayPointStyle: function(pointFeature) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var style;
        switch (pointFeature.get('type')) {
            case 'job':
                style = vm.get('jobMarkerStyle');
                break;
            case 'job-unassigned':
                style = vm.get('jobUnassignedMarkerStyle');
                break;
            case 'start':
                style = vm.get('startMarkerStyle');
                break;
            case 'end':
                style = vm.get('endMarkerStyle');
                break;
            default:
                style = vm.get('waypointStyle');
        }
        return style;
    },

    onWindowClose: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.callParent(arguments);

        // destroy context window
        if (vm.get('mapContextMenu') !== null) {
            var mapContextMenu = vm.get('mapContextMenu');
            mapContextMenu.destroy();
            vm.set('mapContextMenu', null);
        }

        // remove context menu listener
        var mapViewport = view.map.getViewport();
        mapViewport.removeEventListener('contextmenu', me.boundOpenContextMenu);
    },

    /**
     * Perform a route optimization request.
     */
    optimizeRoute: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        view.setLoading(true);

        var vehiclesGrid = view.down('k-grid-routing-vehicles');
        if (!vehiclesGrid) {
            return;
        }
        var vehicleStore = vm.get('routingvehicles');
        var vehicleProfileBtn = vehiclesGrid.down('k-button-routing-profile');
        var vehicleProfile = 'driving-car';
        if (vehicleProfileBtn) {
            vehicleProfile = vehicleProfileBtn.getValue();
        }
        vm.set('routingProfile', vehicleProfile);
        var vehicles = vehicleStore.getVroomArray(vehicleProfile);

        var jobsStore = vm.get('routingjobs');
        var jobs = jobsStore.getVroomArray();

        var routingAlgorithm = vm.get('routingAlgorithm');

        if (routingAlgorithm === 'forceAll') {
            // Workaround to force usage of all vehicles at hand
            // and evenly distribute jobs amongst vehicles.
            // Inspired by https://github.com/VROOM-Project/vroom-frontend/blob/06d6f401aa30e17fc0fd65ed70cb7b44d38a744c/src/utils/solution_handler.js#L18-L26
            // and https://github.com/VROOM-Project/vroom/issues/329.
            var jobCount = jobs.length;
            var vehicleCount = vehicles.length;
            var vehicleCapacity = Math.ceil(1.2 * jobCount / vehicleCount);
            // var vehicleCapacity = Math.ceil(jobCount - vehicleCount);
            Ext.Array.each(jobs, function(job) {
                job['delivery'] = [1];
            });
            Ext.Array.each(vehicles, function(vehicle) {
                vehicle['capacity'] = [vehicleCapacity];
            });
        }

        var avoidArea = me.getAvoidAreaGeometry();

        Koala.util.VroomFleetRouting.performOptimization(vehicles, jobs, avoidArea)
            .then(me.handleVroomResponse.bind(me))
            .catch(function(err) {
                view.setLoading(false);

                var str;
                try {
                    str = err.response.body.error.message;
                    Ext.log.warn(str);
                } catch (e) {
                    str = '';
                }

                var info = vm.get('i18n.errorFleetRouting');
                if (!Ext.isEmpty(str)) {
                    info += '<br/><i>(' + str + ')</i>';
                }

                Ext.toast(info);
            });
    },

    /**
     * Handle the VROOM response.
     *
     * Forward the retrieved routes to the OpenRouteservice API.
     * This is necessary for obtaining detailed information
     * like directions or elevation.
     *
     * @param {Object} vroomResponse The response from the VROOM API.
     */
    handleVroomResponse: function(vroomResponse) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        // loop through the computed routes
        // we collect the promises of the routing requests in an array
        Ext.Promise.all(Ext.Array.map(vroomResponse.routes, function(vroomRoute) {
            // convert coordinates in ORS format
            var orsCoords = [];
            Ext.each(vroomRoute.steps, function(step) {
                if (step.type === 'start' || step.type === 'job' || step.type === 'end' ) {
                    orsCoords.push(step.location);
                }
            });

            // create input parameter for routing request
            var orsParams = me.getORSParams({
                coordinates: orsCoords,
                profile: vm.get('routingProfile')
            });

            // Remove preference property if it is null,
            // otherwise computing the route will fail.
            if (orsParams.preference === null) {
                delete orsParams.preference;
            }

            var orsUtil = Koala.util.OpenRouteService;
            return orsUtil.requestDirectionsApi(orsParams);
        }))
            .then(function(orsResponses) {
                var resultPanel = me.getResultPanel();
                resultPanel.fireEvent('optimizationResultAvailable', vroomResponse, orsResponses);

                view.setLoading(false);
                vm.set('showRoutingResults', true);
            })
            .catch(function(err) {
                view.setLoading(false);

                var str;

                try {
                    str = err.response.body.error.message;
                } catch (e) {
                    str = '';
                }

                Ext.log.error(str);

                var info = vm.get('i18n.errorFleetRouting');
                if (!Ext.isEmpty(str)) {
                    info += '<br/><i>(' + str + ')</i>';
                }

                Ext.toast(info);
            });
    },

    /**
     * Set the context menu back to its default state.
     */
    onResetContextMenu: function() {
        var me = this;
        me.setContextMenuType('default');
    },

    /**
     * Set the context menu type.
     * The items in the context menu change depending on the type.
     * Allowed types are 'default', 'vehicle', 'job'.
     * Defaults to 'default'.
     *
     * @param {String} type The ContextMenuType.
     */
    setContextMenuType: function(type) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        if (!type) {
            type = 'default';
        }

        vm.set('contextMenuType', type);
    },

    /**
     * Get the context menu config for the currently
     * set context menu type.
     *
     * @returns {Array} The context menu configuration.
     */
    getContextMenuConfig: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var config;
        var type = vm.get('contextMenuType');
        if (type === 'vehicle') {
            config = me.getVehicleContextConfig();
        } else if (type === 'job') {
            config = me.getJobContextConfig();
        } else {
            config = me.getDefaultContextConfig();
        }
        return config;
    },

    /**
     * Get the configuration for the vehicle context menu.
     * This menu should be used, if the RoutingVehicle window
     * is opened.
     *
     * @returns {Array} The context menu configuration for type 'vehicle'.
     */
    getVehicleContextConfig: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var configs = me.getDefaultContextConfig();
        configs.push({
            item: {
                text: vm.get('i18n.setCurrentVehicleStartContextText')
            },
            callback: function(longitude, latitude) {
                // Error handling is done in triggerReverseGeocoding
                me.triggerReverseGeocoding(longitude, latitude)
                    .then(me.setVehicleStart.bind(me));
            }
        });
        configs.push({
            item: {
                text: vm.get('i18n.setCurrentVehicleEndContextText')
            },
            callback: function(longitude, latitude) {
                // Error handling is done in triggerReverseGeocoding
                me.triggerReverseGeocoding(longitude, latitude)
                    .then(me.setVehicleEnd.bind(me));
            }
        });
        return configs;
    },

    /**
     * Get the configuration for the job context menu.
     * This menu should be used, if the RoutingJob window
     * is opened.
     *
     * @returns {Array} The context menu configuration for type 'job'.
     */
    getJobContextConfig: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var configs = me.getDefaultContextConfig();
        configs.push({
            item: {
                text: vm.get('i18n.setCurrentJobContextText')
            },
            callback: function(longitude, latitude) {
                // Error handling is done in triggerReverseGeocoding
                me.triggerReverseGeocoding(longitude, latitude)
                    .then(me.setJobAdress.bind(me));
            }
        });
        return configs;
    },

    /**
     * Get the configuration for the default context menu.
     * This menu should be used, if only the FleetRouting window
     * is opened.
     *
     * @returns {Array} The context menu configuration for type 'default'.
     */
    getDefaultContextConfig: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var configs = [{
            item: {
                text: vm.get('i18n.addJobContextText')
            },
            callback: function(longitude, latitude) {
                // Error handling is done in triggerReverseGeocoding
                me.triggerReverseGeocoding(longitude, latitude)
                    .then(me.addJobWithAddress.bind(me));
            }
        }, {
            item: {
                text: vm.get('i18n.addVehicleContextText')
            },
            callback: function(longitude, latitude) {
                // Error handling is done in triggerReverseGeocoding
                me.triggerReverseGeocoding(longitude, latitude)
                    .then(me.addVehicleWithAddress.bind(me));
            }
        }];

        return configs;
    },

    /**
     * Set the address for the currently being edited RoutingJob.
     *
     * @param {Object} address The new address.
     */
    setJobAdress: function(address) {
        var jobWindow = Ext.ComponentQuery.query('k-window-routing-job')[0];
        if (jobWindow) {
            jobWindow.fireEvent('setAddress', address);
        }
    },

    /**
     * Set the starting location for the currently being edited RoutingVehicle.
     *
     * @param {Object} address The new address.
     */
    setVehicleStart: function(address) {
        var vehicleWindow = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];
        if (vehicleWindow) {
            vehicleWindow.fireEvent('setStart', address);
        }
    },

    /**
     * Set the ending location for the currently being edited RoutingVehicle.
     *
     * @param {Object} address The new address.
     */
    setVehicleEnd: function(address) {
        var vehicleWindow = Ext.ComponentQuery.query('k-window-routing-vehicle')[0];
        if (vehicleWindow) {
            vehicleWindow.fireEvent('setEnd', address);
        }
    },

    /**
     * Add a new RoutingJob with given address.
     *
     * @param {Object} address The new address.
     */
    addJobWithAddress: function(address) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var jobsGrid = view.down('k-grid-routing-jobs');
        if (jobsGrid) {
            jobsGrid.fireEvent('addJob', {address: address});
        }
    },

    /**
     * Add a new RoutingVehicle with given address
     * as starting and ending location.
     *
     * @param {Object} address The new address.
     */
    addVehicleWithAddress: function(address) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vehiclesGrid = view.down('k-grid-routing-vehicles');
        if (vehiclesGrid) {
            vehiclesGrid.fireEvent('addVehicle', {
                start: address,
                // make sure we do not run into call-by-reference errors
                end: Ext.clone(address)
            });
        }
    },

    /**
     * Open a context menu when a right-click on the map
     * is performed.
     *
     * @param {event} evt The event emitted by clicking on the map.
     */
    openContextMenu: function(evt) {
        var me = this;

        var view = me.getView();
        var vm = view.lookupViewModel();
        var map = view.map;

        var evtCoord = map.getEventCoordinate(evt);

        // suppress default browser behaviour
        evt.preventDefault();

        // transform coordinate
        var sourceProjection = map.getView().getProjection().getCode();
        var targetProjection = ol.proj.get('EPSG:4326');
        var transformed = ol.proj.transform(evtCoord, sourceProjection, targetProjection);

        var latitude = transformed[1];
        var longitude = transformed[0];

        var config = me.getContextMenuConfig();

        var items = Ext.Array.map(config, function(c) {
            var item = c.item;
            item.handler = function() {
                c.callback(longitude, latitude);
            };

            return item;
        });

        var mapContextMenu = Ext.create('Ext.menu.Menu', {
            renderTo: Ext.getBody(),
            items: items
        });

        mapContextMenu.showAt(evt.x, evt.y);
        vm.set('mapContextMenu', mapContextMenu);
    },

    /**
     * Trigger the reverseGeocoding including the
     * default error handling.
     *
     * @param {Number} longitude The longitude.
     * @param {Number} latitude The latitude.
     * @returns {Ext.Promise} The Ext.Promise resolving with the new address or rejecting with the error message.
     */
    triggerReverseGeocoding: function(longitude, latitude) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var language = vm.get('language');

        var geocoding = Koala.util.Geocoding;

        return new Ext.Promise(function(resolve, reject) {
            geocoding.doReverseGeocoding(longitude, latitude, language)
                .then(function(resultJson) {

                    var features = resultJson.features;
                    if (features.length === 0) {
                        throw new Error();
                    }

                    var placeName = geocoding.createPlaceString(features[0].properties);

                    var address = {
                        address: placeName,
                        latitude: latitude,
                        longitude: longitude
                    };

                    resolve(address);
                })
                .catch(function(err) {
                    var str = err.message;
                    Ext.Logger.log(str);
                    var info = vm.get('i18n.errorGeoCoding');
                    if (!Ext.isEmpty(str)) {
                        info += ' ' + str;
                    }
                    Ext.toast(info);
                    reject(err);
                });
        });
    },
    /**
     * Redraw the waypoint layer.
     */
    updateWayPointLayer: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }

        // empty waypoint layer
        layer.getSource().clear();

        // create job marker
        var jobsStore = vm.get('routingjobs');
        if (!jobsStore) {
            return;
        }
        jobsStore.each(function(job) {
            if (job.get('unassigned')) {
                me.createWaypointFeature(job, 'address', 'job-unassigned');
            } else {
                me.createWaypointFeature(job, 'address', 'job');
            }
        });

        // create vehicle marker
        var vehicleStore = vm.get('routingvehicles');
        if (!vehicleStore) {
            return;
        }
        vehicleStore.each(function(vehicle) {

            var start = vehicle.get('start');
            var end = vehicle.get('end');
            var startAndEndAreEqual = false;
            if (start && end) {
                startAndEndAreEqual =
                    (start.latitude === end.latitude) &&
                    (start.longitude === end.longitude);
            }
            if (startAndEndAreEqual) {
                // since 'start' and 'end' are the same
                // the second argument of the function can
                // be either 'start' or 'end'
                me.createWaypointFeature(vehicle, 'start', 'start');
            } else {
                if (start) {
                    me.createWaypointFeature(vehicle, 'start', 'start');
                }
                if (end) {
                    me.createWaypointFeature(vehicle, 'end', 'end');
                }
            }
        });
    },

    /**
     * Add a waypoint feature to the map.
     *
     * @param {Ext.data.Model} record The record containing the point feature information.
     * @param {String} locationProperty The property that holds 'latitude', 'latitude' and 'address' information.
     * @param {String} type The type of the waypoint e.g. 'job'.
     */
    createWaypointFeature: function(record, locationProperty, type) {
        var me = this;

        if (!record.get(locationProperty)) {
            return;
        }

        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }
        var layerSource = layer.getSource();

        var wayPointProps = record.get(locationProperty);

        var lat = wayPointProps.latitude;
        var lon = wayPointProps.longitude;

        var transformed = me.latLonToMapProjection([lon, lat]);

        var feature = new ol.Feature({
            type: type,
            geometry: new ol.geom.Point(transformed),
            address: wayPointProps.address,
            description: record.get('description')
        });

        var setExtraJobProps = type === 'job' &&
            Ext.isNumber(record.get('waiting_time')) &&
            Ext.isNumber(record.get('arrival')) &&
            Ext.isNumber(record.get('vehicle_id'));

        if (setExtraJobProps) {
            feature.set('waiting_time', record.get('waiting_time'));
            feature.set('arrival', record.get('arrival'));
            feature.set('vehicle_id', record.get('vehicle_id'));
        }

        if (type === 'vehicle') {
            feature.set('vehicle_id', record.get('vehicle_id'));
        }

        layerSource.addFeature(feature);
    },

    /**
     * Enable/disable the trigger button depending on
     * if settings fullfill all requirements.
     */
    onUpdateOptimizeTrigger: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var routingJobs = vm.get('routingjobs');
        if (!routingJobs || routingJobs.count() === 0) {
            vm.set('disableOptimizeRoute', true);
            return;
        }

        var vehiclesStore = vm.get('routingvehicles');
        if (!vehiclesStore || vehiclesStore.count() === 0) {
            vm.set('disableOptimizeRoute', true);
            return;
        }

        vm.set('disableOptimizeRoute', false);
    },

    /**
     * Handler for the file button.
     * @param {Ext.Component} field The file input field.
     */
    afterJobUploadRender: function(field) {
        var me = this;
        field.fileInputEl.on('change', me.handleJobUpload.bind(me));
    },

    /**
     * Handle the job upload.
     *
     * @param {Ext.event.Event} evt The change event of the upload button.
     */
    handleJobUpload: function(evt) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        view.setLoading(true);
        var GeocodingUtil = Koala.util.Geocoding;

        var waypoints = vm.get('waypoints');
        var routingJobs = vm.get('routingjobs');
        var language = vm.get('language');

        var file = evt.target.files[0];

        if (file) {
            file.text()
                .then(function(text) {

                    try {
                        var jobs = Ext.JSON.decode(text);
                    } catch (err) {
                        Ext.log.warn(vm.get('i18n.errorInvalidJobsJson'));
                        Ext.toast(vm.get('i18n.errorInvalidJobsJson'));
                        return;
                    }

                    if (!Ext.isArray(jobs)) {
                        Ext.log.warn(vm.get('i18n.errorInvalidJobsJson'));
                        Ext.toast(vm.get('i18n.errorInvalidJobsJson'));
                        return;
                    }

                    // we only work with jobs with locations and ignore all others
                    var jobsWithLocations = Ext.Array.filter(jobs, function(job) {
                        return Ext.isArray(job.location) && job.location.length === 2;
                    });

                    // we have to delete existing ids to avoid conflicts in the store
                    Ext.Array.each(jobsWithLocations, function(job) {
                        delete job.id;
                    });

                    var msg = Ext.String.format(
                        vm.get('i18n.infoImportedJobs'),
                        jobsWithLocations.length
                    );

                    if (jobsWithLocations.length !== jobs.length) {
                        var invalidMsg = Ext.String.format(
                            vm.get('i18n.infoInvalidJobs'),
                            jobs.length - jobsWithLocations.length
                        );
                        msg += ' ' + invalidMsg;
                    }

                    var queue = Ext.Promise.resolve();

                    Ext.Array.each(jobsWithLocations, function(job, i) {
                        var prevJob = jobsWithLocations[i - 1];

                        queue = queue
                            .then(function(resultJson) {
                                if (!resultJson) {
                                    return GeocodingUtil.doReverseGeocoding(job.location[0], job.location[1], language);
                                }

                                var features = resultJson.features;
                                if (features.length === 0) {
                                    throw new Error();
                                }

                                var placeName = GeocodingUtil.createPlaceString(features[0].properties);

                                prevJob.address = {
                                    address: placeName,
                                    latitude: prevJob.location[1],
                                    longitude: prevJob.location[0]
                                };

                                return GeocodingUtil.doReverseGeocoding(job.location[0], job.location[1], language);

                            })
                            .catch(function() {
                                if (prevJob) {
                                    var str = 'Could not get placeName of job.';
                                    Ext.log.warn(str);

                                    prevJob.address = {
                                        address: prevJob.location[0] + ', ' + prevJob.location[1],
                                        latitude: prevJob.location[1],
                                        longitude: prevJob.location[0]
                                    };
                                }
                                return GeocodingUtil.doReverseGeocoding(job.location[0], job.location[1], language);
                            });
                    });

                    // last promise
                    queue
                        .then(function(resultJson) {
                            var features = resultJson.features;
                            if (features.length === 0) {
                                throw new Error();
                            }

                            var placeName = GeocodingUtil.createPlaceString(features[0].properties);

                            var prevJob = jobsWithLocations[jobsWithLocations.length - 1];
                            prevJob.address = {
                                address: placeName,
                                latitude: prevJob.location[1],
                                longitude: prevJob.location[0]
                            };
                        })
                        .catch(function() {
                            var str = 'Could not get placeName of job.';
                            Ext.log.warn(str);

                            var prevJob = jobsWithLocations[jobsWithLocations.length - 1];
                            prevJob.address = {
                                address: prevJob.location[0] + ', ' + prevJob.location[1],
                                latitude: prevJob.location[1],
                                longitude: prevJob.location[0]
                            };
                        })
                        .finally(function() {
                            routingJobs.loadRawData(jobsWithLocations);
                            waypoints.loadRawData(Ext.Array.map(routingJobs.getData().items, function(job) {
                                return job.get('address');
                            }));
                            Ext.toast(msg);
                            view.setLoading(false);
                        });

                }).catch(function(err) {
                    var str = vm.get('i18n.errorInvalidJobsJson');
                    Ext.log.warn(str + err);
                    Ext.toast(str);
                    view.setLoading(false);
                });
        }
    },

    /**
     * Handler for the file button.
     * @param {Ext.Component} field The file input field.
     */
    afterVehicleUploadRender: function(field) {
        var me = this;
        field.fileInputEl.on('change', me.handleVehicleUpload.bind(me));
    },

    /**
     * Handle the vehicle upload.
     *
     * @param {Ext.event.Event} evt The change event of the upload button.
     */
    handleVehicleUpload: function(evt) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        view.setLoading(true);

        var RoutingVehiclesUtil = Koala.util.RoutingVehicles;
        var filterLocations = RoutingVehiclesUtil.filterLocations;
        var getGeocodingLocations = RoutingVehiclesUtil.getGeocodingLocations;
        var setStartEndFromGeocoding = RoutingVehiclesUtil.setStartEndFromGeocoding;

        var routingVehicles = vm.get('routingvehicles');
        var language = vm.get('language');

        var file = evt.target.files[0];

        if (file) {
            file.text()
                .then(function(text) {

                    try {
                        var vehicles = Ext.JSON.decode(text);
                    } catch (err) {
                        Ext.log.warn(vm.get('i18n.errorInvalidVehiclesJson'));
                        Ext.toast(vm.get('i18n.errorInvalidVehiclesJson'));
                        return;
                    }

                    if (!Ext.isArray(vehicles)) {
                        Ext.log.warn(vm.get('i18n.errorInvalidVehiclesJson'));
                        Ext.toast(vm.get('i18n.errorInvalidVehiclesJson'));
                        return;
                    }

                    // we only work with vehicles with locations and ignore all others
                    var vehiclesWithLocations = filterLocations(vehicles);

                    // we have to delete existing ids to avoid conflicts in the store
                    Ext.Array.each(vehiclesWithLocations, function(vehicle) {
                        delete vehicle.id;
                    });

                    var msg = Ext.String.format(
                        vm.get('i18n.infoImportedVehicles'),
                        vehiclesWithLocations.length
                    );

                    if (vehiclesWithLocations.length !== vehicles.length) {
                        var invalidMsg = Ext.String.format(
                            vm.get('i18n.infoInvalidVehicles'),
                            vehicles.length - vehiclesWithLocations.length
                        );
                        msg += ' ' + invalidMsg;
                    }

                    var queue = Ext.Promise.resolve();

                    Ext.Array.each(vehiclesWithLocations, function(vehicle, i) {
                        var prevVehicle = vehiclesWithLocations[i - 1];
                        queue = queue
                            .then(function(resultArray) {
                                if (!resultArray || !Ext.isArray(resultArray)) {
                                    return getGeocodingLocations(vehicle, language);
                                }
                                if (resultArray[0] === null) {
                                    Ext.log.warn('Could not get placeName of starting location.');
                                }
                                if (resultArray[1] === null) {
                                    Ext.log.warn('Could not get placeName of ending location.');
                                }

                                setStartEndFromGeocoding(prevVehicle, resultArray);

                                return getGeocodingLocations(vehicle, language);
                            });
                    });

                    queue
                        .then(function(resultArray) {
                            if (resultArray[0] === null) {
                                Ext.log.warn('Could not get placeName of starting location.');
                            }
                            if (resultArray[1] === null) {
                                Ext.log.warn('Could not get placeName of ending location.');
                            }

                            var prevVehicle = vehiclesWithLocations[vehiclesWithLocations.length - 1];

                            setStartEndFromGeocoding(prevVehicle, resultArray);
                        })
                        .finally(function() {
                            routingVehicles.loadRawData(vehiclesWithLocations);
                            me.updateWayPointLayer();
                            Ext.toast(msg);
                            view.setLoading(false);
                        });
                }).catch(function(err) {
                    var str = vm.get('i18n.errorInvalidVehiclesJson');
                    Ext.log.warn(str + err);
                    Ext.toast(str);
                    view.setLoading(false);
                });
        }
    },

    /**
     * Export all jobs as json.
     */
    exportJobs: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var exportFile = Koala.util.Export.exportFile;

        var vm = view.lookupViewModel();
        var jobsStore = vm.get('routingjobs');
        var jobs = jobsStore.getVroomArray();

        var filename = 'jobs.json';
        exportFile(JSON.stringify(jobs), filename);
    },

    /**
     * Export all vehicles as json.
     */
    exportVehicles: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var exportFile = Koala.util.Export.exportFile;

        var vm = view.lookupViewModel();
        var vehiclesStore = vm.get('routingvehicles');
        var vehicles = vehiclesStore.getVroomArray();

        var filename = 'vehicles.json';
        exportFile(JSON.stringify(vehicles), filename);
    }

});
