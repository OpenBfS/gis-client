Ext.define('Koala.view.chart.BarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-chart-bar',

    /**
     *
     */
    onBarBeforeLoad: function(store) {
        var me = this;
        var view = me.getView();

        view.getAxes()[0].getFields().push(
                'Pb214' + view.selectedStation.get('locality_name'),
                'Te132', 'Bi214', 'Ru103', 'I131', 'Pb212', 'Cs137', 'Pb214',
//                The following elements might be null
                'Bi212', 'Zr97', 'Mn54', 'Na22', 'Te123m', 'Cs134', 'Nb95',
                'Ce144', 'Co58', 'Sb125', 'Zn65'
        );
        view.setLoading(true);
    },

    /**
     *
     */
    onBarStoreLoad: function(store) {
        var me = this;
        var view = me.getView();
        var station = view.selectedStation;

        var newSeries1 = me.createNewBarSeries("Te132", "#d2564a", "Te_132", "Te132");
        var newSeries2 = me.createNewBarSeries("Bi214", "#6e4b61", "Bi_214", "Bi214");
        var newSeries3 = me.createNewBarSeries("Ru103", "#cabd61", "Ru_103", "Ru103");
        var newSeries4 = me.createNewBarSeries( "I131", "#d2564a",  "I_131",  "I131");
        var newSeries5 = me.createNewBarSeries("Pb212", "#6e4b61", "Pb_212", "Pb212");
        var newSeries6 = me.createNewBarSeries("Cs137", "#cabd61", "Cs_137", "Cs137");
        var newSeries7 = me.createNewBarSeries("Pb214", "#d2564a", "Pb_214", "Pb214");
        if(newSeries1){
            view.addSeries(newSeries1);
            view.addSeries(newSeries2);
            view.addSeries(newSeries3);
            view.addSeries(newSeries4);
            view.addSeries(newSeries5);
            view.addSeries(newSeries6);
            view.addSeries(newSeries7);
        }

//      The following elements might be null
        if(store.data.items[0].get('Bi212')) {
            var newSeries = me.createNewBarSeries("Bi212", "#6e4b61", "Bi_212", "Bi212");
            view.addSeries(newSeries);
        } else {
            console.log('Bi212 is: ' + store.data.items[0].get('Bi212'));
        }
        if(store.data.items[0].get('Zr97')) {
            var newSeries = me.createNewBarSeries("Zr97", "#6e4b61", "Zr97", "Zr97");
            view.addSeries(newSeries);
        } else {
            console.log('Zr97 is: ' + store.data.items[0].get('Zr97'));
        }
        if(store.data.items[0].get('Mn54')) {
            var newSeries = me.createNewBarSeries("Mn54", "#6e4b61", "Mn54", "Mn54");
            view.addSeries(newSeries);
        } else {
            console.log('Mn54 is: ' + store.data.items[0].get('Mn54'));
        }
        if(store.data.items[0].get('Na22')) {
            var newSeries = me.createNewBarSeries("Na22", "#6e4b61", "Na_22", "Na22");
            view.addSeries(newSeries);
        } else {
            console.log('Na22 is: ' + store.data.items[0].get('Na22'));
        }
//        TODO check all elements which might be null

        var dtUser = new Date(station.get('end_measure'));
        dtUser.setTime(dtUser.getTime() + dtUser.getTimezoneOffset()*60*1000);
        var dtFormatted = Ext.Date.format(dtUser, 'Y-m-d H:i:s');
        view.setTitle(station.get('locality_name') + ' - ' + dtFormatted);

        view.setLoading(false);
    },

    /**
     *
     */
    createNewBarSeries: function(title, fillStyle, xField, yField) {
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
                fillStyle: fillStyle,
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
                renderer: function (storeitem, item) {
                    var me = this;
                    var element = this.getConfig('yField');
                    var value = item.get(element);
                    me.getConfig('tooltip').setHtml(element + ': ' + value + ' µSv/h');
                }
            }
        };
        return newSeries;
    }
});
