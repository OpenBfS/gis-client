/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * MapContainer Panel
 *
 * Represents a main viewport which holds the map and other map related
 * components. Using this container leads to a map with integrated or
 * overlapping components, instead of arranging them in a border layout.
 *
 */
Ext.define("Basepackage.view.panel.MapContainer", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-mapcontainer",

    requires: [
        "Ext.dom.Query",
        "GeoExt.data.store.LayersTree",
        "GeoExt.component.OverviewMap",

        "Basepackage.util.Layer",
        "Basepackage.view.component.Map",
        "Basepackage.view.panel.LegendTree",
        "Basepackage.view.panel.Menu",

        "Basepackage.view.button.ZoomIn",
        "Basepackage.view.button.ZoomOut",
        "Basepackage.view.button.ZoomToExtent",
        "Basepackage.view.button.ToggleLegend"
    ],

    /**
     *
     */
    viewModel: {
        data: {
            titleLegendPanel: 'Legende'
        }
    },

    /**
     *
     */
    layout: 'absolute',

    /**
     *
     */
    header: false,

    /**
     * The mapPanel containing the map.
     */
    mapPanel: null,

    /**
     * Config
     */
    config: {
        mapComponentConfig: {
            xtype: 'base-component-map',
            anchor: '100% 100%'
        },
        menuConfig: {
            xtype: 'base-panel-menu',
            width: 300,
            items: []
        },
        toolbarConfig: {
            xtype: 'toolbar',
            vertical: true,
            width: 50,
            cls: 'base-map-tools',
            x: 0,
            y: 0,
            defaults: {
                scale: 'large'
            }
        },
        overviewMapConfig: {
            xtype: 'gx_overviewmap',
            magnification: 10,
            width: 400,
            height: 150,
            padding: 5,
            cls: 'base-overview-map',
            hidden: true,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.MapQuest({layer: 'sat'})
                })
            ]
        },
        overviewMapToggleButtonConfig: {
            xtype: 'button',
            scale: 'large',
            helpKey: 'base-overview-map-button',
            cls: 'base-overview-map-button',
            glyph: 'xf0ac@FontAwesome',
            enableToggle: true
        },
        legendPanelConfig: {
            xtype: 'base-panel-legendtree',
            width: 250,
            height: 300,
            layout: 'fit',
            collapsible: true,
            collapsed: true,
            hideCollapseTool: true,
            collapseDirection: 'bottom',
            titleCollapse: true,
            titleAlign: 'center',
            rootVisible: false,
            bind: {
                title: '{titleLegendPanel}'
            }
        },
        /* use this property for additional items that can not be added
         * to "items" immediately as they depend on the map or
         * other components that are built in the MapContainer and should be
         * instanciated first
         */
        additionalItems: []
    },

    /**
     * Init
     */
    initComponent: function(){
        var me = this;

        // call parent (we can use this.add() after this call)
        me.callParent();

        /* add the map component and set it as member
         * the map should be built first as some other components
         * depend on it
         */
        me.addMapComponent();

        // add the menu. TODO: make optional based on config and pass menuItems
        me.addMenu();

        // add the toolbar. TODO: make optional based on config
        me.addToolbar();

        // add the overview map. TODO make optional based on config
        me.addOverviewMap();

        // add the overview map toggle button. TODO make optional
        me.addOverviewMapToggleButton();

        /* add additional items (that possibly depend on the map or other
         * components that were built in the lines before)
         */
        me.addAdditionalItems();

        // TODO make optional based on config
        me.on('afterrender', me.addLegendPanel, me, {single: true});
    },

    /**
     *
     */
    addMapComponent: function() {
        var me = this;

        var mapComponent = me.getMapComponentConfig();

        me.add(mapComponent);

        // query the mapPanel we just built to set it as a member
        me.mapPanel = me.down(mapComponent.xtype);
    },

    /**
     *
     */
    addMenu: function() {
        var me = this;

        var menu = me.getMenuConfig();

        me.add(menu);
    },

    /**
     *
     */
    addToolbar: function() {
        var me = this;

        var toolbar = me.getToolbarConfig();

        toolbar.items = me.buildToolbarItems();

        me.add(toolbar);
    },

    /**
     *
     */
    addOverviewMap: function() {
        var me = this;

        var overviewMap = me.getOverviewMapConfig();

        // set the overviewmap parent map
        if(!overviewMap.parentMap && me.mapPanel) {
            overviewMap.parentMap = me.mapPanel.getMap();
        }

        me.add(overviewMap);
    },

    /**
     *
     */
    addOverviewMapToggleButton: function() {
        var me = this;

        var overviewMapToggleButton = me.getOverviewMapToggleButtonConfig();

        // set the toggleHandler if not configured
        if(!overviewMapToggleButton.toggleHander && me.toggleOverviewMap) {
            overviewMapToggleButton.toggleHandler = me.toggleOverviewMap;
        }

        // set the scope (e.g. for handler or toggleHandler)
        if(!overviewMapToggleButton.scope) {
            overviewMapToggleButton.scope = me;
        }

        me.add(overviewMapToggleButton);
    },

    /**
     *
     */
    addAdditionalItems: function() {
        var me = this;

        var additionalItems = me.getAdditionalItems();

        me.add(additionalItems);
    },

    /**
     *
     */
    addLegendPanel: function() {
        var me = this;

        var legendTreeConfig = me.getLegendPanelConfig();

        // set the store if not configured
        if(!legendTreeConfig.store && me.mapPanel) {
            var treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                layerGroup: me.mapPanel.getMap().getLayerGroup(),
                showLayerGroupNode: false,
                filters: [
                    // filter out vector layers
                    function(rec) {
                        var layer = rec.data;
                        var util = Basepackage.util.Layer;
                        var showKey = util.KEY_DISPLAY_IN_LAYERSWITCHER;
                        if (layer.get(showKey) === false) {
                            return false;
                        }
                        return true;
                    }
                ]
            });

            // set the store
            legendTreeConfig.store = treeStore;
        }

        // add the legend panel
        me.add(legendTreeConfig);
    },

    /**
     *
     */
    buildToolbarItems: function() {
        var toolbarItems = [{
                xtype: 'base-button-zoomin'
            }, {
                xtype: 'base-button-zoomout'
            }, {
                xtype: 'base-button-zoomtoextent'
            }, {
                xtype: 'base-button-togglelegend'
            }];

        return toolbarItems;
    },

    /**
     *
     */
    toggleOverviewMap: function(button, pressed){
        var ovm = button.up("base-panel-mapcontainer")
                .down('gx_overviewmap');
        if (pressed) {
            ovm.show(button);
        } else {
            ovm.hide(button);
        }
        button.blur();
        this.toggleScalelineAdjustment();
        this.toggleScalecomboAdjustment();
    },

    /**
     *
     */
    toggleScalelineAdjustment: function(){
        var scaleline = Ext.dom.Query.select('.ol-scale-line')[0];
        var scalelineElem;
        if(scaleline) {
            scalelineElem = Ext.get(scaleline);
        }
        if(scalelineElem){
            scalelineElem.toggleCls('base-scaline-adjusted');
        }
    },

    /**
     *
     */
    toggleScalecomboAdjustment: function(){
        var scaleCombo = Ext.ComponentQuery.query('base-combo-scale')[0];
        var scaleComboEl;
        if(scaleCombo){
            scaleComboEl = scaleCombo.getEl();
        }
        if(scaleComboEl){
            scaleComboEl.toggleCls('base-combo-scale-adjusted');
        }
    }
});
