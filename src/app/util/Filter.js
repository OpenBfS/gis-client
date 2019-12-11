Ext.define('Koala.util.Filter', {
    requires: [
        'Koala.util.Object',
        'Koala.util.String'
    ],
    statics: {
        /* begin i18n */
        warnMsgEndBeforeStart: '',
        warnMsgExceedsMaxDuration: '',
        msgNotBetweenMinMax: '',
        /* end i18n */

        /**
         * The field configured as displayField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_DSP_FIELD: 'dsp',

        /**
         * The field configured as valueField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_VAL_FIELD: 'val',

        /**
         * Will hold all stores we created, keyed by the rawAllowedValues that
         * they represent.
         */
        createdStores: {},

        /**
         * The string which we replace with the current date.
         */
        NOW_STRING: 'now',

        /**
         * Examines the metadata object and returns an object with timeseries
         * min and max values for the x-axis (that is the first possible date
         * and the last possible date).
         *
         * @param {Object} metadata The GNOS metadata object.
         * @return {Object} An object with keys `min` and `max` containing
         *     `Date`-instances or `undefined`.
         */
        getMinMaxDatesFromMetadata: function(metadata) {
            var min;
            var max;
            var rawXAxisMin = Koala.util.Object.getPathStrOr(
                metadata,
                'layerConfig/timeSeriesChartProperties/xAxisMin',
                undefined
            );
            var rawXAxisMax = Koala.util.Object.getPathStrOr(
                metadata,
                'layerConfig/timeSeriesChartProperties/xAxisMax',
                undefined
            );
            if (rawXAxisMin) {
                min = Koala.util.Date.getUtcMoment(rawXAxisMin);
            }
            if (rawXAxisMax) {
                max = Koala.util.Date.getUtcMoment(rawXAxisMax);
            }

            return {
                min: min,
                max: max
            };
        },

        /**
         * Generates a start/end time filter from the given layer's features
         * using the configured xAxisAttribute.
         *
         * @param {ol.layer.Vector} layer the layer
         * @param {Object} metadata the layer's metadata
         */
        getStartEndFilterFromVectorLayer: function(layer, metadata) {
            var timeseriesCfg = metadata.layerConfig.timeSeriesChartProperties;
            var x = timeseriesCfg.xAxisAttribute;
            var startDate, endDate;

            Ext.each(layer.getSource().getFeatures(), function(feat) {
                var cur = moment(feat.get(x));
                if (!startDate) {
                    startDate = cur;
                }
                if (!endDate) {
                    endDate = cur;
                }
                if (cur.isBefore(startDate)) {
                    startDate = cur;
                }
                if (endDate.isBefore(cur)) {
                    endDate = cur;
                }
            });

            return {
                parameter: timeseriesCfg.xAxisAttribute,
                // start- and enddate are always UTC, but we may have to set
                // them to local reference.
                mindatetimeinstant: Koala.util.Date.getTimeReferenceAwareMomentDate(startDate),
                maxdatetimeinstant: Koala.util.Date.getTimeReferenceAwareMomentDate(endDate)
            };
        },

        /**
         * Calculates the start and endvalues for timeseries charts. If a filter
         * is active for the layer it takes the filtervalue as enddate. If not
         * it looks for the configured defaultvalue.
         * The startvalue is calculated from the enddate minus the configured
         * timeseries duration.
         *
         * @param {Object} metadata The metadata  Object of the layer.
         * @return {Object} The filterobject used by the timeseries. It contains
         *                  the keys `parameter`, `mindatetimeinstant` and
         *                  `maxdatetimeinstant`.
         */
        getStartEndFilterFromMetadata: function(metadata) {
            var layer = Koala.util.Layer.findLayerFromMetadata(metadata);
            var serverBased = Koala.util.Object.getPathStrOr(layer, 'metadata/layerConfig/vector/url', false);
            if (layer instanceof ol.layer.Vector && !serverBased) {
                return Koala.util.Filter.getStartEndFilterFromVectorLayer(layer, metadata);
            }

            var staticMe = Koala.util.Filter;
            var timeseriesCfg = metadata.layerConfig.timeSeriesChartProperties;
            var endDate = Koala.util.String.coerce(timeseriesCfg.end_timestamp);

            // replace "now" with current utc date
            if (endDate === staticMe.NOW_STRING) {
                endDate = Koala.util.Date.getUtcMoment(new Date());
            }
            if (Ext.isString(endDate)) {
                endDate = Koala.util.Date.getUtcMoment(endDate);
            }

            var filters = metadata.filters;
            if (filters) {
                Ext.each(filters, function(filter) {
                    switch (filter.type) {
                        case 'pointintime':
                        case 'rodostime':
                            endDate = filter.effectivedatetime;
                            break;
                        case 'timerange':
                            endDate = filter.effectivemaxdatetime;
                            break;
                        // TODO Do something
                        default:
                            break;
                    }
                });
            }

            var duration = timeseriesCfg.duration;
            var startDate = endDate.clone();
            startDate = startDate.subtract(moment.duration(duration));

            var filter = {
                parameter: timeseriesCfg.xAxisAttribute,
                // start- and enddate are always UTC, but we may have to set
                // them to local reference.
                mindatetimeinstant: Koala.util.Date.getTimeReferenceAwareMomentDate(startDate),
                maxdatetimeinstant: Koala.util.Date.getTimeReferenceAwareMomentDate(endDate)
            };

            return filter;
        },

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
        getStoreFromAllowedValues: function(rawAllowedValues, defaultValue) {
            var staticMe = this;
            if (rawAllowedValues && staticMe.createdStores[rawAllowedValues + defaultValue]) {
                return staticMe.createdStores[rawAllowedValues + defaultValue];
            }
            var data = null;
            var VAL_FIELD = staticMe.COMBO_VAL_FIELD;
            var DSP_FIELD = staticMe.COMBO_DSP_FIELD;
            var allowedValues = Koala.util.String.coerce(rawAllowedValues);
            if (Ext.isString(allowedValues)) {
                data = [];
                var arr = allowedValues.split(',');
                Ext.each(arr, function(val) {
                    var entry = {};
                    entry[VAL_FIELD] = val;
                    entry[DSP_FIELD] = val;
                    data.push(entry);
                });
            } else if (Ext.isArray(allowedValues)) {
                // validate structure
                Ext.each(allowedValues, function(entry) {
                    if (!(VAL_FIELD in entry) || !(DSP_FIELD in entry)) {
                        Ext.log.warn('Missing any of the required keys (' +
                            VAL_FIELD + ', ' + DSP_FIELD + ') in ' +
                            'allowedValues configuration');
                    }
                });
                data = allowedValues;
            } else {
                Ext.log.warn('Illegal \'allowedValues\' configured: ',
                    allowedValues);
            }

            var store = Ext.create('Ext.data.Store', {
                fields: [VAL_FIELD, DSP_FIELD],
                data: data
            });
            staticMe.createdStores[rawAllowedValues + defaultValue] = store;
            return store;
        },

        /**
         * Returns a combobo or multiselect element according to the allowed
         * values and the flag `rawMulti`.
         *
         * @param {String} allowedValues A string with the raw allowed
         *                               values, must conform to any of the
         *                               above.
         * @param {String} rawMulti A string (`"true"" or `"false"`) indicating
         *                          if this combo should allow multiselection.
         * @param {Ext.XTemplate} displayTpl An optional XTemplate for the
         *                                   display of the combobbox.
         * @param {Ext.XTemplate} listTpl An optional XTemplate for the
         *                                listitems of the combobox.
         * @return {Object} A configuration for a combobox or a multiselect
         *                  select element.
         * @param {Object} filter
         *
         */
        getComboFromFilter: function(filter) {
            var staticMe = this;
            var allowedValues = filter.allowedValues;
            var allowMultipleSelect = filter.allowMultipleSelect;
            var store = staticMe.getStoreFromAllowedValues(allowedValues, filter.defaultValue);
            var multi = Koala.util.String.coerce(allowMultipleSelect);
            var combo;
            var xtype;

            if (filter.type === 'rodostime') {
                var getFormatedDate = function(values) {
                    var dspField = staticMe.COMBO_DSP_FIELD;
                    values = Ext.isArray(values) ? values[0] : values;
                    var dateString = values[dspField];
                    var moment = Koala.util.Date.getUtcMoment(dateString);
                    return Koala.util.Date.getFormattedDate(moment);
                };
                var listTpl = Ext.create('Ext.XTemplate',
                    /* eslint-disable indent */
                    '<tpl for=".">',
                        '<div class="x-boundlist-item">',
                            '{[this.getFormatedDate(values)]}',
                        '</div>',
                    '</tpl>',
                    /* eslint-enable indent */
                    {
                        getFormatedDate: getFormatedDate
                    }
                );
                var displayTpl = Ext.create('Ext.XTemplate',
                    '{[this.getFormatedDate(values)]}',
                    {
                        getFormatedDate: getFormatedDate
                    }
                );
            }

            if (!Ext.isModern) { // classic
                xtype = multi ? 'multiselect' : 'combo';
                combo = {
                    xtype: xtype,
                    store: store,
                    queryMode: 'local',
                    editable: false,
                    allowBlank: true,
                    forceSelection: true,
                    displayField: staticMe.COMBO_DSP_FIELD,
                    valueField: staticMe.COMBO_VAL_FIELD,
                    listeners: {
                        change: 'onFilterChanged'
                    },
                    displayTpl: displayTpl,
                    tpl: listTpl,
                    width: 400,
                    maxHeight: 400
                };
            } else { // modern
                if (multi) {
                    // If multi selection is allowed, we return a list view.
                    combo = {
                        xtype: 'list',
                        store: store,
                        mode: 'MULTI',
                        itemTpl: displayTpl || '{' + staticMe.COMBO_DSP_FIELD + '}',
                        items: [{
                            // The list view itself doesn't contain a label,
                            // therefore we insert a basic field that can be
                            // labeled.
                            xtype: 'field',
                            labelWidth: '100%'
                        }],
                        listeners: {
                            change: 'onFilterChanged'
                        }
                    };
                } else {
                    var displayField = staticMe.COMBO_DSP_FIELD;
                    if (filter.type === 'rodostime') {
                        displayField = staticMe.COMBO_DSP_FIELD+ '_special';
                        store.each(function(rec) {
                            var dateString = rec.get(staticMe.COMBO_DSP_FIELD);
                            var moment = Koala.util.Date.getUtcMoment(dateString);
                            var formated = Koala.util.Date.getFormattedDate(moment);
                            rec.set(displayField, formated);
                        });
                    }
                    combo = {
                        xtype: 'selectfield',
                        store: store,
                        queryMode: 'local',
                        displayField: displayField,
                        valueField: staticMe.COMBO_VAL_FIELD,
                        usePicker: true,
                        listeners: {
                            change: 'onFilterChanged'
                        }
                    };
                }
            }

            return combo;
        },

        /**
         * The types of spinners we handle, "days" is a meta-type, we have the
         * the calender wodget for them but need the constant in order to fix
         * a interval/unit combination like "24 hours".
         */
        SPINNERTYPE: {
            DAYS: 'days',
            HOURS: 'hours',
            MINUTES: 'minutes'
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
            var unit = (filter.unit || '').toLowerCase();
            // harmonize interval as number
            var interval = parseInt((filter.interval || '1').toLowerCase(), 10);

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
            if ((spinnerType === HOURS && (unit === MINUTES || unit === HOURS)) ||
                (spinnerType === MINUTES && unit === MINUTES)) {
                // we are creating an hour spinner, and the filter has an
                // interval/unit combination that is less than one day, enable
                // or we are creating a minute spinner, and the filter has an
                // interval/unit combination that deals with minutes
                enableSpinner = true;
            }

            // default to one for other spinners than the one we need according
            // to the filter unit, otherwise use provided filter interval
            var stepSize = unit === spinnerType ? interval : 1;

            // Determine the start value of the spinner
            var startValue = 0;
            if (value && spinnerType === MINUTES) {
                startValue = value.get('minutes');
            } else if (value && spinnerType === HOURS) {
                startValue = value.get('hours');
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

            var spinner;
            if (!Ext.isModern) {
                spinner = {
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
                    editable: (spinnerType === MINUTES || spinnerType === HOURS) ? true : false,
                    validator: function(val) {
                        if (!Ext.isEmpty(val)) {
                            if (Math.floor(val % this.step) === 0) {
                                return true;
                            } else {
                                return Ext.String.format(Ext.ComponentQuery.query('k-form-layerfilter')[0].getViewModel().getData().numberfieldValidationText, this.step);
                            }
                        } else {
                            if (startValue) {
                                this.value = startValue;
                            } else {
                                this.value = 0;
                            }
                            return true;
                        }
                    },
                    valueToRaw: staticMe.leadingZeroValueToRaw,
                    rawToValue: staticMe.leadingZeroRawToValue,
                    listeners: {
                        change: staticMe.handleSpinnerChange
                    }
                };
            } else {
                spinner = {
                    xtype: 'selectfield',
                    name: name,
                    spinnerType: spinnerType,
                    value: startValue,
                    disabled: !enableSpinner,
                    usePicker: true,
                    width: 60,
                    valueToRaw: staticMe.leadingZeroValueToRaw,
                    rawToValue: staticMe.leadingZeroRawToValue,
                    options: staticMe.getSelectFieldOptionsData(maxValue, stepSize),
                    listeners: {
                        change: staticMe.handleSpinnerChange
                    }
                };
            }

            return spinner;
        },

        /**
         * Creates a linear incremented options array that can be used in a
         * selectfield or similar. Typically used in a time slotpicker.
         *
         * @param {Number} maxValue The number of option objects to create.
         * @param {Number} stepSize The distance between the object values.
         *
         * @return {Array} The options object.
         */
        getSelectFieldOptionsData: function(maxValue, stepSize) {
            var options = [];

            var optionsCnt = maxValue / stepSize;

            for (var i = 0; i <= optionsCnt; i++) {
                options.push({
                    text: i * stepSize,
                    value: i * stepSize
                });
            }

            return options;
        },

        /**
         * Used as `valueToRaw`-configuration of the numberfields for hours and
         * minutes, will give single digit numbers a leading zero.
         *
         * @return {String} The number as string, padded to size 2, with an
         *     optional leading zero for numbers less than 10.
         */
        leadingZeroValueToRaw: function(val) {
            return (val < 10) ? '0' + val : '' + val;
        },

        /**
         * Used as `rawToValue`-configuration of the numberfields for hours and
         * minutes, will return a number from an input which may have a leading
         * zero.
         *
         * @return {Number} A number representation of the raw value, which may
         *     have a leading zero
         */
        leadingZeroRawToValue: function(raw) {
            return parseInt('' + raw, 10);
        },

        /**
         * Given a date and the Ext.form.field.Date it is coming from, this
         * method searches the surroundings of the datefield to find the
         * accompanying (if any) minute and hour spinners. The datefield will
         * report with a precision of DAY (Time will always be 00:00) so we need
         * to add hours and minutes accordingly.
         *
         * @param {Moment} momentDate The moment date to adjust.
         * @param {Ext.form.field.Date} dateField The field where the date comes
         *     from.
         * @return {Moment} An adjusted date, with hours and minutes set as
         *     requested from the accompanying spinners.
         */
        setHoursAndMinutes: function(momentDate, dateField) {
            var dateClone = momentDate.clone();
            var container = dateField.up();
            // the selectors mean '… ending with hourspinner' / 'minutespinner'
            var hourspinner = container.down('[name$="hourspinner"]');
            var minutespinner = container.down('[name$="minutespinner"]');
            var addHours = hourspinner && hourspinner.getValue() || 0;
            var addMinutes = minutespinner && minutespinner.getValue() || 0;
            dateClone = dateClone.set('hours', addHours);
            dateClone = dateClone.set('minutes', addMinutes);
            return dateClone;
        },

        /**
         * Sets the hour and minutes fields to the values from the date.
         * @param  {Moment} momentDate the date to extract the hours/minutes from
         * @param  {Ext.form.field.Date} dateField  the date field next to the
         * minutes/hour spinners
         */
        replaceHoursAndMinutes: function(momentDate, dateField) {
            var container = dateField.up();
            var hourspinner = container.down('[name$="hourspinner"]');
            var minutespinner = container.down('[name$="minutespinner"]');
            hourspinner.setValue(momentDate.get('hours'));
            minutespinner.setValue(momentDate.get('minutes'));
        },

        /**
         * A reusable eventhandler for the `change` event of the spinners for
         * hours or minutes that are inside of an `fieldcontainer` which holds
         * associated `datefield`. Will update the value of the `datefield` on
         * change.
         */
        handleSpinnerChange: function(field, val) {
            var self = Koala.util.Filter;
            var MINUTE_TYPE = self.SPINNERTYPE.MINUTES;
            var datefield;
            var dateVal;

            if (!Ext.isModern) { // classic
                datefield = field.up('fieldcontainer').down('datefield');
                // Request the date as moment date.
                dateVal = datefield.getValue(true);
                // Fix the date by starting with the old values from h and min
                dateVal = self.setHoursAndMinutes(dateVal, datefield);
                datefield.setValue(dateVal);
                datefield.validate();
                // setting it is basically not needed, since the values cannot
                // be read out
            } else { // modern

                if (Ext.isEmpty(val)) {
                    return false;
                }

                datefield = field.up('container[name*=timecontainer]')
                    .down('datepickerfield');
                dateVal = datefield.getValue(true);

                if (field.spinnerType === MINUTE_TYPE) {
                    dateVal.set('minutes', field.getValue());
                } else {
                    dateVal.set('hours', field.getValue());
                }

                datefield.setValue(dateVal);
            }
        },

        /**
         * Determines the names to use for fields from a filter `param` when
         * creating and reading out a timerange filter's elements. Timerange
         * filters may have a param of the form `foo,bar` or simply `foo` (if
         * the start- and endparamter shall have the same name). Since our names
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
        startAndEndFieldnamesFromMetadataParam: function(param) {
            var names = {
                startName: '',
                endName: ''
            };
            var differentiateSuffix = '__make-distinguishable__';

            if (!param) {
                Ext.log.warn('Illegal configuration for timerange filter');
                return names;
            }

            var trimmedParam = Ext.String.trim(param);
            if (trimmedParam === ',' || trimmedParam === '') {
                Ext.log.warn('Illegal configuration for timerange filter');
                return names;
            }

            var params = trimmedParam.split(',');

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
         * The fields values for min and max cannot be trusted, they
         * might e.g. be stripped of the hours if the format had no
         * hours. Also we must create a function that knows in which form the
         * min and max were once passed (UTC or local).
         *
         * Important: We compare the UTC values always!
         *
         * @param {moment} min The minimum/start date.
         * @param {moment} max The maximum/end date.
         */
        makeDateValidator: function(min, max) {
            var staticMe = Koala.util.Filter;

            // Min and max might be undefined, in that case we set them to
            // values that are hard to ever reach.
            if (!min) {
                min = moment.utc('1970-01-01T00:00:00');
            }
            if (!max) {
                max = moment.utc('2100-01-01T00:00:00');
            }


            // Get clones of once passed in min and max:
            var minClone = min.clone().utc();
            var maxClone = max.clone().utc();

            /**
             * @this {Ext.form.field.Date}
             */
            var validator = function() {
                var field = this;
                // Request the value as moment object.
                var date = field.getValue(true);

                if (!date) {
                    return true;
                }
                // Inside this validation method we handle all dates as UTC.
                var momentDate = date.clone().utc();
                var realDate = momentDate;

                if (realDate.isBetween(minClone, maxClone, null, '[]')) {
                    return true;
                } else {
                    return staticMe.msgNotBetweenMinMax;
                }
            };
            return validator;
        },

        /**
         * This method is bound as Ext.form.field.Date#validator of the two
         * datefields that make up a timerange fieldset. It checks if the
         * current range determine by start- and enddate is not larger than the
         * `maxduration` of the corresponding filter.
         */
        validateMaxDurationTimerange: function() {
            var field = this; // since we are bound as validator function
            var staticMe = Koala.util.Filter;
            var fieldset = field.up('fieldset[filter]');
            var filter = fieldset && fieldset.filter;
            var maxDuration = filter && filter.maxduration;
            var maxDurationUnit = filter && filter.unit;
            var startName, endName;

            if (!filter.fromTimeseries) {
                var names = staticMe.startAndEndFieldnamesFromMetadataParam(
                    filter.param);
                startName = names.startName;
                endName = names.endName;
            } else {
                startName = 'timeseriesStartField';
                endName = 'timeseriesEndField';
            }

            // Query for field types generally to be compatible with classic
            // and modern. In classic the datefield, whereas in modern
            // the datepickerfield, is used.
            var minField = fieldset.down('field[name="' + startName + '"]');
            var maxField = fieldset.down('field[name="' + endName + '"]');

            var startDate = minField.getValue(true);
            var endDate = maxField.getValue(true);

            if (!startDate || !endDate) {
                return true;
            }

            if (startDate.isAfter(endDate)) {
                // Invalid: start value after end value
                return staticMe.warnMsgEndBeforeStart;
            }

            if (Ext.isEmpty(maxDuration)) {
                // Valid: no explicitly configured maximum duration
                return true;
            }

            // maxDuration may be a ISO duration string or a
            // (stringified) number. Call coerce util to get the "real" value
            // to finally determine how to handle the maxDuration.
            maxDuration = Koala.util.String.coerce(maxDuration);

            if (Ext.isNumber(maxDuration)) {
                // If the value is a number, get the seconds value from it using
                // the given maxDurationUnit from the filter object.
                maxDuration = moment.duration(maxDuration, maxDurationUnit);
            } else if (Ext.isString(maxDuration)) {
                // If the value is a string (e.g. P4WT), handle it as a ISO
                // duration string.
                maxDuration = moment.duration(maxDuration);
            } else {
                // No interpretable maxDuration given.
                return true;
            }

            if (maxDuration.asMilliseconds() === 0) {
                // Valid: the maximum duration is set to 0 seconds.
                return true;
            }

            var notBefore = endDate.subtract(maxDuration);
            var withinDuration = notBefore.isBefore(startDate);

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
        revalidatePartnerField: function(triggerField) {
            var fieldset = triggerField.up('fieldset[filter]');
            var candidates = fieldset.query('datefield');
            var partnerField = Ext.Array.findBy(candidates, function(cand) {
                return triggerField !== cand;
            });
            if (partnerField) {
                partnerField.validate();
            }
        },

        /**
         * Creates and adds a point in time filter at the specified index.
         *
         * @param {String} format A date format string.
         * @param {Object} filter A filter specification object of type
         *     `pointintime`.
         * @param {Number} idx The index of the filter in the list of all filters.
         */
        createPointInTimeFieldset: function(format, filter, idx) {
            var me = this;

            var minValue;
            if (filter.mindatetimeinstant) {
                // Only fill lower boundary when defined
                minValue = Koala.util.Date.getUtcMoment(
                    filter.mindatetimeinstant
                );
            }

            var maxValue;
            if (filter.maxdatetimeinstant) {
                // Only fill upper boundary when defined
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

            var dateField = Ext.create('Ext.form.field.Date', {
                bind: {
                    fieldLabel: '{timestampLabel}'
                },
                editable: false,
                labelWidth: 70,
                name: filter.param,
                flex: 1,
                // The Ext.form.field.Date is capabale of receiving a moment object,
                // see override of setValue().
                value: value,
                minValue: minValue,
                maxValue: maxValue,
                validator: me.makeDateValidator(
                    minValue, maxValue
                ),
                format: format,
                listeners: {
                    change: 'onFilterChanged'
                }
            });

            var hourSpinner = me.getSpinner(
                filter, 'hours', 'hourspinner', value
            );
            var minuteSpinner = me.getSpinner(
                filter, 'minutes', 'minutespinner', value
            );
            var container = Ext.create('Ext.form.FieldContainer', {
                name: 'pointintimecontainer',
                anchor: '100%',
                layout: 'hbox',
                items: [dateField, hourSpinner, minuteSpinner]
            });

            var fieldSet = Ext.create('Ext.form.FieldSet', {
                padding: 5,
                layout: 'anchor',
                filterIdx: idx,
                items: [container]
            });
            return fieldSet;
        },

        /**
         * Creates and adds a timerange filter at the specified index.
         *
         * @param {Object} filter A filter specification object of type timerange.
         * @param {Number} idx The index of the filter in the list of all filters.
         */
        createTimeRangeFieldset: function(format, filter, idx) {
            var me = this;
            var param = filter.param;
            var startName, endName;

            if (!filter.fromTimeseries) {
                var names = me.startAndEndFieldnamesFromMetadataParam(param);
                startName = names.startName;
                endName = names.endName;
            } else {
                startName = 'timeseriesStartField';
                endName = 'timeseriesEndField';
            }

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

            var minMaxValidator = me.makeDateValidator(
                minValue, maxValue
            );
            var minMaxDurationAndOrderValidator = function() {
                var ok = minMaxValidator.call(this);
                if (ok === true) {
                    ok = me.validateMaxDurationTimerange.call(this);
                }
                return ok;
            };

            // --- MINIMUM ---
            var minDateField = Ext.create('Ext.form.field.Date', {
                bind: {
                    fieldLabel: '{startLabel}'
                },
                name: startName,
                editable: false,
                labelWidth: 50,
                flex: 1,
                value: startValue,
                minValue: minValue,
                maxValue: maxValue,
                format: format,
                validator: minMaxDurationAndOrderValidator,
                listeners: {
                    validitychange: me.revalidatePartnerField,
                    change: 'onFilterChanged'
                }
            });
            var minHourSpinner = me.getSpinner(
                filter, 'hours', 'minhourspinner', startValue
            );
            var minMinuteSpinner = me.getSpinner(
                filter, 'minutes', 'minminutespinner', startValue
            );
            var minContainer = Ext.create('Ext.form.FieldContainer', {
                name: 'mincontainer',
                anchor: '100%',
                layout: 'hbox',
                items: [minDateField, minHourSpinner, minMinuteSpinner]
            });

            // --- MAXIMUM ---
            var maxDateField = Ext.create('Ext.form.field.Date', {
                name: endName,
                editable: false,
                bind: {
                    fieldLabel: '{endLabel}'
                },
                labelWidth: 50,
                flex: 1,
                value: endValue,
                minValue: minValue,
                maxValue: maxValue,
                format: format,
                validator: minMaxDurationAndOrderValidator,
                listeners: {
                    validitychange: me.revalidatePartnerField,
                    change: 'onFilterChanged'
                }
            });
            var maxHourSpinner = me.getSpinner(
                filter, 'hours', 'maxhourspinner', endValue
            );
            var maxMinuteSpinner = me.getSpinner(
                filter, 'minutes', 'maxminutespinner', endValue
            );
            var maxContainer = Ext.create('Ext.form.FieldContainer', {
                name: 'maxcontainer',
                anchor: '100%',
                layout: 'hbox',
                items: [maxDateField, maxHourSpinner, maxMinuteSpinner]
            });

            var fieldSet = Ext.create('Ext.form.FieldSet', {
                padding: 5,
                layout: 'anchor',
                filter: filter,
                filterIdx: idx,
                items: [minContainer, maxContainer]
            });

            return fieldSet;
        },

        createAutorefreshDropdown: function(layer) {
            var value = null;
            if (layer) {
                var id = layer.metadata.id;
                value = Koala.util.Autorefresh.prototype.autorefreshMap[id];
            }
            var minutes = this.minutes;
            var times = Ext.create('Ext.data.Store', {
                fields: ['timeLabel', 'time'],
                data: [
                    {timeLabel: this.minute, time: 1},
                    {timeLabel: Ext.String.format(minutes, 5), time: 5},
                    {timeLabel: Ext.String.format(minutes, 10), time: 10},
                    {timeLabel: Ext.String.format(minutes, 15), time: 15},
                    {timeLabel: Ext.String.format(minutes, 30), time: 30},
                    {timeLabel: Ext.String.format(minutes, 60), time: 60}
                ]
            });

            var xtype = Ext.isModern ? 'selectfield' : 'combo';

            return Ext.create({
                xtype: xtype,
                fieldLabel: this.refreshInterval,
                label: this.refreshInterval,
                name: 'autorefresh',
                value: value,
                queryMode: 'local',
                store: times,
                displayField: 'timeLabel',
                valueField: 'time',
                labelWidth: '50%'
            });
        }
    }

});
