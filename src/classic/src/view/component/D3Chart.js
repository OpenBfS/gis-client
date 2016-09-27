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
    extend: 'Koala.view.component.D3Base',
    xtype: 'd3-chart',

    requires: [
        'Koala.view.component.D3ChartController',
        'Koala.view.component.D3ChartModel'
    ],

    controller: 'component-d3chart',
    viewModel: {
        type: 'component-d3chart'
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
        grid: {
            show: false,
            color: null,
            width: null,
            opacity: null
        },
        startDate: null,
        endDate: null,
        shapes: [],
        selectedStations: [],
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
