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
 * This class is the view model for the Main view of the application.
 *
 * @class Koala.view.main.MainModel
 */
Ext.define('Koala.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.app-main',

    data: {
        addWmsButtonText: '',
        addWmsButtonTooltip: '',
        buttonGroupTopTitle: '',
        printButtonText: '',
        printButtonTooltip: '',
        importLocalDataButtonText: 'Import',
        importLocalDataButtonTooltip: 'Import local data',
        importLocalDataWindowText: 'Import',
        headerTitle: '',
        treeMenuTitle: 'Menu',
        selectedFeaturesLayer: null,
        noFeaturesSelected: true
    },
    formulas: {
        noFeaturesSelected: function(get) {
            var me = this;
            var layer = get('selectedFeaturesLayer');
            if (layer) {
                layer.getSource().on('change', function(evt) {
                    this.set('noFeaturesSelected',
                        evt.target.getFeatures().length === 0
                    );
                }.bind(me));
                return false;
            }
            return true;
        },
        treeMenuIconCls: function(get) {
            var isMicro = get('treeMenuMicro');
            return isMicro ? 'x-fa fa-chevron-right' : 'x-fa fa-chevron-left';
        }
    }
});
