/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.RoutingVehicleController
 */
Ext.define('Koala.view.window.RoutingVehicleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-routing-vehicle',
    requires: [
        'Ext.Object',
        'Ext.Array',
        'Ext.ComponentQuery',
        'Koala.util.Date'
    ],

    /**
     * Handle the submission of a single RoutingVehicle by
     * sending the RoutingVehicle to the parent grid and
     * closing the window.
     */
    onSubmit: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var form = view.down('[name=vehicle-form]');
        if (!form) {
            view.close();
            return;
        }

        var formData = {};

        var profileComp = form.down('[name=profile]');
        if (profileComp) {
            formData.profile = profileComp.getValue();
        }

        var descriptionComp = form.down('[name=description]');
        if (descriptionComp) {
            formData.description = descriptionComp.getValue();
        }

        var startComp = form.down('[name=start]');
        if (startComp) {
            var selection = startComp.getSelection();
            if (selection) {
                var start = Ext.clone(selection.getData());
                if (!Ext.isObject(start)) {
                    start = undefined;
                }
                formData.start = start;
            }
        }

        var endComp = form.down('[name=end]');
        if (endComp) {
            var selection = endComp.getSelection();
            if (selection) {
                var end = Ext.clone(selection.getData());
                if (!Ext.isObject(end)) {
                    end = undefined;
                }
                formData.end = end;
            }
        }

        var breaksComp = form.down('[name=breaks]');
        if (breaksComp) {
            var breaksStore = breaksComp.store;
            if (breaksStore && breaksStore.count() !== 0) {

                // ignore empty breaks
                var filteredBreakRecords = Ext.Array.filter(breaksStore.getData().items, function(b){
                    var timeWindows = b.get('timeWindowsStore');
                    var hasItems = false;
                    if (timeWindows) {
                        hasItems = timeWindows.count() !== 0;
                    }
                    return hasItems
                            || !Ext.isEmpty(b.get('description'))
                            || !Ext.isEmpty(b.get('service'));
                });

                var breaks = Ext.Array.map(filteredBreakRecords, function(b) {
                    var result = {
                        id: b.get('id')
                    };

                    var timeWindows = b.get('timeWindowsStore');
                    if (timeWindows && timeWindows.count() !== 0) {
                        result.time_windows = timeWindows.getAllAsTimestamp();
                    }
                    if (!Ext.isEmpty(b.get('description'))) {
                        result.description = b.get('description');
                    }
                    if (!Ext.isEmpty(b.get('service'))) {
                        result.service = b.get('service');
                    }

                    return result;
                });

                if (!Ext.isEmpty(breaks)) {
                    formData.breaks = breaks;
                }
            }
        }

        // TODO check why start and end are not set sometimes
        // TODO check for required values

        var timeWindowComponent = form.down('[name=time_window]');
        if (timeWindowComponent) {
            formData.time_window = me.getTimeWindow(timeWindowComponent);
        }

        debugger;
        if (!me.isEmptyRecord(formData)) {
            var parentGrid = Ext.ComponentQuery.query('k-grid-routing-vehicles')[0];
            if (parentGrid) {
                parentGrid.fireEvent('applyVehicle', formData, view.vehicle);
            }
        }

        view.close();
    },

    /**
     * Handler for the cancel event.
     */
    onCancel: function() {
        var me = this;
        var view = me.getView();
        if (view) {
            view.close();
        }
    },

    /**
     * Check if a RoutingVehicle record is empty.
     *
     * @param {Ext.data.Model} rec The RoutingVehicle record.
     */
    isEmptyRecord: function(rec) {
        var empty = true;
        Ext.Object.eachValue(rec, function(v) {
            if (!Ext.isEmpty(v)) {
                empty = false;
            }
        });
        return empty;
    },

    getTimeWindow: function(comp) {
        var startDay = comp.down('[name=startday]') || undefined;
        var startTime = comp.down('[name=starttime]') || undefined;
        var endDay = comp.down('[name=endday]') || undefined;
        var endTime = comp.down('[name=endtime]') || undefined;

        if (
            !Ext.isDefined(startDay) || !Ext.isDefined(startTime) || !Ext.isDefined(endDay) || !Ext.isDefined(endTime)
            || Ext.isEmpty(startDay.getValue()) || Ext.isEmpty(startTime.getValue()) || Ext.isEmpty(endDay.getValue()) || Ext.isEmpty(endTime.getValue())
            ) {
            return;
        }

        var startDayVal = moment(startDay.getValue());
        var startTimeVal = moment(startTime.getValue());
        var endDayVal = moment(endDay.getValue());
        var endTimeVal = moment(endTime.getValue());

        var start = startDayVal.clone()
            .hour(startTimeVal.hour())
            .minute(startTimeVal.minute());

        var end = endDayVal.clone()
            .hour(endTimeVal.hour())
            .minute(endTimeVal.minute());

        var startUtc = Koala.util.Date.getUtcMoment(start);
        var endUtc = Koala.util.Date.getUtcMoment(end);
        return [startUtc.valueOf(), endUtc.valueOf()];
    }
});
