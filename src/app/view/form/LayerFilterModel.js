Ext.define('Koala.view.form.LayerFilterModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-form-layerfilter',
    data: {
        startLabel: 'Start',
        endLabel: 'Ende',
        timestampLabel: 'Zeitpunkt',
        buttonText: 'Filter übernehmen und Layer der Karte hinzufügen',
        valueFilter: 'Wertefilter',
        timeRangeFilter: 'Zeitraumfilter',
        pointInTimeFilter: 'Zeitpunktfilter'
    }

});
