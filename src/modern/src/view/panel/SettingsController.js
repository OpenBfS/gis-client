Ext.define('Koala.view.panel.SettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-settings',

    /**
     *
     */
    onShow: function() {
        var me = this;
        var view = me.getView();

        Koala.util.Route.setRouteForView(Ext.String.format(
            view.getRoute(), 1), view);
    },

    /**
     *
     */
    onHide: function(panel) {
        var me = this;
        var view = me.getView();

        if (panel.isRendered()) {
            Koala.util.Route.setRouteForView(Ext.String.format(
                view.getRoute(), 0), view);
        }
    },

    /**
     *
     */
    onUtcChanged: function(cb, utcChecked){
        var mainView = this.getView().up('app-main');
        var mainViewModel = mainView.getViewModel();
        mainViewModel.set('useUtc', utcChecked);
    }

});
