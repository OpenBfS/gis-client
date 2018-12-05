/* Copyright (c) 2018-present terrestris GmbH & Co. KG
*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.util.Print
 */
Ext.define('Koala.util.Print', {

    requires: [
    ],

    statics: {

        doChartPrint: function(chart) {
            var chartCtrl = chart.getController();

            chartCtrl
                .showScaleWindow()
                .then(function(scale) {
                    return chartCtrl.chartToDataUri(scale, false);
                })
                .then(function(dataUri) {
                    var printWin = Ext.create({
                        xtype: 'k-window-print',
                        chartPrint: true,
                        chart: dataUri,
                        irixPrint: true
                    });
                    printWin.down('k-form-print').irixFieldsetLoaded.then(function() {
                        var fieldset = printWin.down('k-form-irixfieldset');
                        fieldset.irixFieldsetLoaded.then(function() {
                            printWin.show();
                        });
                    });
                });
        }

    }

});
