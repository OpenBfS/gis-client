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
 * @class Koala.util.Metadata
 */
Ext.define('Koala.util.Metadata', {

    statics: {

        /**
         * Prepares/clones a metadata object for cloned layers. This will delete
         * some properties out of the metadata object so it can be stored in
         * GNOS for a newly created layer.
         * @param  {Object} metadata the metadata to clones
         * @return {Object}          the cloned metadata
         */
        prepareClonedMetadata: function(metadata) {
            if (!metadata) {
                return metadata;
            }
            metadata = Ext.clone(metadata);

            delete metadata.id;
            delete metadata.layerConfig.wms;
            delete metadata.barChartProperties;
            delete metadata.timeSeriesChartProperties;

            return metadata;
        }

    }

});
