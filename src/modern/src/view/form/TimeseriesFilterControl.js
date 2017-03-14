/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.form.TimeseriesFilterControl
 */
Ext.define("Koala.view.form.TimeseriesFilterControl", {
    extend: "Ext.form.Panel",
    xtype: "k-form-timeseriesfiltercontrol",

    requires: [
        "Ext.field.DatePicker",
        "Ext.field.Select",

        "Koala.util.Date",
        "Koala.util.Filter",

        'Koala.view.container.date.DateTimePicker',

        "Koala.view.form.TimeseriesFilterControlController",
        "Koala.view.form.TimeseriesFilterControlModel"
    ],

    controller: "k-form-timeseriesfiltercontrol",
    viewModel: {
        type: "k-form-timeseriesfiltercontrol"
    },

    items: [{
        xtype: 'k-container-datetimepicker',
        name: 'startdate',
        partnerType: 'start',
        partnerFieldName: 'enddate',
        value: null,
        bind: {
            label: '{labelStartDate}'
        }
    }, {
        xtype: 'k-container-datetimepicker',
        name: 'enddate',
        partnerType: 'end',
        partnerFieldName: 'startdate',
        value: null,
        margin: '5 0 0 0',
        bind: {
            label: '{labelEndDate}'
        }
    }, {
        xtype: 'button',
        margin: '5 0 0 0',
        bind: {
            text: '{setFilterButtonText}'
        },
        handler: 'onSetFilterButtonClick'
    }]
});
