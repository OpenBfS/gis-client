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
 * @class Koala.view.panel.RoutingBreaks
 */
Ext.define('Koala.view.panel.RoutingBreaks', {
    extend: 'Ext.panel.Panel',

    xtype: 'k-panel-routing-breaks',

    requires: [
        'Ext.Array',
        'Ext.container.Container',
        'Ext.form.field.Display',
        'Koala.view.panel.RoutingBreak',
        'Koala.store.RoutingBreaks'
    ],

    viewModel: {
        data: {
            i18n: {
                title: '',
                addBreakTooltip: '',
                noBreaksText: ''
            }
        }
    },

    store: null,

    collapsible: true,

    scrollable: 'vertical',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    padding: '0 0 10 0',

    defaults: {
        bodyPadding: 10,
        padding: '10 0 0 0'
    },

    bind: {
        title: '{i18n.title}'
    },

    buttons: [{
        xtype: 'displayfield',
        name: 'no-breaks-field',
        hidden: true,
        cls: 'no-breaks-field',
        bind: {
            value: '{i18n.noBreaksText}'
        }
    }, '->', {
        iconCls: 'x-fa fa-plus',
        bind: {
            tooltip: '{i18n.addBreakTooltip}'
        },
        handler: function(btn) {
            var routingBreaks = btn.up('k-panel-routing-breaks');
            if (!routingBreaks) {
                return;
            }

            var store = routingBreaks.store;
            if (store) {
                store.add({});
            }
        }
    }],

    listeners: {
        overwriteStore: function(items) {
            var me = this;
            if (me.store) {
                // we have to use remove() here so we will trigger
                // the removal of components
                me.store.remove(me.store.getData().items);
                // we have to use add() here so we will trigger
                // the creation of components
                me.store.add(items);
            }
        },
        removeBreak: function(item) {
            var me = this;
            if (!item) {
                return;
            }
            if (me.store) {
                me.store.remove(item);
            }
        },
        beforedestroy: function() {
            var me = this;
            if (me.store) {
                me.store.removeListener('add', me.onStoreAdd);
                me.store.removeListener('remove', me.onStoreRemove);
            }
        }
    },

    onStoreAdd: function(store, records) {
        var me = this;
        Ext.Array.each(records, me.addItem.bind(me));
    },

    onStoreRemove: function(store, records) {
        var me = this;
        Ext.Array.each(records, function(rec) {
            var item = me.down('[recId=' + rec.id + ']');
            if (item) {
                me.remove(item);
            }
        });
        if (store.count() === 0) {
            me.down('[name=no-breaks-field]').setHidden(false);
        }
    },

    addItem: function(rec) {
        var me = this;
        var item = Ext.create({
            xtype: 'k-panel-routing-break',
            recId: rec.id,
            break: rec
        });
        me.add(item);
        me.down('[name=no-breaks-field]').setHidden(true);
    },

    initComponent: function() {
        var me = this;
        me.callParent(arguments);

        if (!me.store) {
            me.store = Ext.create('Koala.store.RoutingBreaks');
        }

        me.store.addListener('add', me.onStoreAdd, me);
        me.store.addListener('remove', me.onStoreRemove, me);
        me.store.each(me.addItem, me);

        if (me.store.count() === 0) {
            me.store.add({});
        }
    }
});
