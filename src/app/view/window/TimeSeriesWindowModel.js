Ext.define('Koala.view.window.TimeSeriesWindowModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-timeserieswindow',

    data: {
        title: 'Zeitreihe',
        dateFieldStartLabel: 'Start',
        dateFieldEndLabel: 'Ende',
        setFilterBtnText: 'OK',
        resetFilterBtnText: 'Reset',
        selectChartLayerComboLabel: '',
        startDateValue: new Date(),
        startDateMaxValue: new Date(),
        endDateValue: new Date()
    }
});
