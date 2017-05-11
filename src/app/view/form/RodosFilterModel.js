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
 * @class Koala.view.form.RodosFilterModel
 */
Ext.define('Koala.view.form.RodosFilterModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-form-rodosfilter',

    data: {
        rodosProjectFieldsetTitle: 'Rodos Projekt auswählen !i18n',
        projectComboLabel: 'Projekt !i18n',
        removeAllLayers: 'Remove All Rodos Layers from Tree !i18n',

        rodosResults: null,
        rodosProjectsUrl: '/rodos-servlet',
        rodosResultsUrl: '/rodos-servlet'
    },

    stores: {
        projectStore: {
            type: 'k-rodosprojects',
            proxy: {
                url: '{rodosProjectsUrl}'
            }
        }
    }

});
