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
 * @class Koala.view.window.Print
 */
Ext.define('Koala.view.window.Print', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-print',

    requires: [
        'Koala.util.Help',
        'Koala.view.window.PrintController',
        'Koala.view.window.PrintModel',

        'Koala.view.form.Print'
    ],

    controller: 'k-window-print',
    viewModel: {
        type: 'k-window-print'
    },

    bind: {
        title: '{title}'
    },

    collapsible: true,
    resizable: false,
    constrainHeader: true,

    listeners: {
        expand: function() {
            this.down('k-form-print').addExtentInteractions();
            // HBD: after collapse/expand extjs thinks the user manually
            // resized the window and stops automatic window resize if
            // child component sizes are updated. We can apparently
            // reset this by setting the sizes to null...
            this.setSize(null, null);
        },
        resize: function(win) {
            win.center();
        }
    },

    layout: 'fit',

    tools: [{
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        callback: function() {
            Koala.util.Help.showHelpWindow('toolsPrint', 'tools');
        }
    }],

    config: {
        chartPrint: false,
        chart: undefined,
        irixPrint: false
    },

    constructor: function() {
        this.callParent(arguments);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var urls = appContext.data.merge.urls;
        this.add({
            xtype: 'k-form-print',
            maxHeight: Ext.getBody().getHeight() - 100,
            url: urls['print-servlet'],
            chartPrint: this.config.chartPrint,
            chart: this.config.chart,
            skipMapMode: this.config.irixPrint
        });
    }
});
