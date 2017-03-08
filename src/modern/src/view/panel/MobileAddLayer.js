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
         * Whether layers shall start 'checked' or 'unchecked' in the available
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
        versionsWmsAutomatically: true,

        /**
         * The WMS urls we try to fill the selectedfield.
         */
        urlArray: [],

         /**
          *Whether to change WMS Url from textfield to selectedfield.
          */
        urlField: false
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
                name: 'url',
                bind: {
                    label: '{wmsUrlTextFieldLabel}'
                },
                value: 'http://ows.terrestris.de/osm/service'
            }, {
                xtype: 'button',
                name: 'pickerbutton',
                bind: {
                    text: '{layerSelection}'
                },
                handler: function() {
                    var data = this.up('k-panel-mobileaddlayer').pickerdata;
                    var urlPicker = Ext.create('Ext.Picker', {
                        xtype: 'pickerfield',
                        doneButton: 'Done',
                        cancelButton: 'Cancel',
                        slots: [{
                            name : 'picker',
                            data: data
                        }],
                        listeners: {
                            change: function(picker, value) {
                                var urlField = Ext.ComponentQuery.query('urlfield[name=url]')[0];
                                urlField.setValue(value.picker);
                            }
                        }
                    });
                    urlPicker.show();
                }
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
            var url = this.getUrlField();

            if (versionsAutomatically) {
                this.down('container[name=wmsVersionsContainer]').setHidden(true);
            } else {
                this.down('container[name=wmsVersionsContainer]').setHidden(false);

            }
            if(url) {
                this.down('button[name=pickerbutton]').setHidden(true);
            } else {
                this.down('button[name=pickerbutton]').setHidden(false);
                //correct data for the pickerfield
                var text = null,
                    value = null,
                    data = [];

                Ext.each(wmsUrl, function(wms){
                    text = wms;
                    value = wms;
                    data.push({text:text, value:value});
                });
                this.pickerdata = data;
            }
        }
    }
});
