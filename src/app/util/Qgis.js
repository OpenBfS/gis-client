/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * @class Koala.util.Qgis
 */
Ext.define('Koala.util.Qgis', {

    requires: [
        'BasiGX.util.Map'
    ],

    statics: {

        exportQgisProject: function() {
            var staticMe = Koala.util.Qgis;
            var map = BasiGX.util.Map.getMapComponent().map;
            var layers = [];
            Ext.each(map.getLayers().getArray(), function(layer) {
                if (layer.getSource() instanceof ol.source.Vector) {
                    if (layer.get('name') === 'hoverVectorLayer' ||
                        layer.get('bp_displayInLayerSwitcher') === false ||
                        !layer.get('name')) {
                        return;
                    }
                    layers.push(layer);
                }
            });
            var fmt = new ol.format.GeoJSON();
            GeoPackage.GeoPackageAPI.create()
                .then(function(gpkg) {
                    gpkg.createDataColumns();
                    gpkg.createGeometryColumnsTable();
                    gpkg.createGeometryIndexTable();

                    var promises = [];
                    Ext.each(layers, function(layer) {
                        var name = layer.get('name');
                        var columns = [];
                        var features = layer.getSource().getFeatures().slice();
                        var feat = features[0];
                        if (feat) {
                            Ext.iterate(feat.getProperties(), function(key, value) {
                                if (key === 'geometry' || key === 'id') {
                                    return;
                                }
                                var dataType = 'TEXT';
                                if (typeof value === 'number') {
                                    dataType = 'DOUBLE';
                                }
                                if (typeof value === 'boolean') {
                                    dataType = 'BOOLEAN';
                                }
                                columns.push({
                                    name: key,
                                    dataType: dataType
                                });
                            });
                        }
                        gpkg.createFeatureTableFromProperties(name, columns);
                        features = fmt.writeFeaturesObject(features, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        var count = -1;
                        Ext.each(features.features, function(feature) {
                            feature.properties.id = ++count;
                        });
                        promises.push(gpkg.addGeoJSONFeaturesToGeoPackage(features.features, name, true));
                    });
                    Ext.Promise.all(promises)
                        .then(function() {
                            staticMe.getQgisTemplateProject(layers, gpkg);
                        });
                });
        },

        getQgisTemplateProject: function(layers, gpkg) {
            var staticMe = Koala.util.Qgis;
            Ext.Ajax.request({
                url: 'resources/qgis-template.xml',
                success: function(xhr) {
                    var doc = xhr.responseXML;
                    window.d = doc;
                    var layerIds = {};
                    Ext.each(layers, function(layer) {
                        var name = layer.get('name');
                        var node = doc.querySelector('projectlayers');
                        var layerNode = doc.createElement('maplayer');
                        layerNode.setAttribute('simplifyLocal', '1');
                        layerNode.setAttribute('simplifyDrawingHints', '1');
                        layerNode.setAttribute('symbologyReferenceScale', '-1');
                        layerNode.setAttribute('styleCategories', 'AllStyleCategories');
                        layerNode.setAttribute('readOnly', '0');
                        layerNode.setAttribute('labelsEnabled', '0');
                        layerNode.setAttribute('legendPlaceholderImage', '');
                        layerNode.setAttribute('simplifyMaxScale', '1');
                        layerNode.setAttribute('wkbType', 'MultiPolygon');
                        layerNode.setAttribute('simplifyAlgorithm', '0');
                        layerNode.setAttribute('simplifyDrawingTol', '1');
                        layerNode.setAttribute('geometry', 'Polygon');
                        layerNode.setAttribute('hasScaleBasedVisibilityFlag', '0');
                        layerNode.setAttribute('maxScale', '0');
                        layerNode.setAttribute('autoRefreshEnabled', '0');
                        layerNode.setAttribute('refreshOnNotifyEnabled', '0');
                        layerNode.setAttribute('autoRefreshTime', '0');
                        layerNode.setAttribute('minScale', '100000000');
                        layerNode.setAttribute('refreshOnNotifyMessage', '');
                        layerNode.setAttribute('type', 'vector');
                        node.appendChild(layerNode);
                        layerIds[name] = name + '_' + crypto.randomUUID();
                        var inner = '<extent>' +
                            '<xmin>5.86625035000000139</xmin>' +
                            '<ymin>47.27012359999996249</ymin>' +
                            '<xmax>15.04181564999996112</xmax>' +
                            '<ymax>55.05838360000004172</ymax>' +
                            '</extent>' +
                            '<wgs84extent>' +
                            '<xmin>5.86625035000000139</xmin>' +
                            '<ymin>47.27012359999996249</ymin>' +
                            '<xmax>15.04181564999996112</xmax>' +
                            '<ymax>55.05838360000004172</ymax>' +
                            '</wgs84extent>' +
                            '<id>' + layerIds[name] + '</id>' +
                            '<datasource>./project.gpkg|layername=' + name + '</datasource>' +
                            '<keywordList><value></value></keywordList>' +
                            '<layername>' + name + '</layername>' +
                            '<srs>' +
                            '<spatialrefsys nativeFormat="Wkt">' +
                            '<wkt>GEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>' +
                            '<proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>' +
                            '<srsid>3452</srsid>' +
                            '<srid>4326</srid>' +
                            '<authid>EPSG:4326</authid>' +
                            '<description>WGS 84</description>' +
                            '<projectionacronym>longlat</projectionacronym>' +
                            '<ellipsoidacronym>EPSG:7030</ellipsoidacronym>' +
                            '<geographicflag>true</geographicflag>' +
                            '</spatialrefsys>' +
                            '</srs>' +
                            '<resourceMetadata>' +
                            '<identifier></identifier>' +
                            '<parentidentifier></parentidentifier>' +
                            '<language></language>' +
                            '<type>dataset</type>' +
                            '<title></title>' +
                            '<abstract></abstract>' +
                            '<links/>' +
                            '<fees></fees>' +
                            '<encoding></encoding>' +
                            '<crs>' +
                            '<spatialrefsys nativeFormat="Wkt">' +
                            '<wkt>GEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>' +
                            '<proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>' +
                            '<srsid>3452</srsid>' +
                            '<srid>4326</srid>' +
                            '<authid>EPSG:4326</authid>' +
                            '<description>WGS 84</description>' +
                            '<projectionacronym>longlat</projectionacronym>' +
                            '<ellipsoidacronym>EPSG:7030</ellipsoidacronym>' +
                            '<geographicflag>true</geographicflag>' +
                            '</spatialrefsys>' +
                            '</crs>' +
                            '<extent>' +
                            '<xmin>5.86625035000000139</xmin>' +
                            '<ymin>47.27012359999996249</ymin>' +
                            '<xmax>15.04181564999996112</xmax>' +
                            '<ymax>55.05838360000004172</ymax>' +
                            '</extent>' +
                            '</resourceMetadata>' +
                            '<provider encoding="UTF-8">ogr</provider>' +
                            '<vectorjoins/>' +
                            '<layerDependencies/>' +
                            '<dataDependencies/>' +
                            '<expressionfields/>' +
                            '<map-layer-style-manager current="default">' +
                            '<map-layer-style name="default"/>' +
                            '</map-layer-style-manager>' +
                            '<auxiliaryLayer/>' +
                            '<metadataUrls/>' +
                            '<flags>' +
                            '<Identifiable>1</Identifiable>' +
                            '<Removable>1</Removable>' +
                            '<Searchable>1</Searchable>' +
                            '<Private>0</Private>' +
                            '</flags>' +
                            '<temporal startExpression="" endExpression="" accumulate="0" durationUnit="min" fixedDuration="0" limitMode="0" endField="" enabled="0" durationField="" mode="0" startField="">' +
                            '<fixedRange>' +
                            '<start></start>' +
                            '<end></end>' +
                            '</fixedRange>' +
                            '</temporal>' +
                            '<elevation zscale="1" extrusion="0" zoffset="0" extrusionEnabled="0" type="IndividualFeatures" binding="Centroid" clamping="Terrain" respectLayerSymbol="1" showMarkerSymbolInSurfacePlots="0" symbology="Line">' +
                            '<data-defined-properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data-defined-properties>' +
                            '<profileLineSymbol>' +
                            '<symbol force_rhr="0" type="line" name="" is_animated="0" frame_rate="10" alpha="1" clip_to_extent="1">' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '<layer pass="0" enabled="1" class="SimpleLine" locked="0">' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="0" name="align_dash_pattern"/>' +
                            '<Option type="QString" value="square" name="capstyle"/>' +
                            '<Option type="QString" value="5;2" name="customdash"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="customdash_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="customdash_unit"/>' +
                            '<Option type="QString" value="0" name="dash_pattern_offset"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="dash_pattern_offset_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="dash_pattern_offset_unit"/>' +
                            '<Option type="QString" value="0" name="draw_inside_polygon"/>' +
                            '<Option type="QString" value="bevel" name="joinstyle"/>' +
                            '<Option type="QString" value="243,166,178,255" name="line_color"/>' +
                            '<Option type="QString" value="solid" name="line_style"/>' +
                            '<Option type="QString" value="0.6" name="line_width"/>' +
                            '<Option type="QString" value="MM" name="line_width_unit"/>' +
                            '<Option type="QString" value="0" name="offset"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="offset_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="offset_unit"/>' +
                            '<Option type="QString" value="0" name="ring_filter"/>' +
                            '<Option type="QString" value="0" name="trim_distance_end"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="trim_distance_end_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="trim_distance_end_unit"/>' +
                            '<Option type="QString" value="0" name="trim_distance_start"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="trim_distance_start_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="trim_distance_start_unit"/>' +
                            '<Option type="QString" value="0" name="tweak_dash_pattern_on_corners"/>' +
                            '<Option type="QString" value="0" name="use_custom_dash"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="width_map_unit_scale"/>' +
                            '</Option>' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '</layer>' +
                            '</symbol>' +
                            '</profileLineSymbol>' +
                            '<profileFillSymbol>' +
                            '<symbol force_rhr="0" type="fill" name="" is_animated="0" frame_rate="10" alpha="1" clip_to_extent="1">' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '<layer pass="0" enabled="1" class="SimpleFill" locked="0">' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="border_width_map_unit_scale"/>' +
                            '<Option type="QString" value="243,166,178,255" name="color"/>' +
                            '<Option type="QString" value="bevel" name="joinstyle"/>' +
                            '<Option type="QString" value="0,0" name="offset"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="offset_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="offset_unit"/>' +
                            '<Option type="QString" value="174,119,127,255" name="outline_color"/>' +
                            '<Option type="QString" value="solid" name="outline_style"/>' +
                            '<Option type="QString" value="0.2" name="outline_width"/>' +
                            '<Option type="QString" value="MM" name="outline_width_unit"/>' +
                            '<Option type="QString" value="solid" name="style"/>' +
                            '</Option>' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '</layer>' +
                            '</symbol>' +
                            '</profileFillSymbol>' +
                            '<profileMarkerSymbol>' +
                            '<symbol force_rhr="0" type="marker" name="" is_animated="0" frame_rate="10" alpha="1" clip_to_extent="1">' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '<layer pass="0" enabled="1" class="SimpleMarker" locked="0">' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="0" name="angle"/>' +
                            '<Option type="QString" value="square" name="cap_style"/>' +
                            '<Option type="QString" value="243,166,178,255" name="color"/>' +
                            '<Option type="QString" value="1" name="horizontal_anchor_point"/>' +
                            '<Option type="QString" value="bevel" name="joinstyle"/>' +
                            '<Option type="QString" value="diamond" name="name"/>' +
                            '<Option type="QString" value="0,0" name="offset"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="offset_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="offset_unit"/>' +
                            '<Option type="QString" value="174,119,127,255" name="outline_color"/>' +
                            '<Option type="QString" value="solid" name="outline_style"/>' +
                            '<Option type="QString" value="0.2" name="outline_width"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="outline_width_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="outline_width_unit"/>' +
                            '<Option type="QString" value="diameter" name="scale_method"/>' +
                            '<Option type="QString" value="3" name="size"/>' +
                            '<Option type="QString" value="3x:0,0,0,0,0,0" name="size_map_unit_scale"/>' +
                            '<Option type="QString" value="MM" name="size_unit"/>' +
                            '<Option type="QString" value="1" name="vertical_anchor_point"/>' +
                            '</Option>' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>' +
                            '</layer>' +
                            '</symbol>' +
                            '</profileMarkerSymbol>' +
                            '</elevation>' +
                            '<renderer-v2 referencescale="-1" type="singleSymbol" symbollevels="0" enableorderby="0" forceraster="0">' +
                            '<symbols>' +
                            '<symbol force_rhr="0" type="fill" name="0" is_animated="0" frame_rate="10" alpha="1" clip_to_extent="1">' +
                            '<data_defined_properties>' +
                            '<Option type="Map">' +
                            '<Option type="QString" value="" name="name"/>' +
                            '<Option name="properties"/>' +
                            '<Option type="QString" value="collection" name="type"/>' +
                            '</Option>' +
                            '</data_defined_properties>';

                        staticMe.getStyleFragments(layer)
                            .then(function(nodes) {
                                Ext.each(nodes, function(styleNode) {
                                    inner += styleNode.outerHTML;
                                });

                                inner += '</symbol>' +
                                    '</symbols>' +
                                    '<rotation/>' +
                                    '<sizescale/>' +
                                    '</renderer-v2>' +
                                    '<customproperties>' +
                                    '<Option/>' +
                                    '</customproperties>' +
                                    '<blendMode>0</blendMode>' +
                                    '<featureBlendMode>0</featureBlendMode>' +
                                    '<layerOpacity>1</layerOpacity>' +
                                    '<geometryOptions geometryPrecision="0" removeDuplicateNodes="0">' +
                                    '<activeChecks type="StringList">' +
                                    '<Option type="QString" value=""/>' +
                                    '</activeChecks>' +
                                    '<checkConfiguration/>' +
                                    '</geometryOptions>' +
                                    '<legend type="default-vector" showLabelLegend="0"/>' +
                                    '<referencedLayers/>' +
                                    '<fieldConfiguration>';

                                var features = layer.getSource().getFeatures().slice();
                                var feat = features[0];
                                if (feat) {
                                    Ext.iterate(feat.getProperties(), function(key) {
                                        if (key === 'geometry') {
                                            return;
                                        }
                                        inner += '<field name="fid" configurationFlags="None">' +
                                            '<editWidget type="">' +
                                            '<config>' +
                                            '<Option/>' +
                                            '</config>' +
                                            '</editWidget>' +
                                            '</field>';
                                    });
                                }
                                inner += '</fieldConfiguration>' +
                                    '<expressionfields/>' +
                                    '<attributeactions>' +
                                    '<defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>' +
                                    '</attributeactions>' +
                                    '<attributetableconfig sortExpression="" sortOrder="0" actionWidgetStyle="dropDown">' +
                                    '<columns/>' +
                                    '</attributetableconfig>' +
                                    '<conditionalstyles>' +
                                    '<rowstyles/>' +
                                    '<fieldstyles/>' +
                                    '</conditionalstyles>' +
                                    '<storedexpressions/>' +
                                    '<editform tolerant="1"></editform>' +
                                    '<editforminit/>' +
                                    '<editforminitcodesource>0</editforminitcodesource>' +
                                    '<editforminitfilepath></editforminitfilepath>' +
                                    '<editforminitcode><![CDATA[]]></editforminitcode>' +
                                    '<featformsuppress>0</featformsuppress>' +
                                    '<editorlayout>generatedlayout</editorlayout>' +
                                    '<editable/>' +
                                    '<labelOnTop/>' +
                                    '<reuseLastValue/>' +
                                    '<dataDefinedFieldProperties/>' +
                                    '<widgets/>' +
                                    '<previewExpression></previewExpression>' +
                                    '<mapTip></mapTip>';
                                layerNode.innerHTML = inner;

                                var treeNode = doc.querySelector('layer-tree-group');
                                var html = '<layer-tree-layer expanded="1" providerKey="ogr" legend_split_behavior="0" patch_size="-1,-1" ' +
                                    'name="' + name + '" checked="Qt::Checked" id="' + layerIds[name] +
                                    '" source="./project.gpkg|layername=' + name + '" legend_exp="">' +
                                    '<customproperties>' +
                                    '<Option/>' +
                                    '</customproperties>' +
                                    '</layer-tree-layer>';
                                treeNode.innerHTML += html;
                            });

                    });
                    staticMe.createAndDownloadResult(gpkg, doc, layers);
                }
            });
        },

        createAndDownloadResult: function(gpkg, doc, layers) {
            var staticMe = Koala.util.Qgis;
            Ext.Ajax.request({
                url: 'resources/hbDrmM_styles.db',
                success: function(xhr) {
                    var zip = new JSZip();
                    zip.file('hbDrmM_styles.db', xhr.responseText);
                    var bytes = new TextEncoder().encode(doc.documentElement.outerHTML);
                    var blob = new Blob([bytes]);
                    zip.file('{' + crypto.randomUUID() + '}.qgs', blob);

                    zip.generateAsync({
                        type: 'uint8array'
                    })
                        .then(function(zipBlob) {
                            var conn = gpkg.database;
                            conn.run('CREATE TABLE qgis_projects(name TEXT PRIMARY KEY, metadata BLOB, content BLOB)');
                            conn.run('create table imis_layers(name text primary key, metadata text, sld text)');
                            conn.run('insert into qgis_projects (name, content) values (?, ?)', ['project', staticMe.toHex(zipBlob)]);
                            Ext.each(layers, function(layer) {
                                conn.run('insert into imis_layers values (?, ?, ?)', [layer.get('name'), JSON.stringify(layer.metadata), layer.get('SLD')]);
                            });
                            gpkg.export()
                                .then(function(result) {
                                    download(new Blob([result]), 'project.gpkg', 'application/octet-stream');
                                    gpkg.close();
                                });
                        });
                }
            });
        },

        toHex: function(uint8) {
            var result = '';
            for (var i = 0; i < uint8.length; ++i) {
                var hex = uint8[i].toString(16);
                result += (hex.length === 2 ? hex : '0' + hex);
            }
            return result.toLowerCase();
        },

        getStyleFragments: function(layer) {
            var qgisParser = new GeoStylerQGISParser.QGISStyleParser();
            var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
            var original = layer.getStyle();
            if (typeof original === 'function') {
                original = original();
            }
            return new Ext.Promise(function(resolve, reject) {
                olParser.readStyle(original)
                    .then(function(style) {
                        if (style.errors && style.errors.length) {
                            reject();
                            return;
                        }
                        qgisParser.writeStyle(style.output)
                            .then(function(result) {
                                if (result.errors && result.errors.length) {
                                    reject();
                                } else {
                                    var parser = new DOMParser();
                                    var doc = parser.parseFromString(result.output, 'application/xml');
                                    resolve(doc.querySelectorAll('layer'));
                                }
                            })
                            .catch(function() {
                                reject();
                            });
                    })
                    .catch(function() {
                        reject();
                    });
            });
        },

        importQgisProject: function(file) {
            var reader = new FileReader();
            var fmt = new ol.format.GeoJSON({
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            reader.addEventListener('load', function(event) {
                GeoPackage.GeoPackageAPI.open(new Uint8Array(event.target.result))
                    .then(function(gpkg) {
                        var conn = gpkg.database;
                        var layers = conn.all('select * from imis_layers');
                        Ext.each(layers, function(obj) {
                            var layerUtil = Koala.util.Layer;
                            var layerName = obj.name;

                            var cfg = Koala.util.Metadata.getVectorLayerConfig(JSON.parse(obj.metadata));

                            cfg.name = layerName;
                            cfg.metadata = JSON.parse(obj.metadata);
                            cfg.userCreated = true;
                            cfg.routeId = 'localData_' + layerName;

                            var sldParser = new GeoStylerSLDParser.SldStyleParser();
                            sldParser.readStyle(obj.sld)
                                .then(function(output) {
                                    var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
                                    olParser.writeStyle(output.output)
                                        .then(function(olStyle) {
                                            cfg.style = olStyle.output;
                                            cfg.source = new ol.source.Vector({
                                                features: new ol.Collection()
                                            });

                                            var layer = new ol.layer.Vector(cfg);
                                            layer.metadata = JSON.parse(obj.metadata);
                                            layerUtil.setOriginalMetadata(layer, JSON.parse(obj.metadata));
                                            layerUtil.addOlLayerToMap(layer);

                                            layer.set('name', obj.name);
                                            layer.set('SLD', obj.sld);
                                            layer.metadata = JSON.parse(obj.metadata);
                                            var features = gpkg.iterateGeoJSONFeatures(obj.name);
                                            var next = features.next();
                                            while (!next.done) {
                                                layer.getSource().addFeature(fmt.readFeature(next.value));
                                                next = features.next();
                                            }
                                            layerUtil.updateVectorStyle(layer, layer.get('SLD'));
                                        });
                                });
                        });
                    });

            });
            reader.readAsArrayBuffer(file);
        }

    }

});
