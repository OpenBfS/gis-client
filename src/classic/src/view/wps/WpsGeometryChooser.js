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
 * @class Koala.view.wps.WpsGeometryChooser
 */
Ext.define('Koala.view.wps.WpsGeometryChooser', {
    extend: 'Ext.container.Container',
    xtype: 'wps-geometrychooser',

    requires: [
        'Ext.Promise',
        'Ext.button.Button',
        'Ext.form.field.FileButton',
        'Koala.view.wps.WpsGeometryChooserModel',
        'Koala.view.wps.WpsGeometryChooserController',
        'Koala.view.wps.ContainerText'
    ],

    controller: 'wps-geometrychooser',
    viewModel: {
        type: 'wps-geometrychooser'
    },

    layout: {
        type: 'hbox',
        align: 'center'
    },

    fieldLabel: undefined,
    allowBlank: true,
    supportedCRSs: [],

    draw: false,
    bbox: false,
    currentExtent: true,
    upload: false,

    identifier: undefined,
    mimeType: 'application/vnd.geo+json',
    schema: undefined,
    encoding: undefined,
    asReference: false,
    dimension: undefined,

    items: [{
        xtype: 'wps-container-textfield',
        flex: 1,
        width: '100%',
        bind: {
            value: '{geojsonString}'
        }
    }],

    listeners: {
        beforedestroy: 'onBeforeDestroy'
    },

    generateInput: function() {
        var generator = new InputGenerator();
        var input;
        if (this.bbox) {
            var vm = this.lookupViewModel();
            var crs = this.supportedCRSs[0];
            var dimension = this.dimension;
            var bbox = vm.get('bbox');
            if (!bbox) {
                if (!this.allowBlank) {
                    return Ext.Promise.reject({
                        identifier: this.identifier,
                        label: this.fieldLabel
                    });
                }
                return Ext.Promise.resolve();
            }
            var lowerCorner = bbox[0] + ' ' + bbox[1];
            var upperCorner = bbox[2] + ' ' + bbox[3];
            input = generator.createBboxDataInput_wps_1_0_and_2_0(
                this.identifier, crs, dimension, lowerCorner, upperCorner
            );
        } else {
            var geoJson = this.down('wps-container-textfield').getValue();
            if (!geoJson) {
                if (!this.allowBlank) {
                    return Ext.Promise.reject({
                        identifier: this.identifier,
                        label: this.fieldLabel
                    });
                }
                return Ext.Promise.resolve();
            }
            var payload = '<![CDATA[' + geoJson + ']]>';
            input = generator.createComplexDataInput_wps_1_0_and_2_0(
                this.identifier, this.mimeType, this.schema, this.encoding, this.asReference, payload
            );
        }
        return Ext.Promise.resolve(input);
    },

    initComponent: function() {
        this.callParent();
        var textField = this.down('wps-container-textfield');
        textField.setFieldLabel(this.fieldLabel);
        var menuButton = {
            xtype: 'button',
            text: '…',
            menu: []
        };
        if (this.draw) {
            menuButton.menu.push({
                bind: {
                    text: '{i18n.draw}'
                },
                handler: 'draw'
            });
        }
        if (this.bbox) {
            menuButton.menu.push({
                bind: {
                    text: '{i18n.bbox}'
                },
                handler: 'drawBbox'
            });
        }
        if (this.currentExtent) {
            menuButton.menu.push({
                bind: {
                    text: '{i18n.currentExtent}'
                },
                handler: 'currentExtent'
            });
        }
        if (this.upload) {
            menuButton.menu.push({
                // intentionally hidden button
                xtype: 'filebutton',
                listeners: {
                    afterrender: 'uploadButtonAfterRender'
                },
                accept: '.geojson,.json',
                hidden: true
            });
            menuButton.menu.push({
                bind: {
                    text: '{i18n.upload}'
                },
                handler: function(item) {
                    var bb = item.up().down('filebutton');
                    bb.fileInputEl.dom.click();
                }
            });
        }
        this.add(menuButton);
    }
});
