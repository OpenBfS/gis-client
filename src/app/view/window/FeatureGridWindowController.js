/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.FeatureGridWindowController
 */
Ext.define('Koala.view.window.FeatureGridWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-featuregrid',

    require: [
        'Koala.util.WFST'
    ],

    onDestroy: function() {
        var view = this.getView();
        this.unregisterListeners();
        var map = BasiGX.util.Map.getMapComponent().map;
        if (view.originalLayer !== view.layer) {
            map.removeLayer(view.layer);
        }
    },

    /**
     * Disable the hover plugin when using some digitalisation tools,
     * as it interferes e.g. with selections
     *
     * @param {Ext.button.Button} btn The button that has been pressed
     */
    disableHover: function(btn) {
        var mapComponent = BasiGX.util.Map.getMapComponent();
        var hoverPlugin = mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            if (btn.pressed) {
                hoverPlugin.getCmp().setPointerRest(false);
            } else {
                hoverPlugin.getCmp().setPointerRest(true);
            }
        }
    },

    /**
     * Issues a WFS-T LockFeature
     *
     * @param {Ext.button.Button} btn The button itself
     * @param {ol.layer} layer The layer the lock should be aquired for
     */
    getFeatureLock: function(btn, layer) {
        var me = this;
        if (layer.get('persisted') === false) {
            btn.setPressed(false);
            Ext.toast(this.getViewModel().get(
                'layerNotSavedYet'));
            return;
        }
        if (!Koala.util.WFST.lockAquired) {
            Koala.util.WFST.lockFeatures(layer).
                then(Koala.util.WFST.handleLockFeaturesResponse).
                then(function(msg) {
                    if (msg === 'Could not aquire an WFST-Lock') {
                        Ext.toast(me.getViewModel().get(
                            'wfstLockFail'));
                        btn.setPressed(false);
                        return;
                    } else {
                        var text = Ext.String.format(me.getViewModel().get(
                            'wfstLockSuccess'), Koala.util.WFST.lockTime);
                        Ext.toast(text);
                        btn.setPressed(true);

                        var task = new Ext.util.DelayedTask(function() {
                            if (Koala.util.WFST.lockAquired === false) {
                                // check if window has been closed already
                                if (me.getView()) {
                                    Ext.toast(me.getViewModel().get(
                                        'wfstLockExpired'));
                                    btn.setPressed(false);
                                }
                            }
                        });
                        task.delay(Koala.util.WFST.lockTime * 1000 * 60);
                    }
                }).
                otherwise(function() {
                    Ext.toast(me.getViewModel().get(
                        'wfstLockFail'));
                    btn.setPressed(false);
                });
        } else {
            btn.setPressed(true);
        }
    },

    /**
     * Populates the different arrays for WFS Transactions
     *
     * @param {Object} evt The event
     * @param{ol.layer} layer The layer containing the features
     */
    handleFeatureChanged: function(evt, layer) {
        // dont populate arrays when the layer is not persisted yet
        if (layer.get('persisted') === false) {
            return;
        }
        var type = evt.type;
        var feature = evt.feature;
        var featuregridWindow = this.getView();
        switch (type) {
            case 'removefeature':
                featuregridWindow.wfstDeletes = Ext.Array.merge(
                    featuregridWindow.wfstDeletes, [feature]);
                break;
            case 'addfeature':
                featuregridWindow.wfstInserts = Ext.Array.merge(
                    featuregridWindow.wfstInserts, [feature]);
                break;
            case 'changefeature':
                featuregridWindow.wfstUpdates = Ext.Array.merge(
                    featuregridWindow.wfstUpdates, [feature]);
                break;
            default:
                break;
        }
    },

    /**
     * Register listeners for WFS-T
     */
    registerListeners: function() {
        var me = this;
        var layer = me.getView().layer;
        layer.getSource().on('addfeature', this.onAddFeature = function(evt) {
            me.handleFeatureChanged(evt, layer);
        }, me);
        layer.getSource().on('changefeature', this.onChangeFeature = function(evt) {
            me.handleFeatureChanged(evt, layer);
        }, me);
        layer.getSource().on('removefeature', this.onRemoveFeature = function(evt) {
            me.handleFeatureChanged(evt, layer);
        }, me);
    },

    /**
     * Unregister listeners for WFS-T
     */
    unregisterListeners: function() {
        var me = this;
        var layer = me.getView().layer;
        layer.getSource().un('addfeature', this.onAddFeature, me);
        layer.getSource().un('changefeature', this.onChangeFeature, me);
        layer.getSource().un('removefeature', this.onRemoveFeature, me);
    },

    downloadLayer: function() {
        var map = Ext.ComponentQuery.query('basigx-component-map')[0];
        var view = this.getView();
        var viewModel = view.getViewModel();
        var menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: viewModel.get('geoJsonText'),
                handler: function() {
                    BasiGX.util.Download.downloadLayer(view.layer, map.map, 'geojson');
                }
            }, {
                text: viewModel.get('shapefileText'),
                handler: function() {
                    BasiGX.util.Download.downloadLayer(view.layer, map.map, 'zip');
                }
            }]
        });
        var btn = view.down('#feature-grid-download-button');
        menu.showBy(btn);
    }

});
