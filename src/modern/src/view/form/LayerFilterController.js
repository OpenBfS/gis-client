/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
        'Koala.util.Filter',
        'Koala.util.Layer'
    ],

    /**
     * Initializes the LayerFilter.
     */
    initComponent: function(){
        var me = this;
        var view = this.getView();
        var filters = view.getFilters();

        if(!filters || filters.length < 1){
            me.addWithoutFilterBtn();
            return;
        }

        var setFilterButton = Ext.create("Ext.Button", {
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
            var type = (filter.type || "").toLowerCase();
            switch(type){
                case "timerange":
                    me.createTimeRangeFilter(filter, idx);
                    break;
                case "pointintime":
                    me.createPointInTimeFilter(filter, idx);
                    break;
                case "rodos":
                    break;
                case "value":
                    me.createValueFilter(filter, idx);
                    break;
                default:
                    Ext.log.warn("Unexpected filter type: " + filter.type);
                    break;
            }
        });

        // TODO Readd validation
        // view.getForm().isValid();

        var utcBtns = Ext.ComponentQuery.query('radiofield[originalValue=UTC]');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.on('change', me.handleTimereferenceButtonToggled, me);
        });
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

        Ext.each(mobilePanels, function(panel){
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
                            // we have to add hours & minutes, the date field
                            // has precision DAY:
                            val = FilterUtil.addHoursAndMinutes(val, field);
                            val = me.adjustToUtcIfNeeded(val);
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
     * Called during the update of a filter of an existing layer, this
     * method will upodate the metadata of the layer everywhere it might
     * be used.
     *
     * @param {ol.layer.Layer} layer The layer whose metadata (filter)
     *     has changed.
     * @param {Object} metadata The new metadata of the layer.
     */
    updateMetadataLegendTree: function(layer, metadata){
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

        Ext.each(mobilePanels, function(panel){
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
     * Check if the application currently displays local dates, and if so adjust
     * the passed date to UTC since we always store in UTC.
     *
     * @param {Date} userDate A date entered in a filter which may be in local
     *     time.
     * @return {Date} The date which probably has been adjusted to UTC.
     */
    adjustToUtcIfNeeded: function(userDate){
        var mainViewModel = Ext.ComponentQuery.query('app-main')[0]
            .getViewModel();
        if (!mainViewModel.get('useUtc')) {
            return Koala.util.Date.makeUtc(userDate);
        }
        // already UTC
        return userDate;
    },

    /**
     *
     */
    updateFilterValues: function(filters, idx, keyVals) {
        var FilterUtil = Koala.util.Filter;
        var filter = filters[idx];
        var filterType = (filter.type || "").toLowerCase();
        var param = filter.param;
        if (filterType === 'timerange') {
            var keys = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
            filter.effectivemindatetime = keyVals[keys.startName];
            filter.effectivemaxdatetime = keyVals[keys.endName];
        } else if (filterType === 'pointintime') {
            filter.effectivedatetime = keyVals[param];
        } else if (filterType === 'value') {
            filter.effectivevalue = keyVals[param];
        }
        filters[idx] = filter;
        return filters;
    },

    /**
     * Called whenever any UTC button is toggled, this method will adjust the
     * visually relevant (displayed or restricting the calendar) dates to the
     * now active setting; either they wil be transformed to UTC or to the local
     * timezone.
     */
    handleTimereferenceButtonToggled: function(){
        var layerFilterView = this.getView();
        var dateUtil = Koala.util.Date;
        var makeUtc = dateUtil.makeUtc;
        var makeLocal = dateUtil.makeLocal;
        var dateFields = layerFilterView.query('datepicker');

        var switchToUtc = layerFilterView.up('app-main').getViewModel().get('useUtc');
        var converterMethod = switchToUtc ? makeUtc : makeLocal;

        Ext.each(dateFields, function(dateField) {
            // The actual value of the field
            var currentDate = dateField.getValue();
            if (!currentDate) {
                return;
            }
            // Also update the minimum and maximums, as they need to be in sync
            // wrt the UTC/local setting.
            var currentMinValue = dateField.minValue; // no getter in ExtJS
            var currentMaxValue = dateField.maxValue; // no getter in ExtJS

            var accompanyingHourSpinner = dateField.up().down(
                // All that end with the string 'hourspinner', will capture all
                // spinners including those from timerange-filters
                'field[name$="hourspinner"]'
            );

            // The new value of the field
            var newDate;
            var newMinValue = currentMinValue; // to gracefully handle unset min
            var newMaxValue = currentMaxValue; // to gracefully handle unset max

            // Use the determined converter now to change new dates
            newDate = converterMethod(currentDate);
            if (!Ext.isEmpty(currentMinValue)) {
                newMinValue = converterMethod(currentMinValue);
            }
            if (!Ext.isEmpty(currentMaxValue)) {
                newMaxValue = converterMethod(currentMaxValue);
            }

            // Update spinner if any
            if (accompanyingHourSpinner) {
                accompanyingHourSpinner.setValue(newDate.getHours());
            }

            // Actually set the new values for relevant properties
            dateField.setValue(newDate);
            dateField.setMinValue(newMinValue);
            dateField.setMaxValue(newMaxValue);
        });
    },

    /**
     * Bound as handler in the destroy sequence, this method unregisters the
     * listener to react on any UTC-button changes (See also the atual
     * method #handleTimereferenceButtonToggled).
     */
    onBeforeDestroyLayerFilterForm: function(){
        var me = this;
        // var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        var utcBtns = Ext.ComponentQuery.query('radiofield[originalValue=UTC]');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.un('change', me.handleTimereferenceButtonToggled, me);
        });
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
        var mainViewModel = Ext.ComponentQuery.query('app-main')[0]
                .getViewModel();
        var FilterUtil = Koala.util.Filter;

        var minValue;
        if (filter.mindatetimeinstant) {
            // only fill lower boundary when defined
            minValue = Ext.Date.parse(
                filter.mindatetimeinstant,
                filter.mindatetimeformat
            );
        }

        var maxValue;
        if (filter.maxdatetimeinstant) {
            // only fill upper boundary when defined
            maxValue = Ext.Date.parse(
                filter.maxdatetimeinstant,
                filter.maxdatetimeformat
            );

            // Fix for the issue #1068-34
            // Raises the maxDate by one day to avoid the bug with the datefield
            // where maxDate = defaultValue leads to invalid input
            maxValue.setDate(maxValue.getDate() + 1);
        }

        var defaultValue = Ext.Date.parse(
            filter.defaulttimeinstant,
            filter.defaulttimeformat
        );

        var value = filter.effectivedatetime || defaultValue;

        if (!mainViewModel.get('useUtc')) {
            var makeLocal = Koala.util.Date.makeLocal;
            minValue = minValue ? makeLocal(minValue) : undefined;
            maxValue = maxValue ? makeLocal(maxValue) : undefined;
            value = makeLocal(value);
        }

        var minClone = minValue ? Ext.Date.clone(minValue) : undefined;
        var maxClone = maxValue ? Ext.Date.clone(maxValue) : undefined;

        var dateField = Ext.create('Ext.field.DatePicker', {
            type: 'pointintime',
            viewModel: me.getViewModel(),
            bind: {
                label: '{timestampLabel}'
            },
            labelAlign: 'top',
            name: filter.param,
            flex: 1,
            value: Ext.Date.clone(value),
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minClone,
            maxValue: maxClone,
            dateFormat: view.getFormat(),
            listeners: {
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

        hourSpinner.setWidth('50%');
        minuteSpinner.setWidth('50%');

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
            bind: {
                title: '{pointInTimeFilter}'
            },
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
    createTimeRangeFilter: function(filter, idx){
        var me = this;
        var view = this.getView();
        var mainViewModel = Ext.ComponentQuery.query('app-main')[0]
                .getViewModel();
        var FilterUtil = Koala.util.Filter;
        var param = filter.param;

        var names = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
        var startName = names.startName;
        var endName = names.endName;

        var minValue;
        if (filter.mindatetimeinstant) {
            minValue = Ext.Date.parse(
                filter.mindatetimeinstant,
                filter.mindatetimeformat
            );
        }

        var maxValue;
        if (filter.maxdatetimeinstant) {
            maxValue = Ext.Date.parse(
                filter.maxdatetimeinstant,
                filter.maxdatetimeformat
            );

            // Fix for the issue #1068-34
            // Raises the maxDate by one day to avoid the bug with the datefield
            // where maxDate = defaultValue leads to invalid input
            maxValue.setDate(maxValue.getDate() + 1);
        }

        var defaultMinValue = Ext.Date.parse(
            filter.defaultstarttimeinstant,
            filter.defaultstarttimeformat
        );

        var defaultMaxValue = Ext.Date.parse(
            filter.defaultendtimeinstant,
            filter.defaultendtimeformat
        );

        var startValue = filter.effectivemindatetime || defaultMinValue;
        var endValue = filter.effectivemaxdatetime || defaultMaxValue;

        if (!mainViewModel.get('useUtc')) {
            var makeLocal = Koala.util.Date.makeLocal;
            minValue = minValue ? makeLocal(minValue) : undefined;
            maxValue = maxValue ? makeLocal(maxValue) : undefined;
            startValue = makeLocal(startValue);
            endValue = makeLocal(endValue);
        }

        var minClone = minValue ? Ext.Date.clone(minValue) : undefined;
        var maxClone = maxValue ? Ext.Date.clone(maxValue) : undefined;

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
            value: Ext.Date.clone(startValue),
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minClone,
            maxValue: maxClone,
            dateFormat: view.getFormat(),
            listeners: {
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

        minHourSpinner.setWidth('50%');
        minMinuteSpinner.setWidth('50%');

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
            value: Ext.Date.clone(endValue),
            // The configs minValue and maxValue are not existing in the modern
            // datePicker, but the values will be used by our custom validator
            // onChange.
            minValue: minClone,
            maxValue: maxClone,
            dateFormat: view.getFormat(),
            listeners: {
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

        maxHourSpinner.setWidth('50%');
        maxMinuteSpinner.setWidth('50%');

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
            bind: {
                title: '{timeRangeFilter}'
            },
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
        var sharedCfg = {
            labelAlign: 'top',
            name: filter.param,
            label: filter.alias,
            value: filter.effectivevalue || filter.defaultValue,
            emptyText: filter.defaultValue
        };
        if (filter.allowedValues) {
            field = FilterUtil.getComboFromAllowedValues(
                filter.allowedValues,
                filter.allowMultipleSelect
            );
        } else {
            field = {
                xtype: 'textfield'
            };
        }

        field = Ext.apply(field, sharedCfg);

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            viewModel: me.getViewModel(),
            padding: 5,
            filterIdx: idx,
            bind: {
                title: '{valueFilter}'
            },
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
    createRODOSFilter: function(){
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
        var me = this;
        var viewModel = me.getViewModel();
        var minValue = field.minValue;
        var maxValue = field.maxValue;

        // Only proceed if the field is rendered
        if (!field.isRendered()) {
            return;
        }

        var minDateWarnMsg = viewModel.get('minDateWarnMsg');
        var maxDateWarnMsg = viewModel.get('maxDateWarnMsg');
        var dateFormat = viewModel.get('warnMsgDateFormat');
        var readableMinDate = Ext.Date.format(minValue, dateFormat);
        var readableMaxDate = Ext.Date.format(maxValue, dateFormat);

        // Check if the input value is larger than the accepted minimum
        if (newDate < minValue) {
            Ext.toast(Ext.String.format(
                    minDateWarnMsg,
                    readableMinDate
            ));
            field.setValue(oldDate);
            return;
        }

        // Check if the input value is smaller than the accepted maximum
        if (newDate > maxValue) {
            Ext.toast(Ext.String.format(
                    maxDateWarnMsg,
                    readableMaxDate
            ));
            field.setValue(oldDate);
            return;
        }

        // Check if the current time range fits into the accepted range (only
        // needed if we were called from a timerange field)
        if (field.type === 'timerange-min' || field.type === 'timerange-max') {
            var isValid = Koala.util.Filter.validateMaxDurationTimerange
                    .call(field);
            if (Ext.isString(isValid)) {
                Ext.toast(isValid);
                field.setValue(oldDate);
                return;
            }
        }
    },

    addWithoutFilterBtn: function() {
        var me = this;
        var view = me.getView();
        var addWithoutFilterButton = Ext.create("Ext.Button", {
            viewModel: me.getViewModel(),
            bind: {
                text: "{buttonTextNoFilter}"
            },
            handler: "submitNoFilter"
        });
        view.add(addWithoutFilterButton);
    }
});
