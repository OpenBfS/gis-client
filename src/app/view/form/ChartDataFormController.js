/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.ChartDataFormController
 */
Ext.define('Koala.view.form.ChartDataFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-chartdata',

    requires: [
    ],

    onOk: function() {
        var view = this.getView();
        var bar = view.metadata.layerConfig.barChartProperties;
        Ext.each(view.fields, function(field) {
            bar[field] = view.down('[name=bar]').down('[name=' + field + ']').getValue();
        });
        var time = view.metadata.layerConfig.timeSeriesChartProperties;
        Ext.each(view.timeseriesFields, function(field) {
            time[field] = view.down('[name=timeseries]').down('[name=' + field + ']').getValue();
        });
        view.done(view.metadata);
    },

    onCancel: function() {
        this.getView().cancel();
    }

});
