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
 * @class Koala.view.container.RedliningToolsContainerModel
 */
Ext.define('Koala.view.container.RedliningToolsContainerModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.k-container-redliningtoolscontainer',

    data: {
        drawPointBtnTooltip: '',
        drawLinesBtnTooltip: '',
        drawPolygonsBtnTooltip: '',
        modifyObjectBtnTooltip: '',
        deleteObjectBtnTooltip: '',
        clearObjectsBtnTooltip: '',
        helpMsg: 'Click to start drawing',
        continuePolygonMsg: 'Click to continue drawing the polygon',
        continueLineMsg: 'Click to continue drawing the line',

        measurementLabelText: null,
        measurementLabelCoord: null
    }

});
