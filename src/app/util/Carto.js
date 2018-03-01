/*  Copyright (c) 2018-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 *
 * @class Koala.util.Carto
 */
Ext.define('Koala.util.Carto', {

    requires: [
        'Koala.util.String'
    ],

    statics: {

        getTabData: function(layer, feature, urlProperty, contentProperty) {
            urlProperty = layer.get(urlProperty);
            contentProperty = layer.get(contentProperty);
            var url, prop;
            if (urlProperty) {
                url = Koala.util.String.replaceTemplateStrings(
                    urlProperty,
                    feature
                );
            }
            if (contentProperty) {
                prop = Koala.util.String.replaceTemplateStrings(
                    contentProperty,
                    feature
                );
            }

            var promise;

            if (prop) {
                promise = Ext.Promise.resolve(prop);
            } else {
                promise = new Ext.Promise(function(resolve, reject) {
                    Ext.Ajax.request({
                        url: url,
                        success: function(response) {
                            resolve(response.responseText);
                        },
                        failure: function(response) {
                            reject(response.status);
                        }
                    });
                });
            }
            return promise;
        },

        getTableData: function(layer, feature) {
            return this.getTabData(layer, feature, 'tableContentURL', 'tableContentProperty');
        },

        arrayToTable: function(data) {
            var html = '<table class="bordered-table">';
            Ext.each(data, function(row) {
                html += '<tr>';
                Ext.each(row, function(value) {
                    html += '<td>';
                    html += value;
                    html += '</td>';
                });
                html += '</tr>';
            });
            return html + '</table>';
        },

        geoJsonToTable: function(collection) {
            var html = '<table class="bordered-table">';
            var first = true;
            var headerRow = '<tr>';
            var row;
            Ext.each(collection.features, function(feat) {
                row = '<tr>';
                Ext.iterate(feat.properties, function(key, prop) {
                    row += '<td>';
                    row += prop;
                    row += '</td>';
                    if (first) {
                        headerRow += '<th>' + key + '</th>';
                    }
                });
                if (first) {
                    first = false;
                    html += headerRow + '</tr>';
                }
                html += row + '</tr>';
            });
            return html + '</table>';
        },

        convertData: function(data) {
            switch (data[0]) {
                case '<': {
                    return data;
                }
                case '[': {
                    // case of simple arrays in array
                    return this.arrayToTable(JSON.parse(data));
                }
                case '{': {
                    // case of GeoJSON
                    return this.geoJsonToTable(JSON.parse(data));
                }
                default: {
                    return this.arrayToTable(Ext.util.CSV.decode(data));
                }
            }
        },

        getHtmlData: function(layer, feature) {
            return this.getTabData(layer, feature, 'htmlContentURL', 'htmlContentProperty');
        }

    }

});
