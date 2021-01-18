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
        'Koala.util.Geocoding'
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

        var vehicleStore = view.down('k-grid-routing-vehicles').getStore();
        var vehicles = vehicleStore.getVroomArray();
        if (!vehicles) {
            // TODO: deactivate "optimize" button when the
            // minimal requirements are not fulfilled
            // so this check becomes obsolete
            return;
        }

        var jobsStore = view.down('k-grid-routing-jobs').getStore();
        var jobs = jobsStore.getVroomArray();
        if (!jobs) {
            // TODO: deactivate "optimize" button when the
            // minimal requirements are not fulfilled
            // so this check becomes obsolete
            return;
        }

        var avoidArea = me.getAvoidAreaGeometry();

        Koala.util.VroomFleetRouting.performOptimization(vehicles, jobs, avoidArea)
            .then(me.handleVroomResponse.bind(me))
            .catch(function(error) {
                Ext.toast(vm.get('i18n.errorFleetRouting'));
                Ext.log.error(error);
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
        var promises = [];
        Ext.each(vroomResponse.routes, function(vroomRoute) {

            // convert coordinates in ORS format
            var orsCoords = [];
            Ext.each(vroomRoute.steps, function(step) {
                orsCoords.push(step.location);
                // TODO: maybe add step information to job store
                //      e.g. duration, type of step, arrival time
            });

            // create input parameter for routing request
            var orsParams = me.getORSParams({
                coordinates: orsCoords
                // TODO: take profile from vehicle input of the UI
                // profile: ...,
            });

            var orsUtil = Koala.util.OpenRouteService;
            var routingPromise = orsUtil.requestDirectionsApi(orsParams);
            promises.push(routingPromise);
        });

        // we handle the response once all routing requests have succeeded
        Ext.Promise.all(promises)
            .then(function(orsResponses) {
                var resultPanel = me.getResultPanel();
                resultPanel.fireEvent('optimizationResultAvailable', vroomResponse, orsResponses);

                vm.set('showRoutingResults', true);
            })
            .catch(function(error) {
                Ext.toast(vm.get('i18n.errorFleetRouting'));
                Ext.log.error(error);
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
            item.handler = function(i) {
                c.callback(longitude, latitude);
                var menu = i.up('menu');
                if (menu) {
                    menu.destroy();
                }
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
                        Ext.toast(vm.get('i18n.errorGeoCoding'));
                        return;
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
                    var str = 'An error occured: ' + err;
                    Ext.Logger.log(str);
                    Ext.toast(vm.get('i18n.errorGeoCoding'));
                    reject(err);
                });
        });
    }
});
