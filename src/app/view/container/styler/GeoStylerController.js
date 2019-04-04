Ext.define('Koala.view.container.styler.GeoStylerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.geostyler',

    /**
     * Holds the delayed task since we can possibly be called while the view is
     * still being configured.
     *
     * @private
     */
    rebuildTask: null,

    /**
     * The interval in milliseconds, at which we recheck if the view is done
     * being configured.
     *
     * @private
     */
    rebuildCheckInterval: 25,

    /**
     *
     */
    reloadCurrentStyle: function() {
        var me = this;
        var viewModel = this.getViewModel();
        var layer = viewModel.get('layer');
        Ext.Msg.show({
            title: 'Info',
            message: 'Stil von <b>' + layer.get('name') +
                '</b> zurücksetzen?',
            buttonText: {
                yes: 'Ja',
                no: 'Nein'
            },
            fn: function(btnId) {
                if (btnId === 'yes') {
                    layer.setStyle(layer.get('originalStyle'));
                    layer.set('koalaStyle', undefined);
                    me.getView().up('window').close();
                }
            }
        });
    },

    /**
     *
     */
    applyAndSave: function() {
        var viewModel = this.getViewModel();
        var layer = viewModel.get('layer');
        var style = viewModel.get('style');
        layer.set('koalaStyle', style);
        var sldParser = new GeoStylerSLDParser.SldStyleParser();
        sldParser.writeStyle(style)
            .then(function(sld) {
                Koala.util.Layer.updateVectorStyle(layer, sld);
            })
            .catch(function() {
                Ext.Msg.alert(viewModel.get('saveStyle'), viewModel.get('styleNotConvertedMsg'));
            });
        var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
        olParser.writeStyle(style)
            .then(function(olStyle) {
                layer.setStyle(olStyle);
            })
            .catch(function() {
                Ext.Msg.alert(viewModel.get('saveStyle'), viewModel.get('styleNotConvertedMsg'));
            });
    },

    /**
     * Exports (downloads) the current style as SLD.
     */
    exportStyle: function() {
        var viewModel = this.getViewModel();
        var style = viewModel.get('style');
        var sldParser = new GeoStylerSLDParser.SldStyleParser();
        sldParser.writeStyle(style)
            .then(function(sld) {
                var name = style.name;
                if (!name) {
                    name = 'style.xml';
                }
                if (!name.endsWith('.xml')) {
                    name += '.xml';
                }
                var arr = new TextEncoder().encode(sld);
                download(arr, name, 'application/xml');
            });
    },

    /**
     * Imports an SLD file and updates the styler with its content.
     */
    importStyle: function() {
        var view = this.getView();
        Ext.create('BasiGX.view.window.FileUploadWindow', {
            importHandler: function(result) {
                var sldParser = new GeoStylerSLDParser.SldStyleParser();
                sldParser.readStyle(result)
                    .then(function(style) {
                        view.onStyleChange(style);
                    });
            },
            hideFakepath: true
        }).show();
    },

    /**
     * Loads a SLD from the vector-template.
     */
    chooseFromVectorTemplate: function() {
        var view = this.getView();
        var layer = view.lookupViewModel().get('layer');
        var styles = Koala.util.Object.getPathStrOr(layer,
            'metadata/layerConfig/olProperties/styleReference');
        if (!styles) {
            styles = '';
        }
        styles = styles.split(',')
            .map(function(style) {
                return style.trim();
            });
        var templateStyleLabel = view.lookupViewModel().get('templateStyleLabel');
        var okButtonLabel = view.lookupViewModel().get('okButtonLabel');
        var cancelButtonLabel = view.lookupViewModel().get('cancelButtonLabel');
        var loadSldFromGeoServer = this.loadSldFromGeoServer.bind(this);

        Ext.create('Ext.window.Window', {
            bodyPadding: 10,
            items: [{
                labelAlign: 'top',
                xtype: 'combo',
                width: 300,
                forceSelection: true,
                fieldLabel: templateStyleLabel,
                store: styles,
                value: styles[0]
            }],
            bbar: [{
                xtype: 'button',
                text: okButtonLabel,
                handler: function() {
                    var win = this.up('window');
                    var style = win.down('combo').getValue();
                    loadSldFromGeoServer(style);
                    win.close();
                }
            }, {
                xtype: 'button',
                text: cancelButtonLabel,
                handler: function() {
                    var win = this.up('window');
                    win.getCancelHandler()();
                    win.close();
                }
            }]
        }).show();
    },

    /**
     * Loads and applies a SLD from the vector-template.
     * @param {string} sldName The sldName that should be loaded.
     */
    loadSldFromGeoServer: function(sldName) {
        var view = this.getView();
        var appContext = Koala.util.AppContext.getAppContext();
        var geoserverBaseUrl = Koala.util.Object.getPathStrOr(appContext, 'data/merge/urls/geoserver-base-url');
        var url = geoserverBaseUrl + '/rest/styles/' + sldName + '.sld';
        Ext.Ajax.request({
            url: url,
            method: 'GET'
        })
            .then(function(response) {
                var sld = response.responseText;
                var sldParser = new GeoStylerSLDParser.SldStyleParser();
                sldParser.readStyle(sld)
                    .then(function(geoStylerStyle) {
                        view.onStyleChange(geoStylerStyle);
                    });
            });
    }

});
