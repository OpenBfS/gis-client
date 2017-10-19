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

    //TODO: get rid of the 'fallbackHtml'-solution -> missing bindings, store not ready on initial load issue
    data: {
        fallbackHtml: '<img class=\'img\' src=\'classic/resources/img/bfs-logo.png\' title=\'BfS-Logo\' alt=\'bfs-logo.png\' width=\'100\' height=\'39\' style=\'float:right\'>'+
            '<h2> Willkommen </h2>'+
            '<div>Das '+
            '<a href=\'http://www.bfs.de/DE/home/home_node.html\' target=\'_blank\'>Bundesamt für Strahlenschutz (BfS)</a>'+
            ' stellt mit dem '+
            '<a href=\'http://www.bfs.de/DE/themen/ion/umwelt/luft-boden/geoportal/geoportal.html\' target=\'_blank\'>BfS-Geoportal</a>'+
            ' ein eigenes Internetportal für die Suche und Darstellung raumbezogenen Daten (Geodaten) und Webdienste (Geodatendienste) bereit. Zur Verfügung stehen Messdaten des BfS sowie weiterer Bundes-, Landes- und anderer Behörden. Dies sind in der Mehrzahl Daten aus dem '+
            '<a href=\'http://www.bfs.de/DE/themen/ion/notfallschutz/messnetz/imis/imis.html\' target=\'_blank\'>Integrierten Mess- und Informationssystem (IMIS)</a>'+
            '.</div>'+
            '<div>'+
            '<p>Für die Bereitstellung von Geoinformationen haben gesetzliche Grundlagen, wie das '+
            '<a href=\'http://www.gesetze-im-internet.de/geozg/\' target=\'_blank\'>Geodatenzugangsgesetz (GeoZG)</a>'+
            ' als Umsetzung der Europäische '+
            '<a href=\'http://inspire.ec.europa.eu/\' target=\'_blank\'>INSPIRE Richtlinie</a>'+
            ', in den vergangenen Jahren die technischen Entwicklungen und '+
            '<a href=\'http://www.opengeospatial.org/standards\' target=\'_blank\'>Normierungen</a>'+
            ' von Such-, Darstellungs- und Download-Dienste erheblich vorangetrieben.</p>'+
            '<p>Unter anderem wurden dadurch nutzerfreundlich Zugriffe auf Dienste anderer Quellen möglich, wie dies zentral im '+
            '<a href=\'http://www.geoportal.de/DE/Geoportal/geoportal.html?lang=de\' target=\'_blank\'>Geoportal-Deutschland</a>'+
            ' aber auch in der vorliegenden GIS-Software des BfS möglich ist.</p>'+
            '<p>Das BfS ist bestrebt, sein Informationsangebot über solche standardisierte Dienste stets weiter auszubauen.</p>'+
            '</div>'+
            '<div>Diese Anwendung soll nicht nur helfen die gewünschten Daten zu finden und geographisch darzustellen, sondern wenn möglich auch nach individuellen Bedürfnissen zu analysieren. Zeitreihendarstellungen oder Säulendiagramme sind dabei erste Schritte, die zukünftig noch ausgebaut werden sollen.</div>'+
            '<div>Zur Umsetzung einer transparenten Informationspolitik sehen wir unter anderem die Bereitstellung als offene Daten (siehe BfS Geoportal - Impressum/Nutzungsbedingungen) sowie die Entwicklung aller unserer Anwendungen als Open-Source-Software '+
            '<a href=\'http://www.bfs.de/SharedDocs/Kurzmeldungen/BfS/DE/2017/0102-bfs-open-source.html\' target=\'_blank\'>(Kurzmeldung des BfS)</a>'+
            '.</div>'+
            '<div>Durch dieses Entwicklungskonzept wird darüber hinaus ein effektiver, gemeinnütziger Ressourceneinsatz gewährleistet.</div>'
    },

    formulas: {
        selectionHtml: function(get) {
            var selection = get('treelist.selection'),
                content;
            if (selection) {
                content = selection.getPath('content', '-sep-');
                content = content.replace(/-sep--sep-|-sep-/g, '');
                return content;
            } else {
                return this.getData().fallbackHtml;
            }
        }
    },

    stores: {
        helpNavItems: {
            type: 'tree',
            root: {
                children: [{
                    id: 'preface',
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
                        text: '{mapNavigation.fullScreen.title}',
                        content: '{mapNavigation.fullScreen.html}',
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
                    id: 'legendHelp',
                    text: '{legend.title}',
                    content: '{legend.html}',
                    leaf: true
                }, {
                    id: 'geographicOverview',
                    text: '{geographicOverview.title}',
                    content: '{geographicOverview.html}',
                    leaf: true
                }, {
                    id: 'softwareVersion',
                    text: '{softwareVersion.title}',
                    content: (Ext.manifest) ? Ext.manifest.version : '{softwareVersion.html}',
                    leaf: true
                }]
            }
        }
    }
});
