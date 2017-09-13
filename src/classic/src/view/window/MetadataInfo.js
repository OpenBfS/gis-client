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
 * @class Koala.view.window.MetadataInfo
 */
Ext.define('Koala.view.window.MetadataInfo', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.grid.property.Grid',

        'Koala.view.window.MetadataInfoController',
        'Koala.view.window.MetadataInfoModel'
    ],

    uses: [
        'Koala.model.MetadataRecord'
    ],

    controller: 'k-window-metadatainfo',
    viewModel: {
        type: 'k-window-metadatainfo'
    },

    config: {
        /**
         * @type {Ext.grid.property.Grid}
         */
        propertyGrid: null,

        /**
         * @type {Koala.model.MetadataRecord}
         */
        record: null
    },

    listeners: {
        afterlayout: function() {
            this.el.selectable();
            this.el.select('.x-unselectable').selectable();
        }
    },

    statics: {
        /**
         * A very basic reusable renderer that allows multiple lines inside of
         * a grid cell.
         *
         * @param {object} value The value to render, will often be a string.
         * @return {string} The value wrapped in a `white-space:normal` styled
         *     `<div>`.
         */
        multilineRenderer: function(value) {
            return '<div class=\'koala-multiline\'>' + value +'</div>';
        },

        /**
         * A reusable function that will return `false`.
         *
         * @return {boolean} Always `false`.
         */
        returnFalse: function() {
            return false;
        },

        /**
         * Bound to the celldblclick event, this method will create an alert
         * with the records (rows) name and value.
         *
         * @param {Ext.grid.property.Grid} the property grid.
         * @param {HTMLElement} td The TD element for the cell.
         * @param {Number} cellIndex
         * @param {Ext.data.Model} record
         */
        alertKeyValue: function(propGrid, td, cellIndex, record) {
            Ext.Msg.alert(record.get('name'), record.get('value'));
        },

        /**
         * The keys of the metadata record and their display name. Translated in
         * the locale files.
         */
        fieldNames: {
            fileIdentifier: '',
            abstract: '',
            contact: ''
        }
    },

    /**
     * Initializes the MetadataInfo window.
     */
    initComponent: function() {
        var me = this;
        var staticMe = me.self;
        me.callParent();

        var propertyGrid = Ext.create('Ext.grid.property.Grid', {
            width: 400,
            listeners: {
                beforeedit: staticMe.returnFalse,
                celldblclick: staticMe.alertKeyValue
            },
            source: me.sourceFromRecord(),
            sourceConfig: me.sourceConfigFromRecord()
        });
        me.setPropertyGrid(propertyGrid);
        me.add(propertyGrid);
    },

    /**
     * Transfers the passed #record to an object to be used within the property
     * property grid. Uses #fieldNames for gathering the display values.
     *
     * @return {object} The key value object which we'll display in the property
     *     grid.
     */
    sourceFromRecord: function() {
        var rec = this.getRecord();
        var fieldNames = this.self.fieldNames;
        var source = {};
        Ext.iterate(fieldNames, function(fieldName, dspName) {
            source[dspName] = rec.get(fieldName);
        });
        return source;
    },

    /**
     * Creates a `sourceConfig` to assign our #multilineRenderer to all cells.
     *
     * @return {object} The source config, keyed by the displayName, with an
     *     object that assigns the #multilineRenderer.
     */
    sourceConfigFromRecord: function() {
        var fieldNames = this.self.fieldNames;
        var renderer = this.self.multilineRenderer;
        var sourceCfg = {};
        Ext.iterate(fieldNames, function(fieldName, dspName) {
            sourceCfg[dspName] = {
                renderer: renderer
            };
        });
        return sourceCfg;
    }
});
