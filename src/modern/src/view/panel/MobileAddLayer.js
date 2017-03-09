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

    pickerdata: null,

    config: {
        title: 'Add Layer',

        /**
         * Whether layers shall start `checked` or `unchecked` in the available
         * layers fieldset.
         */
        candidatesInitiallyChecked: true,

        /**
         * Whether to include sublayers when creting the list of available
         * layers.
         */
        includeSubLayer: false,

        /**
         * The WMS versions we try to use in the getCapabilities requests.
         */
        versionArray: ['1.3', '1.1.1'],

        /**
         * WMS versions we already tried to request the getCapabilities document
         */
        triedVersions: [],

        /**
         * Whether to change the WMS versions manually.
         */
        versionsWmsAutomatically: true
    },


    closeToolAlign: 'left',

    items: [{
        xtype: 'formpanel',
        items: [{
            xtype: 'fieldset',
            defaults: {
                labelAlign: 'top'
            },
            bind: {
                title: '{queryParamsFieldSetTitle}'
            },
            items: [{
                xtype: 'urlfield',
                name: 'addWmsUrlField',
                bind: {
                    label: '{wmsUrlTextFieldLabel}'
                },
                value: null
            }, {
                xtype: 'button',
                name: 'pickerbutton',
                bind: {
                    text: '{layerSelection}'
                },
                handler: 'createPicker'
                // function() {
                //     var data = this.up('k-panel-mobileaddlayer').pickerdata;
                //     var urlPicker = Ext.create('Ext.Picker', {
                //         xtype: 'pickerfield',
                //         doneButton: 'Done',
                //         cancelButton: 'Cancel',
                //         slots: [{
                //             name : 'picker',
                //             data: data
                //         }],
                //         listeners: {
                //             change: function(picker, value) {
                //                 var urlField = Ext.ComponentQuery.query('urlfield[name=addWmsUrlField]')[0];
                //                 urlField.setValue(value.picker);
                //             }
                //         }
                //     });
                //     urlPicker.show();
                // }
            }, {
                xtype: 'container',
                defaultType: 'radiofield',
                name: 'wmsVersionsContainer',
                hidden: true,
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
            }]
        }, {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            bind: {
                title: '{availableLayesFieldSetTitle}'
            }
        }, {
            xtype: 'toolbar',
            name: 'addLayersToolbar',
            items:[{
                bind: {
                    text: '{requestLayersBtnText}'
                },
                handler: 'requestGetCapabilities'
            }]
        }]
    }],

    listeners: {
        initialize: function() {
            var appContext = BasiGX.util.Application.getAppContext();
            var wmsUrl = appContext.wmsUrls;
            var versionsAutomatically = this.getVersionsWmsAutomatically();
            var countUrls = wmsUrl.length;

            if (versionsAutomatically) {
                this.down('container[name=wmsVersionsContainer]').setHidden(true);
            } else {
                this.down('container[name=wmsVersionsContainer]').setHidden(false);

            }
            if(countUrls === 0) {
                this.down('button[name=pickerbutton]').setHidden(true);
            } else {
                this.down('button[name=pickerbutton]').setHidden(false);
                //correct data for the pickerfield
                var data = [];

                Ext.each(wmsUrl, function(wms){
                    data.push({text:wms, value:wms});
                });
                this.pickerdata = data;
            }

            var defaultValue = wmsUrl[0];
            var urlField = this.down('urlfield[name=addWmsUrlField]');
            urlField.setValue(defaultValue);
        }
    }
});
