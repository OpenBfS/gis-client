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
 * @class Koala.view.form.IrixFieldsetModel
 */
Ext.define('Koala.view.form.IrixFieldSetModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-form-irixfieldset',
    data: {
        DokpoolBehaviour_label: 'DokpoolBehaviour',
        DokpoolMeta_label: 'DokpoolMeta',
        Doksys_label: 'Doksys',
        Identification_label: 'Identification',
        ElanScenarios_label: 'Elan Incidences',
        DokpoolBehaviour_Elan_label: 'is Elan',
        DokpoolBehaviour_Doksys_label: 'is Doksys',
        DokpoolBehaviour_Rodos_label: 'is Rodos',
        DokpoolBehaviour_Rei_label: 'is Rei',
        Permalink_text: 'Darstellung im GIS anzeigen'
    }

});
