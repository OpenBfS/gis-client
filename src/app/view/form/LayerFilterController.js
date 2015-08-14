Ext.define('Koala.view.form.LayerFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-layerfilter',

    submitFilter: function(){
        var view = this.getView();
        var metadata = view.getMetadata();
        var keyVals = view.getValues();
        // remove ignored values
        var cleanKeyVals = {};
        Ext.iterate(keyVals, function(key, value) {
            if (!Ext.Array.contains(view.ignoreFields, key)) {
                cleanKeyVals[key] = value;
            }
        });

        metadata = this.updateFilterValues(metadata, cleanKeyVals);

        var layer = Koala.util.Layer.layerFromMetadata(metadata);

        Koala.util.Layer.addOlLayerToMap(layer);

        view.up('window').close();
    },

    /**
     *
     */
    updateFilterValues: function(metadata, keyVals) {
        var filter = metadata.filter;
        if (filter.type === 'timerange') {
            var paramArr = metadata.filter.param.split(",");
            filter.mindatetimeinstant = keyVals[paramArr[0]];
            filter.maxdatetimeinstant = keyVals[paramArr[1]];
        } else if (filter.type === 'pointintime') {
             filter.timeinstant = keyVals[filter.param];
        } else if (filter.type === 'value') {
            filter.value = keyVals[filter.param];
        }

        return metadata;
    },

    /**
     * Returns an offset in minutes from a local date compared the UTC date,
     * while giving the appropriate "+" or "-" as first output character.
     * For Germany, this will be e.g. +60 or +120.
     *
     * @return {Number} The offset in minutes compared from the localtime to
     *     UTC time
     * @param {Date} The (local) Date from which the offset should get
     *     calculated
     */
    getUTCOffsetInMinutes: function(date) {
        var utcoffsetminutes = 0,
            utcoffsethours = 0,
            utcoffset = Ext.Date.getGMTOffset(date),
            utcoffsetsign = utcoffset.substring(0, 1);
        if (utcoffset.length === 5) {
            utcoffsetminutes = parseInt(utcoffset.substring(3, 5), 10);
            utcoffsethours = parseInt(utcoffset.substring(1, 3), 10);
            utcoffsetminutes = utcoffsetminutes + (utcoffsethours * 60);
            return (utcoffsetsign === "-") ?
                -1 * utcoffsetminutes :
                utcoffsetminutes;
        } else {
            return 0;
        }
    },

    /**
     *
     */
    handleTimereferenceButtonToggled: function(){
        var me = this;
        var layerFilterView = this.getView();
        var dateFields = layerFilterView.query('datefield');
        var switchToUtc = Koala.Application.isUtc();
        var offsetMinutes = me.getUTCOffsetInMinutes(new Date());

        Ext.each(dateFields, function(dateField) {
            var currentDate = dateField.getValue();
            var newDate;
            if (switchToUtc) {
                // subtract the utc offset in minutes
                newDate = Ext.Date.add(currentDate, Ext.Date.MINUTE, -1 * offsetMinutes);
            } else {
                // add the utc offset in minutes
                newDate = Ext.Date.add(currentDate, Ext.Date.MINUTE, offsetMinutes);
            }
            dateField.setValue(newDate);
        });
    },

    /**
     *
     */
    onBeforeRenderLayerFilterForm: function(){
        var me = this;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.on('toggle', me.handleTimereferenceButtonToggled, me);
        });
    },

    /**
     *
     */
    onBeforeDestroyLayerFilterForm: function(){
        var me = this;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.un('toggle', me.handleTimereferenceButtonToggled, me);
        });
    }
});
