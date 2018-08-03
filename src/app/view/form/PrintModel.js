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
 * @class Koala.view.form.PrintModel
 */
Ext.define('Koala.view.form.PrintModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-form-print',
    data: {
        title: '',
        labelDpi: '',
        printButtonSuffix: '',
        downloadButtonPrefix: '',
        printFormat: '',
        printAppFieldSetTitle: '',
        genericFieldSetTitle: '',
        formatComboLabel: '',
        layoutComboLabel: '',
        attributesTitle: '',
        mapTitleLabel: '',
        map_label: '',
        northArrowLabel: 'northArrow_label',
        northArrowBoxLabel: 'northArrow_boxLabel',
        scaleBar_label: 'scaleBar_label',
        scaleBar_boxLabel: 'scaleBar_boxLabel',
        map_attribution_label: '',
        is_exercise_label: '',
        title_label: '',
        description_label: '',
        comment_label: '',
        impressum_label: '',
        doc_creator_label: '',
        serverUploadSuccessTitle: '',
        serverUploadSuccess: '',
        serverErrorTitle: '',
        serverError: '',
        disablePopupBlockerTitle: '',
        disablePopupBlocker: '',
        printLegendsFieldSetTitle: '',
        unexpectedResponseTitle: '',
        unexpectedResponse: '',
        printButtonPrefix: '',
        downloadButtonSuffix: '',
        downloadOngoingMiddleText: '',
        warnPrintTimedOutTitle: '',
        warnPrintTimedOutText: '',
        updateLegendtext: '',
        unlinkTooltip: ''
    }

});
