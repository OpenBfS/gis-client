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
 * @class Koala.view.form.LayerFilter
 */
Ext.define("Koala.view.form.LayerFilter", {
    extend: "Ext.form.Panel",
    xtype: "k-form-layerfilter",

    requires: [
        "Ext.form.field.Date",
        "Ext.form.ComboBox",
        "Ext.ux.form.MultiSelect",

        "Koala.util.Date",
        "Koala.util.Duration",
        "Koala.util.Filter",

        "Koala.view.form.LayerFilterController",
        "Koala.view.form.LayerFilterModel"
    ],

    controller: "k-form-layerfilter",
    viewModel: {
        type: "k-form-layerfilter"
    },
    layout: "anchor",
    defaults: {
        anchor: "100%"
    },
    padding: 5,

    ignoreFields: [
        "minutespinner",
        "hourspinner",
        "minminutespinner",
        "minhourspinner",
        "maxminutespinner",
        "maxhourspinner"
    ],

    listeners: {
        beforerender: "onBeforeRenderLayerFilterForm",
        beforedestroy: "onBeforeDestroyLayerFilterForm"
    },

    config: {
        metadata: null,
        filters: null,
        format: null
    },

    /**
     * Initializes the LayerFilter.
     */
    initComponent: function(){
        var me = this;
        me.callParent();

        var filters = me.getFilters();

        if(!filters || filters.length < 1){
            me.addWithoutFilterBtn();
            return;
        }

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

        var submitButton = Ext.create("Ext.button.Button", {
            bind: {
                text: "{buttonText}"
            },
            handler: "submitFilter",
            formBind: true
        });
        me.add(submitButton);
        me.getForm().isValid();

    },

    addWithoutFilterBtn: function(){
        var addWithoutFilterButton = Ext.create("Ext.button.Button", {
            bind: {
                text: "{buttonTextNoFilter}"
            },
            handler: "submitNoFilter"
        });
        this.add(addWithoutFilterButton);
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
        var FilterUtil = Koala.util.Filter;
        var format = Koala.util.Date.ISO_FORMAT;

        var value = Ext.Date.parse(
                filter.defaulttimeinstant, filter.defaulttimeformat
            );

        var minValue;
        if (filter.mindatetimeinstant) {
            // only fill lower boundary when defined
            minValue = Ext.Date.parse(
                filter.mindatetimeinstant, filter.mindatetimeformat
            );
        }

        var maxValue;
        if (filter.maxdatetimeinstant) {
            // only fill upper boundary when defined
            maxValue = Ext.Date.parse(
                filter.maxdatetimeinstant, filter.maxdatetimeformat
            );

            // Fix for the issue #1068-34
            // Raises the maxDate by one day to avoid the bug with the datefield
            // where maxDate = defaultValue leads to invalid input
            maxValue.setDate(maxValue.getDate() + 1);
        }

        if (Koala.Application.isLocal()) {
            var makeLocal = Koala.util.Date.makeLocal;
            value = makeLocal(value);
            minValue = minValue ? makeLocal(minValue) : undefined;
            maxValue = maxValue ? makeLocal(maxValue) : undefined;
        }

        var dateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: "{timestampLabel}"
            },
            editable: false,
            labelWidth: 70,
            name: filter.param,
            flex: 1,
            value: value,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: format
        });

        var hourSpinner = FilterUtil.getSpinner(
            filter, "hours", "hourspinner", value
        );
        var minuteSpinner = FilterUtil.getSpinner(
            filter, "minutes", "minutespinner", value
        );

        var container = Ext.create("Ext.form.FieldContainer", {
            name: "pointintimecontainer",
            anchor: "100%",
            layout: "hbox",
            items: [dateField, hourSpinner, minuteSpinner]
        });

        var fieldSet = Ext.create("Ext.form.FieldSet", {
            padding: 5,
            layout: "anchor",
            filterIdx: idx,
            bind: {
                title: "{pointInTimeFilter}"
            },
            items: [container]
        });
        me.add(fieldSet);
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
     * Creates and adds a timerange filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type timerange.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createTimeRangeFilter: function(filter, idx){
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var format = Koala.util.Date.ISO_FORMAT;
        var param = filter.param;

        var names = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
        var startName = names.startName;
        var endName = names.endName;

        var minValue = Ext.Date.parse(
            filter.mindatetimeinstant,
            filter.mindatetimeformat
        );
        var maxValue = Ext.Date.parse(
            filter.maxdatetimeinstant,
            filter.maxdatetimeformat
        );
        var defaultMinValue = Ext.Date.parse(
            filter.defaultstarttimeinstant,
            filter.defaultstarttimeformat
        );
        var defaultMaxValue = Ext.Date.parse(
            filter.defaultendtimeinstant,
            filter.defaultendtimeformat
        );

        // Fix for the issue #1068-34
        // Raises the maxDate by one day to avoid the bug with the datefield
        // where maxDate = defaultValue leads to invalid input
        maxValue.setDate(maxValue.getDate() + 1);


        if (Koala.Application.isLocal()) {
            var makeLocal = Koala.util.Date.makeLocal;
            minValue = makeLocal(minValue);
            maxValue = makeLocal(maxValue);
            defaultMinValue = makeLocal(defaultMinValue);
            defaultMaxValue = makeLocal(defaultMaxValue);
        }

        // --- MINIMUM ---
        var minDateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: "{startLabel}"
            },
            name: startName,
            editable: false,
            labelWidth: 70,
            flex: 1,
            value: defaultMinValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: format,
            validator: FilterUtil.validateMaxDurationTimerange,
            msgTarget: "under",
            listeners: {
                validitychange: FilterUtil.revalidatePartnerField
            }
        });
        var minHourSpinner = FilterUtil.getSpinner(
            filter, "hours", "minhourspinner", defaultMinValue
        );
        var minMinuteSpinner = FilterUtil.getSpinner(
            filter, "minutes", "minminutespinner", defaultMinValue
        );
        var minContainer = Ext.create("Ext.form.FieldContainer", {
            name: "mincontainer",
            anchor: "100%",
            layout: "hbox",
            items: [minDateField, minHourSpinner, minMinuteSpinner]
        });

        // --- MAXIMUM ---
        var maxDateField = Ext.create("Ext.form.field.Date", {
            name: endName,
            editable: false,
            bind: {
                fieldLabel: "{endLabel}"
            },
            labelWidth: 70,
            flex: 1,
            value: defaultMaxValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: format,
            validator: FilterUtil.validateMaxDurationTimerange,
            msgTarget: 'under',
            listeners: {
                validitychange: FilterUtil.revalidatePartnerField
            }
        });
        var maxHourSpinner = FilterUtil.getSpinner(
            filter, "hours", "maxhourspinner", defaultMaxValue
        );
        var maxMinuteSpinner = FilterUtil.getSpinner(
            filter, "minutes", "maxminutespinner", defaultMaxValue
        );

        var maxContainer = Ext.create("Ext.form.FieldContainer", {
            name: "maxcontainer",
            anchor: "100%",
            layout: "hbox",
            items: [maxDateField, maxHourSpinner, maxMinuteSpinner]
        });

        var fieldSet = Ext.create("Ext.form.FieldSet", {
            padding: 5,
            layout: "anchor",
            filter: filter,
            filterIdx: idx,
            bind: {
                title: "{timeRangeFilter}"
            },
            items: [minContainer, maxContainer]
        });
        me.add(fieldSet);
    },

    /**
     * Creates and adds a value filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type `value`.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createValueFilter: function(filter, idx) {
        var FilterUtil = Koala.util.Filter;
        var field = null;
        var sharedCfg = {
            labelWidth: 70,
            name: filter.param,
            fieldLabel: filter.alias,
            value: filter.value || filter.defaultValue,
            emptyText: filter.defaultValue
        };
        if (filter.allowedValues) {
            field = FilterUtil.getComboFromAllowedValues(
                filter.allowedValues,
                filter.allowMultipleSelect
            );
        } else {
            field = {
                xtype: "textfield"
            };
        }

        field = Ext.apply(field, sharedCfg);

        var fieldSet = Ext.create("Ext.form.FieldSet", {
            padding: 5,
            defaults: {
                anchor: "100%"
            },
            layout: "anchor",
            filterIdx: idx,
            bind: {
                title: "{valueFilter}"
            },
            items: field
        });
        this.add(fieldSet);
    }
});
