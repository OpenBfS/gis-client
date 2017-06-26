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
        'Ext.Toast',
        'Ext.field.Select',
        'Ext.dataview.List',

        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Layer'
    ],

    /**
     * Initializes the LayerFilter.
     */
    initComponent: function() {
        var me = this;
        var view = this.getView();
        var filters = view.getFilters();

        if (!filters || filters.length < 1) {
            me.addWithoutFilterBtn();
            return;
        }

        var setFilterButton = Ext.create('Ext.Button', {
            viewModel: me.getViewModel(),
            bind: {
                text: view.getLayer() ?
                    '{buttonTextChangeFilter}' :
                    '{buttonText}'
            },
            handler: view.getLayer() ?
                'changeFilterForLayer' :
                'submitFilter',
            margin: '0 20px',
            formBind: true
        });

        view.add(setFilterButton);

        Ext.each(filters, function(filter, idx) {
            var type = (filter.type || '').toLowerCase();
            switch (type) {
                case 'timerange':
                    me.createTimeRangeFilter(filter, idx);
                    break;
                case 'pointintime':
                    me.createPointInTimeFilter(filter, idx);
                    break;
                case 'rodostime':
                case 'value':
                    me.createValueFilter(filter, idx);
                    break;
                default:
                    Ext.log.warn('Unexpected filter type: ' + filter.type);
                    break;
            }
        });

        // TODO Readd validation
        // view.getForm().isValid();
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
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);

        me.deselectThemeTreeItems();

        var mobilePanels = view.up('app-main').query('k-panel-mobilepanel');

        Ext.each(mobilePanels, function(panel) {
            panel.hide();
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

        // Create a complete new layer to get its source…
        var newLayer = LayerUtil.layerFromMetadata(metadata);
        // … this is the trick to update the filter but reuse all the
        // utility logic.
        existingLayer.setSource(newLayer.getSource());

        me.updateMetadataLegendTree(existingLayer, metadata);
        me.deselectThemeTreeItems();
        LayerUtil.repaintLayerFilterIndication();

        var mobilePanels = view.up('app-main').query('k-panel-mobilepanel');

        Ext.each(mobilePanels, function(panel) {
            panel.hide();
        });
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
                var fields = fieldset.query('field, list');
                var keyVals = {};

                Ext.each(fields, function(field) {
                    var key;
                    if (field instanceof Ext.dataview.List) {
                        var selections = field.getSelections();
                        // The list component has no property name and therefore
                        // no getter.
                        key = field.name;
                        keyVals[key] = [];
                        var valField = FilterUtil.COMBO_VAL_FIELD;
                        Ext.each(selections, function(selection) {
                            keyVals[key].push(selection.get(valField));
                        });
                    } else {
                        key = field.getName();
                        if (!Ext.Array.contains(view.ignoreFields, key)) {
                            var val = field.getValue(true);
                            if (filter.type === 'rodostime' && !moment.isMoment(val)) {
                                val = Koala.util.Date.getUtcMoment(val);
                            } else if (moment.isMoment(val)) {
                                // we have to add hours & minutes, the date field
                                // has precision DAY:
                                val = FilterUtil.setHoursAndMinutes(val, field);
                            }
                            keyVals[key] = val;
                        }
                    }
                });
                filters = me.updateFilterValues(filters, idx, keyVals);
            }
        });

        return filters;
    },

    /**
     * Called during the update of a filter of an existing layer, this
     * method will upodate the metadata of the layer everywhere it might
     * be used.
     *
     * @param {ol.layer.Layer} layer The layer whose metadata (filter)
     *     has changed.
     * @param {Object} metadata The new metadata of the layer.
     */
    updateMetadataLegendTree: function(layer, metadata) {
        layer.metadata = metadata;
        // find all legendpanels:
        var legends = Ext.ComponentQuery.query('k-panel-routing-legendtree');
        Ext.each(legends, function(legend) {
            // find the correct record for the given layer
            legend.getStore().each(function(rec) {
                var layerInTree = rec.getOlLayer && rec.getOlLayer();
                if (layerInTree && layerInTree === layer) {
                    rec.set('metadata', metadata);
                    layerInTree.metadata = metadata;
                }
            });
        });
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
        var metadataClone = Ext.clone();
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.setOriginalMetadata(layer, metadataClone);
        LayerUtil.addOlLayerToMap(layer);
        this.deselectThemeTreeItems();

        var mobilePanels = view.up('app-main').query('k-panel-mobilepanel');

        Ext.each(mobilePanels, function(panel) {
            panel.hide();
        });
    },

    /**
     * Unselects all items after a layer was added to the map.
     */
    deselectThemeTreeItems: function() {
        var tree = Ext.ComponentQuery.query('k-panel-themetree')[0];
        var treeSelModel = tree && tree.getSelectionModel();
        var selection = treeSelModel && treeSelModel.getSelection();
        if (!Ext.isEmpty(selection)) {
            treeSelModel.deselectAll();
        }
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

        }

        filters[idx] = filter;
        return filters;
    },

    /**
     * Creates and adds a point in time filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type
     *     `pointintime`.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createPointInTimeFilter: function(filter, idx) {
        var me = this;
        var view = this.getView();
        var FilterUtil = Koala.util.Filter;

        var minValue;
        if (filter.mindatetimeinstant) {
            // only fill lower boundary when defined
            minValue = Koala.util.Date.getUtcMoment(
                filter.mindatetimeinstant
            );
        }

        var maxValue;
        if (filter.maxdatetimeinstant) {
            // only fill upper boundary when defined
            maxValue = Koala.util.Date.getUtcMoment(
                filter.maxdatetimeinstant
            );
        }

        var defaultValue = Koala.util.Date.getUtcMoment(
            filter.defaulttimeinstant
        );

        var value = filter.effectivedatetime || defaultValue;

        minValue = Koala.util.Date.getTimeReferenceAwareMomentDate(minValue);
        maxValue = Koala.util.Date.getTimeReferenceAwareMomentDate(maxValue);
        value = Koala.util.Date.getTimeReferenceAwareMomentDate(value);

        var dateField = Ext.create('Ext.field.DatePicker', {
            type: 'pointintime',
            viewModel: me.getViewModel(),
            bind: {
                label: '{timestampLabel}'
            },
            labelAlign: 'top',
            name: filter.param,
            flex: 1,
            value: value,
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minValue,
            maxValue: maxValue,
            dateFormat: view.getFormat(),
            listeners: {
                painted: me.onDatePickerPainted,
                change: me.validateDatePickerChange,
                scope: me
            }
        });

        var hourSpinner = FilterUtil.getSpinner(
            filter, 'hours', 'hourspinner', value
        );
        var minuteSpinner = FilterUtil.getSpinner(
            filter, 'minutes', 'minutespinner', value
        );

        hourSpinner.width = '50%';
        minuteSpinner.width = '50%';

        var timeContainer = {
            xtype: 'container',
            layout: 'hbox',
            items: [hourSpinner, minuteSpinner]
        };

        var container = Ext.create('Ext.Container', {
            name: 'pointintimecontainer',
            items: [dateField, timeContainer]
        });

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            viewModel: me.getViewModel(),
            padding: 5,
            filterIdx: idx,
            items: [container]
        });
        view.add(fieldSet);
    },

    /**
     * Creates and adds a timerange filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type timerange.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createTimeRangeFilter: function(filter, idx) {
        var me = this;
        var view = this.getView();
        var FilterUtil = Koala.util.Filter;
        var param = filter.param;

        var names = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
        var startName = names.startName;
        var endName = names.endName;

        var minValue;
        if (filter.mindatetimeinstant) {
            minValue = Koala.util.Date.getUtcMoment(
                filter.mindatetimeinstant
            );
        }

        var maxValue;
        if (filter.maxdatetimeinstant) {
            maxValue = Koala.util.Date.getUtcMoment(
                filter.maxdatetimeinstant
            );
        }

        var defaultMinValue = Koala.util.Date.getUtcMoment(
            filter.defaultstarttimeinstant
        );

        var defaultMaxValue = Koala.util.Date.getUtcMoment(
            filter.defaultendtimeinstant
        );

        var startValue = filter.effectivemindatetime || defaultMinValue;
        var endValue = filter.effectivemaxdatetime || defaultMaxValue;

        minValue = Koala.util.Date.getTimeReferenceAwareMomentDate(minValue);
        maxValue = Koala.util.Date.getTimeReferenceAwareMomentDate(maxValue);
        startValue = Koala.util.Date.getTimeReferenceAwareMomentDate(startValue);
        endValue = Koala.util.Date.getTimeReferenceAwareMomentDate(endValue);

        // --- MINIMUM ---
        var minDateField = Ext.create('Ext.field.DatePicker', {
            type: 'timerange-min',
            viewModel: me.getViewModel(),
            bind: {
                label: '{startLabel}'
            },
            labelAlign: 'top',
            name: startName,
            flex: 1,
            value: startValue,
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minValue,
            maxValue: maxValue,
            dateFormat: view.getFormat(),
            listeners: {
                painted: me.onDatePickerPainted,
                change: me.validateDatePickerChange,
                scope: me
            }
        });
        var minHourSpinner = FilterUtil.getSpinner(
            filter, 'hours', 'minhourspinner', startValue
        );
        var minMinuteSpinner = FilterUtil.getSpinner(
            filter, 'minutes', 'minminutespinner', startValue
        );

        minHourSpinner.width = '50%';
        minMinuteSpinner.width = '50%';

        var minTimeContainer = {
            xtype: 'container',
            layout: 'hbox',
            items: [minHourSpinner, minMinuteSpinner]
        };

        var minContainer = Ext.create('Ext.Container', {
            name: 'mintimecontainer',
            items: [minDateField, minTimeContainer]
        });

        // --- MAXIMUM ---
        var maxDateField = Ext.create('Ext.field.DatePicker', {
            type: 'timerange-max',
            viewModel: me.getViewModel(),
            bind: {
                label: '{endLabel}'
            },
            labelAlign: 'top',
            name: endName,
            flex: 1,
            value: endValue,
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minValue,
            maxValue: maxValue,
            dateFormat: view.getFormat(),
            listeners: {
                painted: me.onDatePickerPainted,
                change: me.validateDatePickerChange,
                scope: me
            }
        });
        var maxHourSpinner = FilterUtil.getSpinner(
            filter, 'hours', 'maxhourspinner', endValue
        );
        var maxMinuteSpinner = FilterUtil.getSpinner(
            filter, 'minutes', 'maxminutespinner', endValue
        );

        maxHourSpinner.width = '50%';
        maxMinuteSpinner.width = '50%';

        var maxTimeContainer = {
            xtype: 'container',
            layout: 'hbox',
            items: [maxHourSpinner, maxMinuteSpinner]
        };

        var maxContainer = Ext.create('Ext.Container', {
            name: 'maxtimecontainer',
            items: [maxDateField, maxTimeContainer]
        });

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            viewModel: me.getViewModel(),
            padding: 5,
            filter: filter,
            filterIdx: idx,
            items: [minContainer, maxContainer]
        });
        view.add(fieldSet);
    },

    /**
     * Creates and adds a value filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type `value`.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createValueFilter: function(filter, idx) {
        var me = this;
        var view = this.getView();
        var FilterUtil = Koala.util.Filter;
        var field = null;
        var value;
        if (filter.type === 'rodostime' &&
                moment.isMoment(filter.effectivedatetime)) {
            value = filter.effectivedatetime.format();
        } else {
            value = filter.effectivevalue || filter.defaultValue;
        }
        var sharedCfg = {
            labelAlign: 'top',
            name: filter.param,
            label: filter.alias || filter.param,
            value: value,
            emptyText: filter.defaultValue
        };

        if (filter.allowedValues) {
            field = FilterUtil.getComboFromFilter(filter);
        } else {
            field = {
                xtype: 'textfield'
            };
        }

        field = Ext.apply(field, sharedCfg);

        if (field.xtype === 'list') {
            // Set the label
            field.items[0].label = field.label;
            // Set the default values and enforce selection
            field.listeners = {
                painted: me.selectEffectiveValues,
                selectionchange: me.forceListSelection
            };
        }

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            viewModel: me.getViewModel(),
            padding: 5,
            filterIdx: idx,
            items: field
        });

        view.add(fieldSet);
    },

    /**
     * Creates and adds a rodos filter at the specified index. Currently not
     * doing anything.
     *
     * // TODO specify and implement
     *
     * @param {Object} filter A filter specification object of type rodos.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createRODOSFilter: function() {
    },

    /**
     * Selects the effective values of a list in the representing view.
     *
     * @param {Ext.dom.Element} element The list element this listener is
     *                                  bound to.
     */
    selectEffectiveValues: function(element) {
        var list = element.component;
        var listStore = list.getStore();
        var val = list.value;
        var values;
        if (Ext.isString(val)) {
            values = val.split(',');
        } else if (Ext.isArray(val)) {
            values = val;
        } else {
            values = [val];
        }
        var valField = Koala.util.Filter.COMBO_VAL_FIELD;
        var records = [];

        listStore.each(function(record) {
            Ext.each(values, function(value) {
                if (record.get(valField) === value) {
                    records.push(record);
                }
            });
        });

        list.select(records);
    },

    /**
     * Forces at least a single active selection in a list component.
     *
     * @param {Ext.dataview.List} list The list component this listener is
     *                                 bound to.
     * @param {Ext.data.Model} record The record that selection has been
     *                                changed.
     */
    forceListSelection: function(list, record) {
        var selectionCnt = list.getSelectionCount();
        if (selectionCnt < 1) {
            list.select(record);
        }
    },

    /**
     * Called whenever a datepickerfield is painted to validate the initial
     * values.
     *
     * @method onDatePickerPainted
     * @param {Ext.Element} element The passed element on `painted` event.
     */
    onDatePickerPainted: function(element) {
        var me = this;
        var field = element.component;
        var newValue = field.getValue(true);

        me.validateDatePickerChange(field, newValue);
    },

    /**
     * Validates the user input on a datefield picker. If the input is invalid,
     * it resets the value to the previous (and valid) value and shows a simple
     * toast with an warn message.
     *
     * @param {Ext.field.DatePicker} field The datefield picker this validator
     *                                     is bound to.
     * @param {Date} newDate The new date.
     * @param {Date} oldDate The old date.
     */
    validateDatePickerChange: function(field, newDate, oldDate) {
        // Only proceed if the field is rendered
        if (!field.isRendered()) {
            return;
        }

        var me = this;
        var viewModel = me.getViewModel();
        var minValue = field.getMinValue(true);
        var maxValue = field.getMaxValue(true);
        newDate = field.getValue(true);

        var minDateWarnMsg = viewModel.get('minDateWarnMsg');
        var maxDateWarnMsg = viewModel.get('maxDateWarnMsg');
        var readableMinDate = Koala.util.Date.getFormattedDate(minValue);
        var readableMaxDate = Koala.util.Date.getFormattedDate(maxValue);

        // Check if the input value is larger than the accepted minimum
        if (newDate.isBefore(minValue)) {
            Ext.toast(Ext.String.format(
                minDateWarnMsg,
                readableMinDate
            ), 2000);
            field.setValue(oldDate);
            return;
        }

        // Check if the input value is smaller than the accepted maximum
        if (newDate.isAfter(maxValue)) {
            Ext.toast(Ext.String.format(
                maxDateWarnMsg,
                readableMaxDate
            ), 2000);
            field.setValue(oldDate);
            return;
        }

        // Check if the current time range fits into the accepted range (only
        // needed if we were called from a timerange field)
        if (field.type === 'timerange-min' || field.type === 'timerange-max') {
            var isValid = Koala.util.Filter.validateMaxDurationTimerange
                .call(field);
            if (Ext.isString(isValid)) {
                Ext.toast(isValid, 2000);
                // TODO If an invalid oldDate is set in the metadata of the layer
                // setting it back could lead to an loop of infinity here.
                // field.setValue(oldDate);
                return;
            }
        }
    },

    addWithoutFilterBtn: function() {
        var me = this;
        var view = me.getView();
        var addWithoutFilterButton = Ext.create('Ext.Button', {
            viewModel: me.getViewModel(),
            bind: {
                text: '{buttonTextNoFilter}'
            },
            handler: 'submitNoFilter'
        });
        view.add(addWithoutFilterButton);
    }
});
