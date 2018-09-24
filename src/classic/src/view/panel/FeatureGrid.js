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
 * @class Koala.view.panel.FeatureGrid
 */
Ext.define('Koala.view.panel.FeatureGrid', {
    extend: 'Ext.panel.Panel',
    xtype: 'k-panel-featuregrid',

    requires: [
        'BasiGX.view.grid.FeatureGrid',
        'BasiGX.util.Download',
        'Koala.util.Import',
        'Koala.view.panel.FeatureGridController',
        'Koala.view.panel.FeatureGridModel'
    ],

    controller: 'k-panel-featuregrid',
    viewModel: {
        type: 'k-panel-featuregrid'
    },

    originalLayer: null,
    layout: 'border',
    layer: null,
    wfstInserts: [],
    wfstUpdates: [],
    wfstDeletes: [],
    listeners: {
        beforedestroy: 'onBeforeDestroy'
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
            // update wms layer cache
            if (!(me.originalLayer instanceof ol.layer.Vector)) {
                me.originalLayer.getSource().updateParams({'date': new Date()});
            }
        };

        var wfstFailureCallback = function(msg) {
            Ext.Msg.alert('Error', viewModel.get('wfstFailure') +
                '<br>' + msg);
        };

        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        var context = mapComp.appContext.data.merge;
        var imisRoles = context.imis_user.userroles;
        var allowCreate = context.import.allowCreateLayer;
        var extendedRights = Ext.Array.contains(imisRoles, 'ruf');

        me.setTitle(me.layer.get('name'));
        me.items = [{
            xtype: 'buttongroup',
            height: 50,
            region: 'north',
            items: [{
                xtype: 'basigx-button-mergeselection',
                padding: 5,
                bind: {
                    disabled: '{noFeaturesSelected}',
                    sourceLayer: '{selectedFeaturesLayer}'
                }
            }, {
                xtype: 'button',
                glyph: 'xf160@FontAwesome',
                handler: 'multiEdit'
            }, {
                xtype: 'basigx-button-digitize-point',
                map: map.map,
                layer: me.layer,
                glyph: 'xf100@Flaticon',
                multi: true
            }, {
                xtype: 'basigx-button-digitize-line',
                map: map.map,
                layer: me.layer,
                glyph: 'xf104@Flaticon',
                multi: true
            }, {
                xtype: 'basigx-button-digitize-polygon',
                map: map.map,
                layer: me.layer,
                glyph: 'xf107@Flaticon',
                multi: true
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
                glyph: 'xf10c@FontAwesome',
                fullSplit: true,
                maxAllowedFeaturesForOperation: 10,
                tolerance: 10
            }, {
                xtype: 'button',
                enableToggle: true,
                bind: {
                    text: '{wfstLockButton}'
                },
                hidden: me.layer.get('persisted') === false ||
                        !extendedRights || !allowCreate,
                handler: function(btn) {
                    me.getController().getFeatureLock(btn, me.layer);
                }
            }, {
                xtype: 'button',
                hidden: (!extendedRights || !allowCreate),
                bind: {
                    text: '{saveLayerText}'
                },
                handler: function(btn) {
                    var performSave = function(role) {
                        Koala.util.Import.importOrUpdateLayer(
                            me.layer,
                            me.wfstInserts,
                            me.wfstUpdates,
                            me.wfstDeletes,
                            wfstSuccessCallback,
                            wfstFailureCallback,
                            role
                        );
                    };

                    if (me.layer.get('persisted') ||
                            me.layer.metadata.layerConfig.olProperties.persisted) {
                        performSave();
                        return;
                    }
                    var roles = Koala.util.AppContext.getAppContext()
                        .data.merge.imis_user.userroles;
                    var menu = Ext.create('Ext.menu.Menu', {
                        items: Ext.Array.map(roles, function(role) {
                            return {
                                text: role,
                                handler: function() {
                                    performSave(role);
                                }
                            };
                        })
                    });
                    menu.showBy(btn);
                }
            }, {
                xtype: 'button',
                id: 'feature-grid-download-button',
                bind: {
                    text: '{downloadLayerText}'
                },
                handler: 'downloadLayer'
            }]
        }, {
            xtype: 'basigx-grid-featuregrid',
            region: 'center',
            layout: 'fit',
            height: 350,
            layer: me.layer,
            bind: {
                selectionLayer: '{selectedFeaturesLayer}'
            },
            map: map
        }];
        me.callParent();
    }

});
