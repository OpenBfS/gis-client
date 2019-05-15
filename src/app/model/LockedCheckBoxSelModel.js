/* This program is free software: you can redistribute it and/or modify
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
 * @class Koala.model.Station
 */
Ext.define('Koala.model.LockedCheckBoxSelModel', {
    extend: 'Ext.selection.CheckboxModel',
    alias: 'selection.LockedCheckBoxSelModel',

    getHeaderConfig: function() {
        return {
            isCheckerHd: true,
            text: '&#160;',
            width: 24,
            sortable: false,
            fixed: true,
            hideable: false,
            menuDisabled: true,
            dataIndex: '',
            locked: true, //here's the difference
            cls: Ext.baseCSSPrefix + 'column-header-checkbox ',
            renderer: Ext.Function.bind(this.renderer, this)
        };
    }
});
