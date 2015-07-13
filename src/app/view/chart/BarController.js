Ext.define('Koala.view.chart.BarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-chart-bar',

    /**
     *
     */
    onBarBeforeLoad: function(store) {
        var me = this;
        var view = me.getView();
        view.setLoading(true);
    },

    /**
     *
     */
    onBarStoreLoad: function(store) {
        var me = this;
        var view = me.getView();
        var stations = view.selectedStations;
        Ext.each(stations, function(station) {
            // TODO: fill arguments with real values given by the (e.g.) feature
            // info request
             stationName = station.get('name');
            view.addSeries(me.createNewBarSeries(stationName, "date", "data1"));
        });
        view.setLoading(false);
    },

    /**
     *
     */
    createNewBarSeries: function(title, xField, yField) {
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
                    var timestamp = record.get('date');
                    var time = Ext.Date.parse(timestamp, "time");
                    var odl = record.get('data1');
                    tooltip.setHtml(Ext.Date.format(time, 'd.m.Y H:i') + '</br>' + odl + ' µSv/h');
                }
            }
        };
        return newSeries;
    }

});
