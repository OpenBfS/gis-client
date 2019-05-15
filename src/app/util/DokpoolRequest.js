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

    requires: [
        'Koala.util.Authentication'
    ],

    statics: {
        elanScenarioSearch: '@search?portal_type=DPEvent',
        dpTypeActive: '&dp_type=active',
        dpTypeInactive: '&dp_type=inactive',

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
                auth = 'Basic ' + Koala.util.String.utf8_to_b64('admin:istrator'),
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': auth
                };

            me.getActiveElanScenarios().then(function(promise) {
                var activeElanScenarios = promise.items;
                if (!(activeElanScenarios.length >=0) || (activeElanScenarios.length === 1) && (activeElanScenarios[0].title === 'Normalfall')) {
                    // TODO:
                    // handle routinemode specially?
                    console.log('only routinemode');
                } else {
                    console.log('activeScenarios from ELAN available');
                    Ext.each(activeElanScenarios, function(scenario, index, array) {
                        //console.log('scenario_' + index);
                        var url = scenario['@id'];
                        var scenarioDetailed = new Ext.Promise(function(resolve, reject) {
                            Ext.Ajax.request({
                                url: url,
                                headers: headers,
                                method: 'GET',
                                success: function(response) {
                                    var responseObj = Ext.decode(response.responseText);
                                    var id = responseObj.id;
                                    var ElanScenariosUpdate = Object.create({});
                                    var activeElanScenariosDetail = Koala.util.LocalStorage.getDokpoolEvents();
                                    if (activeElanScenariosDetail && !Ext.Object.isEmpty(activeElanScenariosDetail)) {
                                        ElanScenariosUpdate = activeElanScenariosDetail;
                                        if (!activeElanScenariosDetail[id] || !(activeElanScenariosDetail[id].modified === responseObj.modified)) {
                                            //debugger;
                                            console.log('scenario change detected: ' + new Date());
                                            var ScenarioAlertBtn = Ext.ComponentQuery.query('button[name=ScenarioAlertBtn]')[0];
                                            // ScenarioAlertBtn.status = 'alert';
                                            ScenarioAlertBtn.triggerEvent = responseObj.id;
                                            ScenarioAlertBtn.setGlyph('xf071@FontAwesome');
                                            ScenarioAlertBtn.removeCls('button-routine');
                                            ScenarioAlertBtn.addCls('button-alert');
                                        } else {
                                            console.log('checked, but NO scenario change detected: ' + new Date());
                                        }
                                    } else {
                                        //console.log('no scenario available in LocalStorage yet');
                                    }
                                    ElanScenariosUpdate[id] = responseObj;
                                    Koala.util.LocalStorage.updateDokpoolEvents(ElanScenariosUpdate);
                                    resolve(responseObj);
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
            var me = this;
            var auth = 'Basic ' + Koala.util.String.utf8_to_b64('admin:istrator'),
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': auth
                };
            // ,
            // appContext = Koala.util.AppContext.getAppContext(),
            // baseUrl = Koala.util.Object.getPathStrOr(appContext,
            //     'data/merge/urls/dokpool-scenarios'),
            var baseUrl = 'http://dev-pk-fr.lab.bfs.de:8081/dokpool4/bund/contentconfig/scen/';
            var url = (dpType) ? baseUrl + me.elanScenarioSearch + dpType : baseUrl + me.elanScenarioSearch;
            //var url = baseUrl;

            if (!baseUrl) {
                return Ext.Promise.resolve({});
            }

            return new Ext.Promise(function(resolve, reject) {
                Ext.Ajax.request({
                    url: url,
                    headers: headers,
                    method: 'GET',
                    success: function(response) {
                        var responseObj = Ext.decode(response.responseText);
                        resolve(responseObj);
                    },
                    failure: function(response) {
                        var msg = 'server-side failure with status code ' +
                            response.status;
                        reject(msg);
                    }
                });
            });
        }
    }
});
