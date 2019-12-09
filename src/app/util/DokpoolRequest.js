/* Copyright (c) 2017-present BfS Bundesamt fuer Strahlenschutz
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
 * A utility class to provide dokpool requests
 *
 * @class Koala.util.DokpoolRequest
 */
Ext.define('Koala.util.DokpoolRequest', {

    requires: [],

    statics: {
        elanScenarioSearch: '@search?portal_type=DPEvent',
        dpTypeActive: '&dp_type=active',
        dpTypeInactive: '&dp_type=inactive',

        /**
         * Url to elan scenario service
         */
        elanScenarioUrl: null,

        /**
         * App context module

        Koala.util.DokpoolRequest.appContext = Koala.util.AppContext

         */
        appContext: null,

        /**
         * Authentication module

        Koala.util.DokpoolRequest.authenticationModule = Koala.util.Authentication

         */
        authenticationModule: null,

        /**
         * LocalStorage module

        Koala.util.DokpoolRequest.storageModule = Koala.util.LocalStorage

         */
        storageModule: null,

        /**
         * Handler called after new elan scenarios were received.
         * Handler args:
         *   success (Boolean): True if request was successfull
         */
        handleElanScenariosReceived: function(success) {
            Ext.fireEvent('elanEventsReceived', success);
        },

        /**
         * Handler called if elan scenarios were updated.
         * Handler args:
         *  objectIds: Scenario object ids
         *  routineMode (Boolean): True if update only contains routine scenarios, else false
         */
         handleElanScenariosUpdated: function(scenarioIds, routineMode) {
            Ext.fireEvent('elanEventsUpdated', scenarioIds, routineMode);
        },

        getAllElanScenarios: function() {
            var me = this;
            return me.getElanScenarios();
        },

        getActiveElanScenarios: function() {
            var me = this;
            return me.getElanScenarios(me.dpTypeActive);
        },

        updateActiveElanScenarios: function() {
            var me = this,
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'//,
                    //'Authorization': auth
                };
            me.getActiveElanScenarios().then(function(promise) {
                var activeElanScenarios = promise.items;
                var localStorageScenarios = me.storageModule.getDokpoolEvents();

                me.storageModule.updateDokpoolEvents(localStorageScenarios);
                //Response only contains routinemode
                if (!(activeElanScenarios.length >= 0) || (activeElanScenarios.length === 1)
                        && (activeElanScenarios[0].title === 'Normalfall')) {
                    me.handleElanScenariosUpdated([], true);
                } else {
                    new Ext.Promise(function(resolve, reject) {
                        var changedIds = [];
                        var storedEvents = me.storageModule.getDokpoolEvents();
                        var activeEvents = {};
                        var eventCount = activeElanScenarios.length;
                        var resolved = 0;
                        Ext.each(activeElanScenarios, function(scenario) {
                            var url = scenario['@id'];
                            Ext.Ajax.request({
                                url: url,
                                headers: headers,
                                method: 'GET',
                                success: function(response) {
                                    var eventObj = Ext.decode(response.responseText);
                                    var eventId = eventObj['id'];
                                    var storedEvent = storedEvents[eventId];
                                    //Store active events in seperate for later check
                                    activeEvents[eventId] = eventObj;
                                    //If event is new or modified
                                    if (!storedEvent
                                        || storedEvent.modified !== eventObj.modified) {
                                        //Update stored events and add id to changed list
                                        storedEvents[eventId] = eventObj;
                                        changedIds.push(eventId);
                                    }
                                    resolved++;
                                    //Check if all requests were issued
                                    if (resolved == eventCount) {
                                        me.removeInactiveEvents(storedEvents, activeEvents);
                                        me.storageModule.updateDokpoolEvents(storedEvents);
                                        resolve(changedIds);
                                    }
                                },
                                failure: function(response) {
                                    reject('Request failed');
                                }
                            });
                        })
                    }).then(function(changedIds) {
                        if (changedIds.length > 0) {
                            me.handleElanScenariosUpdated(changedIds, false);
                        }
                    });
                }
            });
        },

        /**
         * Checks local events for inactive/removed events and returns
         * an events object without them
         * @param {Object} localEvents Object containing locally stored events
         * @param {Object} serverEvents Object containing events received from the server
         * @return {Object} Locally stored events without inactive ones
         */
        removeInactiveEvents: function(localEvents, serverEvents) {
            var localKeys = Ext.Object.getKeys(localEvents);
            var serverKeys = Ext.Object.getKeys(serverEvents);
            localKeys.forEach(function(el) {
                if (!Ext.Array.contains(serverKeys, el)) {
                    delete localEvents[el];
                }
            });
        },

        getInactiveElanScenarios: function() {
            var me = this;
            return me.getElanScenarios(me.dpTypeInactive);
        },


        getElanScenarios: function(dpType) {
            if (!this.elanScenarioUrl) {
                return Ext.Promise.resolve({items: []});
            }

            var me = this,
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'//,
                    //'Authorization': auth
                },
                url = (dpType) ? this.elanScenarioUrl + me.elanScenarioSearch + dpType :
                        this.elanScenarioUrl + me.elanScenarioSearch;

            if (this.appContext && this.appContext.getAppContext().debug) {
                this.elanScenarioUrl = null;
            }

            return new Ext.Promise(function(resolve) {
                Ext.Ajax.request({
                    url: url,
                    headers: headers,
                    method: 'GET',
                    success: function(response) {
                        try {
                            var responseObj = Ext.decode(response.responseText);
                            me.handleElanScenariosReceived(true);
                            resolve(responseObj);
                        } catch (err) {
                            // most likely response isn't JSON
                            Ext.log('ERROR: ' + err);
                            Ext.log('SERVER-RESPONSE: ' + response);
                            me.handleElanScenariosReceived(false);
                        }
                    },
                    failure: function() {
                        me.handleElanScenariosReceived(false);
                    }
                });
            });
        }
    }
});
