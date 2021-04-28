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
 * @class Koala.view.window.RoutingVehicle
 */
Ext.define('Koala.view.window.RoutingVehicle', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-routing-vehicle',

    requires: [
        'Ext.panel.Panel',
        'Ext.form.Panel',
        'Ext.form.field.TextArea',
        'Ext.form.field.Date',
        'Ext.form.field.Time',
        'Ext.form.field.Display',
        'Ext.form.Label',
        'Ext.container.Container',
        'Ext.data.Store',
        'Koala.view.form.field.GeocodingCombo',
        'Koala.view.panel.RoutingBreaks'
    ],

    controller: 'k-window-routing-vehicle',

    viewModel: {
        data: {
            i18n: {
                title: '',
                submitText: '',
                cancelText: '',
                profileLabel: '',
                descriptionLabel: '',
                descriptionPlaceholder: '',
                startLabel: '',
                startPlaceholder: '',
                endLabel: '',
                endPlaceholder: '',
                startDayLabel: '',
                dayPlaceholder: '',
                timePlaceholder: '',
                endDayLabel: '',
                breaksLabel: '',
                geocodingErrorText: '',
                timeWindowErrorText: '',
                windowErrorText: '',
                startDayBiggerErrorText: '',
                startTimeBiggerErrorText: '',
                endDayBiggerErrorText: '',
                endTimeBiggerErrorText: ''
            }
        }
    },

    bind: {
        title: '{i18n.title}'
    },

    minHeight: 100,
    maxHeight: 800,
    width: 500,

    collapsible: false,
    resizable: false,
    constrainHeader: true,
    scrollable: true,

    layout: 'fit',

    vehicle: null,

    items: [{
        xtype: 'form',
        name: 'vehicle-form',
        padding: 10,
        defaults: {
            anchor: '100%'
        },
        items: [{
            xtype: 'container',
            layout: 'hbox',
            margin: '0 0 5 0',
            items: [
                {
                    xtype: 'k-form-field-geocodingcombo',
                    name: 'start',
                    bind: {
                        fieldLabel: '{i18n.startLabel}',
                        emptyText: '{i18n.startPlaceholder}'
                    },
                    labelSeparator: ': *',
                    flex: 1,
                    validator: function() {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var endField = window.down('k-form-field-geocodingcombo[name=end]');
                        if (this.getSelectedRecord() === null && endField.getSelectedRecord() === null) {
                            return vm.get('i18n.geocodingErrorText');
                        }
                        return true;
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-trash-o',
                    margin: '0 0 0 5',
                    handler: function(button) {
                        var textField = button.up().down('k-form-field-geocodingcombo');
                        if (!textField) {
                            return;
                        }
                        textField.reset();
                    }
                }
            ]
        },{
            xtype: 'container',
            layout: 'hbox',
            margin: '0 0 5 0',
            items: [
                {
                    xtype: 'k-form-field-geocodingcombo',
                    name: 'end',
                    bind: {
                        fieldLabel: '{i18n.endLabel}',
                        emptyText: '{i18n.endPlaceholder}'
                    },
                    labelSeparator: ': *',
                    flex: 1,
                    validator: function() {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var startField = window.down('k-form-field-geocodingcombo[name=start]');
                        if (this.getSelectedRecord() === null && startField.getSelectedRecord() === null) {
                            return vm.get('i18n.geocodingErrorText');
                        }
                        return true;
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-trash-o',
                    margin: '0 0 0 5',
                    handler: function(button) {
                        var textField = button.up().down('k-form-field-geocodingcombo');
                        if (!textField) {
                            return;
                        }
                        textField.reset();
                    }
                }
            ]
        }, {
            xtype: 'textarea',
            name: 'description',
            bind: {
                fieldLabel: '{i18n.descriptionLabel}',
                emptyText: '{i18n.descriptionPlaceholder}'
            }
        }, {
            xtype: 'panel',
            name: 'time_window',
            defaults: {
                margin: '0 0 5 0'
            },
            items: [{
                xtype: 'container',
                name: 'start',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'startday',
                    flex: 1,
                    bind: {
                        fieldLabel: '{i18n.startDayLabel}',
                        emptyText: '{i18n.dayPlaceholder}'
                    },
                    validator: function(value) {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var startTime = this.up().down('[name=starttime]').getValue();
                        var endDay = this.up('[name=time_window]').down('[name=endday]').getValue();
                        var endTime = this.up('[name=time_window]').down('[name=endtime]').getValue();

                        if (!value && (startTime || endDay || endTime)) {
                            return vm.get('i18n.timeWindowErrorText');
                        }

                        var format = 'DD.MM.YYYY';
                        if (endDay && moment(value, format).isAfter(moment(endDay, format))) {
                            return vm.get('i18n.startDayBiggerErrorText');
                        }

                        return true;
                    }
                }, {
                    xtype: 'timefield',
                    name: 'starttime',
                    bind: {
                        emptyText: '{i18n.timePlaceholder}'
                    },
                    validator: function(value) {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var startDay = this.up().down('[name=startday]').getValue();
                        var endDay = this.up('[name=time_window]').down('[name=endday]').getValue();
                        var endTime = this.up('[name=time_window]').down('[name=endtime]').getValue();

                        if (!value && (startDay || endDay || endTime)) {
                            return vm.get('i18n.timeWindowErrorText');
                        }

                        if (value && startDay && endDay && endTime) {
                            var format = 'DD.MM.YYYY';
                            var mStartDay = moment(startDay, format);
                            var mEndDay = moment(endDay, format);
                            var mStartTime = moment(value, format);
                            var mEndTime = moment(endTime, format);

                            var comparableBase = moment();
                            var comparableStartTime = comparableBase.clone()
                                .hours(mStartTime.hours())
                                .minutes(mStartTime.minutes());
                            var comparableEndTime = comparableBase.clone()
                                .hours(mEndTime.hours())
                                .minutes(mEndTime.minutes());

                            if (mStartDay.isSame(mEndDay, 'day') && comparableStartTime.isAfter(comparableEndTime)) {
                                return vm.get('i18n.startTimeBiggerErrorText');
                            }
                        }

                        return true;
                    }
                }]
            }, {
                xtype: 'container',
                name: 'end',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'endday',
                    flex: 1,
                    bind: {
                        fieldLabel: '{i18n.endDayLabel}',
                        emptyText: '{i18n.dayPlaceholder}'
                    },
                    validator: function(value) {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var startDay = this.up('[name=time_window]').down('[name=startday]').getValue();
                        var startTime = this.up('[name=time_window]').down('[name=starttime]').getValue();
                        var endTime = this.up().down('[name=endtime]').getValue();

                        if (!value && (startDay || startTime || endTime)) {
                            return vm.get('i18n.timeWindowErrorText');
                        }

                        var format = 'DD.MM.YYYY';
                        if (startDay && moment(value, format).isBefore(moment(startDay, format))) {
                            return vm.get('i18n.endDayBiggerErrorText');
                        }

                        return true;
                    }
                }, {
                    xtype: 'timefield',
                    name: 'endtime',
                    bind: {
                        emptyText: '{i18n.timePlaceholder}'
                    },
                    validator: function(value) {
                        var window = this.up('k-window-routing-vehicle');
                        var vm = window.getViewModel();
                        var startDay = this.up('[name=time_window]').down('[name=startday]').getValue();
                        var startTime = this.up('[name=time_window]').down('[name=starttime]').getValue();
                        var endDay = this.up().down('[name=endday]').getValue();

                        if (!value && (startDay || startTime || endDay)) {
                            return vm.get('i18n.timeWindowErrorText');
                        }

                        if (value && startTime && startDay && endDay) {
                            var format = 'DD.MM.YYYY';
                            var mStartTime = moment(startTime, format);
                            var mStartDay = moment(startDay, format);
                            var mEndDay = moment(endDay, format);
                            var mEndTime = moment(value, format);

                            var comparableBase = moment();
                            var comparableStartTime = comparableBase.clone()
                                .hours(mStartTime.hours())
                                .minutes(mStartTime.minutes());
                            var comparableEndTime = comparableBase.clone()
                                .hours(mEndTime.hours())
                                .minutes(mEndTime.minutes());

                            if (mStartDay.isSame(mEndDay, 'day') && comparableStartTime.isAfter(comparableEndTime)) {
                                return vm.get('i18n.endTimeBiggerErrorText');
                            }
                        }

                        return true;
                    }
                }]
            }]
        }, {
            xtype: 'label',
            bind: {
                text: '{i18n.breaksLabel}:'
            }
        }, {
            xtype: 'k-panel-routing-breaks',
            header: false,
            name: 'breaks',
            maxHeight: 400
        }]
    }],

    buttons: [{
        xtype: 'displayfield',
        name: 'window-error-field',
        hidden: true,
        bind: {
            value: '<i class="fa fa-exclamation-circle" style="color: #cf4c35"></i> {i18n.windowErrorText}'
        }
    }, '->', {
        bind: {
            text: '{i18n.cancelText}',
            handler: 'onCancel'
        }
    }, {
        bind: {
            text: '{i18n.submitText}',
            handler: 'onSubmit'
        }
    }],

    listeners: {
        setStart: function(address) {
            var me = this;
            if (!address) {
                return;
            }

            var field = me.down('[name=start]');
            if (!field) {
                return;
            }
            var store = field.getStore();
            if (store) {
                field.suspendEvents();
                store.loadRawData([address]);
                field.setSelection(store.first());
                field.resumeEvents();
            }
        },
        setEnd: function(address) {
            var me = this;
            if (!address) {
                return;
            }

            var field = me.down('[name=end]');
            if (!field) {
                return;
            }
            var store = field.getStore();
            if (store) {
                field.suspendEvents();
                store.loadRawData([address]);
                field.setSelection(store.first());
                field.resumeEvents();
            }
        },
        beforedestroy: function() {
            var fleetRoutingWindow = Ext.ComponentQuery.query('k-window-fleet-routing')[0];
            if (fleetRoutingWindow) {
                fleetRoutingWindow.fireEvent('resetContextMenu');
            }
        }
    },

    initComponent: function() {
        var me = this;
        me.callParent();

        var form = me.down('[name=vehicle-form]');
        if (!form) {
            return;
        }

        if (me.vehicle) {
            Ext.Object.each(me.vehicle, function(k, v) {
                var field = form.down('[name=' + k + ']');
                if (!field) {
                    return;
                }
                switch (k) {
                    case 'end':
                    case 'start':
                        var store = field.getStore();
                        if (store && v) {
                            field.suspendEvents();
                            store.loadRawData([v]);
                            field.setSelection(store.first());
                            field.resumeEvents();
                        }
                        break;
                    case 'time_window':
                        if (!Ext.isArray(v) || v.length !== 2) {
                            break;
                        }
                        var startDay = field.down('[name=startday]');
                        var startTime = field.down('[name=starttime]');
                        var endDay = field.down('[name=endday]');
                        var endTime = field.down('[name=endtime]');
                        if (startDay) {
                            var s = new Date(v[0] * 1000);
                            startDay.setValue(new Date(s.getFullYear(), s.getMonth(), s.getDate()));
                        }
                        if (startTime) {
                            startTime.setValue(new Date(v[0] * 1000));
                        }
                        if (endDay) {
                            var e = new Date(v[1] * 1000);
                            endDay.setValue(new Date(e.getFullYear(), e.getMonth(), e.getDate()));
                        }
                        if (endTime) {
                            endTime.setValue(new Date(v[1] * 1000));
                        }
                        break;
                    case 'breaks':
                        field.fireEvent('overwriteStore', v);
                        break;
                    default:
                        field.setValue(v);
                        break;
                }
            });
        }

        var fleetRoutingWindow = Ext.ComponentQuery.query('k-window-fleet-routing') [0];
        if (fleetRoutingWindow) {
            fleetRoutingWindow.fireEvent('setContextMenuType', 'vehicle');
        }
    }
});
