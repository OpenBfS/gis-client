/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
 * Container containing the redlining tools for the temporary drawing in the
 * client.
 *
 * @class Koala.view.container.RedliningToolsContainer
 */
Ext.define('Koala.view.container.RedliningToolsContainer', {
    extend: 'Ext.container.Container',
    xtype: 'koala-container-redlining',

    requires: [
        'Ext.button.Button',

        'Koala.view.container.RedliningToolsContainerModel'
    ],

    viewModel: 'k-container-redliningtoolscontainer',

    controller: 'k-container-redliningtoolscontainer',

    width: 150,

    config: {
        postitPictureUrl: null,
        redlinePointStyle: null,
        redlineLineStringStyle: null,
        redlinePolygonStyle: null,
        redlineStyleFunction: function(feature) {
            var me = Ext.ComponentQuery.query('koala-container-redlining')[0];
            if (!(feature instanceof ol.Feature)) {
                return;
            }
            var geometry = feature.getGeometry();
            if (geometry instanceof ol.geom.Point) {
                return me.getRedlinePointStyle();
            } else if (geometry instanceof ol.geom.LineString) {
                return me.getRedlineLineStringStyle();
            } else {
                return me.getRedlinePolygonStyle();
            }
        }
    },

    map: null,

    redliningVectorLayer: null,

    redlineFeatures: null,

    stateChangeActive: false,

    defaults: {
        xtype: 'button',
        scale: 'large',
        ui: 'default-toolbar',
        margin: '0 0 10px 10px',
        toggleGroup: 'draw'
    },

    items: [{
        name: 'drawPointsBtn',
        bind: {
            tooltip: '{drawPointBtnTooltip}'
        },
        glyph: 'xf100@Flaticon'
    }, {
        name: 'drawLinesBtn',
        bind: {
            tooltip: '{drawLinesBtnTooltip}'
        },
        glyph: 'xf104@Flaticon'
    }, {
        name: 'drawPolygonsBtn',
        bind: {
            tooltip: '{drawPolygonsBtnTooltip}'
        },
        glyph: 'xf107@Flaticon'
    }, {
        name: 'modifyObjectBtn',
        bind: {
            tooltip: '{modifyObjectBtnTooltip}'
        },
        glyph: 'xf044@FontAwesome'
    }, {
        name: 'deleteObjectBtn',
        bind: {
            tooltip: '{deleteObjectBtnTooltip}'
        },
        glyph: 'xf12d@FontAwesome'
    }, {
        name: 'clearObjectsBtn',
        bind: {
            tooltip: '{clearObjectsBtnTooltip}'
        },
        glyph: 'f014@FontAwesome'
    }],

    /**
     * @event redliningchanged
     * An event that fires everytime a feature is added, deleted, moved or
     * modified.
     * @param {Koala.view.container.RedliningToolsContainer} container
     *     The Redlining container.
     * @param {Object} state The current redlining state.
     */

    /**
     * Initializes this component
     */
    initComponent: function() {
        var me = this;
        var displayInLayerSwitcherKey = BasiGX.util.Layer.
            KEY_DISPLAY_IN_LAYERSWITCHER;

        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (!me.redliningVectorLayer) {
            me.redlineFeatures = new ol.Collection();
            me.redlineFeatures.on(
                'add',
                me.fireRedliningChanged,
                me
            );
            me.redliningVectorLayer = new ol.layer.Vector({
                name: 'redliningVectorLayer',
                source: new ol.source.Vector({features: me.redlineFeatures}),
                style: me.getRedlineStyleFunction()
            });
            me.redliningVectorLayer.set(displayInLayerSwitcherKey, false);
            me.map.addLayer(me.redliningVectorLayer);
        }

        me.callParent(arguments);
    }

    // /**
    //  *
    //  */
    // fireRedliningChanged: function(evt) {
    //     var me = this;
    //     var feat = evt.element;
    //     me.adjustFeatureStyle(feat);
    // },

    // /**
    //  * Sets currently defined style to the new added features.
    //  * @param {ol.Feature} feature drawn feature
    //  */
    // adjustFeatureStyle: function(feature) {
    //     var me = this;
    //     var controller = me.getController();
    //
    //     if (controller.stateChangeActive) {
    //         return;
    //     }
    //
    //     if (feature) {
    //         var geometry = feature.getGeometry();
    //
    //         if (geometry instanceof ol.geom.Point) {
    //             feature.setStyle(me.getRedlinePointStyle());
    //         } else if (geometry instanceof ol.geom.LineString) {
    //             feature.setStyle(me.getRedlineLineStringStyle());
    //         } else {
    //             feature.setStyle(me.getRedlinePolygonStyle());
    //         }
    //     }
    // }
});
