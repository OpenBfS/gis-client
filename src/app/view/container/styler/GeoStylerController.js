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
                var ctx = Koala.util.AppContext.getAppContext().data.merge;
                var url = ctx.urls['spatial-search'];
                var parms = {
                    request: 'GetLegendGraphic',
                    version: '1.1.1',
                    service: 'WMS',
                    sld_body: sld,
                    layer: ctx.createLegendGraphicLayer,
                    format: 'image/png'
                };
                layer.set('legendUrl', url + '?' + Ext.Object.toQueryString(parms));
                layer.set('SLD', sld);
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
                download(sld, 'style.xml', 'application/xml');
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
            }
        }).show();
    }

});
