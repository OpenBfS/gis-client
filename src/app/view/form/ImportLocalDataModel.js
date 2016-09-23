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
 * @class Koala.view.form.ImportLocalDataModel
 */
Ext.define('Koala.view.form.ImportLocalDataModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-form-importlocaldata',
    data: {
        file: null,
        features: null,
        projection: null,
        targetProjection: null,
        layerName: null,
        templateUuid: null,
        // TODO add to locales
        fieldSetTitle: 'Upload of',
        cancelButtonText: 'Cancel',
        importButtonText: 'Import',
        layerNameLabel: 'Layername',
        templateLabel: 'Template',
        projectionLabel: 'Projection',
        fileFieldLabel: 'Datei',
        fileFieldButtonText: 'Durchsuchen'
    },

    formulas: {
        couldBeGml: function(get){
            var fileName = get('file.name');
            var couldBeGml = fileName.endsWith('gml') || fileName.endsWith('xml');
            return couldBeGml;
        }
    }

});
