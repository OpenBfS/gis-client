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
        var charts = Ext.ComponentQuery.query('d3-chart,d3-barchart');
        Ext.each(charts, function(chart) {
            if (chart.getController && chart.getController()) {
                chart.getController().getChartData();
            }
        });
        var button = Ext.ComponentQuery.query('[name=' + existingLayer.get('name') + '_button]')[0];
        if (button && button.getController) {
            button.getController().updateFeatures();
        }
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
        var filters = Ext.clone(view.getFilters());
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
     * Extract the current filter values.
     *
     * @param {String} paramToExclude a param name to ignore when iterating through the filters
     */
    getFilterValues: function(paramToExclude) {
        var me = this;
        var viewParams = {};
        var cqlFilter = {};
        Ext.each(this.filters, function(other) {
            if (other.param !== paramToExclude) {
                var value = me.down('[name=' + other.param + ']').getValue();
                if (value.toISOString) {
                    value = value.toISOString();
                }
                if (other.encodeInViewParams) {
                    viewParams[other.param] = value;
                } else {
                    cqlFilter[other.param] = value;
                }
            }
        });
        return {
            cql: cqlFilter,
            viewParams: viewParams
        };
    },

    addDependencyClasses: function(filters) {
        var view = this.getView();
        var deps = this.extractDependencies(filters);
        Ext.each(filters, function(filter, idx) {
            if (deps.dependencies[filter.param]) {
                var selector = '[filterIdx=\'' + idx +'\']';
                var fieldset = view.down(selector);
                if (fieldset) {
                    var dependencies = [];
                    Ext.each(deps.dependencies[filter.param], function(dependency) {
                        Ext.each(filters, function(f) {
                            if (f.param === dependency) {
                                if (f.alias) {
                                    dependencies.push(f.alias);
                                } else {
                                    var timeFilter = view.getViewModel().get('timeFilter');
                                    if (dependencies.indexOf(timeFilter) === -1) {
                                        dependencies.push(timeFilter);
                                    }
                                }
                            }
                        });
                    });
                    fieldset.setUserCls('field-label-dependency');
                    fieldset.body.dom.title = view.getViewModel().get('dependencyText') + dependencies.join(', ');
                }
            }
        });
    },

    /**
     * Encodes the CQL and view params filters to be used in a distinct WPS execute request.
     *
     * @param {Object} filters the filter values
     */
    getEncodedFilterValues: function(filters) {
        var params = '';
        if (Object.keys(filters.viewParams).length) {
            var viewParamsString = '';
            Ext.iterate(filters.viewParams, function(key, value) {
                if (viewParamsString !== '') {
                    viewParamsString += ';';
                }
                viewParamsString += key + ':' + value;
            });
            params += ';viewParams=' + encodeURIComponent(viewParamsString);
        }
        if (Object.keys(filters.cql).length) {
            var filterString = '';
            Ext.iterate(filters.cql, function(key, value) {
                if (filterString !== '') {
                    filterString += ' AND ';
                }
                filterString += key + ' = ' + value;
            });
            params += ';filter=' + encodeURIComponent(filterString);
        }
        return params;
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
        Koala.util.Filter.updateTimeRangeDefaultFilters(filters);
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
        var me = this;
        var Objects = Koala.util.Object;
        var view = this.getView();
        var filterName = field.config.fieldLabel;
        if (filterName === undefined && field.xtype === 'numberfield') {
            var FilterUtil = Koala.util.Filter;
            filterName = FilterUtil.getDateFieldLabelFromSpinner(field);
        }

        var metadata = view.getMetadata();
        var filters = view.getFilters();
        var currentFilters = this.updateFiltersFromForm(filters);
        var context = Objects.arrayToObject(currentFilters, 'param', 'effectivevalue');
        var filterParam;
        Ext.each(currentFilters, function(filter) {
            if (filter.type === 'pointintime') {
                context.currentDate = filter.effectivedatetime.toISOString();
                if (view.timeSelectConfig) {
                    view.timeSelectConfig.selectedTime = filter.effectivedatetime.unix() * 1000;
                    view.rerenderChart();
                }
            }
            if (filter.type === 'timerange') {
                context.minDate = filter.effectivemindatetime.toISOString();
                context.maxDate = filter.effectivemaxdatetime.toISOString();
            }
            if (filter.alias === filterName || filter.param === filterName) {
                filterParam = filter.param;
            }
            if (filter.type === 'value') {
                context[filter.param] = context[filter.param] || filter.defaultValue;
            }
        });
        var deps = this.extractDependencies(metadata.filters);

        Ext.iterate(deps.dependencies, function(param, paramDependencies) {
            if (!paramDependencies.includes(filterParam)) {
                return;
            }
            switch ((deps.origFilters[param]).type) {
                case 'pointintime':
                case 'timerange':
                    me.getView().updateTimeFilters();
                    break;
                case 'value':
                    var combo = view.down('combobox[name=' + param + ']');
                    var store = combo.getStore();
                    var filter = deps.origFilters[param];
                    Koala.util.String.replaceTemplateStringsWithPromise(filter.allowedValues, context, undefined, undefined, true)
                        .then(function(data) {
                            store.setData(JSON.parse(data));
                            combo.clearValue();
                        });
                    break;
                default:
                    Ext.toast(deps.origFilters[param].type + ' filters are not supported in filter dependencies.');
                    break;
            }
        });
        if (field.xtype === 'datefield') {
            Koala.util.Filter.revalidatePartnerField(field);
        }
    },

    extractDependencies: function(filters) {
        var Objects = Koala.util.Object;
        var origFilters = Objects.arrayToMap(filters, 'param');
        var dependencies = {};
        var timeParam;
        Ext.each(filters, function(filter) {
            if (filter.type === 'pointintime' || filter.type === 'timerange') {
                timeParam = filter.param;
            }
        });
        Ext.each(filters, function(filter) {
            if (filter.allowedValues && filter.allowedValues.startsWith && filter.allowedValues.startsWith('url:')) {
                var split = filter.allowedValues.split('[[');
                dependencies[filter.param] = [];
                Ext.each(split, function(s) {
                    s = s.split(']]');
                    if (s.length === 2) {
                        dependencies[filter.param].push(s[0]);
                        if (s[0] === 'minDate' || s[0] === 'maxDate' || s[0] === 'currentDate') {
                            dependencies[filter.param].push(timeParam);
                        }
                    }
                });
            }
            if (filter.type === 'pointintime' || filter.type === 'timerange') {
                origFilters[filter.param] = filter;
            }
        });
        return {
            dependencies: dependencies,
            origFilters: origFilters
        };
    }

});
