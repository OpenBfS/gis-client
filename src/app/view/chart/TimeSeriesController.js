Ext.define('Koala.view.chart.TimeSeriesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-chart-timeseries',

    /**
     *
     */
    onTimeSeriesBeforeLoad: function(store) {
        var me = this;
        var view = me.getView();

        var feld = Ext.create('Ext.data.field.Field', {
            name : 'value_' + view.selectedStation.get('geo_id'),
            mapping : function(dataRec) {
                return dataRec.properties.result_value;
            }
        });
        store.getModel().getFields().push(feld);
        view.getAxes()[0].getFields().push(
                'value_' + view.selectedStation.get('geo_id'));

        view.setLoading(true);
    },

    /**
     *
     */
    onTimeSeriesStoreLoad: function(store) {
        var me = this;
        var view = me.getView();
        var station = view.selectedStation;

//        Ext.each(stations, function(station) {
            // TODO: fill arguments with real values given by the (e.g.) feature
            // info request
             stationName = station.get('locality_name');

             var newSeries = me.createNewSeries(stationName, "end_measure", "value_" + station.get('geo_id'));
             if(newSeries){
                 view.addSeries(newSeries);
             }
//        });
        view.setLoading(false);

    },

    /**
     *
     */
    createNewSeries: function(title, xField, yField) {
        var me = this;
        var view = me.getView();
        var newSeries = {
            type: view.getSeriesType(),
            title: title,
            xField: xField,
            yField: yField,
            step: view.getShowStep(),
            style: {
                lineWidth: 1,
                strokeStyle: '#7f8b43'
            },
            marker: {
                radius: 0
            },
            selectionTolerance: 5,
            highlight: {
                fillStyle: '#e0e0e0',
                radius: 5,
                lineWidth: 1,
                strokeStyle: '#7f8b43'
            },
            tooltip: {
                trackMouse: true,
                showDelay: 0,
                dismissDelay: 0,
                hideDelay: 0,
                renderer: function (tooltip, record, item) {
                    var timestamp = record.get('end_measure');
                    var time = Ext.Date.parse(timestamp, "time");
                    var odl = record.get('value');
                    tooltip.setHtml(Ext.Date.format(time, 'd.m.Y H:i') + '</br>' + odl + ' µSv/h');
                }
            }
        };
        return newSeries;
    }

});
