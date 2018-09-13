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
 * @class Koala.store.TreeMenu
 */
Ext.define('Koala.store.TreeMenu', {
    extend: 'Ext.data.TreeStore',

    requires: 'Koala.util.Fullscreen',

    alias: 'store.k-treemenu',

    data: {
        expanded: true,
        children: [{
            text: 'Menu',
            key: 'menu',
            leaf: true,
            iconCls: 'x-fa fa-bars'
        }, {
            text: 'Themenauswahl',
            key: 'layers',
            leaf: true,
            iconCls: 'x-fa fa-folder-open-o'
        }, {
            text: 'Laden',
            iconCls: 'x-fa fa-globe',
            children: [{
                text: 'WMS hinzuladen',
                key: 'wmsimport',
                leaf: true,
                iconCls: 'x-fa fa-circle'
            }, {
                text: 'Vektordaten laden',
                key: 'vectorimport',
                leaf: true,
                iconCls: 'x-fa fa-circle-o'
            }]
        }, {
            text: 'Drucken',
            key: 'print',
            leaf: true,
            iconCls: 'x-fa fa-print'
        }, {
            text: 'Zeichnen',
            iconCls: 'x-fa fa-pencil-square-o',
            children: [{
                text: 'Messen',
                key: 'measure',
                leaf: true,
                iconCls: 'x-fa fa-pencil-square'
            }, {
                text: 'Zeichnen',
                key: 'draw',
                leaf: true,
                iconCls: 'x-fa fa-pencil'
            }]
        }, {
            text: 'Teilen',
            iconCls: 'x-fa fa-share-alt',
            children: [{
                text: 'Permalink',
                key: 'permalink',
                leaf: true,
                iconCls: 'x-fa fa-chain'
            }]
        }, {
            text: 'Einstellungen',
            iconCls: 'x-fa fa-gear',
            children: [{
                text: 'Zeitbezug',
                key: 'timezone',
                leaf: true,
                iconCls: 'x-fa fa-clock-o'
            }, {
                text: 'Sprache',
                key: 'language',
                leaf: true,
                iconCls: 'x-fa fa-language'
            }, {
                text: 'Vollbildmodus',
                key: 'fullscreen',
                leaf: true,
                iconCls: 'x-fa fa-expand',
                hidden: !Koala.util.Fullscreen.isFullscreenSupported()
            }]
        }, {
            text: 'Impressum',
            leaf: true,
            key: 'imprint',
            iconCls: 'x-fa fa-copyright'
        }, {
            text: 'Datenschutz',
            leaf: true,
            key: 'privacy',
            iconCls: 'x-fa fa-shield'
        }, {
            text: 'Hilfe',
            leaf: true,
            key: 'help',
            iconCls: 'x-fa fa-question'
        }]
    }
});
