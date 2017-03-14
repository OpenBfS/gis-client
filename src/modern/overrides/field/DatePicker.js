Ext.define('Koala.overrides.field.DatePicker', {
    override: 'Ext.field.DatePicker',
    config: {
        minValue: null,
        maxValue: null
    },

    applyValue: function(value, oldValue) {
        if (!Ext.isDate(value)) {
            if (Ext.isString(value)) {
                value = Ext.Date.parse(value, this.getDateFormat());
            } else if (moment.isMoment(value)) {
                if (Koala.Application.isUtc()) {
                    value = Koala.util.Date.removeUtcOffset(value);
                }
                value = value.toDate();
            } else {
                value = null;
            }
       }

       // The same date value may not be the same reference, so compare them by time.
       // If we have dates for both, then compare the time. If they're the same we
       // don't need to do anything.
       if (value && oldValue && value.getTime() === oldValue.getTime()) {
           value = undefined;
       }

       return value;
   },

   setMinValue: function(value) {
       var me = this;
       var minValue;

       if (Ext.isDate(value)) {
           minValue = value;
       } else if (moment.isMoment(value)) {
           if (Koala.Application.isUtc()) {
               value = Koala.util.Date.removeUtcOffset(value);
           }
           minValue = value.toDate();
       } else {
           minValue = Ext.Date.parse(value, me.getDateFormat());
       }

       me._minValue = minValue;
   },

   setMaxValue: function(value) {
       var me = this;
       var maxValue;

       if (Ext.isDate(value)) {
           maxValue = value;
       } else if (moment.isMoment(value)) {
           if (Koala.Application.isUtc()) {
               value = Koala.util.Date.removeUtcOffset(value);
           }
           maxValue = value.toDate();
       } else {
           maxValue = Ext.Date.parse(value, me.getDateFormat());
       }

       me._maxValue = maxValue;
   },

   getValue: function(asMoment) {
       if (asMoment) {
           // The field's value is always local. Check if we have to adjust it
           // to UTC (by adding the UTC offset).
           if (Koala.Application.isUtc()) {
               return Koala.util.Date.addUtcOffset(moment(this._value));
           } else {
               return moment(this._value);
           }
       }
       return this._value || null;
   },

   getMinValue: function(asMoment) {
       if (asMoment) {
           // The field's value is always local. Check if we have to adjust it
           // to UTC (by adding the UTC offset).
           if (Koala.Application.isUtc()) {
               return Koala.util.Date.addUtcOffset(moment(this._minValue));
           } else {
               return moment(this._minValue);
           }
       }
       return this._minValue || null;
   },

   getMaxValue: function(asMoment) {
       if (asMoment) {
           // The field's value is always local. Check if we have to adjust it
           // to UTC (by adding the UTC offset).
           if (Koala.Application.isUtc()) {
               return Koala.util.Date.addUtcOffset(moment(this._maxValue));
           } else {
               return moment(this._maxValue);
           }
       }
       return this._maxValue || null;
   }

});
