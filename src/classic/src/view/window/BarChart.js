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
 * @class Koala.view.window.BarChart
 */
Ext.define("Koala.view.window.BarChart", {
    extend: "Ext.window.Window",
    xtype: "k-window-barchart",
    cls: "k-window-barchart",

    requires: [
        "Koala.view.window.BarChartController",
        "Koala.view.window.BarChartModel",

        "Ext.form.field.Date"
    ],

    controller: "k-window-barchart",

    viewModel: {
        type: "k-window-barchart"
    },

    bind: {
        title: "{title}"
    },

    name: "barchartwin",
    constrainHeader: true,
    collapsible: true,
    maxHeight: 800,
    height: 300,
    width: 900,
    layout: "fit",
    tools: [{
        type: 'help',
        //TODO: move to app-locale
        tooltip: 'Hilfe',
        callback: function() {
            var helpWin = Ext.ComponentQuery.query('k-window-help')[0];
            if (!helpWin) {
                helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                helpWin.on('afterlayout', function() {
                    var helpWinController = this.getController();
                    helpWinController.setTopic('mapGeoObjects', 'map');
                });
            } else {
                BasiGX.util.Animate.shake(helpWin);
                var helpWinController = helpWin.getController();
                helpWinController.setTopic('mapGeoObjects', 'map');
            }
        }
    }],
    listeners: {
        close: "onBarchartWinClose"
    }
});
