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

    onBoxReady: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var layer = viewModel.get('layer');
        var style = layer.get('koalaStyle') || Ext.create('Koala.model.Style');

        if(!layer){
            debugger
        }

        viewModel.set('layer', layer);
        viewModel.set('style', style);
        view.add({
            xtype: 'k_container_styler_rules'
        });
    },

    // /**
    //  * Called when the configured value for layerName changes in the view, this
    //  * method checks if and how the user interface can be rebuild.
    //  */
    // checkRebuildUserInterface: function() {
    //     var me = this;
    //     if (me.rebuildTask) {
    //         me.rebuildTask.cancel();
    //     }
    //     var view = me.getView();
    //     if (view.isConfiguring) {
    //         me.rebuildTask = new Ext.util.DelayedTask(
    //             me.checkRebuildUserInterface, me, []
    //         );
    //         me.rebuildTask.delay(me.rebuildCheckInterval);
    //     } else {
    //         me.rebuildUserInterface();
    //     }
    // },

    // /**
    //  *
    //  */
    // rebuildUserInterface: function() {
    //     var me = this;
    //     var view = me.getView();
    //     var viewModel = me.getViewModel();
    //
    //     view.removeAll();
    //     view.setHtml('');
    //     // view.setLoading(true);
    //
    //     var style = viewModel.get('style');
    //     if(!style){
            // viewModel.set('style', Ext.create('Koala.model.Style'));
            // view.add({
            //     xtype: 'k_container_styler_rules'
            // });
    //     } else {
    //         debugger
    //     }
    // },

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
    markErrored: function(msgKey){
        var me = this;
        var msg = me.getViewModel().get(msgKey || 'genericError');
        me.getView().setHtml(msg);
    }
});
