Ext.define('Koala.view.container.styler.StylerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.styler',

    requires: [
        'Koala.view.container.styler.Rules',
        'Koala.util.Style'
    ],

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
    onBoxReady: function() {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var layer = viewModel.get('layer');
        var style = layer.get('koalaStyle') || Ext.create('Koala.model.Style');

        viewModel.set('layer', layer);
        viewModel.set('style', style);

        if (!layer.get('originalStyle')) {
            layer.set('originalStyle', layer.getStyle());
        }

        view.add({
            xtype: 'k_container_styler_rules'
        });
    },

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

        Koala.util.Style.applyKoalaStyleToLayer(style, layer);
    },

    /**
     * Marks the main styler container as currently being incorrectly
     * configured, usually from an unexpected layerName configuration or after a
     * request for getting styles failed.
     */
    markErrored: function(msgKey) {
        var me = this;
        var msg = me.getViewModel().get(msgKey || 'genericError');
        me.getView().setHtml(msg);
    }
});
