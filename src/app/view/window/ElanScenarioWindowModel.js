/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.CloneWindowModel
 */
Ext.define('Koala.view.window.ElanScenarioWindowModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-elanscenarios',

    data: {
        windowTitle: '',
        title: '',
        close: '',
        unchangedText: '',
        changedText: '',
        description: '',
        EventType_title: '',
        TimeOfEvent: '',
        OperationMode_title: '',
        modified: '',
        modified_by: '',
        true: '',
        false: '',
        emptyText: ''
    }
});
