Ext.define('Koala.view.container.styler.StylerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.styler',

    requires: [
        'Koala.view.container.styler.Rules'
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
        var viewModel = this.getViewModel();
        var layer = viewModel.get('layer');

        if(!layer){
            debugger
        }

        viewModel.set('layer', layer);

        this.rebuildUserInterface();
    },

    /**
     * Called when the configured value for layerName changes in the view, this
     * method checks if and how the user interface can be rebuild.
     *
     * @param {String} layerName The fully qualified name of the layer, e.g.
     *     'namespace:featuretype'.
     */
    checkRebuildUserInterface: function(layerName) {
        var me = this;
        if (me.rebuildTask) {
            me.rebuildTask.cancel();
        }
        var view = me.getView();
        if (view.isConfiguring) {
            me.rebuildTask = new Ext.util.DelayedTask(
                me.checkRebuildUserInterface, me, [layerName]
            );
            me.rebuildTask.delay(me.rebuildCheckInterval);
        } else {
            me.rebuildUserInterface(layerName);
        }
    },

    /**
     * Rebuilds the SLD container according to the passed layerName.
     *
     * @param {String} layerName The fully qualified name of the layer, e.g.
     *     'namespace:featuretype'.
     */
    rebuildUserInterface: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();

        view.removeAll();
        view.setHtml('');
        // view.setLoading(true);

        var style = viewModel.get('style');
        if(!style){
            viewModel.set('style', Ext.create('Koala.model.Style'));
            view.add({
                xtype: 'k_container_styler_rules'
            });
        } else {
            debugger
        }
    },

    applyAndSave: function() {
        var me = this;
        var view = me.getView();
        var rulesContainer = view.down('k_container_styler_rules');
        var rules = rulesPanel.rules;
        var sldObj = rulesPanel.sldObj;
    },

    /**
     * Marks the main SLD styler container as currently being incorrectly
     * configured, usually from an unexpected layerName configuration or after a
     * request for getting styles failed.
     */
    markErrored: function(msgKey){
        var me = this;
        var msg = me.getViewModel().get(msgKey || 'genericError');
        me.getView().setHtml(msg);
    }
});
