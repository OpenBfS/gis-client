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
 * @class Koala.view.form.LayerFilterController
 */
Ext.define('Koala.view.form.LayerFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-layerfilter',

    requires: [
        'Koala.util.Date',
        'Koala.util.Layer'
    ],

    submitFilter: function(){
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();
        var metadata = view.getMetadata();
        var filters = view.getFilters();

        // Iterate over all filters…
        Ext.each(filters, function(filter, idx) {
            // … grab the associated fieldset by attribute
            var selector = "[filterIdx='" + idx +"']";
            var fieldset = view.down(selector);
            if (fieldset) {
                var fields = fieldset.query('field, multiselect');
                var keyVals = {};
                Ext.each(fields, function(field) {
                    var key = field.getName();
                    if (!Ext.Array.contains(view.ignoreFields, key)) {
                        var val = field.getValue();
                        if (Ext.isDate(val)) {
                            val = me.adjustToUtcIfNeeded(val);
                        }
                        keyVals[key] = val;
                    }
                });
                filters = me.updateFilterValues(filters, idx, keyVals);
            }
        });
        metadata.filters = filters;
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.addOlLayerToMap(layer);
        view.up('window').close();
    },

    /**
     * Check if the application currently displays local dates, and if so adjust
     * the passed date to UTC since we always store in UTC.
     *
     * @param {Date} userDate A date entered in a filter which may be in local
     *     time.
     * @return {Date} The date which probably has been adjusted to UTC.
     */
    adjustToUtcIfNeeded: function(userDate){
        if (Koala.Application.isLocal()) {
            return Koala.util.Date.makeUtc(userDate);
        }
        // already UTC
        return userDate;
    },

    /**
     *
     */
    updateFilterValues: function(filters, idx, keyVals) {
        var view = this.getView();
        var filter = filters[idx];
        var filterType = (filter.type || "").toLowerCase();
        var param = filter.param;
        if (filterType === 'timerange') {
            var keys = view.startAndEndFieldnamesFromMetadataParam(param);
            filter.mindatetimeinstant = keyVals[keys.startName];
            filter.maxdatetimeinstant = keyVals[keys.endName];
        } else if (filterType === 'pointintime') {
            filter.timeinstant = keyVals[param];
        } else if (filterType === 'value') {
            filter.value = keyVals[param];
        }
        filters[idx] = filter;
        return filters;
    },

    /**
     *
     */
    handleTimereferenceButtonToggled: function(){
        var layerFilterView = this.getView();
        var dateFields = layerFilterView.query('datefield');

        var switchToUtc = Koala.Application.isUtc();

        Ext.each(dateFields, function(dateField) {
            var currentDate = dateField.getValue();
            if (!currentDate) {
                return;
            }
            var accompanyingHourSpinner = dateField.up().down(
                    // all that end with the string 'hourspinner', will capture
                    // all spinners including those from timerange-filters
                    'field[name$="hourspinner"]'
                );
            var newDate;
            if (switchToUtc) {
                newDate = Koala.util.Date.makeUtc(currentDate);
            } else {
                newDate = Koala.util.Date.makeLocal(currentDate);
            }
            if (accompanyingHourSpinner) {
                accompanyingHourSpinner.setValue(newDate.getHours());
            }
            dateField.setValue(newDate);
        });
    },

    /**
     *
     */
    onBeforeRenderLayerFilterForm: function(){
        var me = this;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.on('toggle', me.handleTimereferenceButtonToggled, me);
        });
    },

    /**
     *
     */
    onBeforeDestroyLayerFilterForm: function(){
        var me = this;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.un('toggle', me.handleTimereferenceButtonToggled, me);
        });
    }
});
