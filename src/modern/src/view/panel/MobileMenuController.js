Ext.define('Koala.view.panel.MobileMenuController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilemenu',

    requires: [
        "Koala.store.SpatialSearch"
    ],

    routes: {
        'menu/:menu/:tree/:filter/:layer/:settings/:imprint': {
            action: 'onMenuRoute'
        }
    },

    routeMapping: [{
        type: 'k-panel-mobilemenu',
        state: null
    }, {
        type: 'k-panel-treepanel',
        state: null
    }, {
        type: 'k-panel-mobilepanel[name=filterContainer]',
        state: null
    }, {
        type: 'k-panel-mobileaddlayer',
        state: null
    }, {
        type: 'k-panel-settings',
        state: null
    }, {
        type: 'k-panel-mobileimprint',
        state: null
    }],

    /**
     *
     */
    onMenuRoute: function() {
        var me = this;
        var states = arguments;

        for (var i = 0; i < me.routeMapping.length; i++) {
            var state = states[i] === "1";
            var menuView = Ext.ComponentQuery.query(me.routeMapping[i].type)[0];

            if (!menuView) {
                continue;
            }

            if (state) {
                menuView.show();
            } else {
                menuView.hide();
            }
        }
    },

    /**
     *
     */
    onInitialize: function() {
        var me = this;
        var view = me.getView();

        // set the route if not given already (e.g. by a link)
        if (!Koala.util.Route.isRouteSet(Ext.String.format(
                view.getRoute(), 0))) {
            Koala.util.Route.setRouteForView(Ext.String.format(
                    view.getRoute(), 0), view);
        }
    },

    /**
     *
     */
    onHide: function(panel) {
        var me = this;
        var view = me.getView();

        if (panel.isRendered()) {
            Koala.util.Route.setRouteForView(Ext.String.format(
                    view.getRoute(), 0), view);
        }
    },

    /**
     *
     */
    onShow: function() {
        var me = this;
        var view = me.getView();

        Koala.util.Route.setRouteForView(Ext.String.format(
                view.getRoute(), 1), view);
    },

    fetchNewData: function(field) {
        var list = field.up().down('[name=spatialsearchlist]');
        list.setHidden(false);
        var store = list.getStore();
        var newVal = field.getValue();
        store.getProxy().setExtraParam('cql_filter', "NAME ilike '%" + newVal + "%'");
        store.load();

        var metadatalist = field.up().down('[name=metadatasearchlist]');
        metadatalist.setHidden(false);
        var mdStore = metadatalist.getStore();
        //Ext.Ajax.abort(spatialStore._lastRequest);
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var fields = appContext.data.merge.metadataSearchFields;
        var cql = this.getMetadataCql(fields, newVal);
        mdStore.getProxy().setExtraParam('constraint', cql);
        mdStore.load();
    },

    onClearIconTap: function(field){
        var list = field.up().down('[name=spatialsearchlist]');
        var metadatalist = field.up().down('[name=metadatasearchlist]');
        list.getStore().removeAll();
        metadatalist.getStore().removeAll();
    },

    zoomToRecord: function(list, index, target, record) {
        var store = list.getStore();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var projection = store.map.getView().getProjection().getCode();
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        var map = store.map;
        var view = map.getView();

        var extent = feature.getGeometry().getExtent();
        view.fit(extent, map.getSize());
    },

    addLayer: function(list, index, target, record){
        var uuid = record.get('fileIdentifier');
        Koala.util.Layer.addLayerByUuid(uuid);

        // var mobilemenucard = this.getView();
        // var tabpanel = mobilemenucard.up('tabpanel');
        // var mapcard = tabpanel.down('[name=mapcontainer]');
        // tabpanel.setActiveItem(mapcard);
    },

    getMetadataCql: function(fields, value){
        var cql = "";
        Ext.each(fields, function(field, idx, fieldsArray){
            cql += field + " like '%" + value + "%'";
            if(idx < fieldsArray.length-1){
                cql += " OR ";
            }
        });
        return cql;
    }
});
