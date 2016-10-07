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
 * @class Koala.view.component.D3Base
 */
Ext.define('Koala.view.component.D3Base',{
    extend: 'Ext.Component',
    xtype: 'd3-base',

    listeners: {
        boxready: 'onShow',
        painted: 'onShow'
    },

    inheritableStatics: {
        DEFAULTS: {
            CHART: {
                LEFT_AXIS_TYPE: 'line',
                LEFT_AXIS_CURVE: 'linear',
                STROKE_OPACITY: 1,
                STROKE_WIDTH: 1
            },
            BARCHART: {
                LEFT_AXIS_TYPE: 'bar',
                LEFT_AXIS_CURVE: 'linear',
                LEFT_AXIS_SCALE: 'linear', // TODO are these always same?
                LEFT_AXIS_FORMAT: ',.0f',
                BOTTOM_AXIS_SCALE: 'ordinal'
            }
        }
    }
});
