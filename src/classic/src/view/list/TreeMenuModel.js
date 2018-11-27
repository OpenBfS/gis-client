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
 * @class Koala.view.list.TreeMenuModel
 */
Ext.define('Koala.view.list.TreeMenuModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.k-list-treemenu',

    data: {
        micro: false,
        timereferenceValue: 'local',
        // i18n
        menu: '',
        themes: '',
        loading: '',
        wmsimport: '',
        vectorimport: '',
        print: '',
        tools: '',
        draw: '',
        measure: '',
        selectfeatures: '',
        share: '',
        permalink: '',
        settings: '',
        timereference: '',
        fullscreen: '',
        imprint: '',
        privacy: '',
        help: '',
        privacyUrl: '',
        settingsExpanded: false,
        themeTreeVisible: true,
        drawToolsActive: false,
        measureToolsActive: false,
        selectFeaturesActive: false,
        createvectorlayer: ''
    },

    stores: {
        menuStore: {
            type: 'tree',
            root: {
                expanded: true,
                children: [{
                    text: '{menu}',
                    key: 'menu',
                    leaf: true,
                    iconCls: 'x-fa fa-bars',
                    rowCls: 'menu-button'
                }, {
                    text: '{themes}',
                    key: 'themes',
                    leaf: true,
                    iconCls: 'x-fa fa-folder-open-o',
                    rowCls: '{themeTreeVisible ? "active" : ""}'
                }, {
                    text: '{loading}',
                    iconCls: 'x-fa fa-globe',
                    children: [{
                        text: '{wmsimport}',
                        key: 'wmsimport',
                        leaf: true,
                        iconCls: 'x-fa fa-map'
                    }, {
                        text: '{vectorimport}',
                        key: 'vectorimport',
                        leaf: true,
                        iconCls: 'x-fa fa-map-o'
                    }, {
                        text: '{createvectorlayer}',
                        key: 'createvectorlayer',
                        leaf: true,
                        iconCls: 'x-fa fa-files-o'
                    }]
                }, {
                    text: '{print}',
                    key: 'print',
                    leaf: true,
                    iconCls: 'x-fa fa-print'
                }, {
                    text: '{tools}',
                    iconCls: 'x-fa fa-pencil-square-o',
                    rowCls: '{selectFeaturesActive || drawToolsActive || measureToolsActive ? "active" : ""}',
                    children: [{
                        text: '{draw}',
                        key: 'draw',
                        leaf: true,
                        iconCls: 'x-fa fa-pencil',
                        rowCls: '{drawToolsActive ? "active" : ""}'
                    }, {
                        text: '{measure}',
                        key: 'measure',
                        leaf: true,
                        iconCls: 'x-fa fa-pencil-square',
                        rowCls: '{measureToolsActive ? "active" : ""}'
                    }, {
                        text: '{selectfeatures}',
                        key: 'selectfeatures',
                        leaf: true,
                        iconCls: 'x-fa fa-crop',
                        rowCls: '{selectFeaturesActive ? "active" : ""}'
                    }]
                }, {
                    text: '{share}',
                    iconCls: 'x-fa fa-share-alt',
                    children: [{
                        text: '{permalink}',
                        key: 'permalink',
                        leaf: true,
                        iconCls: 'x-fa fa-chain'
                    }]
                }, {
                    text: '{settings}',
                    iconCls: 'x-fa fa-gear',
                    expanded: '{settingsExpanded}',
                    children: [{
                        text: '{timereference} ({timereferenceValue})',
                        key: 'timereference',
                        leaf: true,
                        iconCls: 'x-fa fa-clock-o'
                    },
                    {
                        text: '{fullscreen}',
                        key: 'fullscreen',
                        leaf: true,
                        iconCls: 'x-fa fa-expand',
                        hidden: !Koala.util.Fullscreen.isFullscreenSupported()
                    }]
                }, {
                    text: '{imprint}',
                    leaf: true,
                    key: 'imprint',
                    iconCls: 'x-fa fa-copyright'
                }, {
                    text: '{privacy}',
                    leaf: true,
                    key: 'privacy',
                    iconCls: 'x-fa fa-shield'
                }, {
                    text: '{help}',
                    leaf: true,
                    key: 'help',
                    iconCls: 'x-fa fa-question'
                }]
            }
        }
    }

});
