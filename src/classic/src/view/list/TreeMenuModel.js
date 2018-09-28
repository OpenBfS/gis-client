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
        drawandmeasure: '',
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
        settingsExpanded: false
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
                    iconCls: 'x-fa fa-bars'
                }, {
                    text: '{themes}',
                    key: 'themes',
                    leaf: true,
                    iconCls: 'x-fa fa-folder-open-o'
                }, {
                    text: '{loading}',
                    iconCls: 'x-fa fa-globe',
                    children: [{
                        text: '{wmsimport}',
                        key: 'wmsimport',
                        leaf: true,
                        iconCls: 'x-fa fa-circle'
                    }, {
                        text: '{vectorimport}',
                        key: 'vectorimport',
                        leaf: true,
                        iconCls: 'x-fa fa-circle-o'
                    }]
                }, {
                    text: '{print}',
                    key: 'print',
                    leaf: true,
                    iconCls: 'x-fa fa-print'
                }, {
                    text: '{drawandmeasure}',
                    iconCls: 'x-fa fa-pencil-square-o',
                    children: [{
                        text: '{draw}',
                        key: 'draw',
                        leaf: true,
                        iconCls: 'x-fa fa-pencil'
                    }, {
                        text: '{measure}',
                        key: 'measure',
                        leaf: true,
                        iconCls: 'x-fa fa-pencil-square'
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
                    text: '{selectfeatures}',
                    key: 'selectfeatures',
                    leaf: true,
                    iconCls: 'x-fa fa-crop'
                },{
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
