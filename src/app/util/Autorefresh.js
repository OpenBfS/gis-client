/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class to handle autorefresh of layer filters.
 *
 * @class Koala.util.Autorefresh
 */
Ext.define('Koala.util.Autorefresh', {

    requires: [
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Layer',
        'Ext.util.DelayedTask'
    ],

    /**
     * Maps layer uuids to the autorefresh time in minutes.
     * @type {Object}
     */
    autorefreshMap: {},

    statics: {

        initialize: function() {
            if (!this.prototype.layerUpdater) {
                // functions seem sometimes to be called on the prototype itself
                this.prototype.layerUpdater = new Ext.util.DelayedTask(this.refreshLayers.bind(this));
                this.prototype.layerUpdater.delay(60000);
            }
        },

        /**
         * Refreshes the layers where the user activated auto refresh.
         */
        refreshLayers: function() {
            Koala.util.Autorefresh.initialize();
            this.prototype.layerUpdater.delay(60000);

            var mapComponent = BasiGX.util.Map.getMapComponent('gx_map');
            var map = mapComponent.getMap();
            var allLayers = BasiGX.util.Layer.getAllLayers(map);
            var layersById = {};
            Ext.Array.each(allLayers, function(lay) {
                if (lay.metadata) {
                    layersById[lay.metadata.id] = lay;
                }
            });

            var me = this;
            Ext.Object.each(this.prototype.autorefreshMap, function(id, time) {
                var date = Koala.util.Date.getTimeReferenceAwareMomentDate(new moment());
                if ((date.minutes() % time) === 0) {
                    Koala.util.Layer.getMetadataFromUuid(id).then(function(metadata) {
                        var existingLayer = layersById[id];
                        if (!existingLayer) {
                            // layer was removed from map
                            delete me.prototype.autorefreshMap[id];
                            return;
                        }

                        var currentFilters = existingLayer.metadata.filters;

                        me.overwriteValueFilters(currentFilters, metadata.filters);

                        me.updateFiltersForAutorefresh(metadata.filters,currentFilters);
                        var LayerUtil = Koala.util.Layer;

                        var layer = LayerUtil.layerFromMetadata(metadata);
                        var source = layer.getSource();
                        source.updateParams({
                            _dc2: new Date().getTime()
                        });
                        existingLayer.setSource(source);

                        me.updateMetadataLegendTree(existingLayer, metadata);
                        me.deselectThemeTreeItems();
                        LayerUtil.repaintLayerFilterIndication();
                        var button = Ext.ComponentQuery.query('[name=' + existingLayer.get('name') + '_button]')[0];
                        if (button) {
                            button.getController().updateFeatures();
                        }
                    });
                }
            });
        },

        /**
         * Overwrites all value filters in the second filter array with the ones
         * from the first filter array. Filter arrays must be compatible!
         * @param  {Array} oldFilters filter array from which to copy
         * @param  {Array} newFilters filter array to which to copy
         */
        overwriteValueFilters: function(oldFilters, newFilters) {
            Ext.Array.each(oldFilters, function(filter, idx) {
                if (filter.type === 'value') {
                    newFilters[idx] = filter;
                }
            });
        },

        /**
         * Updates the auto refresh flag from the view.
         * @param  {Koala.view.form.LayerFilter} view     must be set
         * @param  {Object} metadata layer metadata, must be set
         */
        updateAutorefresh: function(view, metadata) {
            var box = view.down('[name=autorefreshcheckbox]');
            if (!box) {
                return;
            }
            var autorefresh = box.checked || (box.isChecked && box.isChecked());
            if (!autorefresh) {
                delete this.prototype.autorefreshMap[metadata.id];
            } else {
                this.prototype.autorefreshMap[metadata.id] =
                    view.query('[name=autorefresh]')[0].value ||
                    view.query('[name=autorefresh]')[0].getValue();
            }
        },

        /**
         * Updates layer time filters based on current date and the configured
         * min/max times, also considers maximum duration for time ranges.
         * @param  {Array} filters the filter metadata
         * @return {Array}         the updated filters
         */
        updateFiltersForAutorefresh: function(filters, currentFilters) {
            var KD = Koala.util.Date;
            Ext.each(filters, function(filter) {
                var now = KD.getTimeReferenceAwareMomentDate(new moment()).toISOString();
                if (filter.type === 'pointintime') {
                    if (now > filter.maxdatetimeinstant) {
                        now = KD.getTimeReferenceAwareMomentDate(KD.getUtcMoment(filter.maxdatetimeinstant));
                    }
                    filter.effectivedatetime = moment(now);
                }

                if (filter.type === 'timerange') {
                    var datediffMilliseconds = moment.duration(filter.maxduration).asMilliseconds();
                    Ext.each(currentFilters, function(currentFilter) {
                        if (currentFilter.type === 'timerange') {
                            var currentEffectivemaxdatetime = currentFilter.effectivemaxdatetime;
                            var currentEffectivemindatetime = currentFilter.effectivemindatetime;
                            if (currentEffectivemaxdatetime && currentEffectivemindatetime) {
                                datediffMilliseconds = currentEffectivemaxdatetime.diff(currentEffectivemindatetime);
                            }
                        }
                    });
                    if (now > filter.maxdatetimeinstant) {
                        now = KD.getTimeReferenceAwareMomentDate(KD.getUtcMoment(filter.maxdatetimeinstant));
                    }
                    filter.effectivemaxdatetime = moment(now);
                    filter.effectivemindatetime = KD.getUtcMoment(filter.effectivemaxdatetime).subtract(datediffMilliseconds, 'milliseconds');
                }
            });
            return filters;
        },

        /**
         * Called during the update of a filter of an existing layer, this
         * method will update the metadata of the layer everywhere it might
         * be used.
         *
         * @param {ol.layer.Layer} layer The layer whose metadata (filter)
         *     has changed.
         * @param {Object} metadata The new metadata of the layer.
         */
        updateMetadataLegendTree: function(layer, metadata) {
            layer.metadata = metadata;
            // find all legendpanels:
            var legends = Ext.ComponentQuery.query('k-panel-routing-legendtree');
            Ext.each(legends, function(legend) {
                // find the correct record for the given layer
                legend.getStore().each(function(rec) {
                    var layerInTree = rec.getOlLayer && rec.getOlLayer();
                    if (layerInTree && layerInTree === layer) {
                        rec.set('metadata', metadata);
                        layerInTree.metadata = metadata;
                        // update the legend image
                        var view = legend.getView();
                        var node = view.getNode(rec);
                        if (node && node.querySelector &&
                            node.querySelector('img')) {
                            var selector = node.querySelector('img').id;
                            var img = Ext.ComponentQuery.query(
                                '[id=' + selector + ']')[0];
                            if (img && img.el && img.el.dom) {
                                img.setLoading(true);
                                img.el.dom.onload = function(evt) {
                                    var extImg = Ext.ComponentQuery.query(
                                        '[id=' + evt.target.id + ']')[0];
                                    if (extImg) {
                                        extImg.setLoading(false);
                                    }
                                };
                                img.el.dom.src = Koala.util.Layer.getCurrentLegendUrl(layer);
                            }
                        }
                    }
                });
            });
        },

        /**
         * Unselects all items after a layer was added to the map.
         */
        deselectThemeTreeItems: function() {
            var tree = Ext.ComponentQuery.query('k-panel-themetree')[0];
            var treeSelModel = tree && tree.getSelectionModel();
            var selection = treeSelModel && treeSelModel.getSelection();
            if (!Ext.isEmpty(selection)) {
                treeSelModel.deselectAll();
            }
        },

        /**
         *
         */
        updateFilterValues: function(filters, idx, keyVals) {
            var FilterUtil = Koala.util.Filter;
            var filter = filters[idx];
            var filterType = (filter.type || '').toLowerCase();
            var param = filter.param;
            switch (filterType) {
                case 'timerange':
                    var keys = FilterUtil.startAndEndFieldnamesFromMetadataParam(param);
                    filter.effectivemindatetime = keyVals[keys.startName];
                    filter.effectivemaxdatetime = keyVals[keys.endName];
                    break;
                case 'pointintime':
                case 'rodostime':
                    filter.effectivedatetime = keyVals[param];
                    break;
                case 'value':
                    filter.effectivevalue = keyVals[param];
                    break;
                default:
                    Ext.log.warn('Unexpected filter type ' + filterType + ' specified');
            }

            filters[idx] = filter;
            return filters;
        }

    }

});
