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
        format: null,
        /**
         * This config determines if we are to add a new layer with folter on
         * form submission or if we need to update an existing one.
         *
         * @type {ol.layer.Layer}
         */
        layer: null
    },

    /**
     * Initializes the LayerFilter.
     */
    initComponent: function() {
        var me = this;
        me.callParent();

        var filters = me.getFilters();

        if (!filters || filters.length < 1) {
            me.addWithoutFilterBtn();
            return;
        }

        Ext.each(filters, function(filter, idx) {
            var type = (filter.type || "").toLowerCase();
            switch (type) {
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

        var submitButton = me.getSubmitButton();
        me.add(submitButton);
        me.getForm().isValid();

    },

    /**
     * Returns a button for submitting the filter and handling the submssion via
     * correctly bound handlers. If thsi panel was cosntructed with a `layer`,
     * it will update the filter of that layer. If it was created without a
     * layer, the handler will create one and add it to the map.
     *
     * @return {Ext.button.Button} The button to submit the form, will either
     *     add anew layer with an appropriate filter or update the filter of
     *     an existing layer.
     */
    getSubmitButton: function() {
        var handler;
        var textBind;
        if (!this.getLayer()) {
            handler = "submitFilter";
            textBind = "{buttonText}";
        } else {
            handler = "changeFilterForLayer";
            textBind = "{buttonTextChangeFilter}";
        }
        return Ext.create("Ext.button.Button", {
            formBind: true,
            handler: handler,
            bind: {
                text: textBind
            }
        });
    },

    addWithoutFilterBtn: function() {
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

        var appIsLocal = Koala.Application.isLocal();
        if (appIsLocal) {
            var makeLocal = Koala.util.Date.makeLocal;
            minValue = minValue ? makeLocal(minValue) : undefined;
            maxValue = maxValue ? makeLocal(maxValue) : undefined;
            value = makeLocal(value);
        }

        var minClone = minValue ? Ext.Date.clone(minValue) : undefined;
        var maxClone = maxValue ? Ext.Date.clone(maxValue) : undefined;

        var dateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: "{timestampLabel}"
            },
            editable: false,
            labelWidth: 70,
            name: filter.param,
            flex: 1,
            value: Ext.Date.clone(value),
            minValue: minClone,
            maxValue: maxClone,
            validator: FilterUtil.makeDateValidator(
                minClone, maxClone, appIsLocal
            ),
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
    createRODOSFilter: function() {
    },

    /**
     * Creates and adds a timerange filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type timerange.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    createTimeRangeFilter: function(filter, idx) {
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var format = Koala.util.Date.ISO_FORMAT;
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

        var appIsLocal = Koala.Application.isLocal();
        if (appIsLocal) {
            var makeLocal = Koala.util.Date.makeLocal;
            minValue = minValue ? makeLocal(minValue) : undefined;
            maxValue = maxValue ? makeLocal(maxValue) : undefined;
            startValue = makeLocal(startValue);
            endValue = makeLocal(endValue);
        }

        var minClone = minValue ? Ext.Date.clone(minValue) : undefined;
        var maxClone = maxValue ? Ext.Date.clone(maxValue) : undefined;

        var minMaxValidator = FilterUtil.makeDateValidator(
            minClone, maxClone, appIsLocal
        );
        var minMaxDurationAndOrderValidator = function() {
            var ok = minMaxValidator.call(this);
            if (ok === true) {
                ok = FilterUtil.validateMaxDurationTimerange.call(this);
            }
            return ok;
        };

        // --- MINIMUM ---
        var minDateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: "{startLabel}"
            },
            name: startName,
            editable: false,
            labelWidth: 70,
            flex: 1,
            value: Ext.Date.clone(startValue),
            minValue: minClone,
            maxValue: maxClone,
            format: me.getFormat(),
            submitFormat: format,
            validator: minMaxDurationAndOrderValidator,
            msgTarget: "under",
            listeners: {
                validitychange: FilterUtil.revalidatePartnerField
            }
        });
        var minHourSpinner = FilterUtil.getSpinner(
            filter, "hours", "minhourspinner", startValue
        );
        var minMinuteSpinner = FilterUtil.getSpinner(
            filter, "minutes", "minminutespinner", startValue
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
            value: Ext.Date.clone(endValue),
            minValue: minClone,
            maxValue: maxClone,
            format: me.getFormat(),
            submitFormat: format,
            validator: minMaxDurationAndOrderValidator,
            msgTarget: 'under',
            listeners: {
                validitychange: FilterUtil.revalidatePartnerField
            }
        });
        var maxHourSpinner = FilterUtil.getSpinner(
            filter, "hours", "maxhourspinner", endValue
        );
        var maxMinuteSpinner = FilterUtil.getSpinner(
            filter, "minutes", "maxminutespinner", endValue
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
            items: field
        });
        this.add(fieldSet);
    }
});
