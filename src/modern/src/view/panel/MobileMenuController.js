/* Copyright (c) 2015-2017 terrestris GmbH & Co. KG
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
 * @class Koala.view.panel.MobileMenuController
 */
Ext.define('Koala.view.panel.MobileMenuController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilemenu',

    requires: [
        'Koala.store.SpatialSearch'
    ],

    fetchNewData: function(field) {
        var list = field.up().down('[name=spatialsearchlist]');
        list.setHidden(false);
        var store = list.getStore();
        var newVal = field.getValue();
        store.getProxy().setExtraParam('cql_filter', "NAME ilike '%" + newVal + "%'");
        store.load();

        var metadataList = field.up().down('[name=metadatasearchlist]');
        metadataList.setHidden(false);
        var mdStore = metadataList.getStore();
        //Ext.Ajax.abort(spatialStore._lastRequest);
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var fields = appContext.data.merge.metadataSearchFields;
        var cql = this.getMetadataCql(fields, newVal);
        mdStore.getProxy().setExtraParam('constraint', cql);
        mdStore.load();

        var spatialSearchTitle = field.up().down('[name=spatialsearchtitle]');
        spatialSearchTitle.setHidden(false);
        var metadataSearchTitle = field.up().down('[name=metadatasearchtitle]');
        metadataSearchTitle.setHidden(false);

    },

    onClearIconTap: function(field) {
        var list = field.up().down('[name=spatialsearchlist]');
        var metadataList = field.up().down('[name=metadatasearchlist]');
        list.getStore().removeAll();
        metadataList.getStore().removeAll();
        var spatialSearchTitle = field.up().down('[name=spatialsearchtitle]');
        spatialSearchTitle.setHidden(true);
        var metadataSearchTitle = field.up().down('[name=metadatasearchtitle]');
        metadataSearchTitle.setHidden(true);
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
        var menuPanel = this.getView('k-panel-mobilemenu');
        menuPanel.hide();
    },

    onItemTap: function(list, index, target, record, event) {

        if (event.target.title ==='addLayer') {
            var uuid = record.get('fileIdentifier');
            Koala.util.Layer.addLayerByUuid(uuid);
            var menuPanel = this.getView('k-panel-mobilemenu');
            menuPanel.hide();
        }
        if (event.target.title ==='getInfo') {
            var view = this.getView();
            var metadataInfoPanel = view.up('app-main').down('k-panel-mobilemetadatainfo');

            if (metadataInfoPanel) {
                var vm = metadataInfoPanel.getViewModel();
                var fieldNames = Koala.view.panel.MobileMetadataInfo.fieldNames;
                var data = [];

                Ext.Object.each(fieldNames, function(key, value) {
                    data.push({
                        'key': value,
                        'value': record.get(key)
                    });
                });

                vm.set('name', record.get('name'));
                vm.set('data', data);
                metadataInfoPanel.show();
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
