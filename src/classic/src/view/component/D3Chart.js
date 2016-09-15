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
Ext.define('Koala.view.component.D3Chart',{
    extend: 'Ext.Component',
    xtype: 'd3-chart',

    requires: [
        'Koala.view.component.D3ChartController',
        'Koala.view.component.D3ChartModel'
    ],

    controller: 'component-d3chart',
    viewModel: {
        type: 'component-d3chart'
    },

    listeners: {
        boxready: 'onShow'
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
        shapes: [],
        selectedStations: [],
        // shapes: [{
        //     type: 'area',
        //     curve: 'linear',
        //     xField: 'end_measure',
        //     yField: 'value',
        //     name: 'area 1',
        //     color: '#6C3483',
        //     opacity: 1,
        //     width: 4
        // },
        // {
        //     type: 'line',
        //     curve: 'linear',
        //     xField: 'end_measure',
        //     yField: 'value',
        //     name: 'stepline 1',
        //     color: '#1F618D',
        //     width: 3
        // },
        // {
        //     type: 'bar',
        //     curve: 'linear',
        //     xField: 'end_measure',
        //     yField: 'value',
        //     name: 'barchart 1',
        //     color: '#117A65',
        //     width: 3
        // }],
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
                left: 30
            }
        },
        axes: {
            // left: {
                // scale: 'linear',
                // dataIndex: 'value',
                // ticks: null,
                // tickValues: null,
                // tickSize: null,
                // tickPadding: null,
                // format: ',.0f',
                // label: 'Verrückte Mongo',
                // labelSize: 35,
                // labelColor: '#000',
                // labelPadding: 25
            // },
            // bottom: {
                // scale: 'time',
                // dataIndex: 'end_measure',
                // label: 'Datum'
            // }
        }
    }
});
