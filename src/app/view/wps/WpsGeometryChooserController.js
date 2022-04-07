/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.wps.WpsGeometryChooserController
 */
Ext.define('Koala.view.wps.WpsGeometryChooserController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.wps-geometrychooser',

    requires: [
        'Ext.Array',
        'BasiGX.view.component.Map',
        'BasiGX.util.Layer'
    ],

    draw: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var processWindow = view.up('k-window-wps');
        if (!processWindow) {
            return;
        }

        var map = BasiGX.view.component.Map.guess().getMap();

        if (!processWindow.layer) {
            this.createProcessWindowLayer(processWindow);
        }

        if (!processWindow.interaction) {
            processWindow.interaction = new ol.interaction.Draw({
                source: processWindow.layer.getSource(),
                type: 'Polygon',
                stopClick: true
            });
            map.addInteraction(processWindow.interaction);

            processWindow.interaction.once('drawstart', function() {
                processWindow.layer.getSource().clear();
            });
            processWindow.interaction.once('drawend', function(evt) {
                var fmt = new ol.format.GeoJSON();
                var geojson = fmt.writeGeometryObject(evt.feature.getGeometry(), {
                    dataProjection: 'EPSG:3857',
                    featureProjection: map.getView().getProjection().getCode()
                });
                map.removeInteraction(processWindow.interaction);
                processWindow.interaction = null;
                this.getView().lookupViewModel().set('geojson', geojson);
            }.bind(me));
        }
    },

    drawBbox: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var processWindow = view.up('k-window-wps');
        if (!processWindow) {
            return;
        }

        if (!processWindow.layer) {
            me.createProcessWindowLayer(processWindow);
        }

        var map = BasiGX.view.component.Map.guess().getMap();
        var sourceProjection = map.getView().getProjection().getCode();

        if (!processWindow.interaction) {
            processWindow.interaction = new ol.interaction.Extent();
            map.addInteraction(processWindow.interaction);
            processWindow.interaction.setActive(true);

            var evtListener = function() {
                processWindow.interaction.setActive(false);
            };

            window.addEventListener('mouseup', evtListener);
            processWindow.interaction.on('change:active', function(evt) {
                if (!evt.target.value) {
                    var extent = processWindow.interaction.getExtent();
                    var feature = this.extentToFeature(extent);
                    var targetProjection = this.getTargetProjection(sourceProjection, view.supportedCRSs);
                    var geojson = this.featureToGeoJSON(feature, sourceProjection, targetProjection);
                    processWindow.layer.getSource().clear();
                    processWindow.layer.getSource().addFeature(feature);
                    vm.set('geojson', geojson);

                    window.removeEventListener('mouseup', evtListener);
                    map.removeInteraction(processWindow.interaction);
                    processWindow.interaction = null;
                }
            }.bind(this));
        }
    },

    getTargetProjection: function(sourceProj, supportedCRSs) {
        if (!supportedCRSs) {
            return sourceProj;
        }
        if (Ext.Array.contains(supportedCRSs, sourceProj)) {
            return sourceProj;
        }
        return supportedCRSs[0];
    },

    currentExtent: function() {
        var view = this.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var processWindow = view.up('k-window-wps');
        if (!processWindow.layer) {
            this.createProcessWindowLayer(processWindow);
        }

        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        var mapView = map.getView();
        var sourceProjection = mapView.getProjection().getCode();
        var targetProjection = this.getTargetProjection(sourceProjection, view.supportedCRSs);
        var extent = mapView.calculateExtent(map.getSize());
        var feature = this.extentToFeature(extent);
        var geojson = this.featureToGeoJSON(feature, sourceProjection, targetProjection);

        vm.set('geojson', geojson);
        processWindow.layer.getSource().clear();
        processWindow.layer.getSource().addFeature(feature);
    },

    extentToFeature: function(extent) {
        return new ol.Feature({
            geometry: new ol.geom.Polygon(
                [[
                    [extent[0], extent[1]],
                    [extent[2], extent[1]],
                    [extent[2], extent[3]],
                    [extent[0], extent[3]],
                    [extent[0], extent[1]]
                ]]
            )
        });
    },

    featureToGeoJSON: function(feature, sourceProj, targetProj) {
        var fmt = new ol.format.GeoJSON();
        return fmt.writeGeometryObject(feature.getGeometry(), {
            featureProjection: sourceProj,
            dataProjection: targetProj || 'EPSG:3857'
        });

    },

    createProcessWindowLayer: function(processWindow) {
        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        var displayInLayerSwitcherKey =
            BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;

        var source = new ol.source.Vector();
        processWindow.layer = new ol.layer.Vector({
            source: source
        });
        processWindow.layer.set(displayInLayerSwitcherKey, false);
        map.addLayer(processWindow.layer);
    },

    onBeforeDestroy: function() {
        var view = this.getView();
        if (!view) {
            return;
        }

        var processWindow = view.up('k-window-wps');
        if (!processWindow) {
            return;
        }

        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        if (processWindow.interaction) {
            map.removeInteraction(processWindow.interaction);
            processWindow.interaction = null;
        }
    },

    uploadButtonAfterRender: function(field) {
        var me = this;
        field.fileInputEl.on('change', me.handleUploadedFile.bind(me));
    },

    handleUploadedFile: function(event) {
        var view = this.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var processWindow = view.up('k-window-wps');
        if (!processWindow) {
            return;
        }

        if (!processWindow.layer) {
            this.createProcessWindowLayer(processWindow);
        }

        var file = event.target.files[0];

        if (file) {
            // check file extension
            var fileName = file.name.toLowerCase();
            var correctFileExtension = (fileName.endsWith('.json') || fileName.endsWith('.geojson'));

            if (!correctFileExtension) {
                Ext.toast(vm.get('i18n.errorUploadedFileExtension'));
                return;
            }

            file.text().then(function(text) {
                var map = BasiGX.view.component.Map.guess().getMap();
                if (!map) {
                    return;
                }

                var sourceProjection = map.getView().getProjection().getCode();
                var fmt = new ol.format.GeoJSON();
                var features = fmt.readFeatures(text,
                    {
                        featureProjection: sourceProjection
                    }
                );

                if (features.length === 0) {
                    Ext.toast(vm.get('i18n.errorZeroFeatures'));
                    return;
                }

                if (features.length > 1) {
                    Ext.toast(vm.get('i18n.errorTooManyFeatures'));
                    return;
                }

                var feat = features[0];
                if (!(feat.getGeometry() instanceof ol.geom.Polygon )) {
                    Ext.toast(vm.get('i18n.errorUploadedGeometryType'));
                    return;
                }

                var geojson = fmt.writeGeometryObject(feat.getGeometry(), {
                    featureProjection: sourceProjection,
                    dataProjection: 'EPSG:3857'
                });

                vm.set('geojson', geojson);
                processWindow.layer.getSource().clear();
                processWindow.layer.getSource().addFeature(feat);

                // the value must be reset after chosing a file
                var fileField = view.down('filebutton');
                fileField.fileInputEl.dom.value = '';

            }).catch(function(err) {
                Ext.toast(vm.get('i18n.errorFileUpload'));
                var str = 'An error occured: ' + err;
                Ext.log(str);
            });
        }
    }

});
