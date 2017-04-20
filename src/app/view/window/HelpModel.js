/* Copyright (c) 2017 Bundesamt fuer Strahlenschutz
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
 * @class Koala.view.window.HelpModel
 */
Ext.define('Koala.view.window.HelpModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-help',

    formulas: {
        selectionHtml: function(get) {
            var selection = get('treelist.selection'),
                content;
            if (selection) {
                content = selection.getPath('content', '-sep-');
                content = content.replace(/-sep--sep-|-sep-/g, '');
                return content;
            } else {
                return 'No node selected';
            }
        }
    },

    stores: {
        helpNavItems: {
            type: 'tree',
            root: {
                children: [{
                    text: '{preface.title}',
                    content: '{preface.html}',
                    leaf: true
                }, {
                    id: 'quickRef',
                    text: '{quickRef.title}',
                    content: '{quickRef.html}',
                    leaf: true
                }, {
                    id: 'profileSelection',
                    text: '{profileSelection.title}',
                    content: '{profileSelection.html}',
                    leaf: true
                }, {
                    id: 'map',
                    text: '{map.title}',
                    content: '{map.html}',
                    children: [{
                        id: 'mapOverview',
                        text: '{map.overview.title}',
                        content: '{map.overview.html}',
                        leaf: true
                    }, {
                        id: 'mapGeoObjects',
                        text: '{map.geoObjects.title}',
                        content: '{map.geoObjects.html}',
                        leaf: true
                    }]
                }, {
                    id: 'tools',
                    text: '{tools.title}',
                    content: '{tools.html}',
                    children: [{
                        id: 'toolsWms',
                        text: '{tools.wms.title}',
                        content: '{tools.wms.html}',
                        leaf: true
                    }, {
                        id: 'toolsPrint',
                        text: '{tools.print.title}',
                        content: '{tools.print.html}',
                        leaf: true
                    }, {
                        id: 'toolsImport',
                        text: '{tools.import.title}',
                        content: '{tools.import.html}',
                        leaf: true
                    }]
                }, {
                    id: 'layerSelection',
                    text: '{layerSelection.title}',
                    content: '{layerSelection.html}',
                    leaf: true
                }, {
                    text: '{searchField.title}',
                    content: '{searchField.html}',
                    leaf: true
                }, {
                    text: '{settings.title}',
                    content: '{settings.html}',
                    children: [{
                        text: '{settings.fullScreen.title}',
                        content: '{settings.fullScreen.html}',
                        leaf: true
                    }, {
                        text: '{settings.timeRef.title}',
                        content: '{settings.timeRef.html}',
                        leaf: true
                    }, {
                        text: '{settings.help.title}',
                        content: '{settings.help.html}',
                        leaf: true
                    }, {
                        text: '{settings.imprint.title}',
                        content: '{settings.imprint.html}',
                        leaf: true
                    }, {
                        text: '{settings.language.title}',
                        content: '{settings.language.html}',
                        leaf: true
                    }]
                }, {
                    id: 'mapNavigation',
                    text: '{mapNavigation.title}',
                    content: '{mapNavigation.html}',
                    children: [{
                        text: '{mapNavigation.zoomIn.title}',
                        content: '{mapNavigation.zoomIn.html}',
                        leaf: true
                    }, {
                        text: '{mapNavigation.zoomOut.title}',
                        content: '{mapNavigation.zoomOut.html}',
                        leaf: true
                    }, {
                        text: '{mapNavigation.initMapView.title}',
                        content: '{mapNavigation.initMapView.html}',
                        leaf: true
                    }, {
                        id: 'mapNavigationPermalink',
                        text: '{mapNavigation.permaLink.title}',
                        content: '{mapNavigation.permaLink.html}',
                        leaf: true
                    }, {
                        text: '{mapNavigation.openLegend.title}',
                        content: '{mapNavigation.openLegend.html}',
                        leaf: true
                    }]
                }, {
                    text: '{legend.title}',
                    content: '{legend.html}',
                    leaf: true
                }, {
                    id: 'geographicOverview',
                    text: '{geographicOverview.title}',
                    content: '{geographicOverview.html}',
                    leaf: true
                }]
            }
        }
    }
});
