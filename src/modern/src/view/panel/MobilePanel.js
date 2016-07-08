Ext.define('Koala.view.panel.MobilePanel',{
    extend: 'Ext.Panel',
    xtype: 'k-panel-mobilepanel',

    hideOnMaskTap: true,
    top: 0,
    width: '80%',
    height: '100%',
    margin: 0,
    modal: true,
    style: 'border: 0px;',

    showAnimation: {
        type: 'slideIn',
        direction: 'right'
    },
    hideAnimation: 'slideOut',

    initialize: function(config) {
        var me = this;

        me.callParent([config]);

        if (Ext.isFunction(me.getCloseToolAlign)) {
            me.addTool({
                type: me.getCloseToolAlign(),
                docked: me.getCloseToolAlign(),
                handler: function(panel) {
                    panel.hide();
                }
            });
        }

    }

});
