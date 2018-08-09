/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
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
        'Koala.store.SpatialSearch',
        'Koala.store.StationSearch'
    ],

    fetchNewData: function(field) {
        var newVal = field.getValue();
        var appContext = BasiGX.view.component.Map.guess().appContext;

        var spatialList = field.up().down('[name=spatialsearchlist]');
        var spatialStore = spatialList.getStore();

        var stationList = field.up().down('[name=stationsearchlist]');
        var stationFields = appContext.data.merge.stationSearchFields;
        var stationStore, stationCql;

        var metadataList = field.up().down('[name=metadatasearchlist]');
        var mdStore = metadataList.getStore();
        //Ext.Ajax.abort(spatialStore._lastRequest);
        var mdFields = appContext.data.merge.metadataSearchFields;
        var mdCql = this.getMetadataCql(mdFields, newVal);

        var spatialSearchTitle = field.up().down('[name=spatialsearchtitle]');
        var stationSearchTitle = field.up().down('[name=stationsearchtitle]');
        var metadataSearchTitle = field.up().down('[name=metadatasearchtitle]');

        spatialStore.getProxy().setExtraParam('cql_filter', 'NAME ilike \'%' + newVal + '%\'');
        spatialStore.load();
        spatialSearchTitle.setHidden(false);
        spatialList.setHidden(false);

        mdStore.getProxy().setExtraParam('constraint', mdCql);
        mdStore.load();
        metadataSearchTitle.setHidden(false);
        metadataList.setHidden(false);

        if (stationList) {
            stationStore = stationList.getStore();
            Ext.Ajax.abort(stationStore._lastRequest);
            stationCql = this.getStationCql(stationFields, newVal);
            stationStore.getProxy().setExtraParam('cql_filter', stationCql);
            stationStore.load();
            stationStore._lastRequest = Ext.Ajax.getLatest();
            stationSearchTitle.setHidden(false);
            stationList.setHidden(false);
        }
    },

    onClearIconTap: function(field) {
        var list = field.up().down('[name=spatialsearchlist]');
        var spatialSearchTitle = field.up().down('[name=spatialsearchtitle]');
        var metadataList = field.up().down('[name=metadatasearchlist]');
        var metadataSearchTitle = field.up().down('[name=metadatasearchtitle]');
        var stationList = field.up().down('[name=stationsearchlist]');
        var stationSearchTitle = field.up().down('[name=stationsearchtitle]');

        list.getStore().removeAll();
        metadataList.getStore().removeAll();
        if (stationList) {
            stationList.getStore().removeAll();
            stationSearchTitle.setHidden(true);
        }
        spatialSearchTitle.setHidden(true);
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

    zoomToStation: function(list, index, target, station) {
        var store = list.getStore();
        var map = store.map;
        var view = map.getView();
        var feature = this.getFeatureFromRecord(station);
        var extent = feature.getGeometry().getExtent();
        var menuPanel = this.getView('k-panel-mobilemenu');

        view.fit(extent, {size: map.getSize(), maxZoom: 11});
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

    /**
     * Find a wkt or geometry inside of an grid record and returns a corresponding
     * feature;
     * @param {Koala.model.StationRecord} record A record of the stationsearch
     *                                           grid.
     * @return {ol.Feature} The feature contained in this record.
     */
    getFeatureFromRecord: function(record) {
        var store = record.store;
        var map = store.map;
        var view = map.getView();
        var wkt = record.get('wkt');
        var geom = record.get('geometry');
        var format;
        var feature;

        if (wkt) {
            format = new ol.format.WKT();
            feature = format.readFeature(wkt, {
                dataProjection: 'EPSG:4326',
                featureProjection: map.getView().getProjection()
            });
        } else if (geom) {
            format = new ol.format.GeoJSON({
                geometryName: record.get('geometry_name') || 'the_geom',
                featureProjection: view.getProjection()
            });
            feature = format.readFeature(record.getData());
        }

        return feature;
    },

    getStationCql: function(fields, value) {
        var cql = '';
        Ext.each(fields, function(field, idx, fieldsArray) {

            cql += field + ' ilike \'%' + value + '%\'';
            if (idx < fieldsArray.length-1) {
                cql += ' OR ';
            }
        });
        return cql;
    },

    getMetadataCql: function(fields, value) {
        var cql = '';
        Ext.each(fields, function(field, idx, fieldsArray) {
            cql += field + ' like \'%' + value + '%\'';
            if (idx < fieldsArray.length-1) {
                cql += ' OR ';
            }
        });
        return cql;
    }
});
