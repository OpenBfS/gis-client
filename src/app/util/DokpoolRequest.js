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
         *  objectId: Scenario object id
         *  routineMode (Boolean): True if update only contains routine scenarios, else false
         */
         handleElanScenariosUpdated: function(scenarioId, routineMode) {
            Ext.fireEvent('elanEventsUpdated', scenarioId, routineMode);
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

                //delete inactive events from localStorage
                for (var prop in localStorageScenarios) {
                    var check = activeElanScenarios.filter(function(scen) {
                        return scen['@id'] === localStorageScenarios[prop]['@id'];
                    });
                    if (check.length === 0) {
                        // console.log('deleted "' + localStorageScenarios[prop].id
                        //      + '" from localStorage since it is no longer active!');
                        delete localStorageScenarios[prop];
                        me.storageModule.updateDokpoolEvents(localStorageScenarios);
                    }
                }
                if (!(activeElanScenarios.length >= 0) || (activeElanScenarios.length === 1)
                        && (activeElanScenarios[0].title === 'Normalfall')) {
                    me.handleElanScenariosUpdated(null, true);
                } else {
                    Ext.each(activeElanScenarios, function(scenario) {
                        var url = scenario['@id'];
                        new Ext.Promise(function(resolve, reject) {
                            Ext.Ajax.request({
                                url: url,
                                headers: headers,
                                method: 'GET',
                                success: function(response) {
                                    try {
                                        var responseObj = Ext.decode(response.responseText);
                                        var id = responseObj.id;
                                        var ElanScenariosUpdate = Object.create({});
                                        var activeElanScenariosDetail = me.storageModule.getDokpoolEvents();
                                        if (activeElanScenariosDetail && !Ext.Object.isEmpty(activeElanScenariosDetail)) {
                                            ElanScenariosUpdate = activeElanScenariosDetail;
                                            if (!activeElanScenariosDetail[id]
                                                    || !(activeElanScenariosDetail[id].modified === responseObj.modified)) {
                                                // scenario change detected
                                                me.handleElanScenariosUpdated(responseObj.id, false);
                                            } else {
                                                // checked, but NO scenario change detected
                                            }
                                        } else {
                                            // no scenario available in LocalStorage yet
                                        }
                                        ElanScenariosUpdate[id] = responseObj;
                                        me.storageModule.updateDokpoolEvents(ElanScenariosUpdate);
                                        resolve(responseObj);
                                    } catch (err) {
                                        // most likely response isn't JSON
                                        Ext.log('ERROR: ' + err);
                                        Ext.log('SERVER-RESPONSE: ' + response);
                                    }
                                },
                                failure: function(response) {
                                    var msg = 'server-side failure with status code ' +
                                        response.status;
                                    reject(msg);
                                }
                            });
                        });
                    });
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
