/* global window, location */
/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 *
 * @class Koala.Application
 */
Ext.define('Koala.Application', {
    extend: 'Ext.app.Application',
    xtype: 'k-application',

    name: 'Koala',


    statics: {
        /**
         * Return the current timereference for the application or null if
         * we cannot determine the desired.
         */
        getTimereference: function() {
            var btn = Ext.ComponentQuery.query('k-button-timereference')[0];
            if (!btn) {
                Ext.log.error('Could not find a timereference button');
                return null;
            }
            return btn.getCurrent();
        },
        /**
         * Return whether the current time reference is UTC.
         */
        isUtc: function(){
            var btnClass = Koala.view.button.TimeReference;
            return this.getTimereference() === btnClass.UTC;
        },
        /**
         * Return whether the current time reference is local.
         */
        isLocal: function(){
            return !this.isUtc();
        }
    },

    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    onUnmatchedRoute: function(hash) {
        Ext.log.info('Unmatched route: ', hash);
    },

    /**
     * A look-up object that will be filled in #beforeLayerTreeRoute so that
     * the actual #onLayerTreeRoute can do its work. Cosnsist of uuids as keys
     * and actual OpenLayers layers as values.
     *
     * @private
     */
    routeCreatedLayers: null,

    /**
     * Called before the actual #onLayerTreeRoute handlers layer adding to the
     * map, this method ensures that the correct openlayers objects are build
     * asynchronously via their UUID. Created layers are saved in the private
     * property #routeCreatedLayers, and the routing action is only then
     * resumed when all layers have been build.
     *
     * @param String layers The has part that triggered the route and
     *     that looks like 'uuid:state,otheruuid:otherstate'
     * @param Object action A routing action element
     * @private
     */
    beforeLayerTreeRoute: function(layers, action){
        var me = this;
        var layerUuidsWithStates = layers.split(",");
        var expectedLayers = 0;
        var gotLayers = 0;
        var routeCreatedLayers = {};

        Ext.each(layerUuidsWithStates, function(uuidWithState) {
            var uuid = uuidWithState.split("_")[0];
            if (Koala.util.String.isUuid(uuid)) {
                expectedLayers++;
                Koala.util.Layer.getMetadataFromUuidAndThen(uuid, function(md){
                   gotLayers++;
                    var olLayer = Koala.util.Layer.layerFromMetadata(md);
                    routeCreatedLayers[uuid] = olLayer;
                    if (gotLayers === expectedLayers) {
                        me.routeCreatedLayers = routeCreatedLayers;
                        action.resume();
                    }
                });
           } else {
               Ext.log.info('Skipping route part ', uuidWithState);
            }
        });
    },

    /**
     * Called as handler for routes matching 'layers/:layers', but only if the
     * before handler #beforeLayerTreeRoute was able to create all required
     * layers and store them in #routeCreatedLayers. This method splits the
     * matched hash and adds the layers contained in the object in the correct
     * order.
     *
     * @param String layers The has part that triggered the route and
     *     that looks like 'uuid:state,otheruuid:otherstate'
     * @private
     */
    onLayerTreeRoute: function(layers){
        var me = this;
        var layerUuidsWithStates = layers.split(",");
        Ext.each(layerUuidsWithStates, function(uuidWithState) {
            var uuidWithStateParts = uuidWithState.split("_");
            var uuid = uuidWithStateParts[0];
            var state = uuidWithStateParts[1] || '1'; // default to visible
            var booleanState = state === '1';
            var olLayer = me.routeCreatedLayers[uuid];
            if (Koala.util.String.isUuid(uuid) && Ext.isDefined(olLayer)) {
                olLayer.set('visible', booleanState);
                Koala.util.Layer.addOlLayerToMap(olLayer);
            }
        });
        me.routeCreatedLayers = null;
    },

    routes: {
        'layers/:layers': {
            action: 'onLayerTreeRoute',
            before: 'beforeLayerTreeRoute'
        }
    },

    stores: [
        // TODO: add global / shared stores here
    ],

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
}, function() {
    // Remove the annyoing warning '[W] targetCls is missing. This may mean that
    // getTargetEl() …' see: https://www.sencha.com/forum/showthread.php?288898-
    // W-targetCls-is-missing.-This-may-mean-that-getTargetEl()-is-being-overrid
    // den-but-no/page3
    Ext.define('Ext.overrides.layout.container.Container', {
        override: 'Ext.layout.container.Container',
        notifyOwner: function() {
            this.owner.afterLayout(this);
        }
    });
});
