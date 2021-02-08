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
 * @class Koala.view.window.RoutingJob
 */
Ext.define('Koala.view.window.RoutingJob', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-routing-job',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.ComboBox',
        'Ext.form.field.TextArea',
        'Ext.form.field.Number',
        'Ext.form.field.Display',
        'Koala.view.window.RoutingJobController',
        'Koala.util.AppContext',
        'Koala.view.grid.RoutingTimeWindow',
        'Koala.view.form.field.GeocodingCombo',
        'Koala.model.RoutingJob'
    ],

    controller: 'k-window-routing-job',

    viewModel: {
        data: {
            i18n: {
                title: '',
                submitText: '',
                cancelText: '',
                descriptionLabel: '',
                descriptionPlaceholder: '',
                serviceLabel: '',
                emptyServiceText: '',
                priorityLabel: '',
                emptyPriorityText: '',
                addressLabel: '',
                addressPlaceholder: '',
                windowErrorText: '',
                geocodingErrorText: ''
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

    job: null,

    items: [{
        xtype: 'form',
        name: 'job-form',
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
                    name: 'address',
                    bind: {
                        fieldLabel: '{i18n.addressLabel}',
                        emptyText: '{i18n.addressPlaceholder}'
                    },
                    labelSeparator: ': *',
                    flex: 1
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
            xtype: 'combobox',
            name: 'service',
            forceSelection: true,
            queryMode: 'local',
            bind: {
                fieldLabel: '{i18n.serviceLabel}',
                emptyText: '{i18n.emptyServiceText}'
            },
            // we fill the store on initComponent
            store: {
                fields: [{
                    name: 'duration', type: 'int'
                }, {
                    name: 'title', type: 'string',
                    convert: function(v, r) {
                        var d = r.data.duration;
                        var duration = moment.duration(d, 'seconds');
                        return duration.as('hours').toFixed(1) + 'h';
                    }
                }]
            },
            displayField: 'title',
            valueField: 'duration',
            editable: false
        }, {
            xtype: 'numberfield',
            name: 'priority',
            allowDecimals: false,
            minValue: 0,
            maxValue: 100,
            bind: {
                fieldLabel: '{i18n.priorityLabel}',
                emptyText: '{i18n.emptyPriorityText}'
            }
        }, {
            xtype: 'k-grid-routing-time-window',
            name: 'time_windows',
            flex: 1
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
        setAddress: function(address) {
            var me = this;
            if (!address) {
                return;
            }

            var field = me.down('[name=address]');
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

        var appContext = Koala.util.AppContext;
        var ctx = appContext.getAppContext();
        if (!ctx) {
            ctx = {};
        }
        var routingOpts = appContext.getMergedDataByKey('routing', ctx);
        var fleetRoutingOpts = {};
        if (routingOpts && routingOpts.fleetRouting) {
            fleetRoutingOpts = routingOpts.fleetRouting;
        }
        var jobOpts = {};
        if (fleetRoutingOpts.job) {
            jobOpts = fleetRoutingOpts.job;
        }

        var form = me.down('[name=job-form]');
        if (!form) {
            return;
        }

        // 24 hours
        var maxServiceDuration = 60 * 60 * 24;
        if (Ext.isDefined(jobOpts.maxServiceDuration)) {
            maxServiceDuration = jobOpts.maxServiceDuration;
        }
        var service = form.down('[name=service]');
        if (service) {
            var serviceStore = service.getStore();
            if (serviceStore) {
                var durations = [{duration: 0}];
                do {
                    var prevDuration = durations[durations.length - 1].duration;
                    durations.push({duration: prevDuration + (30 * 60)});
                } while (
                    durations[durations.length - 1].duration < maxServiceDuration
                );

                serviceStore.loadRawData(durations);
            }
        }

        if (me.job) {
            Ext.Object.each(me.job, function(k, v) {
                var field = form.down('[name=' + k + ']');
                if (!field) {
                    return;
                }
                var store;
                switch (k) {
                    case 'time_windows':
                        store = field.getStore();
                        if (store) {
                            store.setAllFromTimestamp(v);
                        }
                        break;
                    case 'address':
                        store = field.getStore();
                        if (store) {
                            field.suspendEvents();
                            store.loadRawData([v]);
                            field.setSelection(store.first());
                            field.resumeEvents();
                        }
                        break;
                    default:
                        field.setValue(v);
                        break;
                }
            });
        }

        var fleetRoutingWindow = Ext.ComponentQuery.query('k-window-fleet-routing') [0];
        if (fleetRoutingWindow) {
            fleetRoutingWindow.fireEvent('setContextMenuType', 'job');
        }
    }

});
