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
 * @class Koala.model.SpatialRecord
 */
Ext.define('Koala.model.SpatialRecord', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'name',
        mapping: function(data) {
            var html = '';
            if (data.properties.name) {
                html += '<b>' + data.properties.name + '</b><br>';
            }
            if (data.properties.street) {
                html += data.properties.street;
                if (data.properties.housenumber) {
                    html += ' ' + data.properties.housenumber + '<br>';
                }
            }
            if (data.properties.city) {
                html += data.properties.city;
                if (data.properties.district) {
                    html += ' - ' + data.properties.district;
                }
                if (data.properties.city !== data.properties.state) {
                    html += ' (' + data.properties.state + ')';
                }
            }
            if (data.properties.countrycode !== 'DE') {
                html += '<br>' + data.properties.countrycode;
            }
            return html;
        }
    }, {
        name: 'wkt',
        mapping: function(data) {
            var fmt = new ol.format.GeoJSON();
            var geom = fmt.readGeometry(data.geometry);
            fmt = new ol.format.WKT();
            return fmt.writeGeometry(geom);
        }
    }, {
        name: 'nnid',
        mapping: function(data) {
            return data.properties.NNID;
        }
    }]
});
