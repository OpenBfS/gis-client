Ext.define('Koala.view.panel.MobilePermalinkController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilepermalink',

    requires: [
        'Koala.util.Routing'
    ],

    /**
     *
     */
    onPanelShow: function() {
        var me = this;
        var viewModel = this.getViewModel();
        var applyLayerFilters = viewModel.get('applyFilterCheckboxChecked');

        me.refreshPermalink(!applyLayerFilters);
    },

    /**
     *
     */
    onApplyFilterCheckboxChange: function(comp, newVal) {
        var me = this;

        me.refreshPermalink(!newVal);
    },

    /**
     * Updates the viewmodel value with the current permalink.
     */
    refreshPermalink: function(skipLayerFilters) {
        var viewModel = this.getViewModel();
        var route = Koala.util.Routing.getRoute(false, skipLayerFilters);
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        viewModel.set('permalink', permalink);
    }
});
