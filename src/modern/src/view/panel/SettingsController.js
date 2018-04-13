Ext.define('Koala.view.panel.SettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-settings',

    /**
     *
     */
    onTimeReferenceChanged: function(cb, utcChecked) {
        var mainView = this.getView().up('app-main');
        var mainViewModel = mainView.getViewModel();
        mainViewModel.set('useUtc', utcChecked);
    }

});
