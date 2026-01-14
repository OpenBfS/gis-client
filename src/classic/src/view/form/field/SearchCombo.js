/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.field.SearchCombo
 */
Ext.define('Koala.view.form.field.SearchCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'k-form-field-searchcombo',

    requires: [
        'Ext.window.Toast',
        'Ext.util.KeyNav'
    ],

    controller: 'k-form-field-searchcombo',
    viewModel: {
        type: 'k-form-field-searchcombo'
    },

    store: [],
    labelWidth: null,
    minChars: 3,
    queryDelay: 300,
    hideTrigger: true,

    bind: {
        emptyText: '{emptyText}',
        tooltip: '{tooltip}'
    },

    listeners: {
        change: function(combo, newValue) {
            try {
                if (newValue.length < this.minChars) {
                    return false;
                }
            } catch (e) {
                Ext.log.error(e);
                // if property length is null
                return false;
            }

            // TODO this will need to be changed once we have more than one
            //      map/panel/composition
            var multiPanel = Ext.ComponentQuery.query('k-panel-multisearch')[0];
            if (newValue) {
                if (multiPanel) {
                    multiPanel.show(combo);
                }
                this.doSpatialSearch(newValue);
                if (multiPanel.down('k-grid-stationsearch')) {
                    this.doStationSearch(newValue);
                }
                this.doMetadataSearch(newValue);
            } else {
                if (multiPanel) {
                    multiPanel.getEl().slideOut('t', {
                        duration: 250,
                        callback: function() {
                            multiPanel.hide();
                        }
                    });
                }
            }
        },
        boxready: function(combo) {
            combo.nav = Ext.create('Ext.util.KeyNav', combo.el, {
                esc: function() {
                    combo.clearValue();
                },
                scope: combo
            });
        }
    },

    setTooltip: function() {
        var el = this.getEl();
        var viewModel = this.getViewModel();
        Ext.QuickTips.register({
            target: el,
            text: viewModel.get('tooltip')
        });
    },

    doSpatialSearch: function(value) {
        var spatialGrid = Ext.ComponentQuery.query('k-grid-spatialsearch')[0];
        var spatialStore = spatialGrid.getStore();

        spatialGrid.show();
        Ext.Ajax.abort(spatialStore._lastRequest);
        spatialStore.getProxy().setExtraParam('q', value);
        spatialStore.getProxy().setExtraParam('osm_tag', null);
        // assume PLZ-search
        if (parseInt(value,10).toString()===value) {
            spatialStore.getProxy().setExtraParam('osm_tag', 'boundary');
        }
        spatialStore.load();
        spatialStore._lastRequest = Ext.Ajax.getLatest();

    },

    doStationSearch: function(value) {
        var stationGrid = Ext.ComponentQuery.query('k-grid-stationsearch')[0];
        var stationStore = stationGrid.getStore();

        stationGrid.show();
        Ext.Ajax.abort(stationStore._lastRequest);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var fields = appContext.data.merge.stationSearchFields;
        var cql = this.getStationCql(fields, value);

        stationStore.getProxy().setExtraParam('cql_filter', cql);
        stationStore.load();
        stationStore._lastRequest = Ext.Ajax.getLatest();
    },

    doMetadataSearch: function(value) {

        var metadataGrid = Ext.ComponentQuery.query('k-grid-metadatasearch')[0];
        var metadataStore = metadataGrid.getStore();

        metadataGrid.show();
        Ext.Ajax.abort(metadataStore._lastRequest);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var fields = appContext.data.merge.metadataSearchFields;
        var cql = this.getMetadataCql(fields, value);

        metadataStore.getProxy().setExtraParam('constraint', cql);
        metadataStore.load();
        metadataStore._lastRequest = Ext.Ajax.getLatest();
    },

    /**
     *
     */
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

    /**
     *
     */
    getMetadataCql: function(fields, value) {
        var cql = '';
        Ext.each(fields, function(field, idx, fieldsArray) {

            cql += field + ' like \'*' + value + '*\'';
            if (idx < fieldsArray.length-1) {
                cql += ' OR ';
            }
        });
        return cql;
    }

});
