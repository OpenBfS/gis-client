/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class with functions to handle timeseries chart autorefresh.
 *
 * @class Koala.util.ChartAutoUpdater
 */
Ext.define('Koala.util.ChartAutoUpdater', {

    requires: [
        'Koala.util.String',
        'Koala.util.Object',
        'Ext.util.TaskRunner'
    ],

    statics: {

        /**
         * Activate autorefresh for a timeseries chart. This is done for all
         * timeseries charts and deactivates itself once the chart is destroyed.
         * @param {Koala.view.component.D3Chart} chart the chart
         * @param {object} optionsCombo the combo box with the autorefresh options
         * @param {object} autorefreshCheckbox checkbox controlling if autorefresh is on
         * @param {object} layer the layer the chart is based on
         * @param {object} startField optional field to update with the new start value
         * @param {object} endField optional field to update with the new end value
         */
        autorefreshTimeseries: function(
            chart,
            optionsCombo,
            autorefreshCheckbox,
            layer,
            startField,
            endField
        ) {
            if (!chart) {
                return;
            }
            var runner = new Ext.util.TaskRunner();

            runner.start({
                run: function() {
                    var endDate;
                    if (chart.destroyed) {
                        runner.destroy();
                        return;
                    }

                    if (!autorefreshCheckbox.getValue()) {
                        return;
                    }

                    if (optionsCombo.getValue() === 'autorefresh-expand') {
                        endDate = moment();
                        chart.setConfig('endDate', moment());
                        if (endField) {
                            endField.setValue(endDate);
                        }
                        chart.getController().getChartData();
                    }
                    if (optionsCombo.getValue() === 'autorefresh-move') {
                        endDate = moment();
                        var startDate = moment(endDate);
                        var ctrl = chart.getController();
                        if (!ctrl.currentDateRange.min) {
                            ctrl.currentDateRange.min = chart.getConfig('startDate');
                        }
                        if (!ctrl.currentDateRange.max) {
                            ctrl.currentDateRange.max = chart.getConfig('endDate');
                        }
                        var duration = moment(ctrl.currentDateRange.max)
                            .diff(moment(ctrl.currentDateRange.min));

                        startDate.subtract(duration);
                        chart.setConfig('startDate', startDate);
                        chart.setConfig('endDate', endDate);
                        chart.getController().getChartData();
                        if (startField) {
                            startField.setValue(startDate);
                        }
                        if (endField) {
                            endField.setValue(endDate);
                        }
                    }
                },
                interval: 60000
            });
        }

    }

});
