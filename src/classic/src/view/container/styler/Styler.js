Ext.define('Koala.view.container.styler.Styler', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_styler',

    requires: [
        'Koala.view.container.styler.StylerController',
        'Koala.view.container.styler.StylerModel'
    ],

    controller: 'container.styler.styler',
    viewModel: {
        type: 'container.styler.styler'
    },

    bodyStyle: {
        background: '#f6f6f6'
    },

    /**
     * Fired when the layername changes.
     *
     * @param {String} layerName The new layername or null if it was not valid.
     * @event layerNameChange
     */

    bbar: {
        reference: 'styler-toolbar',
        bodyStyle: {
            background: '#f6f6f6'
        },
        bind: {
            hidden: '{uploadIsNotStylable}'
        },
        items: [{
            xtype: 'button',
            bind: {
                text: '{btnTextReloadCurrentStyle}'
            },
            handler: 'reloadCurrentStyle'
        },
        '->',
        {
            xtype: 'button',
            bind: {
                text: '{btnTextApplyAndSave}'
            },
            handler: 'applyAndSave'
        }]
    },

    listeners: {
        boxready: 'onBoxReady'
    },

    /**
     * Initializes the SLD styler. Will check if the required configuration
     * option `layerName` is passed and valid.
     */
    initComponent: function() {
        var me = this;
        me.callParent();
    }

});
