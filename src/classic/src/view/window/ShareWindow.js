/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.ShareWindow
 */
Ext.define('Koala.view.window.ShareWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-share',
    cls: 'k-window-share',

    requires: [
    ],

    controller: 'k-window-share',

    viewModel: {
        type: 'k-window-share'
    },

    bind: {
        title: '{title}'
    },

    autoShow: true,
    bodyPadding: 5,
    constrainHeader: true,
    collapsible: true,
    maxHeight: 800,
    height: 300,
    width: 500,
    layout: 'vbox',

    defaults: {
        flex: 1,
        width: '100%'
    },

    config: {
        /**
         * The layer to possibly clone.
         * @type {ol.layer.Layer}
         */
        sourceLayer: null
    },

    items: [{
        xtype: 'form',
        width: 495,
        bbar: [{
            xtype: 'button',
            bind: {
                text: '{okButtonLabel}'
            },
            handler: 'shareHandler'
        }, {
            xtype: 'button',
            bind: {
                text: '{cancelButtonLabel}'
            },
            handler: 'cancelHandler'
        }],
        items: [{
            xtype: 'textfield',
            labelWidth: 200,
            width: '95%',
            bind: {
                fieldLabel: '{layerNameLabel}'
            }
        }, {
            xtype: 'k-form-field-vectortemplatecombo'
        }]
    }]

});
