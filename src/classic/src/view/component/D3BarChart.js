/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.component.D3Chart
 */
Ext.define('Koala.view.component.D3BarChart',{
    extend: 'Koala.view.component.D3Base',
    xtype: 'd3-barchart',

    requires: [
        'Koala.view.component.D3BarChartController',
        'Koala.view.component.D3BarChartModel'
    ],

    controller: 'component-d3barchart',
    viewModel: {
        type: 'component-d3barchart'
    },

    width: 800,
    height: 500,
    margin: 5,

    name: null,

    config: {
        targetLayer: null,
        showLoadMask: true,
        zoomEnabled: false,
        backgroundColor: null,
        labelFunc: null,
        chartFieldSequence: null,
        grid: {
            show: false,
            color: null,
            width: null,
            opacity: null
        },
        startDate: null,
        endDate: null,
        shape: {},
        selectedStation: null,
        // TODO adjust dynamically in relation to axes/title label size
        chartMargin: {
            top: null,
            right: null,
            bottom: null,
            left: null
        },
        title: {
            label: null,
            labelSize: null,
            labelColor: null,
            labelPadding: null
        },
        legend: {
            legendEntryMaxLength: null,
            legendMargin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        axes: {
        }
    }
});
