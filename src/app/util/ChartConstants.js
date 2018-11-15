/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.util.ChartConstants
 */
Ext.define('Koala.util.ChartConstants', {

    statics: {

        /**
         * An object containing CSS classes and parts (suffixes, prefixes) to
         * generate CSS classes.
         *
         * @type {Object}
         */
        CSS_CLASS: {
            AXIS: 'k-d3-axis',
            AXIS_X: 'k-d3-axis-x',
            AXIS_Y: 'k-d3-axis-y',

            PLOT_BACKGROUND: 'k-d3-plot-background',

            GRID: 'k-d3-grid',
            GRID_X: 'k-d3-grid-x',
            GRID_Y: 'k-d3-grid-y',

            SHAPE_GROUP: 'k-d3-shape-group',
            BAR_GROUP: 'k-d3-bar-group',
            BAR: 'k-d3-bar',
            UNCERTAINTY: 'k-d3-uncertainty',
            SHAPE_PATH: 'k-d3-shape-path',
            SHAPE_POINT_GROUP: 'k-d3-shape-points',
            LEGEND_CONTAINER: 'k-d3-scrollable-legend-container',
            COLOR_ICON: 'k-d3-color-icon',
            DOWNLOAD_ICON: 'k-d3-download-icon',
            DELETE_ICON: 'k-d3-delete-icon',

            AXIS_LABEL: 'k-d3-axis-label',
            AXIS_LABEL_X: 'k-d3-axis-label-x',
            AXIS_LABEL_Y: 'k-d3-axis-label-y',

            PREFIX_IDX_SHAPE_GROUP: 'shape-group-',
            PREFIX_IDX_SHAPE_PATH: 'shape-path-',
            PREFIX_IDX_SHAPE_POINT_GROUP: 'shape-points-',
            PREFIX_IDX_LEGEND_GROUP: 'legend-group-',

            SUFFIX_LEGEND: '-legend',

            HIDDEN_CLASS: 'k-d3-hidden',
            DISABLED_CLASS: 'k-d3-disabled'
        },

        /**
         * Additional space added to the (bar) chart. Adds the configured Number
         * as percent to the datarange to create some space inside the chart.
         *
         * @type {Number} percent
         */
        ADDITIONAL_DOMAIN_SPACE: 10,

        /**
         * Additional margin to take into consideration when calculating the
         * width of the bars.
         *
         * @type {Number}
         */
        ADDITIONAL_BAR_MARGIN: 5

    }

});
