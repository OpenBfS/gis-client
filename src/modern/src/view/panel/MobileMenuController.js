Ext.define('Koala.view.panel.MobileMenuController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilemenu',

    requires: [
        "Koala.store.SpatialSearch"
    ],

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

        var spatialsearchttitle = field.up().down('[name=spatialsearchtitle]');
        spatialsearchttitle.setHidden(false);
        var metadatasearchtitle = field.up().down('[name=metadatasearchtitle]');
        metadatasearchtitle.setHidden(false);

    },

    onClearIconTap: function(field) {
        var list = field.up().down('[name=spatialsearchlist]');
        var metadatalist = field.up().down('[name=metadatasearchlist]');
        list.getStore().removeAll();
        metadatalist.getStore().removeAll();
        var spatialsearchttitle = field.up().down('[name=spatialsearchtitle]');
        spatialsearchttitle.setHidden(true);
        var metadatasearchtitle = field.up().down('[name=metadatasearchtitle]');
        metadatasearchtitle.setHidden(true);
    },

    zoomToRecord: function(list, index, target, record) {
        var store = list.getStore();
        var map = store.map;
        var view = map.getView();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection()
        });

        var extent = feature.getGeometry().getExtent();
        view.fit(extent, map.getSize());
        var menupanel = this.getView('k-panel-mobilemenu');
        menupanel.hide();
    },

    onItemTap: function(list, index, target, record, event){

        if(event.target.title ==='addLayer'){
            var uuid = record.get('fileIdentifier');
            Koala.util.Layer.addLayerByUuid(uuid);
            var menupanel = this.getView('k-panel-mobilemenu');
            menupanel.hide();
        }
        if(event.target.title ==='getInfo'){
            var view = this.getView();
            var metadatInfoPanel = view.up('app-main').down('k-panel-mobilemetadatainfo');

            if (metadatInfoPanel) {
                var vm = metadatInfoPanel.getViewModel();
                var fieldNames = Koala.view.panel.MobileMetadataInfo.fieldNames;
                var data = [];

                Ext.Object.each(fieldNames, function(key, value){
                    data.push({
                        'key': value,
                        'value': record.get(key)
                    });
                });

                vm.set('name', record.get('name'));
                vm.set('data', data);
                metadatInfoPanel.show();
            }
        }
    },

    getMetadataCql: function(fields, value) {
        var cql = "";
        Ext.each(fields, function(field, idx, fieldsArray) {
            cql += field + " like '%" + value + "%'";
            if (idx < fieldsArray.length-1) {
                cql += " OR ";
            }
        });
        return cql;
    }
});
