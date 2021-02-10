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

        var descriptionComp = form.down('[name=description]');
        if (descriptionComp) {
            formData.description = descriptionComp.getValue();
        }

        var startComp = form.down('[name=start]');
        if (startComp) {
            var startSelection = startComp.getSelection();
            if (startSelection) {
                var start = Ext.clone(startSelection.getData());
                if (!Ext.isObject(start)) {
                    start = undefined;
                }
                formData.start = start;
            } else {
                formData.start = undefined;
            }
        }

        var endComp = form.down('[name=end]');
        if (endComp) {
            var endSelection = endComp.getSelection();
            if (endSelection) {
                var end = Ext.clone(endSelection.getData());
                if (!Ext.isObject(end)) {
                    end = undefined;
                }
                formData.end = end;
            } else {
                formData.end = undefined;
            }
        }

        var breaksValid = true;
        var breaksComp = form.down('[name=breaks]');
        if (breaksComp) {
            var breaksStore = breaksComp.store;
            if (breaksStore) {

                // ignore empty breaks
                var filteredBreakRecords = Ext.Array.filter(breaksStore.getData().items, function(b) {
                    var timeWindows = b.get('timeWindowsStore');
                    var hasItems = false;
                    if (timeWindows) {
                        hasItems = timeWindows.count() !== 0;
                    }
                    var notEmpty = hasItems
                            || !Ext.isEmpty(b.get('description'))
                            || !Ext.isEmpty(b.get('service'));

                    if (!notEmpty) {
                        var breakComp = breaksComp.down('k-panel-routing-break[recId=' + b.get('id') + ']');
                        breakComp.removeCls('routing-break-error');
                        breakComp.down('[name=break-error-field]').setHidden(true);
                    }

                    return notEmpty;
                });

                var breaks = Ext.Array.map(filteredBreakRecords, function(b) {
                    var breakComp = breaksComp.down('k-panel-routing-break[recId=' + b.get('id') + ']');
                    var result = {
                        id: b.get('id')
                    };

                    var timeWindows = b.get('timeWindowsStore');
                    if (timeWindows && timeWindows.count() !== 0) {
                        result.time_windows = timeWindows.getAllAsTimestamp();
                        if (!timeWindows.isValid()) {
                            breaksValid = false;
                            breakComp.addCls('routing-break-error');
                            breakComp.down('[name=break-error-field]').setHidden(false);
                        } else {
                            breakComp.removeCls('routing-break-error');
                            breakComp.down('[name=break-error-field]').setHidden(true);
                        }
                    } else {
                        breaksValid = false;
                        if (breakComp) {
                            breakComp.addCls('routing-break-error');
                            breakComp.down('[name=break-error-field]').setHidden(false);
                        }
                    }
                    if (!Ext.isEmpty(b.get('description'))) {
                        result.description = b.get('description');
                    }
                    if (!Ext.isEmpty(b.get('service'))) {
                        result.service = b.get('service');
                    }

                    return result;
                });

                formData.breaks = breaks;
            }
        }

        var timeWindowComponent = form.down('[name=time_window]');
        if (timeWindowComponent) {
            formData.time_window = me.getTimeWindow(timeWindowComponent);
        }

        if (!form.isValid() || !breaksValid) {
            view.down('[name=window-error-field]').setHidden(false);
            return;
        }
        view.down('[name=window-error-field]').setHidden(true);

        if (!me.isEmptyRecord(formData)) {
            view.fireEvent('updatedVehicle', formData, view.vehicle);
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

    /**
     * Get the values from the time_window input fields.
     *
     * @param {Ext.panel.Panel} comp The Panel that holds the time_window input fields.
     * @returns {[Int, Int]} A tuple containing the start and the end date of the time window as UNIX timestamps.
     */
    getTimeWindow: function(comp) {
        var startDay = comp.down('[name=startday]') || undefined;
        var startTime = comp.down('[name=starttime]') || undefined;
        var endDay = comp.down('[name=endday]') || undefined;
        var endTime = comp.down('[name=endtime]') || undefined;

        var hasStartDay = Ext.isDefined(startDay) && !Ext.isEmpty(startDay.getValue());
        var hasStartTime = Ext.isDefined(startTime) && !Ext.isEmpty(startTime.getValue());
        var hasEndDay = Ext.isDefined(endDay) && !Ext.isEmpty(endDay.getValue());
        var hasEndTime = Ext.isDefined(endTime) && !Ext.isEmpty(endTime.getValue());
        if (!hasStartDay || !hasStartTime || !hasEndDay || !hasEndTime) {
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
        var startUtcSeconds = parseInt(startUtc.valueOf() / 1000, 10);
        var endUtcSeconds = parseInt(endUtc.valueOf() / 1000, 10);
        return [startUtcSeconds, endUtcSeconds];
    }
});
