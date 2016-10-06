Ext.define('Koala.view.panel.MobileAddLayer',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileaddlayer',

    requires: [
        'Koala.view.panel.MobileAddLayerController',
        'Koala.view.panel.MobileAddLayerModel'
    ],

    controller: 'k-panel-mobileaddlayer',
    viewModel: {
        type: 'k-panel-mobileaddlayer'
    },

    scrollable: true,

    config: {
        title: 'Add Layer',

        /**
         * Whether layers shall start `checked` or `unchecked` in the available
         * layers fieldset.
         */
        candidatesInitiallyChecked: true,

        /**
         * Whether to add a `Check all layers` button to the toolbar to interact
         * with the layers of a GetCapabilities response.
         */
        hasCheckAllBtn: false,

        /**
         * Whether to add a `Uncheck all layers` button to the toolbar to
         * interactthe with the layers of a GetCapabilities response.
         */
        hasUncheckAllBtn: false,

        /**
         * Whether to include sublayers when creting the list of available
         * layers.
         */
        includeSubLayer: false
    },

    closeToolAlign: 'left',

    items: [{
        xtype: 'formpanel',
        height: '90vh',
        width: '80vw',
        baseCls: 'add-wms-form',
        items: [{
            xtype: 'fieldset',
            defaults: {
                labelAlign: 'top',
                flex: 1
            },
            bind: {
                title: '{queryParamsFieldSetTitle}'
            },
            items: [{
                xtype: 'textfield',
                bind: {
                    label: '{wmsUrlTextFieldLabel}'
                },
                name: 'url',
                allowBlank: false,
                value: 'http://ows.terrestris.de/osm/service'
            },{
                xtype: 'container',
                defaultType: 'radiofield',
                items: [{
                    label: 'v1.1.1',
                    labelWidth: '80%',
                    name: 'version',
                    value: '1.1.1',
                    id: 'v111-radio'
                }, {
                    label: 'v1.3.0',
                    labelWidth: '80%',
                    name: 'version',
                    value: '1.3.0',
                    id: 'v130-radio',
                    checked: true
                }]
            },
            {
                xtype: 'hiddenfield',
                name: 'request',
                value: 'GetCapabilities'
            }, {
                xtype: 'hiddenfield',
                name: 'service',
                value: 'WMS'
            }]
        }, {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            bind: {
                title: '{availableLayesFieldSetTitle}'
            }
        }, {
            xtype: 'toolbar',
            items:[{
                bind: {
                    text: '{requestLayersBtnText}'
                },
                handler: 'requestGetCapabilities'
            }]
        }]
    }]
});
