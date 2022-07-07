/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * @class Koala.view.component.EChartWrapper
 */
Ext.define('Koala.view.component.EChartWrapper',{
    extend: 'Ext.Component',
    xtype: 'e-chart-wrapper',
    cls: 'e-chart-wrapper',

    config: {
        /**
         * The eCharts configuration object.
         *
         * @type {Object}
         */
        chartOpts: null,
        /**
         * The eCharts chart instance.
         * This option is not intended to be set on initialization,
         * but rather to provide access to the created instance
         * and it's API.
         */
        chart: null
    },

    height: 200,
    width: '100%',

    /**
     * Rerender the chart when configuration changes.
     * This method will be automatically triggered by ExtJs,
     * when using binding.
     *
     * @param {Object} newOpts The new configuration options.
     */
    updateChartOpts: function(newOpts) {
        if (newOpts !== null) {
            this.renderChart(newOpts);
        }
    },

    /**
     * Renders a new chart.
     *
     * @param {Object} opts The eCharts configuration object.
     */
    renderChart: function(opts) {
        var chart = this.getChart();
        if (chart) {
            echarts.dispose(chart);
        }
        chart = echarts.init(this.el.dom);
        this.setChart(chart);
        chart.setOption(opts);
        chart.on('click', this.onChartClick.bind(this));
    },

    /**
     * The click handler for the chart.
     *
     * @param {Object} params The eChart click event params.
     */
    onChartClick: function(params) {
        this.fireEvent('chartClick', params);
    },

    /**
     * @event chartClick
     * Fires after the chart was clicked. Passes through the eCharts click params.
     *
     * @param {Object} params The eChart click event params.
     */

    initComponent: function() {
        this.callParent();

        if (this.chartOpts !== null) {
            this.renderChart(this.chartOpts);
        }
    }

});
