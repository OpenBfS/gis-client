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
        // i18n
        minDateWarnMsg: '',
        maxDateWarnMsg: '',
        warnMsgDateFormat: '',
        endBeforeStartWarnMsg: '',
        exceedsMaxDurationWarnMsg: '',
        // i18n
        value: null,
        isValidDateTime: null,
        validationMessage: ''
    },

    formulas: {
        date: {
            get: function(get) {
                return get('value');
            },
            set: function(value) {
                if (!(moment.isMoment(value))) {
                    if (Koala.Application.isUtc()) {
                        value = Koala.util.Date.addUtcOffset(moment(value));
                    } else {
                        value = moment(value);
                    }
                }
                var date = value.clone();
                date.hours(this.get('hours'));
                date.minutes(this.get('minutes'));
                this.set({
                    value: date
                });
            }
        },
        hours: {
            get: function(get) {
                return get('value') ? get('value').hours() : null;
            },
            set: function(value) {
                var mainValue = this.get('value').clone();
                this.set({
                    value: mainValue.hours(value.get('value'))
                });
            }
        },
        minutes: {
            get: function(get) {
                return get('value') ? get('value').minutes() : null;
            },
            set: function(value) {
                var mainValue = this.get('value').clone();
                this.set({
                    value: mainValue.minutes(value.get('value'))
                });
            }
        }
    }
});
