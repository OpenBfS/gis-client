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
 * @class Koala.view.panel.BarChartController
 */
Ext.define('Koala.view.panel.BarChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-barchart',

    requires: [
        "Koala.view.component.D3BarChart"
    ],

    updateFor: function(olLayer, olFeat){
        var me = this;
        var view = me.getView();
        var chart = Koala.view.component.D3BarChart.create(olLayer, olFeat);
        view.removeAll();
        view.add(chart);
    }
});
