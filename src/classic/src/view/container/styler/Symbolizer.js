Ext.define('Koala.view.container.styler.Symbolizer', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_symbolizer',

    requires: [
        'Koala.view.container.styler.SymbolizerController',
        'Koala.view.container.styler.SymbolizerModel'
    ],

    controller: 'container.styler.symbolizer',
    viewModel: {
        type: 'container.styler.symbolizer'
    },

    bodyStyle: {
        background: '#f6f6f6'
    },

    config: {
        symbolizer: null
    },

    listeners: {
        boxready: 'onBoxReady'
    }
});
