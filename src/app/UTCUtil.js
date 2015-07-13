Ext.define('Koala.UTCUtil', {
    // from bfs.geozg.Util
    /**
     * Returns an adjusted date.
     * 
     * If the user has toggled the time button to use local time (initial
     * state), we return the adjusted date. This will be the UTC date,
     * derived from a given local time. If the button is pressed to use UTC
     * time, we return the date called with this function.
     *
     * @return {Date} The Date which has been adjusted, if the button has
     *     been unpressed
     * @param {Date} The Date the user has selected e.g. in the timepicker
     */
    getUTCTime: function(date) {
        var timeBtn = Ext.ComponentQuery.query('button[name=utc-time-button]')[0];
        if (timeBtn.pressed) { //using UTC time
            return date;
        } else { // using local time, returning adjusted date
            var utcoffsetinminutes = bfs.geozg.Util.getUTCOffsetInMinutes(date),
                utcdate;
            utcdate = Ext.Date.add(date, Ext.Date.MINUTE, (-1 * utcoffsetinminutes));
            return utcdate;
        }
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
     * Returns an adjusted date.
     *
     * If the user has toggled the time button to use local time (initial
     * state), we return an adjusted date. This will be the local date,
     * derived from a given UTC date. If the button is pressed to use UTC
     * time, we return the date called with this function.
     *
     * @return {Date} The Date which has been adjusted, if the button has
     *     been unpressed
     * @param {Date} The Date the user has selected e.g. in the timepicker
     */
    getLocalTimeFromUTC: function(date) {
        var timeBtn = Ext.ComponentQuery.query('button[name=utc-time-button]')[0];
        if (timeBtn.pressed) { //using UTC time
            return date;
        } else { // using local time, returning adjusted date
            var utcoffsetinminutes = bfs.geozg.Util.getUTCOffsetInMinutes(date),
                utcdate;
            utcdate = Ext.Date.add(date, Ext.Date.MINUTE, utcoffsetinminutes);
            return utcdate;
        }

    },
    
    // from bfs.geozg.controller.MainController
    /**
     * checks the legend tree and tries to correct dates to utc time or to local
     * time depebnding on the passed buttons's state.
     *
     * @param {Ext.Button} utcBtn the utc button.
     */
    updateLegendDates: function(utcBtn){
        var dspDateSpans = Ext.DomQuery.select('span.displayed-date');
        Ext.each(dspDateSpans, function(dspDateSpan) {
            var extDateSpanElem = Ext.get(dspDateSpan),
                dspFormat = extDateSpanElem.getAttribute('data-dspdateformat'),
                utcDateStr = extDateSpanElem.getAttribute('data-utcdate'),
                utcDateFormat = extDateSpanElem.getAttribute('data-utcformat'),
                utcDate = Ext.Date.parse(utcDateStr, utcDateFormat),
                offset = bfs.geozg.Util.getUTCOffsetInMinutes(utcDate),
                adjusted,
                adjustedDspDate;

            if (utcBtn.pressed) {
                // requested next display is 'utc time', which we already have
                adjusted = utcDate;
            } else {
                // requested next display is 'local time'
                adjusted = Ext.Date.add(utcDate, Ext.Date.MINUTE, offset);
            }

            adjustedDspDate = Ext.Date.format(adjusted, dspFormat);
            extDateSpanElem.setHTML(adjustedDspDate);
        });
    },
    
    /**
     * Handles filter settings for a selected layer and sets the apply layer button
     * according to these settings.
     *
     * @param {Object} selModel
     * @param {Object} record
     * @param {Object} idx
     * @param {Object} eOpts
     */
    treepanelItemSelected: function(selModel, record, idx, eOpts) {
        var me = this,
            name = record.get("dspTxt"),
            isLeaf = !!record.get('leaf'),
            isFolder = !isLeaf,
            filterConfig = record.get("filterConfig"),
            layerConfig = record.get("layerConfig"),
            inspireId = record.get("inspireId"),
            amsDefaultStart = record.get("defaultStart"),
            amsDateFormat = me.dateFormatOutputTodateFormatParse(record.get("dateFormat")),
            dateFromField = me.getFcDateFrom(),
            dateToField = me.getFcDateTo(),
            applyBtn = me.getApplyLayerButton(),
            dateParse = Ext.Date.parse;

        // always disable send button when a folder is selected
        if (isFolder) {
            applyBtn.disable();
            applyBtn.hide();
            dateFromField.disable();
            dateFromField.hide();
            dateToField.disable();
            dateToField.hide();
        }

        // always show mappanel tab, when something in the trees is selected
        me.showMapTab();

        if (Ext.isObject(filterConfig)) {
            // this layer has a filter, the apply button can be enabled/shown
            applyBtn.enable();
            applyBtn.show();

            if ( ( filterConfig.type === "daterange" || filterConfig.type === "date" ) &&
                    filterConfig.interval &&
                    filterConfig.unit &&
                    filterConfig.vendorParamStart ) {

                // we have a valid date-like filter

                var now = new Date(),
                    defaultStart = dateParse(amsDefaultStart, amsDateFormat),
                    minDate = dateParse(layerConfig.wms.timeExtendStart, amsDateFormat),
                    toMaxDate = dateParse(layerConfig.wms.timeExtendEnd, amsDateFormat),
                    maxDate = dateParse(layerConfig.wms.timeExtendEnd, amsDateFormat);

                //before setting the default start, we have to consider utc times
                defaultStart = bfs.geozg.Util.getLocalTimeFromUTC(defaultStart);
                minDate = bfs.geozg.Util.getLocalTimeFromUTC(minDate);
                toMaxDate = bfs.geozg.Util.getLocalTimeFromUTC(toMaxDate);
                maxDate = bfs.geozg.Util.getLocalTimeFromUTC(maxDate);

                // use the original maxDate for the to fields:
                dateToField.dateField.setMaxValue(toMaxDate);

                // now adjust the max date, so it starts interval * units earlier:
                maxDate = me.calculateTimeRange(maxDate, filterConfig.unit, (-1 * filterConfig.interval));

                dateFromField.setDisabled(false);

                dateFromField.show();

                // apply min. and max dates
                dateFromField.dateField.setMinValue(minDate);
                dateFromField.dateField.setMaxValue(maxDate);
                // in case of a 'date' request, also set min and max time
                if (filterConfig.type === "date") {
                    dateFromField.timeField.setMinValue(minDate);
                    dateFromField.timeField.setMaxValue(maxDate);
                } else {
                    dateFromField.timeField.setMinValue(null);
                    dateFromField.timeField.setMaxValue(null);
                }

                dateFromField.setValue(defaultStart);

                dateFromField.validate();

                var to = this.calculateTimeRange(defaultStart, filterConfig.unit, filterConfig.interval);
                to = this.adjustEndTime(to);

                dateToField.setValue(to);

                if (filterConfig.type === "daterange") {
                    dateToField.validate();
                }

                if (filterConfig.type === "date" ) {
                    dateToField.hide();
                } else {
                    dateFromField.show();
                    dateToField.show();
                }
            } else {
                dateFromField.setDisabled(true);
                dateToField.hide();
            }

            // according to the current filter certain UI neeeds to be disabled/enabled
            me.enableDisableTimeFieldsByFilterUnit(filterConfig.unit);

        } else if (filterConfig === null) {
            // statischer Layer ohne filter
            applyBtn.enable();
            applyBtn.show();

            dateFromField.setValue(null);
            dateToField.setValue(null);

            dateFromField.setDisabled(true);
            dateToField.setDisabled(true);

            dateFromField.hide();
            dateToField.hide();

        } else {
            // this shouldn't happen as the ams is suppossed to deliver either
            // a filter or null...
        }

        applyBtn.layerConfig = layerConfig;
        applyBtn.layerName = name;
        applyBtn.filterConfig = filterConfig;
        applyBtn.dateFormat = amsDateFormat;
        applyBtn.defaultStart = amsDefaultStart;
        applyBtn.inspireId = inspireId;
    },
    
    /**
     * Adjusts given date by a certain amount to satisfy certain services like
     * WFS and WMS-Time. See
     * [Ticket 51, comment 10][http://intranet.terrestris.de/trac/bfs_geozg/ticket/51#comment:10]
     * and [Ticket 51, comment 18][http://intranet.terrestris.de/trac/bfs_geozg/ticket/51#comment:18].
     *
     * @param {Date} dateValue the datevalue to adjust
     * @return {Date} the adjusted date
     */
    adjustEndTime: function(dateValue){
        return this.calculateTimeRange(dateValue, 'second', -1);
    },
    
    /**
     * Adds or subtracts a given interval to a date
     *
     * @param dateOrigin the date acting as base value for adding/subtracting
     * @param unit the unit of the given interval, e.g. DAY
     * @param interval Numeric interval to be added (negative to subtract)
     */
    calculateTimeRange: function(dateOrigin, unit, interval) {
        var dt = Ext.Date.add(dateOrigin, Ext.Date[unit.toUpperCase()], interval);
        return dt;
    }

});