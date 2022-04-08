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
 * @class Koala.view.wps.WpsLayerCombo
 */
Ext.define('Koala.view.wps.WpsLayerCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'wps-layercombo',

    requires: [
        'Ext.Promise',
        'Koala.view.wps.WpsLayerComboModel',
        'Koala.view.wps.WpsLayerComboController',
        'Koala.util.Layer'
    ],

    controller: 'wps-layercombo',
    viewModel: {
        type: 'wps-layercombo'
    },

    labelSeparator: '',

    editable: false,
    allowBlank: true,

    displayField: 'treeTitle',
    valueField: 'id',

    identifier: undefined,
    formats: [],
    schema: undefined,

    generateInput: function() {
        var me = this;
        var identifier = this.identifier;

        var format = this.getPreferredFormat();
        var encoding = format.encoding;

        var schema = this.schema;

        var allowBlank = this.allowBlank;
        var metadata = this.getSelectedRecord().data;
        var layer = Koala.util.Layer.findLayerFromMetadata(metadata);

        return new Ext.Promise(function(resolve, reject) {
            if (layer.getSource() instanceof ol.source.Vector) {
                var fmt = new ol.format.GeoJSON();
                var payload = fmt.writeFeatures(layer.getSource().getFeatures());
                var e = document.createElement('div');
                e.textContent = payload;
                payload = e.innerHTML;

                var generator = new InputGenerator();
                var input = generator.createComplexDataInput_wps_1_0_and_2_0(
                    identifier,
                    'application/json',
                    schema,
                    encoding,
                    false,
                    payload
                );
                return resolve(input);
            }

            // currently only remote layers are supported
            var conf = metadata.layerConfig;
            if (!conf.wfs || !conf.wms) {
                if (!allowBlank) {
                    return reject({
                        identifier: me.identifier,
                        label: me.fieldLabel
                    });
                }
                return resolve();
            }

            var params = layer.getSource().getParams();
            var url = new URL(conf.wfs.url);
            url.searchParams.append('service', 'WFS');
            url.searchParams.append('version', '1.0.0');
            url.searchParams.append('request', 'GetFeature');
            url.searchParams.append('srsName', 'EPSG:4326');
            url.searchParams.append('typeName', conf.wms.layers);
            url.searchParams.append('outputFormat', 'application/json');

            if (params.viewparams) {
                url.searchParams.append('viewparams', params.viewparams);
            }
            var cqlFilter;
            if (params.cql_filter) {
                cqlFilter = params.cql_filter;
            }
            if (params.TIME) {
                var timeParam;

                Ext.each(metadata.filters, function(filter) {
                    switch (filter.type) {
                        case 'pointintime':
                        case 'rodostime':
                        case 'timerange':
                            timeParam = filter.params;
                            break;
                        default:
                            break;
                    }
                });

                if (timeParam) {
                    timeParam = timeParam + ' = \'' + params.TIME + '\'';
                    if (cqlFilter) {
                        cqlFilter = cqlFilter + ' AND ' + timeParam;
                    } else {
                        cqlFilter = timeParam;
                    }
                }
            }
            if (cqlFilter) {
                url.searchParams.append('cql_filter', params.cql_filter);
            }

            Ext.Ajax.request({
                url: url.href,
                success: function(xhr) {
                    payload = xhr.responseText;
                    e = document.createElement('div');
                    e.textContent = payload;
                    payload = e.innerHTML;

                    if (payload === undefined) {
                        if (!allowBlank) {
                            return reject({
                                identifier: me.identifier,
                                label: me.fieldLabel
                            });
                        }
                        return resolve();
                    }
                    generator = new InputGenerator();
                    input = generator.createComplexDataInput_wps_1_0_and_2_0(
                        identifier,
                        'application/json',
                        schema,
                        encoding,
                        false,
                        payload
                    );
                    resolve(input);
                },
                failure: function() {
                    if (!allowBlank) {
                        return reject({
                            identifier: me.identifier,
                            label: me.fieldLabel
                        });
                    }
                    return resolve();
                }
            });
        });
    },

    /**
     * Get the preferred format from the list of formats.
     *
     * Order of priority:
     * - wfs-collection/1.0
     * - wfs-collection/1.1
     * - geojson
     * - first format in this.formats
     * - undefined
     *
     * @returns {Object} The preferred format.
     */
    getPreferredFormat: function() {
        var format = Ext.Array.filter(this.formats, function(f) {
            return f.mimeType === 'text/xml; subtype=wfs-collection/1.0';
        })[0];
        if (!format) {
            format = Ext.Array.filter(this.formats, function(f) {
                return f.mimeType === 'text/xml; subtype=wfs-collection/1.1';
            })[0];
        }
        if (!format) {
            format = Ext.Array.filter(this.formats, function(f) {
                return f.mimeType === 'text/xml; subtype=gml/3.1.1';
            })[0];
        }
        if (!format) {
            format = Ext.Array.filter(this.formats, function(f) {
                return f.mimeType === 'application/vnd.geo+json';
            })[0];
        }
        if (!format) {
            format = this.formats[0];
        }
        if (!format) {
            format = {
                encoding: undefined,
                mimetype: undefined
            };
        }
        return format;
    }
});
