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
 * @class Koala.view.form.ClassicRoutingSettingsController
 */
Ext.define('Koala.view.form.ClassicRoutingSettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-classic-routing-settings',

    requires: [
        'Ext.data.Store',
        'Koala.util.Geocoding'
    ],

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
                        labelClsExtra: 'routing-waypoint-form-item',
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
            // necessary drag to invalid area
            revert: true,
            constrain: {
                element: true
            },
            handle: '.routing-waypoint-form-item',
            describe: function(info) {
                // for identification
                info.setData('storeIdx', waypointIdx);
            }
        });

        new Ext.drag.Target({
            element: container.el,
            // for identification
            storeIdx: waypointIdx,
            listeners: {
                drop: function(target, info) {
                    info.getData('storeIdx').then(function(storeIdx) {
                        var sourceRec = wayPointStore.getAt(storeIdx);
                        wayPointStore.removeAt(storeIdx);
                        wayPointStore.insert(target.storeIdx, sourceRec);
                    });
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

        var routingWindow = view.up('k-window-classic-routing');
        if (routingWindow) {
            routingWindow.fireEvent('makeRoutingRequest', undefined, undefined);
        }
    },

    /**
     * Trigger routing request when an avoid area was drawn.
     */
    onAvoidAreaDrawEnd: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var routingWindow = view.up('k-window-classic-routing');
        if (routingWindow) {
            routingWindow.fireEvent('makeRoutingRequest', undefined, undefined);
        }
    }
});
