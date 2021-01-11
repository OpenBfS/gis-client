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
        'Ext.container.Container',
        'Koala.util.AppContext',
        'Koala.view.button.RoutingProfile',
        'Koala.view.form.field.GeocodingCombo',
    ],

    controller: 'k-window-routing-vehicle',

    viewModel: {
        data: {
            i18n: {
                title: '',
                submitText: '',
                cancelText: '',
                descriptionLabel: '',
                descriptionPlaceholder: '',
                startLabel: '',
                startPlaceholder: '',
                endLabel: '',
                endPlaceholder: '',
                timeWindowTitle: '',
                startDayLabel: '',
                startDayPlaceholder: '',
                startTimePlaceholder: '',
                endDayLabel: '',
                endDayPlaceholder: '',
                endTimePlaceholder: ''
            }
        }
    },

    bind: {
        title: '{i18n.title}'
    },

    minHeight: 100,
    maxHeight: 600,
    width: 500,

    collapsible: false,
    resizable: false,
    constrainHeader: true,

    layout: 'fit',

    vehicle: null,

    items: [{
        // TODO add routing breaks
        xtype: 'form',
        name: 'vehicle-form',
        padding: 10,
        defaults: {
            anchor: '100%'
        },
        items: [{
            xtype: 'k-button-routing-profile',
            name: 'profile'
        }, {
            xtype: 'textarea',
            name: 'description',
            bind: {
                fieldLabel: '{i18n.descriptionLabel}',
                emptyText: '{i18n.descriptionPlaceholder}'
            }
        }, {
            xtype: 'k-form-field-geocodingcombo',
            name: 'start',
            bind: {
                fieldLabel: '{i18n.startLabel}',
                emptyText: '{i18n.startPlaceholder}'
            }
        }, {
            xtype: 'k-form-field-geocodingcombo',
            name: 'end',
            bind: {
                fieldLabel: '{i18n.endLabel}',
                emptyText: '{i18n.endPlaceholder}'
            }
        }, {
            xtype: 'panel',
            // TODO properly style or replace with other component
            name: 'time_window',
            bind: {
                title: '{i18n.timeWindowTitle}'
            },
            items: [{
                xtype: 'container',
                name: 'start',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'startday',
                    bind: {
                        fieldLabel: '{i18n.startDayLabel}',
                        emptyText: '{i18n.startDayPlaceholder}'
                    }
                }, {
                    xtype: 'timefield',
                    name: 'starttime',
                    bind: {
                        emptyText: '{i18n.startTimePlaceholder}'
                    }
                }]
            }, {
                xtype: 'container',
                name: 'end',
                layout: 'hbox',
                items: [{
                    xtype: 'datefield',
                    name: 'endday',
                    bind: {
                        fieldLabel: '{i18n.endDayLabel}',
                        emptyText: '{i18n.endDayPlaceholder}'
                    }
                }, {
                    xtype: 'timefield',
                    name: 'endtime',
                    bind: {
                        emptyText: '{i18n.endTimePlaceholder}'
                    }
                }]
            }]
        }]
    }],

    buttons: [{
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

    initComponent: function() {
        var me = this;
        me.callParent();

        var appContext = Koala.util.AppContext;
        var ctx = appContext.getAppContext();
        var routingOpts = appContext.getMergedDataByKey('routing', ctx);
        var optimizationOpts = {};
        if (routingOpts && routingOpts.optimization) {
            optimizationOpts = routingOpts.optimization;
        }
        var vehicleOpts = {};
        if (optimizationOpts.vehicle) {
            vehicleOpts = optimizationOpts.vehicle;
        }

        var form = me.down('[name=vehicle-form]');
        if (!form) {
            return;
        }

        // TODO add specific handling here

        if (me.vehicle) {
            Ext.Object.each(me.vehicle, function(k, v) {
                var field = form.down('[name=' + k + ']');
                if (!field) {
                    return false;
                }
                switch(k) {
                    default:
                        field.setValue(v);
                        break;
                }
            });
        }
    },

});
