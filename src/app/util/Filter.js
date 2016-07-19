Ext.define('Koala.util.Filter', {
    requires: [
        'Koala.util.Duration',
        'Koala.util.String'
    ],
    statics: {
        /**
         * The field configured as displayField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_DSP_FIELD: "dsp",

        /**
         * The field configured as valueField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_VAL_FIELD: "val",

        /**
         * Will hold all stores we created, keyed by the rawAllowedValues that
         * they represent.
         */
        createdStores: {},

        /**
         * Turns various ways of specifying a list of allowed values (coming
         * from the GNOS) into a store suitable for a combo box. There are
         * currently two possibilities:
         *
         * * string separated values to display and submit,
         * * an array with objects that have "val" and "dsp" keys
         *
         * @param {String} rawAllowedValues A string with the raw allowed
         *     values, must conform to any of the above mentioned formats.
         * @return {Ext.data.Store} The created store.
         */
        getStoreFromAllowedValues: function(rawAllowedValues) {
            var staticMe = this;
            if (rawAllowedValues && staticMe.createdStores[rawAllowedValues]) {
                return staticMe.createdStores[rawAllowedValues];
            }
            var data = null;
            var VAL_FIELD = staticMe.COMBO_VAL_FIELD;
            var DSP_FIELD = staticMe.COMBO_DSP_FIELD;
            var allowedValues = Koala.util.String.coerce(rawAllowedValues);
            if (Ext.isString(allowedValues)) {
                data = [];
                var arr = allowedValues.split(",");
                Ext.each(arr, function(val) {
                    var entry = {};
                    entry[VAL_FIELD] = val;
                    entry[DSP_FIELD] = val;
                    data.push(entry);
                });
            } else if (Ext.isArray(allowedValues)) {
                // validate structure
                Ext.each(allowedValues, function(entry) {
                    if(!(VAL_FIELD in entry) || !(DSP_FIELD in entry)) {
                        Ext.log.warn("Missing any of the required keys (" +
                            VAL_FIELD + ", " + DSP_FIELD + ") in " +
                            "allowedValues configuration");
                    }
                });
                data = allowedValues;
            } else {
                Ext.log.warn("Illegal 'allowedValues' configured: ",
                    allowedValues);
            }

            var store = Ext.create("Ext.data.Store", {
                fields: [VAL_FIELD, DSP_FIELD],
                data: data
            });
            staticMe.createdStores[rawAllowedValues] = store;
            return store;
        },

        /**
         * Returns a combobo or multiselect element according to the allowed
         * values and the flag `rawMulti`.
         *
         * @param {String} allowedValues A string with the raw allowed
         *     values, must conform to any of the above
         * @param {String} rawMulti A string (`"true"" or `"false"`) indicating
         *     if this comobo should allow multiselection.
         * @return {Object} A configuration for a combobox or a multiselect
         *     select element.
         */
        getComboFromAllowedValues: function(allowedValues, rawMulti) {
            var staticMe = this;
            var store = staticMe.getStoreFromAllowedValues(allowedValues);
            var multi = Koala.util.String.coerce(rawMulti);
            var combo;
            var xtype;

            if(!Ext.isModern){ // classic
                xtype = multi ? "multiselect" : "combo";
                combo = {
                    xtype: xtype,
                    store: store,
                    queryMode: "local",
                    editable: false,
                    allowBlank: true,
                    forceSelection: true,
                    displayField: staticMe.COMBO_DSP_FIELD,
                    valueField: staticMe.COMBO_VAL_FIELD
                };
            } else { // modern
                combo = {
                    xtype: "selectfield",
                    store: store,
                    queryMode: "local",
                    editable: false,
                    allowBlank: true,
                    displayField: staticMe.COMBO_DSP_FIELD,
                    valueField: staticMe.COMBO_VAL_FIELD
                };
            }

            return combo;
        },

        /**
         * The types of spinners we handle, "days" is a meta-type, we have the
         * the calender wodget for them but need the constant in order to fix
         * a interval/unit combination like "24 hours".
         */
        SPINNERTYPE: {
            DAYS: "days",
            HOURS: "hours",
            MINUTES: "minutes"
        },

        /**
         * The number of hours in a day. Needed to be able to fix interval/unit
         * combinations like "24 hours" and to determine the maximum value in
         * the spinners.
         */
        HOURS_IN_DAY: 24,

        /**
         * The number of minutes in an hour. Needed to be able to fix interval
         * and unit combinations like "60 minutes" and to determine the maximum
         * value in the spinners.
         */
        MINS_IN_HOUR: 60,

        /**
         * Returns a spinner element that can be used to change the hours or
         * minutes of an associated datefield.
         *
         * @param {Object} filter A filterobject that e.g. has properties for
         *     `unit` or `interval`.
         * @param {String} spinnerType Either `"minutes"` or `"hours"`.
         * @param {String} name The name of the spinnerfield, should either
         *     contain the string `"minutes"` or `"hours"`.
         * @param {Date} value The date to take the current minute/hour value
         *     from.
         * @return {Ext.form.field.Number} The created spinner field.
         */
        getSpinner: function(filter, spinnerType, name, value) {
            var staticMe = this;
            // harmonize unit
            var unit = (filter.unit || "").toLowerCase();
            // harmonize interval as number
            var interval = parseInt((filter.interval || "1").toLowerCase(), 10);

            // some static variables
            var DAYS = staticMe.SPINNERTYPE.DAYS;
            var HOURS = staticMe.SPINNERTYPE.HOURS;
            var MINUTES = staticMe.SPINNERTYPE.MINUTES;
            var HOURS_IN_DAY = staticMe.HOURS_IN_DAY;
            var MINS_IN_HOUR = staticMe.MINS_IN_HOUR;

            // we need to change intervals and units if e.g. 24 hours is set as
            // interval/unit combination
            if (unit === HOURS && interval >= HOURS_IN_DAY) {
                // >= 24 hours equals 1 day
                unit = DAYS;
                interval = 1;
            } else if (unit === MINUTES && interval >= MINS_IN_HOUR) {
                // >= 60 minutes equals 1 hour
                unit = HOURS;
                interval = 1;
            }

            var enableSpinner = false;
            if (spinnerType === HOURS && (unit === MINUTES || unit === HOURS)) {
                // we are creating an hour spinner, and the filter has an
                // interval/unit combination that is less than one day, enable
                enableSpinner = true;
            } else if (spinnerType === MINUTES && unit === MINUTES) {
                // we are creating a minute spinner, and the filter has an
                // interval/unit combination that deals with minutes
                enableSpinner = true;
            }

            // default to one for other spinners than the one we need according
            // to tghe filter unit, otherwise use provided filter interval
            var stepSize = unit === spinnerType ? interval : 1;

            // Determine the start value of the spinner
            var startValue = 0;
            if (value && spinnerType === MINUTES) {
                startValue = value.getMinutes();
            } else if (value && spinnerType === HOURS) {
                startValue = value.getHours();
            }

            // Start with the absolute maximum according to spinnertype
            var maxValue = spinnerType === HOURS ? HOURS_IN_DAY : MINS_IN_HOUR;
            var maxValueRemainderStepSize = maxValue % stepSize;
            if (maxValueRemainderStepSize === 0) {
                // the passed interval is a divisor of the maxValue, subtract
                // one stepSize so that the maximum is never reached:
                // * minutespinner, 5 minute step => maximum = 55 (startVal = 0)
                // * hourspinner, 2 hour step => maximum = 22 (startVal = 0)
                maxValue = maxValue - stepSize;
            } else {
                // the interval is not a divisor, so the remainder must be
                // subtracted to get to the maximum allowed value:
                // * minutespinner, 7 minute step => maximum 54 (startVal = 0)
                // * hourspinner, 5 hour step => maximum 20 (startVal = 0)
                maxValue = maxValue - maxValueRemainderStepSize;
            }

            var curValRemainderStepSize = startValue % stepSize;
            // Adjust the maxvalue further if the start value was not 0:
            // Now we need to take the startvalue into account, e.g. if I
            // start at 01:00 the last value must be 23!
            // * hourspinner, 2 hour step => maximum = 23 (startVal = 1)
            // * hourspinner, 5 hour step => maximum 23 (startVal = 3)
            if (curValRemainderStepSize !== 0) {
                // the current value would not be reachable with the spinner
                // we need to adjust the maxValue again.
                maxValue = maxValue + curValRemainderStepSize;
            }

            var spinner = Ext.create({
                xtype: 'numberfield',
                name: name,
                spinnerType: spinnerType,
                value: startValue,
                minValue: 0,
                maxValue: maxValue,
                step: stepSize,
                disabled: !enableSpinner,
                visible: true,
                width: 50,
                editable: false,
                valueToRaw: staticMe.leadingZeroValueToRaw,
                rawToValue: staticMe.leadingZeroRawToValue,
                listeners: {
                    change: staticMe.handleSpinnerChange
                }
            });

            return spinner;
        },

        /**
         * Used as `valueToRaw`-configuration of the numberfields for hours and
         * minutes, will give single digit numbers a leading zero.
         *
         * @return {String} The number as string, padded to size 2, with an
         *     optional leading zero for numbers less than 10.
         */
        leadingZeroValueToRaw: function(val) {
            return (val < 10) ? "0" + val : "" + val;
        },

        /**
         * Used as `rawToValue`-configuration of the numberfields for hours and
         * minutes, will return a number from an input which may have a leading
         * zero.
         *
         * @return {Number} A number representation of the raw value, which may
         *     have a leading zero
         */
        leadingZeroRawToValue: function(raw){
            return parseInt("" + raw, 10);
        },

        /**
         * A reusable eventhandler for the `change` event of the spinners for
         * hours or minutes that are inside of an `fieldcontainer` which holds
         * associated `datefield`. Will update the value of the `datefield` on
         * change.
         */
        handleSpinnerChange: function(field, val, prevVal) {
            var self = Koala.util.Filter;
            var MINUTE_TYPE = self.SPINNERTYPE.MINUTES;
            var datefield;
            var unitOfSpinner;
            var dateVal;

            if(!Ext.isModern){ // classic
                datefield = field.up("fieldcontainer").down("datefield");
                dateVal = datefield.getValue();

                var diff = field.step;

                if(field.spinnerType === MINUTE_TYPE){
                    unitOfSpinner = Ext.Date.MINUTE;
                } else {
                    unitOfSpinner = Ext.Date.HOUR;
                }
                if (prevVal > val) {
                    // spinned down, reduce date by step
                    diff *= -1;
                }
                datefield.setValue(Ext.Date.add(dateVal, unitOfSpinner, diff));
            } else { // modern

                if (Ext.isEmpty(val)) {
                    return false;
                }

                datefield = field.up("container").down('datepickerfield');
                dateVal = datefield.getValue();

                if(field.spinnerType === MINUTE_TYPE){
                    dateVal.setMinutes(field.getValue());
                } else {
                    dateVal.setHours(field.getValue());
                }

                datefield.setValue(dateVal);
            }
        },

        /**
         * Determines the names to use for fields from a filter `param` when
         * creating and reading out a timerange filter's elements. Timerange
         * filters may have a param of the form `foo,bar` or simply `foo` (if
         * the start- and endparamter shall have the sae name). Since our names
         * of the form elemnt must be distinguishable, we *may* have to generate
         * unique fieldnames.
         *
         * @param {String} param A `param` of a filter, e.g. `foo`, `foo,bar` or
         *     `foo,foo`.
         * @return {Object} An object with names to use for start- and end
         *     fields.
         * @return {String} return.startName The name to use for the startfield
         * @return {String} return.endName The name to use for the endfield
         */
        startAndEndFieldnamesFromMetadataParam: function(param){
            var names = {
                startName: "",
                endName: ""
            };
            var differentiateSuffix = "__make-distinguishable__";

            if (!param) {
                Ext.log.warn("Illegal configuration for timerange filter");
                return names;
            }

            var trimmedParam = Ext.String.trim(param);
            if (trimmedParam === "," || trimmedParam === "") {
                Ext.log.warn("Illegal configuration for timerange filter");
                return names;
            }

            var params = trimmedParam.split(",");

            // When we were configured with only one parameter, or if the two
            // parameters have the same name, we need to create a unique fieldname
            // for end…
            if (params.length === 1 || params[0] === params[1]) {
                params[1] = params[0] + differentiateSuffix;
            }

            names.startName = params[0];
            names.endName = params[1];

            return names;
        },

        /**
         * This method is bound as Ext.form.field.Date#validator of the two
         * datefields that make up a timerange fieldset. It checks if the
         * current range determine by start- and enddate is not larger than the
         * `maxduration` of the corresponding filter.
         */
        validateMaxDurationTimerange: function(){
            var field = this; // since we are bound as validator function
            var staticMe = Koala.util.Filter;
            var durationUtil = Koala.util.Duration;
            var fieldset = field.up('fieldset[filter]');
            var filter = fieldset && fieldset.filter;
            var maxDuration = filter && filter.maxduration;

            if (Ext.isEmpty(maxDuration)) {
                // Valid: no explicitly configured maximum duration
                return true;
            }
            if (durationUtil.absoluteSecondsFromDuration(maxDuration) === 0) {
                // Valid: the maximum duration is set to 0 seconds, this
                // may be e.g. if only a number was entered instead of a
                // vaild duration string.
                return true;
            }

            var names = staticMe.startAndEndFieldnamesFromMetadataParam(
                filter.param
            );
            var startName = names.startName;
            var endName = names.endName;
            var minField = fieldset.down('datefield[name="' + startName + '"]');
            var maxField = fieldset.down('datefield[name="' + endName + '"]');

            var startDate = minField.getValue();
            var endDate = maxField.getValue();

            if (startDate > endDate) {
                // Invalid: start value after end value
                return staticMe.warnMsgEndBeforeStart;
            }

            var withinDuration = durationUtil.datesWithinDuration(
                startDate, endDate, maxDuration
            );

            if (!withinDuration) {
                // Invalid: Outside of allowed duration
                return staticMe.warnMsgExceedsMaxDuration;
            }

            // Valid: all is fine!
            return true;
        },

        /**
         * Bound as an eventlistener for `validitychange` for the datefields in
         * a timerange fieldset, this methid will find the corresponding partner
         * datefield and trigger the validation there as well. If we didn't have
         * this, a once invalid field would not become valid if the other field
         * changed it's value. With this function in place, we ensure that
         * always both fields of a range are either valid or invalid.
         *
         * @param {Ext.form.field.Date} triggerField One of the two datefields;
         *     the validity of this field has changed and the other one should
         *     now be revalidated.
         */
        revalidatePartnerField: function(triggerField){
            var fieldset = triggerField.up('fieldset[filter]');
            var candidates = fieldset.query('datefield');
            var partnerField = Ext.Array.findBy(candidates, function(cand) {
                return triggerField !== cand;
            });
            if (partnerField) {
                partnerField.validate();
            }
        }
    }
});
