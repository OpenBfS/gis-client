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
 * @class Koala.view.form.LayerFilterController
 */
Ext.define('Koala.view.form.LayerFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-layerfilter',

    requires: [
        'Koala.util.Autorefresh',
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Layer'
    ],

    constructor: function() {
        Koala.util.Autorefresh.initialize();
    },

    /**
     * Overwrites all value filters in the second filter array with the ones
     * from the first filter array. Filter arrays must be compatible!
     * @param  {Array} oldFilters filter array from which to copy
     * @param  {Array} newFilters filter array to which to copy
     */
    overwriteValueFilters: function(oldFilters, newFilters) {
        Ext.Array.each(oldFilters, function(filter, idx) {
            if (filter.type === 'value') {
                newFilters[idx] = filter;
            }
        });
    },

    /**
     * This is the handler if we want to update the filters of an
     * existing layer.
     */
    changeFilterForLayer: function() {
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();
        var existingLayer = view.getLayer();
        // view.getMetadata() might be tainted, i.e. changed in place
        var metadata = LayerUtil.getOriginalMetadata(existingLayer);
        var filters = view.getFilters();
        filters = me.updateFiltersFromForm(filters);
        metadata.filters = filters;
        Koala.util.Autorefresh.updateAutorefresh(view, metadata);

        // Create a complete new layer to get its source…
        var newLayer = LayerUtil.layerFromMetadata(metadata);
        // … this is the trick to update the filter but reuse all the
        // utility logic.
        existingLayer.setSource(newLayer.getSource());

        Koala.util.Autorefresh.updateMetadataLegendTree(existingLayer, metadata);
        Koala.util.Autorefresh.deselectThemeTreeItems();
        LayerUtil.repaintLayerFilterIndication();
        view.up('window').close();
    },

    /**
     * This is the actual handler when the 'Add to map' button is clicked. It
     * will create a layer (via Koala.util.Layer#layerFromMetadata) with the
     * currently displayed filters applied and add that layer to the map (via
     * Koala.util.Layer#addOlLayerToMap)
     */
    submitFilter: function() {
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();

        var metadata = view.getMetadata();
        var metadataClone = Ext.clone(metadata);
        var filters = view.getFilters();
        filters = me.updateFiltersFromForm(filters);
        metadata.filters = filters;
        Koala.util.Autorefresh.updateAutorefresh(view, metadata);
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);
        Koala.util.Autorefresh.deselectThemeTreeItems();
        view.up('window').close();
    },

    /**
     * Given the set of original filters (from metadata), this method
     * queries the complete filter form and tries to gather values from
     * its elements. Will return a changed filter where the filter
     * conditions match those of the form.
     *
     * @param {Array<Object>} filters The filters.
     * @return {Array<Object>} The updated filters.
     */
    updateFiltersFromForm: function(filters) {
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var view = me.getView();
        // Iterate over all filters…
        Ext.each(filters, function(filter, idx) {
            // … grab the associated fieldset by attribute
            var selector = '[filterIdx=\'' + idx +'\']';
            var fieldset = view.down(selector);
            if (fieldset) {
                var fields = fieldset.query('field, multiselect');
                var keyVals = {};
                Ext.each(fields, function(field) {
                    var key = field.getName();
                    if (!Ext.Array.contains(view.ignoreFields, key)) {
                        // Request the value as moment object.
                        var val = field.getValue(true);
                        // Transform if we have a 'rodostime'-Filter
                        if (filter.type === 'rodostime' && !moment.isMoment(val)) {
                            val = Koala.util.Date.getUtcMoment(val);
                        } else if (moment.isMoment(val)) {
                            // We have to add hours & minutes, the date field
                            // has precision DAY:
                            val = FilterUtil.setHoursAndMinutes(val, field);
                        }
                        keyVals[key] = val;
                    }
                });
                filters = me.updateFilterValues(filters, idx, keyVals);
            }
        });
        return filters;
    },

    /**
     * This method handles the adding of layers without any filters. It is bound
     * as handler for a button that is only visible when the filter form was
     * created for a layer without filters.
     */
    submitNoFilter: function() {
        var LayerUtil = Koala.util.Layer;
        var view = this.getView();
        var metadata = view.getMetadata();
        var metadataClone = Ext.clone(metadata);
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);
        Koala.util.Autorefresh.deselectThemeTreeItems();
        view.up('window').close();
    },

    /**
     *
     */
    updateFilterValues: function(filters, idx, keyVals) {
        var FilterUtil = Koala.util.Filter;
        var filter = filters[idx];
        var filterType = (filter.type || '').toLowerCase();
        var param = filter.param;
        switch (filterType) {
            case 'timerange':
                var keys = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
                filter.effectivemindatetime = keyVals[keys.startName];
                filter.effectivemaxdatetime = keyVals[keys.endName];
                break;
            case 'pointintime':
            case 'rodostime':
                filter.effectivedatetime = keyVals[param];
                break;
            case 'value':
                filter.effectivevalue = keyVals[param];
                break;
            default:
                Ext.log.warn('Unexpected filter type ' + filterType + ' specified');
        }

        filters[idx] = filter;
        return filters;
    },

    /**
     * Bound as handler for the beforerender event, this method registers the
     * listener to react on any UTC-button changes.
     */
    onBeforeRenderLayerFilterForm: function() {
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.disable();
        });
    },

    /**
     * Bound as handler in the destroy sequence, this method unregisters the
     * listener to react on any UTC-button changes.
     */
    onBeforeDestroyLayerFilterForm: function() {
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.enable();
        });

        //deselect ThemeTreeItems
        Koala.util.Autorefresh.deselectThemeTreeItems();
    },

    /**
     * Checks if any other filter is configured as depending on the changed one.
     * If so, the corresponding combobox is updated with new values according
     * to the configured metadata using the current filter values as context
     * object.
     *
     * @param  {object} field the component which was updated
     */
    onFilterChanged: function(field) {
        var Objects = Koala.util.Object;
        var view = this.getView();
        var filterName = field.config.name;

        var metadata = view.getMetadata();
        var filters = view.getFilters();
        var currentFilters = this.updateFiltersFromForm(filters);
        var context = Objects.arrayToObject(currentFilters, 'param', 'effectivevalue');
        var origFilters = Objects.arrayToMap(metadata.filters, 'param');
        var path = 'layerConfig/olProperties/filterDependencies';
        var depsString = Objects.getPathStrOr(metadata, path, '{}');

        var deps = JSON.parse(depsString);
        deps = Objects.inverse(deps);
        if (deps[filterName]) {
            var store = view.down('combobox[name=' + deps[filterName] + ']').getStore();
            var filter = origFilters[deps[filterName]];
            Koala.util.String.replaceTemplateStringsWithPromise(filter.allowedValues, context)
                .then(function(data) {
                    store.setData(JSON.parse(data));
                });
        }
    }
});
