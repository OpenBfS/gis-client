/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.util.MetadataParser
 */
Ext.define('Koala.util.MetadataParser', {

    requires: [
        'Koala.util.Object'
    ],

    statics: {

        /**
         * Utility to extract from a gco:CharacterString.
         * @param  {Object} json to extract from
         * @param  {String} path a path to prepend
         * @return {String} the extracted string
         */
        getStr: function(json, path) {
            var getVal = Koala.util.Object.getPathStrOr;
            return getVal(json, path + 'gco:CharacterString/#text');
        },

        /**
         * Extracts an URL and path, trims them and concatenates them.
         * @param  {Object} json the object with an bfs:URL property
         * @return {String} the complete url
         */
        getTrimmedUrl: function(json) {
            return Ext.String.trim(this.getStr(json, 'bfs:URL/bfs:host/')) +
                Ext.String.trim(this.getStr(json, 'bfs:URL/bfs:path/'));
        },

        /**
         * Parses a WMS layer section.
         * @param  {Object} json the object to parsed
         * @return {Object} the parsed object
         */
        parseWmsLayer: function(json) {
            var getVal = Koala.util.Object.getPathStrOr;
            return {
                url: this.getTrimmedUrl(json),
                layers: this.getStr(json, 'bfs:layer/'),
                transparent: getVal(json, 'bfs:transparent/gco:Boolean/#text'),
                version: this.getStr(json, 'bfs:version/'),
                styles: this.getStr(json, 'bfs:styles/'),
                format: this.getStr(json, 'bfs:format/')
            };
        },

        /**
         * Parses a vector layer section.
         * @param  {Object} json to parse
         * @return {Object} resulting config object
         */
        parseVectorLayer: function(json) {
            return {
                url: this.getTrimmedUrl(json),
                params: this.getStr(json, 'bfs:params/'),
                format: this.getStr(json, 'bfs:format/')
            };
        },

        /**
         * Parses a WMTS layer section.
         * @param  {Object} json to parse
         * @return {Object} the resulting config object
         */
        parseWmtsLayer: function(json) {
            var getVal = Koala.util.Object.getPathStrOr;
            return {
                url: this.getTrimmedUrl(json),
                layers: this.getStr(json, 'bfs:layer/'),
                tilematrixset: this.getStr(json, 'bfs:tilematrixset/'),
                transparent: getVal(json, 'bfs:transparent/gco:Boolean/#text'),
                version: this.getStr(json, 'bfs:version/'),
                styles: this.getStr(json, 'bfs:styles/'),
                format: this.getStr(json, 'bfs:format/')
            };
        },

        /**
         * Parse a WFS section.
         * @param  {Object} json to parse
         * @return {Object} resulting config object.
         */
        parseWfs: function(json) {
            return {
                url: this.getTrimmedUrl(json)
            };
        },

        /**
         * Parse the download section.
         * @param  {Object} json to parse
         * @return {Object} download config
         */
        parseDownload: function(json) {
            return {
                url: this.getTrimmedUrl(json),
                filterFieldStart: this.getStr(json, 'bfs:filterFieldStart/'),
                filterFieldEnd: this.getStr(json, 'bfs:filterFieldEnd/')
            };
        },

        /**
         * Parse a property object.
         * @param  {Object} json   metadata property
         * @param  {Object} target target config object
         */
        parseProperty: function(json, target) {
            var name = this.getStr(json, 'bfs:MD_Property/bfs:propertyName/');
            var val = this.getStr(json, 'bfs:MD_Property/bfs:propertyValue/');
            target[name] = val;
        },

        /**
         * Parse a properties section.
         * @param  {Object} json properties section
         * @return {object} property config object
         */
        parseProperties: function(json) {
            var me = this;
            var props = {};
            Ext.each(json, function(prop) {
                me.parseProperty(prop, props);
            });
            return props;
        },

        /**
         * Parse the layer config section.
         * @param  {Object} json to parse
         * @return {Object} the layer config section
         */
        parseLayerConfig: function(json) {
            var config = {};
            if (json['bfs:layerType']['bfs:MD_WMSLayerType']) {
                config.wms = this.parseWmsLayer(json['bfs:layerType']['bfs:MD_WMSLayerType']);
            }
            if (json['bfs:layerType']['bfs:MD_VectorLayerType']) {
                config.vector = this.parseVectorLayer(json['bfs:layerType']['bfs:MD_VectorLayerType']);
            }
            if (json['bfs:layerType']['bfs:MD_WMTSLayerType']) {
                config.wmts = this.parseWmtsLayer(json['bfs:layerType']['bfs:MD_WMTSLayerType']);
            }
            if (json['bfs:wfs']) {
                config.wfs = this.parseWfs(json['bfs:wfs']);
            }
            if (json['bfs:download']) {
                config.download = this.parseDownload(json['bfs:download']);
            }
            config.olProperties = this.parseProperties(json['bfs:olProperty']);
            config.barChartProperties = this.parseProperties(json['bfs:barChartProperty']);
            config.timeSeriesChartProperties = this.parseProperties(json['bfs:timeSeriesChartProperty']);
            return config;
        },

        /**
         * Parses the common options for a time filter config.
         * @param  {Object} json   to parse
         * @param  {Object} config to put parsed options into.
         */
        parseCommonTimeFilter: function(json, config) {
            var getVal = Koala.util.Object.getPathStrOr;
            config.param = this.getStr(json, 'bfs:paramName/');
            config.interval = getVal(json, 'bfs:interval/gco:Integer/#text');
            config.unit = this.getStr(json, 'bfs:unit/');
            config.mindatetimeformat = this.getStr(json, 'bfs:minDate/bfs:TimeFormat/');
            config.mindatetimeinstant = this.getStr(json, 'bfs:minDate/bfs:TimeInstant/');
            config.maxdatetimeformat = this.getStr(json, 'bfs:maxDate/bfs:TimeFormat/');
            config.maxdatetimeinstant = this.getStr(json, 'bfs:maxDate/bfs:TimeInstant/');
        },

        /**
         * Parse point in time filter.
         * @param  {Object} json to parse
         * @return {Object} filter config
         */
        parsePointInTimeFilter: function(json) {
            var config = {
                type: 'pointintime',
                defaulttimeformat: this.getStr(json, 'bfs:defaultValue/bfs:TimeFormat/'),
                defaulttimeinstant: this.getStr(json, 'bfs:defaultValue/bfs:TimeInstant/')
            };
            this.parseCommonTimeFilter(json, config);
            return config;
        },

        /**
         * Parse rodos filter.
         * @param  {Object} json to parse
         * @return {Object} filter config
         */
        parseRodosFilter: function(json) {
            var getVal = Koala.util.Object.getPathStrOr;
            return {
                type: 'rodos',
                param: getVal(json, 'bfs:paramName/gco:CharacterString/#text'),
                url: this.getTrimmedUrl(json)
            };
        },

        /**
         * Parse time range filter.
         * @param  {Object} json to parse
         * @return {Object} filter config
         */
        parseTimeRangeFilter: function(json) {
            var config = {
                type: 'timerange',
                maxduration: this.getStr(json, 'bfs:maxDuration/'),
                defaultstarttimeformat: this.getStr(json, 'bfs:defaultStartValue/bfs:TimeFormat/'),
                defaultstarttimeinstant: this.getStr(json, 'bfs:defaultStartValue/bfs:TimeInstant/'),
                defaultendtimeformat: this.getStr(json, 'bfs:defaultEndValue/bfs:TimeFormat/'),
                defaultendtimeinstant: this.getStr(json, 'bfs:defaultEndValue/bfs:TimeInstant/')
            };
            this.parseCommonTimeFilter(json, config);
            return config;
        },

        /**
         * Parse a value filter.
         * @param  {Object} json to parse
         * @return {Object} filter config
         */
        parseValueFilter: function(json) {
            var getVal = Koala.util.Object.getPathStrOr;
            return {
                type: 'value',
                param: this.getStr(json, 'bfs:paramName/'),
                alias: this.getStr(json, 'bfs:paramAlias/'),
                defaultValue: Ext.encode(this.getStr(json, 'bfs:defaultValue/')),
                allowedValues: Ext.encode(this.getStr(json, 'bfs:allowedValues/')),
                operator: this.getStr(json, 'bfs:operator/'),
                allowMultipleSelect: getVal(json, 'bfs:allowMultipleSelect/gco:Boolean/#text'),
                encodeInViewParams: getVal(json, 'bfs:encodeInViewParams/gco:Boolean/#text')
            };
        },

        /**
         * Switches between different filter parsers.
         * @param  {Object} json to parse
         * @return {Object} filter config
         */
        parseFilter: function(json) {
            if (json['bfs:MD_PointInTimeFilter']) {
                return this.parsePointInTimeFilter(json['bfs:MD_PointInTimeFilter']);
            }
            if (json['bfs:MD_RodosFilter']) {
                return this.parseRodosFilter(json['bfs:MD_RodosFilter']);
            }
            if (json['bfs:MD_TimeRangeFilter']) {
                return this.parseTimeRangeFilter(json['bfs:MD_TimeRangeFilter']);
            }
            if (json['bfs:MD_ValueFilter']) {
                return this.parseValueFilter(json['bfs:MD_ValueFilter']);
            }
        },

        /**
         * Parse filter list.
         * @param  {Array} json the filters to parse
         * @return {Array} the list of filter configs
         */
        parseFilters: function(json) {
            var me = this;
            var filters = [];
            Ext.each(json, function(obj) {
                filters.push(me.parseFilter(obj));
            });
            return filters;
        },

        /**
         * Parse the raw metadata json and convert it to a configuration object.
         * @param  {object} json to parse
         * @return {Object} the configuration object
         */
        parseMetadata: function(json) {
            var getVal = Koala.util.Object.getPathStrOr;
            var metadata = {};

            metadata.id = this.getStr(json, 'gmd:fileIdentifier/');
            metadata.treeTitle = this.getStr(json, 'gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/');
            metadata.legendTitle = this.getStr(json, 'bfs:layerInformation/bfs:MD_Layer/bfs:legendTitle/');
            metadata.printTitle = this.getStr(json, 'bfs:layerInformation/bfs:MD_Layer/bfs:printTitle/');
            metadata.filters = this.parseFilters(getVal(json, 'bfs:layerInformation/bfs:MD_Layer/bfs:filter'));
            metadata.layerConfig = this.parseLayerConfig(getVal(json, 'bfs:layerInformation/bfs:MD_Layer'));

            return metadata;
        }

    }

});
