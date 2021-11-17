/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.WpsWindow
 */
Ext.define('Koala.view.window.WpsWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-wps',
    cls: 'k-window-wps',

    requires: [
        'Ext.button.Button',
        'Ext.form.Panel',
        'Ext.container.Container',
        'Koala.util.AppContext',
        'Koala.view.window.WpsWindowController',
        'Koala.view.window.WpsWindowModel'
    ],

    controller: 'k-window-wps',

    viewModel: {
        type: 'k-window-wps'
    },

    bind: {
        title: '{title}'
    },

    constrainHeader: true,
    collapsible: true,
    minHeight: 100,
    maxHeight: 600,
    width: 500,
    autoShow: true,
    bodyPadding: 5,

    layout: {
        type: 'vbox'
    },

    defaults: {
        flex: 1,
        width: '100%'
    },

    config: {
        addFilterForm: true,
        oldChart: null
    },

    layer: null,
    interaction: null,

    listeners: {
        beforedestroy: 'onBeforeDestroy'
    },

    bbar: [],

    items: [{
        xtype: 'combo',
        name: 'process-identifier',
        store: 'processes-store',
        editable: false,
        labelSeparator: '',
        valueField: 'processId',
        displayField: 'title',
        bind: {
            fieldLabel: '{processLabel}'
        },
        listeners: {
            select: 'onProcessChange'
        }
    }, {
        xtype: 'form',
        name: 'dynamic-form-container',
        layout: 'vbox',
        defaults: {
            flex: 1,
            width: '100%'
        },
        items: [],
        buttons: [{
            bind: {
                text: '{runBtnText}',
                hidden: '{hideRunBtn}'
            },
            formBind: true,
            disabled: true,
            handler: 'onRunClick'
        }]
    }, {
        xtype: 'container',
        name: 'error-msg-container',
        bind: {
            hidden: '{hideErrorMsgContainer}',
            html: '<i>{errorMsg}</i>'
        }
    }]

});
