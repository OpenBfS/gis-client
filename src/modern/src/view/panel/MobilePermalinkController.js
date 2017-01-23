Ext.define('Koala.view.panel.MobilePermalinkController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilepermalink',

    requires: [
        'Koala.util.Routing'
    ],

    /**
     * Updates the viewmodel value with the current permalink.
     */
    refreshPermalink: function(){
        var viewModel = this.getViewModel();
        var route = Koala.util.Routing.getRoute();
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        viewModel.set('permalink', permalink);
    }

});
