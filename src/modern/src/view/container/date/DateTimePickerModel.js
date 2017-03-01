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
 * @class Koala.view.container.date.DateTimePickerModel
 */
Ext.define('Koala.view.container.date.DateTimePickerModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-container-datetimepicker',

    data: {
        minDateWarnMsg: '',
        maxDateWarnMsg: '',
        warnMsgDateFormat: 'peter2',
        value: null
    },

    formulas: {
        date: {
            get: function(get) {
                return get('value');
            },
            set: function(value) {
                var date = Ext.Date.clone(value);
                date.setHours(this.get('hours'));
                date.setMinutes(this.get('minutes'));
                date.setSeconds(this.get('seconds'));
                this.set({
                    value: date
                });
            }
        },
        hours: {
            get: function(get) {
                return get('value') ? get('value').getHours() : null;
            },
            set: function(value) {
                this.set({
                    value: new Date(this.get('value').setHours(value.get('value')))
                });
            }
        },
        minutes: {
            get: function(get) {
                return get('value') ? get('value').getMinutes() : null;
            },
            set: function(value) {
                this.set({
                    value: new Date(this.get('value').setMinutes(value.get('value')))
                });
            }
        },
        seconds: {
            get: function(get) {
                return get('value') ? get('value').getSeconds() : null;
            },
            set: function(value) {
                this.set({
                    value: new Date(this.get('value').setSeconds(value.get('value')))
                });
            }
        }
    }
});
