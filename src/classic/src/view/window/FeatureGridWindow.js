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
 * @class Koala.view.window.FeatureGridWindow
 */
Ext.define('Koala.view.window.FeatureGridWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-featuregrid',

    requires: [
        'BasiGX.view.grid.FeatureGrid',
        'Koala.util.Import'
    ],

    controller: 'k-window-featuregrid',
    viewModel: {
        type: 'k-window-featuregrid'
    },

    constrainHeader: true,
    originalLayer: null,
    layer: null,
    layout: 'fit',
    width: 650,
    height: 300,
    scrollable: true,
    wfstInserts: [],
    wfstUpdates: [],
    wfstDeletes: [],
    listeners: {
        beforedestroy: 'onDestroy'
    },

    initComponent: function() {
        var me = this;
        // save original layer
        me.originalLayer = me.layer;

        var map = Ext.ComponentQuery.query('basigx-component-map')[0];

        if (!(me.layer instanceof ol.layer.Vector)) {
            // create empty layer to fill with features
            me.layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: new ol.Collection()
                })
            });
            // copy props e.g. for wfs url
            me.layer.metadata = me.originalLayer.metadata;

            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            this.layer.set(displayInLayerSwitcherKey, false);
            map.addLayer(me.layer);

            Ext.on('selectFeatures:featuresReceived',
                me.getController().registerListeners,
                me.getController(),
                {single: true}
            );
            Koala.util.SelectFeatures.getAllFeaturesFromWmsLayer(
                me.originalLayer,
                me.layer,
                100000
            );
        } else {
            me.getController().registerListeners();
        }

        var viewModel = me.getViewModel();

        var wfstSuccessCallback = function(msg) {
            me.wfstDeletes = [];
            me.wfstUpdates = [];
            me.wfstInserts = [];
            var result = msg.transactionSummary;
            var text = Ext.String.format(
                viewModel.get('wfstSuccess'),
                result.totalInserted,
                result.totalUpdated,
                result.totalDeleted
            );
            Ext.Msg.alert('Info', text);
            me.close();
        };

        var wfstFailureCallback = function(msg) {
            Ext.Msg.alert('Error', viewModel.get('wfstFailure') +
                '<br>' + msg);
        };

        var tree = Ext.ComponentQuery.query('basigx-panel-menu')[0];
        var x = tree.getWidth() + 5;
        var header = Ext.ComponentQuery.query('k-panel-header')[0];
        var y = header.getHeight() + 5;

        me.x = x;
        me.y = y;
        me.setTitle(me.layer.get('name'));
        me.items = [{
            xtype: 'panel',
            layout: 'border',
            items: [{
                xtype: 'buttongroup',
                region: 'north',
                height: 50,
                items: [{
                    xtype: 'basigx-button-mergeselection',
                    padding: 5,
                    bind: {
                        disabled: '{noFeaturesSelected}',
                        sourceLayer: '{selectedFeaturesLayer}'
                    }
                }, {
                    xtype: 'basigx-button-digitize-point',
                    map: map.map,
                    layer: me.layer,
                    glyph: 'xf100@Flaticon'
                }, {
                    xtype: 'basigx-button-digitize-line',
                    map: map.map,
                    layer: me.layer,
                    glyph: 'xf104@Flaticon'
                }, {
                    xtype: 'basigx-button-digitize-polygon',
                    map: map.map,
                    layer: me.layer,
                    glyph: 'xf107@Flaticon'
                }, {
                    xtype: 'basigx-button-digitize-move-object',
                    collection: me.layer.getSource().getFeaturesCollection(),
                    map: map.map,
                    glyph: 'xf108@Flaticon',
                    handler: 'disableHover'
                }, {
                    xtype: 'basigx-button-digitize-modify-object',
                    map: map.map,
                    collection: me.layer.getSource().getFeaturesCollection(),
                    glyph: 'xf044@FontAwesome',
                    handler: 'disableHover'
                }, {
                    xtype: 'basigx-button-digitize-delete-object',
                    map: map.map,
                    collection: me.layer.getSource().getFeaturesCollection(),
                    glyph: 'xf12d@FontAwesome',
                    handler: 'disableHover'
                }, {
                    xtype: 'basigx-button-spatial-operator-union',
                    targetVectorLayer: me.layer,
                    selectionVectorLayer: this.getViewModel().get(
                        'selectedFeaturesLayer'),
                    glyph: 'xf111@FontAwesome'
                }, {
                    xtype: 'basigx-button-spatial-operator-intersect',
                    targetVectorLayer: me.layer,
                    selectionVectorLayer: this.getViewModel().get(
                        'selectedFeaturesLayer'),
                    glyph: 'xf10c@FontAwesome'
                }, {
                    xtype: 'button',
                    enableToggle: true,
                    bind: {
                        text: viewModel.get('wfstLockButton')
                    },
                    hidden: me.layer.get('persisted') === false,
                    handler: function(btn) {
                        me.getController().getFeatureLock(btn, me.layer);
                    }
                }, {
                    xtype: 'button',
                    bind: {
                        text: viewModel.get('saveLayerText')
                    },
                    handler: function() {
                        Koala.util.Import.importOrUpdateLayer(
                            me.layer,
                            me.wfstInserts,
                            me.wfstUpdates,
                            me.wfstDeletes,
                            wfstSuccessCallback,
                            wfstFailureCallback
                        );
                    }
                }]
            }, {
                xtype: 'basigx-grid-featuregrid',
                layer: me.layer,
                layout: 'fit',
                region: 'center',
                bind: {
                    selectionLayer: '{selectedFeaturesLayer}'
                },
                map: map
            }]
        }];
        me.callParent();
    }

});
