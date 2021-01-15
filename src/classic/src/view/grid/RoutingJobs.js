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
 * @class Koala.view.grid.RoutingJobs
 */
Ext.define('Koala.view.grid.RoutingJobs', {
    extend: 'Ext.grid.Panel',
    xtype: 'k-grid-routing-jobs',

    requires: [
        'Ext.grid.column.Action',
        'Ext.Array',
        'BasiGX.util.Animate',
        'Koala.view.window.RoutingJob',
        'Koala.store.RoutingJobs'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                emptyJobText: '',
                priorityColumnText: '',
                addressColumnText: '',
                descriptionColumnText: '',
                editJobTooltip: '',
                addJobTooltip: '',
                removeJobTooltip: ''
            }
        }
    },

    enableColumnHide: false,
    enableColumnMove: false,

    bind: {
        title: '{i18n.title}',
        emptyText: '{i18n.emptyJobText}'
    },

    store: {
        type: 'k-routingjobs'
    },

    columns: {
        items: [{
            dataIndex: 'priority',
            bind: {
                text: '{i18n.priorityColumnText}'
            }
        }, {
            dataIndex: 'address',
            bind: {
                text: '{i18n.addressColumnText}'
            },
            flex: 1,
            renderer: function(address) {
                if (address) {
                    return '<span data-qtip="' + address.address + '">' + address.address + '</span>';
                }
            }
        }, {
            dataIndex: 'description',
            bind: {
                text: '{i18n.descriptionColumnText}'
            },
            flex: 1,
            renderer: function(description) {
                return '<span data-qtip="' + description + '">' + description + '</span>';
            }
        }, {
            xtype: 'actioncolumn',
            width: 50,
            items: [{
                iconCls: 'x-fa fa-cog',
                // TODO tooltips are not bindable here, so we have to find a simple
                //      way of adding them here. i18n.editJobTooltip
                name: 'edit-job-action',
                handler: function(grid, rowIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    // make sure there is always only a single window opened
                    var win = Ext.ComponentQuery.query('k-window-routing-job')[0];

                    if (!win) {
                        var job = Ext.clone(rec.getData());
                        Ext.create({
                            xtype: 'k-window-routing-job',
                            job: job
                        }).show();
                    } else {
                        BasiGX.util.Animate.shake(win);
                    }

                }
            }, {
                iconCls: 'x-fa fa-trash-o',
                // TODO tooltips are not bindable here, so we have to find a simple
                //      way of adding them here. i18n.removeJobTooltip
                name: 'remove-job-action',
                handler: function(grid, rowIndex) {
                    var win = Ext.ComponentQuery.query('k-window-routing-job')[0];

                    if (!win) {
                        grid.getStore().removeAt(rowIndex);
                    } else {
                        BasiGX.util.Animate.shake(win);
                    }

                }
            }]
        }]
    },

    buttons: [{
        iconCls: 'fa fa-plus',
        bind: {
            tooltip: '{i18n.addJobTooltip}'
        },
        handler: function(btn) {
            var view = btn.up('k-grid-routing-jobs');
            if (!view) {
                return;
            }

            var win = Ext.ComponentQuery.query('k-window-routing-job')[0];

            if (!win) {
                Ext.create({
                    xtype: 'k-window-routing-job'
                }).show();
            } else {
                BasiGX.util.Animate.shake(win);
            }
        }
    }],

    listeners: {
        beforedestroy: function() {
            var win = Ext.ComponentQuery.query('k-window-routing-job')[0];
            if (win) {
                win.close();
            }
        },
        applyJob: function(data, job) {
            var me = this;
            var store = me.getStore();
            if (store) {
                if (job) {
                    var rec = store.getById(job.id);
                    rec.set(data);
                } else {
                    store.add(data);
                }
            }
        }
    }

});
