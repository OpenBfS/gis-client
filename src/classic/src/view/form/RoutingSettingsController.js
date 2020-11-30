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
            var coordinate = rec.get('coordinate');
            var fieldValue = [];

            if (rec.get('hasLongitude') && rec.get('hasLatitude')) {
                fieldValue = coordinate;
            }

            view.add(
                // TODO: consider moving to own class
                {
                    xtype: 'container',
                    wayPointContainer: true,
                    layout: 'hbox',
                    storeIdx: index,
                    margin: '0 0 5 0',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: label,
                        flex: 1,
                        value: fieldValue,
                        enableKeyEvents: true,
                        listeners: {
                            keyup: {
                                fn: function(textField) {
                                    var userInput = textField.value;

                                    me.processTextFieldInput(index, userInput);
                                },
                                buffer: 1000
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
     * Process the text input of the user.
     *
     * @param {integer} index The index of the of the current item in the store.
     * @param {string} userInput The string that the user has inserted.
     */
    processTextFieldInput: function(index, userInput) {

        // TODO: decide if input of coordiantes will be allowed in future
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var wayPointStore = vm.get('waypoints');

        var split = userInput.split(',');

        var hasTwoParts = (split.length === 2);

        var longitude = parseFloat(split[0]);
        var latitude = parseFloat(split[1]);

        if (hasTwoParts && longitude && latitude) {

            var newPointJson = {
                address: '',
                latitude: latitude,
                longitude: longitude
            };

            wayPointStore.replacePoint(index, newPointJson);
        }
        // TODO: tell user that input does not work
    }
});
