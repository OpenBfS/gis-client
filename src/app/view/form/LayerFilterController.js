Ext.define('Koala.view.form.LayerFilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-layerfilter',

    submitFilter: function(){
        var me = this;
        var LayerUtil = Koala.util.Layer;
        var view = me.getView();
        var metadata = view.getMetadata();
        var filters = view.getFilters();

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
                        keyVals[key] = field.getValue();
                        // console.log("+++ Keep field with key ", key, "of fieldset", selector, "value", keyVals[key]);
                    } else {
                        // console.log("--- Ignore field with key ", key, "of fieldset", selector);
                    }
                });
                filters = me.updateFilterValues(filters, idx, keyVals);
            }
        });
        metadata.filters = filters;
        var layer = LayerUtil.layerFromMetadata(metadata);
        LayerUtil.addOlLayerToMap(layer);
        view.up('window').close();
    },

    /**
     *
     */
    updateFilterValues: function(filters, idx, keyVals) {
        var view = this.getView();

        var filter = filters[idx];
        var filterType = (filter.type || "").toLowerCase();
        var param = filter.param;
        if (filterType === 'timerange') {
            var keys = view.startAndEndFieldnamesFromMetadataParam(param);
            filter.mindatetimeinstant = keyVals[keys.startName];
            filter.maxdatetimeinstant = keyVals[keys.endName];
        } else if (filterType === 'pointintime') {
            filter.timeinstant = keyVals[param];
        } else if (filterType === 'value') {
            filter.value = keyVals[param];
        }
        filters[idx] = filter;
        return filters;
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
