Ext.define('Koala.overrides.form.field.Date', {
    override: 'Ext.form.field.Date',
    config: {
        minValue: null,
        maxValue: null
    },

    initComponent: function() {
        var me = this;

        me.disabledDatesRE = null;
        me.initDisabledDays();

        Ext.form.field.Date.superclass.initComponent.call(me);
    },

    setValue: function(v) {
        var me = this;

        me.lastValue = me.rawDateText;
        me.lastDate = me.rawDate;

        if (Ext.isDate(v)) {
            me.rawDate = v;
            me.rawDateText = me.formatDate(v);
        } else if (moment.isMoment(v)) {
            if (Koala.Application.isUtc()) {
                v = Koala.util.Date.removeUtcOffset(v);
            }
            var date = v.toDate();
            me.rawDate = date;
            me.rawDateText = me.formatDate(date);
        } else {
            me.rawDate = me.rawToValue(v);
            me.rawDateText = me.formatDate(v);
            if (me.rawDate === v) {
                me.rawDate = null;
                me.rawDateText = '';
            }
        }

        Ext.form.field.Date.superclass.setValue.apply(me, [me.rawDate]);
    },

    setMinValue: function(value) {
        var me = this;
        var picker = me.picker;
        var minValue;

        if (Ext.isDate(value)) {
            minValue = value;
        } else if (moment.isMoment(value)) {
            if (Koala.Application.isUtc()) {
                value = Koala.util.Date.removeUtcOffset(value);
            }
            minValue = value.toDate();
        } else {
            minValue = me.parseDate(value);
        }

        me.minValue = minValue;

        if (picker) {
            picker.minText = Ext.String.format(me.minText, me.formatDate(me.minValue));
            picker.setMinDate(minValue);
        }
    },

    setMaxValue: function(value) {
        var me = this;
        var picker = me.picker;
        var maxValue;

        if (Ext.isDate(value)) {
            maxValue = value;
        } else if (moment.isMoment(value)) {
            if (Koala.Application.isUtc()) {
                value = Koala.util.Date.removeUtcOffset(value);
            }
            maxValue = value.toDate();
        } else {
            maxValue = me.parseDate(value);
        }

        me.maxValue = maxValue;

        if (picker) {
            picker.maxText = Ext.String.format(me.maxText, me.formatDate(me.maxValue));
            picker.setMaxDate(maxValue);
        }
    },

    getValue: function(asMoment) {
        if (asMoment) {
            // The field's value is always local. Check if we have to adjust it
            // to UTC (by adding the UTC offset).
            if (Koala.Application.isUtc()) {
                return Koala.util.Date.addUtcOffset(moment(this.rawDate));
            } else {
                return moment(this.rawDate);
            }
        }
        return this.rawDate || null;
    },

    getMinValue: function(asMoment) {
        if (asMoment) {
            // The field's value is always local. Check if we have to adjust it
            // to UTC (by adding the UTC offset).
            if (Koala.Application.isUtc()) {
                return Koala.util.Date.addUtcOffset(moment(this.minValue));
            } else {
                return moment(this.minValue);
            }
        }
        return this.minValue || null;
    },

    getMaxValue: function(asMoment) {
        if (asMoment) {
            // The field's value is always local. Check if we have to adjust it
            // to UTC (by adding the UTC offset).
            if (Koala.Application.isUtc()) {
                return Koala.util.Date.addUtcOffset(moment(this.maxValue));
            } else {
                return moment(this.maxValue);
            }
        }
        return this.maxValue || null;
    }

});
