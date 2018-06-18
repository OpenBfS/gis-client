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
 * @class Koala.view.form.BarChartFilterControlController
 */
Ext.define('Koala.view.form.BarChartFilterControlController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-barchartfiltercontrol',

    requires: [
        'Ext.Toast'
    ],

    /**
     * Validates if the current datetime values are valid. Either delegates
     * the newly passed valies or shows a toast if not valid.
     *
     * @method onSetFilterButtonClick
     */
    onSetFilterButtonClick: function() {
        var me = this;
        var view = me.getView();
        var panel = view.up('k-panel-barchart');
        var chart = panel.down('d3-barchart');
        var controller = chart.getController();

        var uncertainty = view.down('[name=toggle-uncertainty]').getValue();
        controller.showUncertainty = uncertainty;
        var grouping = view.down('[name=toggle-grouping]').getValue();
        controller.groupPropToggled = grouping;
        controller.getChartData();
        controller.on('chartdataprepared', function() {
            controller.redrawLegend();
        });
    }

});
