/*global Ext, ol*/
/*jshint curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80*/
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
Ext.define("Basepackage.view.panel.MapContainer",{
    extend: "Ext.panel.Panel",
    xtype: "base-panel-mapcontainer",

    requires: [
        "Ext.dom.Query",
        "GeoExt.data.TreeStore",
        "GeoExt.component.OverviewMap",

        "Basepackage.view.component.Map",
        "Basepackage.view.panel.LegendTree",
        "Basepackage.view.panel.Menu"
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
            x:0,
            y:0,
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
        overviewMapToggleButtonConfig:{
            xtype: 'button',
            scale: 'large',
            cls: 'base-overview-map-button',
            glyph:'xf0ac@FontAwesome',
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
            var treeStore = Ext.create('GeoExt.data.TreeStore', {
                layerGroup: me.mapPanel.getMap().getLayerGroup(),
                showLayerGroupNode: false,
                filters: [
                    // filter out vector layers
                    function(rec) {
                        if (rec.data instanceof ol.layer.Vector) {
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
        var me = this;
        var toolbarItems = [];

        // Zoom in
        var zoomInTool = {
                glyph:'xf00e@FontAwesome',
                handler: me.zoomIn
            };

        // Zoom out
        var zoomOutTool = {
            glyph:'xf010@FontAwesome',
            handler: me.zoomOut
        };

        // Zoom to extent
        var zoomToExtentTool = {
            glyph:'xf0b2@FontAwesome',
            handler: me.zoomToExtent
        };

        // Toggle legend
        var toggleLegendPanelTool = {
            glyph:'xf022@FontAwesome',
            handler: me.toggleLegendPanel
        };

        // TODO make configurable/optional
        toolbarItems.push(zoomInTool);
        toolbarItems.push(zoomOutTool);
        toolbarItems.push(zoomToExtentTool);
        toolbarItems.push(toggleLegendPanelTool);

        return toolbarItems;
    },

    /**
     *
     */
    toggleLegendPanel: function(button){
        var legendPanel = button.up("base-panel-mapcontainer")
                .down('base-panel-legendtree');
        if(legendPanel.getCollapsed()) {
            legendPanel.expand();
        } else {
            legendPanel.collapse();
        }
        button.blur();
    },

    /**
     *
     */
    toggleOverviewMap: function(button, pressed){
        var ovm = button.up("base-panel-mapcontainer")
                .down('gx_overviewmap');
        if (pressed) {
            ovm.show();
        } else {
            ovm.hide();
        }
        button.blur();
        this.toggleScalineAdjustment();
    },

    /**
     *
     */
    toggleScalineAdjustment: function(){
        var scalelineElem = Ext.get(Ext.dom.Query.select('.ol-scale-line')[0]);
        scalelineElem.toggleCls('base-scaline-adjusted');
    },

    /**
     *
     */
    zoomIn: function(button){
        var olMap = button.up("base-panel-mapcontainer")
            .down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer")
            .down('gx_map').getView();
        var zoom = ol.animation.zoom({
            resolution: olView.getResolution(),
            duration: 500
        });

        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() / 2);
    },

    /**
     *
     */
    zoomOut: function(button){
        var olMap = button.up("base-panel-mapcontainer")
            .down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer")
            .down('gx_map').getView();
        var zoom = ol.animation.zoom({
            resolution: olView.getResolution(),
            duration: 500
        });

        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() * 2);
    },

    /**
     *
     */
    zoomToExtent: function(button){
        var olMap = button.up("base-panel-mapcontainer")
            .down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer")
            .down('gx_map').getView();
        var gerCenter = [1234075.4566814213, 6706481.04685707];
        var gerResolution = 2445.98490512564;
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });

        olMap.beforeRender(pan);
        olMap.beforeRender(zoom);
        olView.setCenter(gerCenter);
        olView.setResolution(gerResolution);
    }
});