/* Copyright (c) 2015-2017 terrestris GmbH & Co. KG
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
 * An override for the `Ext.form.field.Date` class to achieve moment date object
 * compatibility.
 *
 * @class Koala.overrides.form.field.Date
 */
Ext.define('Koala.overrides.form.field.Date', {
    override: 'Ext.form.field.Date',
    config: {
        minValue: null,
        maxValue: null
    },

    /**
     * Don't show a formatText as it will be shown as tooltip onMouseOver.
     * @type {String}
     */
    formatText: '',

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
