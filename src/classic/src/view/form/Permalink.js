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
 * Permalink FormPanel
 *
 * Used to show a permalink of the mapstate (center, zoom, visible layers)
 *
 * @class Koala.view.form.Permalink
 */
Ext.define('Koala.view.form.Permalink', {
    extend: 'BasiGX.view.form.Permalink',

    xtype: 'k-form-permalink',

    requires: [
        'Ext.form.field.Checkbox',
        'Ext.layout.container.VBox',

        'Koala.view.form.PermalinkController',
        'Koala.view.form.PermalinkModel'
    ],

    controller: 'k-form-permalink',
    viewModel: {
        type: 'k-form-permalink'
    },

    layout: 'vbox',

    padding: 0,

    defaults: {
        padding: 5
    },

    items: [{
        xtype: 'textarea',
        flex: 1,
        width: '100%',
        editable: false,
        bind: {
            value: '{permalinkValue}'
        },
        listeners: {
            afterrender: 'onPermalinkTextAreaAfterRender'
        }
    }, {
        xtype: 'checkbox',
        bind: {
            boxLabel: '{applyFilterCheckboxBoxLabel}',
            value: '{applyFilterCheckboxValue}'
        },
        listeners: {
            change: 'onApplyFilterCheckboxChange'
        }
    }],

    buttons: [{
        bind: {
            text: '{refreshBtnText}'
        },
        listeners: {
            click: 'onRefreshButtonClick'
        }
    }, {
        bind: {
            text: '{copyToClipboardBtnText}'
        },
        listeners: {
            boxready: 'onCopyToClipboardButtonBoxReady',
            initialize: 'onCopyToClipboardButtonBoxReady',
            click: 'onCopyToClipboardButtonClick'
        }
    }]

});
