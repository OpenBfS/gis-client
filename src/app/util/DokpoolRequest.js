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
        elanScenarioSearch: '@search?portal_type=ELANScenario',
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

        getInactiveElanScenarios: function() {
            var me = this;
            return me.getElanScenarios(me.dpTypeInactive);
        },

        getElanScenarios: function(dpType) {
            var me = this,
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                appContext = Koala.util.AppContext.getAppContext(),
                baseUrl = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/urls/dokpool-scenarios'),
                url = (dpType) ? baseUrl + me.elanScenarioSearch + dpType : baseUrl + me.elanScenarioSearch;

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
