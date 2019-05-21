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

    requires: [
        'Koala.util.LocalStorage',
        'Koala.util.Fullscreen'
    ],

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
        about: '',
        showAboutBtn: 'false',
        help: '',
        privacyUrl: '',
        settingsExpanded: false,
        themeTreeVisible: true,
        drawToolsActive: false,
        measureToolsActive: false,
        selectFeaturesActive: false,
        createvectorlayer: '',
        showHelp: true,
        showLayersetChooser: true,
        showHelpText: '',
        showLayersetChooserText: '',
        publicRole: true,
        fullscreenSupported: true
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
                    iconCls: 'x-fa fas fa-bars',
                    rowCls: 'menu-button'
                }, {
                    text: '{themes}',
                    key: 'themes',
                    leaf: true,
                    iconCls: 'x-fa fas fa-folder-open',
                    rowCls: '{themeTreeVisible ? "active" : ""}'
                }, {
                    text: '{loading}',
                    iconCls: 'x-fa fas fa-globe',
                    children: [{
                        text: '{wmsimport}',
                        key: 'wmsimport',
                        leaf: true,
                        iconCls: 'x-fa fa-map',
                        rowCls: '{showWmsImportBtn ? "" : "hidden"}'
                    }, {
                        text: '{vectorimport}',
                        key: 'vectorimport',
                        leaf: true,
                        iconCls: 'x-fa fas fa-map-o',
                        rowCls: '{showVectorImportBtn ? "" : "hidden"}'
                    }, {
                        text: '{createvectorlayer}',
                        key: 'createvectorlayer',
                        leaf: true,
                        iconCls: 'x-fa fas fa-files-o',
                        rowCls: '{showCreateVectorLayerBtn ? "" : "hidden"}'
                    }]
                }, {
                    text: '{print}',
                    key: 'print',
                    leaf: true,
                    iconCls: 'x-fa fas fa-print',
                    rowCls: '{showPrintBtn ? "" : "hidden"}'
                }, {
                    text: '{tools}',
                    iconCls: 'x-fa fas fa-pencil-square-o',
                    rowCls: '{selectFeaturesActive || drawToolsActive || measureToolsActive ? "active" : ""}',
                    children: [{
                        text: '{draw}',
                        key: 'draw',
                        leaf: true,
                        iconCls: 'x-fa fas fa-pencil-ruler',
                        rowCls: '{showDrawBtn ? "" : "hidden"} {drawToolsActive ? "active" : ""}'
                    }, {
                        text: '{measure}',
                        key: 'measure',
                        leaf: true,
                        iconCls: 'x-fa fas fa-pencil-square',
                        rowCls: '{showMeasureBtn ? "" : "hidden"} {measureToolsActive ? "active" : ""}'
                    }, {
                        text: '{selectfeatures}',
                        key: 'selectfeatures',
                        leaf: true,
                        iconCls: 'x-fa fas fa-crop',
                        rowCls: '{showSelectFeaturesBtn ? "" : "hidden"}{selectFeaturesActive ? "active" : ""}'
                    }]
                }, {
                    text: '{share}',
                    iconCls: 'x-fa fas fa-share-alt',
                    children: [{
                        text: '{permalink}',
                        key: 'permalink',
                        leaf: true,
                        iconCls: 'x-fa fas fa-link'
                    }]
                }, {
                    text: '{settings}',
                    iconCls: 'x-fa fas fa-cog',
                    expanded: '{settingsExpanded}',
                    children: [{
                        text: '{timereference} ({timereferenceValue})',
                        key: 'timereference',
                        leaf: true,
                        iconCls: 'x-fa fas fa-clock-o'
                    },
                    {
                        text: '{fullscreen}',
                        key: 'fullscreen',
                        leaf: true,
                        iconCls: 'x-fa fas fa-expand',
                        hidden: '{!fullscreenSupported}'
                    }, {
                        text: '{onRestartText}',
                        children: [{
                            text: '{showLayersetChooserText}',
                            key: 'showlayersetchooser',
                            leaf: true,
                            rowCls: '{showLayersetChooser ? "active" : ""}'
                        }, {
                            text: '{showHelpText}',
                            key: 'showhelp',
                            leaf: true,
                            rowCls: '{showHelp ? "active" : ""} {publicRole ? "" : "hidden"}'
                        }]
                    }]
                }, {
                    text: '{imprint}',
                    leaf: true,
                    key: 'imprint',
                    iconCls: 'x-fa fas fa-copyright'
                }, {
                    text: '{privacy}',
                    leaf: true,
                    key: 'privacy',
                    iconCls: 'x-fa fas fa-shield-alt'
                }, {
                    text: '{about}',
                    leaf: true,
                    key: 'about',
                    iconCls: 'x-fa fas fa-info'
                }, {
                    text: '{help}',
                    leaf: true,
                    key: 'help',
                    iconCls: 'x-fa fas fa-question'
                }]
            }
        }
    }

});
