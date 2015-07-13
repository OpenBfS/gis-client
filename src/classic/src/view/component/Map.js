Ext.define("Koala.view.component.Map",{
    extend: "Basepackage.view.component.Map",
    xtype: "k-component-map",

    requires: [
        "Koala.view.component.MapController"
    ],

    /**
     * As we use a controller for this class, we have to set this to false.
     * Otherwise this would be true (which is the default in the parent class
     * Basepackage.view.component.Map.
     */
    defaultListenerScope: false,

    /**
     * 
     */
    controller: "k-component-map",

    /**
     * This overwrites the default value from config in parent class
     * Basepackage.view.component.Map
     */
    pointerRestInterval: 100,

    /**
     * We overwrite this method from the superclass.
     * We simply call the controller which contains the logic.
     */
    onHoverFeatureClick: function(olFeat) {
        var me = this;
        var controller = me.getController();

        controller.onHoverFeatureClick(olFeat);
    },

    /**
     * Overrides the basepackage method.
     * TODO Push this to controller.
     */
    getToolTipHtml: function(layers, features){
        var me = this;
        var controller = me.getController();

        return controller.getToolTipHtml(layers, features);
    }

});
