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
        // TODO: not working at the moment?!
        showLoadMask: true,
        zoomEnabled: true,
        backgroundColor: '#EEE',
        grid: {
            show: false,
            color: '#d3d3d3',
            width: 1,
            opacity: 0.7
        },
        startDate: null,
        endDate: null,
        shape: {},
        selectedStation: null,
        // TODO adjust dynamically in relation to axes/title label size
        chartMargin: {
            top: 40,
            right: 200,
            bottom: 40,
            left: 60
        },
        title: {
            label: '',
            labelSize: 20,
            labelColor: '#000',
            labelPadding: 18
        },
        legend: {
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
