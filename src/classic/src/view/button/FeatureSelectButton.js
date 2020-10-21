/* Copyright (c) 2020-present terrestris GmbH & Co. KG
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
 * @class Koala.view.button.FeatureSelectButton
 */
Ext.define('Koala.view.button.FeatureSelectButton', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-featureselect',

    requires: [
        'Koala.view.button.FeatureSelectButtonController',
        'Koala.view.button.FeatureSelectButtonModel',
        'Koala.util.Object'
    ],

    controller: 'k-button-featureselect',
    viewModel: {
        type: 'k-button-featureselect'
    },

    iconCls: 'x-fa fa-table',

    disabled: true,

    bind: {
        tooltip: '{tooltip}'
    },

    listeners: {
        click: 'onClick',
        beforedestroy: 'onBeforeDestroy'
    },

    config: {
        layer: null,
        transformInteraction: null
    },

    window: null,

    initComponent: function() {
        var me = this;
        this.callParent();
        this.targetLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        this.window = Ext.create('Ext.window.Window', {
            width: 400,
            height: 400,
            autoScroll: true,
            closeAction: 'method-hide',
            title: this.getViewModel().get('tooltip'),
            items: [{
                xtype: 'k-grid-filter',
                selModel: 'checkboxmodel',
                scrollable: true,
                height: 'auto',
                store: {
                    autoLoad: true,
                    data: []
                },
                layer: this.targetLayer
            }]
        });
        var interaction = this.getTransformInteraction();
        if (interaction) {
            interaction.on('translateend', function() {
                me.getController().updateFeatures();
            });
            interaction.on('scaleend', function() {
                me.getController().updateFeatures();
            });
        }
    }

});
