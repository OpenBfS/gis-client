Ext.define("Koala.view.panel.RoutingLegendTree",{
    extend: "Basepackage.view.panel.LegendTree",
    xtype: "k-panel-routing-legendtree",

    requires: [
        "Koala.view.panel.RoutingLegendTreeController",
        "Koala.view.panel.RoutingLegendTreeModel"
    ],

    controller: "k-panel-routing-legendtree",

    viewModel: {
        type: "k-panel-routing-legendtree"
    },

    config: {
        routingEnabled: true
    },

    /**
     *
     */
    constructor: function(cfg) {
        var me = this;

        me.callParent([cfg]);

        // configure routing
        if(me.getRoutingEnabled() === true) {
            var controller = me.getController();
            me.getStore().on('update', controller.setRouting, controller);
            me.getStore().on('datachange', controller.setRouting, controller);
        }
    },

    /**
     * Initialize the component.
     */
    initComponent: function() {
        var me = this;

        // call parent
        me.callParent();

        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed){
            me.on('afterlayout', function(){
                this.collapse();
            }, me, {single: true, delay: 100});
            me.initiallyCollapsed = null;
        }
    },

    listeners: {
        selectionchange: 'onSelectionChange'
    }
});
