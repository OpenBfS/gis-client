/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.wps.WpsGeometryChooserModel
 */
Ext.define('Koala.view.wps.WpsGeometryChooserModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.wps-geometrychooser',

    requires: [
    ],

    data: {
        i18n: {
            draw: '',
            bbox: '',
            currentExtent: '',
            upload: '',
            errorUploadedFileExtension: '',
            errorZeroFeatures: '',
            errorTooManyFeatures: '',
            errorUploadedGeometryType: '',
            errorFileUpload: ''
        },
        geojson: undefined
    },

    formulas: {
        geojsonString: function(get) {
            return JSON.stringify(get('geojson'));
        },
        bbox: function(get) {
            var geojson = get('geojson');
            if (!geojson) {
                return undefined;
            }
            var coords = geojson.coordinates[0];
            return [coords[0][0], coords[0][1], coords[2][0], coords[2][1]];
        }
    }

});
