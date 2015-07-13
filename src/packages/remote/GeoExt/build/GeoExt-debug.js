/**
 * The feature renderer
 *
 * @class GeoExt.component.FeatureRenderer
 */
Ext.define('GeoExt.component.FeatureRenderer', {
    extend: 'Ext.Component',
    alias: 'widget.gx_renderer',
    /**
     * Fires when the feature is clicked on.
     *
     * Listener arguments:
     *
     *  * renderer - GeoExt.component.FeatureRenderer This feature renderer.
     *
     * @event click
     */
    config: {
        /**
         * Optional class to set on the feature renderer div.
         *
         * @cfg {String}
         */
        imgCls: "",
        /**
         * The minimum width.
         *
         * @cfg {Number}
         */
        minWidth: 20,
        /**
         * The minimum height.
         *
         * @cfg {Number}
         */
        minHeight: 20,
        /**
         * The resolution for the renderer.
         *
         * @cfg {Number}
         */
        resolution: 1,
        /**
         * Optional vector to be drawn.
         *
         * @cfg {ol.Feature}
         */
        feature: undefined,
        /**
         * Feature to use for point swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        pointFeature: undefined,
        /**
         * Feature to use for line swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        lineFeature: undefined,
        /**
         * Feature to use for polygon swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        polygonFeature: undefined,
        /**
         * Feature to use for text label swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        textFeature: undefined,
        /**
         * An `ol.style.Style` instance or an array of `ol.style.Style`
         * instances for rendering a  feature.  If no symbolizers are
         * provided, the default style from OpenLayers will be used.
         *
         * @cfg {ol.style.Style[]|ol.style.Style}
         */
        symbolizers: undefined,
        /**
         * One of `"Point"`, `"Line"`, `"Polygon"` or `"Text"`.  Only relevant if
         * `feature` is not provided.
         *
         * @cfg {String}
         */
        symbolType: "Polygon"
    },
    /**
     *
     */
    initComponent: function() {
        var me = this;
        var id = this.getId();
        this.autoEl = {
            tag: "div",
            "class": this.getImgCls(),
            id: id
        };
        if (!this.getLineFeature()) {
            this.setLineFeature(new ol.Feature({
                geometry: new ol.geom.LineString([
                    [
                        -8,
                        -3
                    ],
                    [
                        -3,
                        3
                    ],
                    [
                        3,
                        -3
                    ],
                    [
                        8,
                        3
                    ]
                ])
            }));
        }
        if (!this.getPointFeature()) {
            this.setPointFeature(new ol.Feature({
                geometry: new ol.geom.Point([
                    0,
                    0
                ])
            }));
        }
        if (!this.getPolygonFeature()) {
            this.setPolygonFeature(new ol.Feature({
                geometry: new ol.geom.Polygon([
                    [
                        [
                            -8,
                            -4
                        ],
                        [
                            -6,
                            -6
                        ],
                        [
                            6,
                            -6
                        ],
                        [
                            8,
                            -4
                        ],
                        [
                            8,
                            4
                        ],
                        [
                            6,
                            6
                        ],
                        [
                            -6,
                            6
                        ],
                        [
                            -8,
                            4
                        ]
                    ]
                ])
            }));
        }
        if (!this.getTextFeature()) {
            this.setTextFeature(new ol.Feature({
                geometry: new ol.geom.Point([
                    0,
                    0
                ])
            }));
        }
        this.map = new ol.Map({
            controls: [],
            interactions: [],
            layers: [
                new ol.layer.Vector({
                    source: new ol.source.Vector()
                })
            ]
        });
        var feature = this.getFeature();
        if (!feature) {
            this.setFeature(this['get' + this.getSymbolType() + 'Feature']());
        } else {
            this.applyFeature(feature);
        }
        me.callParent(arguments);
    },
    /**
     * Draw the feature when we are rendered.
     *
     * @private
     */
    onRender: function() {
        this.callParent(arguments);
        this.drawFeature();
    },
    /**
     * After rendering we setup our own custom events using #initCustomEvents.
     *
     * @private
     */
    afterRender: function() {
        this.callParent(arguments);
        this.initCustomEvents();
    },
    /**
     * (Re-)Initializes our custom event listeners, mainly #onClick.
     *
     * @private
     */
    initCustomEvents: function() {
        this.clearCustomEvents();
        this.el.on("click", this.onClick, this);
    },
    /**
     * Unbinds previously bound listeners on #el.
     *
     * @private
     */
    clearCustomEvents: function() {
        if (this.el && this.el.clearListeners) {
            this.el.clearListeners();
        }
    },
    /**
     * Bound to the click event on the #el, this fires the click event.
     *
     * @private
     */
    onClick: function() {
        this.fireEvent("click", this);
    },
    /**
     * Private method called during the destroy sequence.
     *
     * @private
     */
    beforeDestroy: function() {
        this.clearCustomEvents();
        if (this.map) {
            this.map.setTarget(null);
        }
    },
    /**
     * When resizing has happened, we might need to re-set the renderer's
     * dimensions via #setRendererDimensions.
     *
     * @private
     */
    onResize: function() {
        this.setRendererDimensions();
        this.callParent(arguments);
    },
    /**
     * Draw the feature in the map.
     *
     * @private
     */
    drawFeature: function() {
        this.map.setTarget(this.el.id);
        this.setRendererDimensions();
    },
    /**
     * Set the dimension of our renderer, i.e. map and view.
     *
     * @private
     */
    setRendererDimensions: function() {
        var gb = this.feature.getGeometry().getExtent();
        var gw = ol.extent.getWidth(gb);
        var gh = ol.extent.getHeight(gb);
        /*
         * Determine resolution based on the following rules:
         * 1) always use value specified in config
         * 2) if not specified, use max res based on width or height of element
         * 3) if no width or height, assume a resolution of 1
         */
        var resolution = this.initialConfig.resolution;
        if (!resolution) {
            resolution = Math.max(gw / this.width || 0, gh / this.height || 0) || 1;
        }
        this.map.setView(new ol.View({
            minResolution: resolution,
            maxResolution: resolution,
            projection: new ol.proj.Projection({
                units: 'pixels'
            })
        }));
        // determine height and width of element
        var width = Math.max(this.width || this.getMinWidth(), gw / resolution);
        var height = Math.max(this.height || this.getMinHeight(), gh / resolution);
        // determine bounds of renderer
        var center = ol.extent.getCenter(gb);
        var bhalfw = width * resolution / 2;
        var bhalfh = height * resolution / 2;
        var bounds = [
                center[0] - bhalfw,
                center[1] - bhalfh,
                center[0] + bhalfw,
                center[1] + bhalfh
            ];
        this.el.setSize(Math.round(width), Math.round(height));
        this.map.updateSize();
        this.map.getView().fitExtent(bounds, this.map.getSize());
    },
    /**
     * We're setting the symbolizers on the feature.
     *
     * @param {ol.style.Style[]|ol.style.Style} symbolizers
     * @private
     */
    applySymbolizers: function(symbolizers) {
        var feature = this.getFeature();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        return symbolizers;
    },
    /**
     * We're setting the feature and add it to the source.
     *
     * @param {ol.Feature} feature
     * @private
     */
    applyFeature: function(feature) {
        var symbolizers = this.getSymbolizers();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        if (this.map) {
            var source = this.map.getLayers().item(0).getSource();
            source.clear();
            source.addFeature(feature);
        }
        return feature;
    },
    /**
     * Update the `feature` or `symbolizers` and redraw the feature.
     *
     * Valid options:
     *
     * @param options {Object} Object with properties to be updated.
     * @param options.feature {ol.Feature} The new or updated
     *     feature.
     * @param options.symbolizers {ol.style.Style[]|ol.style.Style}
     *     Symbolizers.
     */
    update: function(options) {
        if (options.feature) {
            this.setFeature(options.feature);
        }
        if (options.symbolizers) {
            this.setSymbolizers(options.symbolizers);
        }
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
Ext.define('GeoExt.data.model.Base', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.identifier.Uuid'
    ],
    schema: {
        namespace: 'GeoExt.data.model'
    },
    identifier: 'uuid'
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.Layer', {
    extend: 'GeoExt.data.model.Base',
    statics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().getReader().readRecords([
                layer
            ]).records[0];
        }
    },
    fields: [
        {
            name: 'isLayerGroup',
            type: 'boolean',
            convert: function(v, record) {
                var layer = record.getOlLayer();
                if (layer) {
                    return (layer instanceof ol.layer.Group);
                }
            }
        },
        {
            name: 'text',
            type: 'string',
            convert: function(v, record) {
                if (!v && record.get('isLayerGroup')) {
                    return 'ol.layer.Group';
                } else {
                    return v;
                }
            }
        },
        {
            name: 'opacity',
            type: 'number',
            convert: function(v, record) {
                var layer;
                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('opacity');
                }
            }
        },
        {
            name: 'minResolution',
            type: 'number',
            convert: function(v, record) {
                var layer;
                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('minResolution');
                }
            }
        },
        {
            name: 'maxResolution',
            type: 'number',
            convert: function(v, record) {
                var layer;
                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('maxResolution');
                }
            }
        }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * Returns the {ol.layer.Base} layer object used in this model instance.
     *
     * @return {ol.layer.Base}
     */
    getOlLayer: function() {
        if (this.data instanceof ol.layer.Base) {
            return this.data;
        }
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * A store that synchronizes a layers array of an OpenLayers.Map with a
 * layer store holding {@link GeoExt.data.mode.layer.Base} instances.
 *
 * @class GeoExt.data.LayerStore
 */
Ext.define('GeoExt.data.LayerStore', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.model.Layer'
    ],
    model: 'GeoExt.data.model.Layer',
    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         * @cfg {ol.Map} map
         */
        map: null
    },
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        if (config.map) {
            this.bindMap(config.map);
        }
    },
    /**
     * Bind this store to a map instance, once bound the store
     * is synchronized with the map and vice-versa.
     *
     * @param {ol.Map} map map The map instance.
     */
    bindMap: function(map) {
        var me = this;
        if (!me.map) {
            me.map = map;
        }
        if (map instanceof ol.Map) {
            var mapLayers = map.getLayers();
            mapLayers.forEach(function(layer) {
                me.loadRawData(layer, true);
            });
            mapLayers.forEach(function(layer) {
                layer.on('propertychange', me.onChangeLayer, me);
            });
            mapLayers.on('add', me.onAddLayer, me);
            mapLayers.on('remove', me.onRemoveLayer, me);
        }
        me.on({
            "load": me.onLoad,
            "clear": me.onClear,
            "add": me.onAdd,
            "remove": me.onRemove,
            "update": me.onStoreUpdate,
            scope: me
        });
        me.data.on({
            "replace": me.onReplace,
            scope: me
        });
        me.fireEvent("bind", me, map);
    },
    /**
     * Unbind this store from the map it is currently bound.
     */
    unbindMap: function() {
        var me = this;
        if (me.map && me.map.getLayers()) {
            me.map.getLayers().un('add', me.onAddLayer, me);
            me.map.getLayers().un('remove', me.onRemoveLayer, me);
        }
        me.un("load", me.onLoad, me);
        me.un("clear", me.onClear, me);
        me.un("add", me.onAdd, me);
        me.un("remove", me.onRemove, me);
        me.un("update", me.onStoreUpdate, me);
        me.data.un("replace", me.onReplace, me);
        me.map = null;
    },
    /**
     * Handler for layer changes.  When layer order changes, this moves the
     * appropriate record within the store.
     *
     * @param {Object} evt
     * @private
     */
    onChangeLayer: function(evt) {
        var layer = evt.target;
        var recordIndex = this.findBy(function(rec) {
                return rec.getOlLayer() === layer;
            });
        if (recordIndex > -1) {
            var record = this.getAt(recordIndex);
            if (evt.key === "title") {
                record.set("title", layer.get('title'));
            } else {
                this.fireEvent("update", this, record, Ext.data.Record.EDIT);
            }
        }
    },
    /**
     * Handler for a layer collection's add event.
     *
     * @param {Object} evt
     * @private
     */
    onAddLayer: function(evt) {
        var layer = evt.element;
        var index = this.map.getLayers().getArray().indexOf(layer);
        var me = this;
        layer.on('propertychange', me.onChangeLayer, me);
        if (!me._adding) {
            me._adding = true;
            var result = me.proxy.reader.read(layer);
            me.insert(index, result.records);
            delete me._adding;
        }
    },
    /**
     * Handler for layer collection's remove event.
     *
     * @param {Object} evt
     * @private
     */
    onRemoveLayer: function(evt) {
        var me = this;
        if (!me._removing) {
            var layer = evt.element,
                rec = me.getByLayer(layer);
            if (rec) {
                me._removing = true;
                layer.un('propertychange', me.onChangeLayer, me);
                me.remove(rec);
                delete me._removing;
            }
        }
    },
    /**
     * Handler for a store's load event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Boolean} successful
     * @private
     */
    onLoad: function(store, records, successful) {
        var me = this;
        if (successful) {
            if (!Ext.isArray(records)) {
                records = [
                    records
                ];
            }
            if (!me._addRecords) {
                me._removing = true;
                me.map.getLayers().forEach(function(layer) {
                    layer.un('propertychange', me.onChangeLayer, me);
                });
                me.map.getLayers().clear();
                delete me._removing;
            }
            var len = records.length;
            if (len > 0) {
                var layers = new Array(len);
                for (var i = 0; i < len; i++) {
                    layers[i] = records[i].getOlLayer();
                    layers[i].on('propertychange', me.onChangeLayer, me);
                }
                me._adding = true;
                me.map.getLayers().extend(layers);
                delete me._adding;
            }
        }
        delete me._addRecords;
    },
    /**
     * Handler for a store's clear event.
     *
     * @private
     */
    onClear: function() {
        var me = this;
        me._removing = true;
        me.map.getLayers().forEach(function(layer) {
            layer.un('propertychange', me.onChangeLayer, me);
        });
        me.map.getLayers().clear();
        delete me._removing;
    },
    /**
     * Handler for a store's add event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Number} index
     * @private
     */
    onAdd: function(store, records, index) {
        var me = this;
        if (!me._adding) {
            me._adding = true;
            var layer;
            for (var i = 0,
                ii = records.length; i < ii; ++i) {
                layer = records[i].getOlLayer();
                layer.on('propertychange', me.onChangeLayer, me);
                if (index === 0) {
                    me.map.getLayers().push(layer);
                } else {
                    me.map.getLayers().insertAt(index, layer);
                }
            }
            delete me._adding;
        }
    },
    /**
     * Handler for a store's remove event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @private
     */
    onRemove: function(store, record) {
        var me = this;
        if (!me._removing) {
            var layer = record.getOlLayer();
            layer.un('propertychange', me.onChangeLayer, me);
            var found = false;
            me.map.getLayers().forEach(function(el) {
                if (el === layer) {
                    found = true;
                }
            });
            if (found) {
                me._removing = true;
                me.removeMapLayer(record);
                delete me._removing;
            }
        }
    },
    /**
     * Handler for a store's update event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @param {Number} operation
     */
    onStoreUpdate: function(store, record, operation) {
        if (operation === Ext.data.Record.EDIT) {
            if (record.modified && record.modified.title) {
                var layer = record.getOlLayer();
                var title = record.get("title");
                if (title !== layer.get('title')) {
                    layer.set('title', title);
                }
            }
        }
    },
    /**
     * Removes a record's layer from the bound map.
     *
     * @param {Ext.data.Record} record
     * @private
     */
    removeMapLayer: function(record) {
        this.map.getLayers().remove(record.getOlLayer());
    },
    /**
     * Handler for a store's data collections' replace event.
     *
     * @param {String} key
     * @param {Ext.data.Model} oldRecord In this case, a record that has
     *     been replaced.
     * @private
     */
    onReplace: function(key, oldRecord) {
        this.removeMapLayer(oldRecord);
    },
    /**
     * Get the record for the specified layer.
     *
     * @param {OpenLayers.Layer} layer
     * @returns {Ext.data.Model} or undefined if not found
     */
    getByLayer: function(layer) {
        var index = this.findBy(function(r) {
                return r.getOlLayer() === layer;
            });
        if (index > -1) {
            return this.getAt(index);
        }
    },
    /**
     * Unbinds listeners by calling #unbind prior to being destroyed.
     *
     * @private
     */
    destroy: function() {
        this.unbind();
        this.callParent();
    },
    /**
     * Overload loadRecords to set a flag if `addRecords` is `true`
     * in the load options. Ext JS does not pass the load options to
     * "load" callbacks, so this is how we provide that information
     * to `onLoad`.
     *
     * @private
     */
    loadRecords: function(records, options) {
        if (options && options.addRecords) {
            this._addRecords = true;
        }
        this.callParent(arguments);
    },
    /**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData)
     *
     * In version 4.2.1 this method reads
     *
     *     //...
     *     loadRawData : function(data, append) {
     *         var me      = this,
     *             result  = me.proxy.reader.read(data),
     *             records = result.records;
     *
     *         if (result.success) {
     *             me.totalCount = result.total;
     *             me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         }
     *     },
     *     // ...
     *
     * While the previous version 4.1.3 has also
     * the line `me.fireEvent('load', me, records, true);`:
     *
     *     // ...
     *     if (result.success) {
     *         me.totalCount = result.total;
     *         me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         me.fireEvent('load', me, records, true);
     *     }
     *     // ...
     *
     * Our overwritten method has the code from 4.1.3, so that the #load-event
     * is being fired.
     *
     * See also the source code of [version 4.1.3](http://docs-origin.sencha.
     * com/extjs/4.1.3/source/Store.html#Ext-data-Store-method-loadRawData) and
     * of [version 4.2.1](http://docs-origin.sencha.com/extjs/4.2.1/source/
     * Store.html#Ext-data-Store-method-loadRawData).
     */
    loadRawData: function(data, append) {
        var me = this,
            result = me.proxy.reader.read(data),
            records = result.records;
        if (result.success) {
            me.totalCount = result.total;
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * Create a component container for a map.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         width: 800,
 *         height: 600,
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         }),
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 * @class GeoExt.component.Map
 */
Ext.define("GeoExt.component.Map", {
    extend: "Ext.Component",
    alias: [
        "widget.gx_map",
        "widget.gx_component_map"
    ],
    requires: [
        'GeoExt.data.LayerStore'
    ],
    /**
     * @event pointerrest
     *
     * Fires if the user has left the pointer for an amount
     * of #pointerRestInterval milliseconds at the *same location*. Use the
     * configuration #pointerRestPixelTolerance to configure how long a pixel is
     * considered to be on the *same location*.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The original and most recent
     *     MapBrowserEvent event.
     *  @param {ol.Pixel} lastPixel The originally captured pixel, which defined
     *     the center of the tolerance bounds (itself configurable with the the
     *     configuration #pointerRestPixelTolerance). If this is null, a
     *     completely *new* pointerrest event just happened.
     *
     */
    /**
     * @event pointerrestout
     *
     * Fires if the user first was resting his pointer on the map element, but
     * then moved the pointer out of the map completely.
     *
     * Please note that this event will only fire if the map has #pointerRest
     * configured with `true`.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     */
    config: {
        /**
         * A configured map or a configuration object for the map constructor.
         *
         * @cfg {ol.Map} map
         */
        map: null,
        /**
         * A boolean flag to control whether the map component will fire the
         * events #pointerrest and #pointerrestout. If this is set to `false`
         * (the default), no such events will be fired.
         *
         * @cfg {boolean} pointerRest Whether the component shall provide the
         *     `pointerrest` and `pointerrestout` events.
         */
        pointerRest: false,
        /**
         * The amount of milliseconds after which we will consider a rested
         * pointer as `pointerrest`. Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestInterval The interval in milliseconds.
         */
        pointerRestInterval: 1000,
        /**
         * The amount of pixels that a pointer may move in both vertical and
         * horizontal direction, and still be considered to be a #pointerrest.
         * Only relevant if #pointerRest is `true`.
         *
         * @cfg {Number} pointerRestPixelTolerance The tolerance in pixels.
         */
        pointerRestPixelTolerance: 3
    },
    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,
    /**
     * @property {GeoExt.data.LayerStore} layerStore
     * @private
     */
    layerStore: null,
    /**
     * The location of the last mousemove which we track to be able to fire
     * the #pointerrest event. Only usable if #pointerRest is `true`.
     *
     * @property {ol.Pixel} lastPointerPixel
     * @private
     */
    lastPointerPixel: null,
    /**
     * Whether the pointer is currently over the map component. Only usable if
     * the configuration #pointerRest is `true`.
     *
     * @property {boolean} isMouseOverMapEl
     * @private
     */
    isMouseOverMapEl: null,
    /**
     * @inheritdoc
     */
    initComponent: function() {
        var me = this;
        if (!(me.getMap() instanceof ol.Map)) {
            var olMap = new ol.Map({
                    view: new ol.View({
                        center: [
                            0,
                            0
                        ],
                        zoom: 2
                    })
                });
            me.setMap(olMap);
        }
        me.layerStore = Ext.create('GeoExt.data.LayerStore', {
            storeId: me.getId() + "-store",
            map: me.getMap()
        });
        me.on('resize', me.onResize, me);
        me.callParent();
    },
    /**
     * (Re-)render the map when size changes.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapComponent).
        var me = this;
        if (!me.mapRendered) {
            me.getMap().setTarget(me.getTargetEl().dom);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },
    /**
     * Will contain a buffered version of #unbufferedPointerMove, but only if
     * the configuration #pointerRest is true.
     *
     * @private
     */
    bufferedPointerMove: Ext.emptyFn,
    /**
     * Bound as a eventlistener for pointermove on the OpenLayers map, but only
     * if the configuration #pointerRest is true. Will eventually fire the
     * special events #pointerrest or #pointerrestout.
     *
     * @param {ol.MapBrowserEvent} olEvt The MapBrowserEvent event.
     * @private
     */
    unbufferedPointerMove: function(olEvt) {
        var me = this;
        var tolerance = me.getPointerRestPixelTolerance();
        var pixel = olEvt.pixel;
        if (!me.isMouseOverMapEl) {
            me.fireEvent('pointerrestout', olEvt);
            return;
        }
        if (me.lastPointerPixel) {
            var deltaX = Math.abs(me.lastPointerPixel[0] - pixel[0]);
            var deltaY = Math.abs(me.lastPointerPixel[1] - pixel[1]);
            if (deltaX > tolerance || deltaY > tolerance) {
                me.lastPointerPixel = pixel;
            } else {
                // fire pointerrest, and include the original pointer pixel
                me.fireEvent('pointerrest', olEvt, me.lastPointerPixel);
                return;
            }
        } else {
            me.lastPointerPixel = pixel;
        }
        // a new pointerrest event, the second argument (the 'original' pointer
        // pixel) must be null, as we start from a totally new position
        me.fireEvent('pointerrest', olEvt, null);
    },
    /**
     * Creates #bufferedPointerMove from #unbufferedPointerMove and binds it
     * to `pointermove` on the OpenLayers map.
     *
     * @private
     */
    registerPointerRestEvents: function() {
        var me = this;
        var map = me.getMap();
        if (me.bufferedPointerMove === Ext.emptyFn) {
            me.bufferedPointerMove = Ext.Function.createBuffered(me.unbufferedPointerMove, me.getPointerRestInterval(), me);
        }
        // Check if we have to fire any pointer* events
        map.on('pointermove', me.bufferedPointerMove);
        if (!me.rendered) {
            // make sure we do not fire any if the pointer left the component
            me.on('afterrender', me.bindEnterLeaveListeners, me);
        } else {
            me.bindEnterLeaveListeners();
        }
    },
    /**
     * Registers listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    bindEnterLeaveListeners: function() {
        var me = this;
        var mapEl = me.getEl();
        if (mapEl) {
            mapEl.on({
                mouseenter: me.onMouseEnter,
                mouseleave: me.onMouseLeave,
                scope: me
            });
        }
    },
    /**
     * Unregisters listeners that'll take care of setting #isMouseOverMapEl to
     * correct values.
     *
     * @private
     */
    unbindEnterLeaveListeners: function() {
        var me = this;
        var mapEl = me.getEl();
        if (mapEl) {
            mapEl.un({
                mouseenter: me.onMouseEnter,
                mouseleave: me.onMouseLeave,
                scope: me
            });
        }
    },
    /**
     * Sets isMouseOverMapEl to true, see #pointerRest.
     *
     * @private
     */
    onMouseEnter: function() {
        this.isMouseOverMapEl = true;
    },
    /**
     * Sets isMouseOverMapEl to false, see #pointerRest.
     *
     * @private
     */
    onMouseLeave: function() {
        this.isMouseOverMapEl = false;
    },
    /**
     * Unregisters the #bufferedPointerMove event listener and unbinds the
     * enter- and leave-listeners.
     */
    unregisterPointerRestEvents: function() {
        var map = this.getMap();
        this.unbindEnterLeaveListeners();
        if (map) {
            map.un('pointermove', this.bufferedPointerMove);
        }
    },
    /**
     * Whenever the value of #pointerRest is changed, this method will take
     * care of registering or unregistering internal event listeners.
     *
     * @param {boolean} val The new value that someone set for `pointerRest`.
     * @return {boolean} The passed new value for  `pointerRest` unchanged.
     */
    applyPointerRest: function(val) {
        if (val) {
            this.registerPointerRestEvents();
        } else {
            this.unregisterPointerRestEvents();
        }
        return val;
    },
    /**
     * Returns the center coordinate of the view.
     * @return ol.Coordinate
     */
    getCenter: function() {
        return this.getMap().getView().getCenter();
    },
    /**
     * Set the center of the view.
     * @param {ol.Coordinate} center
     */
    setCenter: function(center) {
        this.getMap().getView().setCenter(center);
    },
    /**
     * Returns the extent of the current view.
     * @return ol.Extent
     */
    getExtent: function() {
        return this.getView().calculateExtent(this.getMap().getSize());
    },
    /**
     * Set the extent of the view.
     * @param {ol.Extent} extent
     */
    setExtent: function(extent) {
        this.getView().fitExtent(extent, this.getMap().getSize());
    },
    /**
     * Returns the layers of the map.
     * @return ol.Collection
     */
    getLayers: function() {
        return this.getMap().getLayers();
    },
    /**
     * Add a layer to the map.
     * @param {ol.layer.Base} layer
     */
    addLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            this.getMap().addLayer(layer);
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' + 'an instance of ol.layer.Base');
        }
    },
    /**
     * Add a layer to the map.
     * @param {ol.layer.Base} layer
     */
    removeLayer: function(layer) {
        if (layer instanceof ol.layer.Base) {
            if (Ext.Array.contains(this.getLayers().getArray(), layer)) {
                this.getMap().removeLayer(layer);
            }
        } else {
            Ext.Error.raise('Can not add layer ' + layer + ' cause it is not ' + 'an instance of ol.layer.Base');
        }
    },
    /**
     * Returns the GeoExt.data.LayerStore
     * @return GeoExt.data.LayerStore
     */
    getStore: function() {
        return this.layerStore;
    },
    /**
     * Returns the view of the map.
     * @return ol.View
     */
    getView: function() {
        return this.getMap().getView();
    },
    /**
     * Set the view of the map.
     * @param {ol.View} view
     */
    setView: function(view) {
        this.getMap().setView(view);
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * An GeoExt.component.OverviewMap displays an overview map of an parent map.
 * You can use this component as any other Ext.Component, e.g give it as an item
 * to a panel.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         })
 *     });
 *
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.OverviewMap Example',
 *         width: 800,
 *         height: 600,
 *         items: [mapComponent],
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 *     var overviewMap = Ext.create('GeoExt.component.OverviewMap', {
 *         parentMap: olMap
 *     });
 *
 *     var extPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'OverviewMap in Panel',
 *         width: 400,
 *         height: 200,
 *         layout: 'fit',
 *         items: [
 *             overviewMap
 *         ],
 *         renderTo: 'panelDiv' // ID of the target <div>. Optional.
 *     });
 *
 * @class GeoExt.component.OverviewMap
 */
Ext.define("GeoExt.component.OverviewMap", {
    extend: 'Ext.Component',
    alias: [
        'widget.gx_overview',
        'widget.gx_overviewmap',
        'widget.gx_component_overviewmap'
    ],
    config: {
        /**
         * TODO
         * @cfg {ol.Style} anchorStyle
         */
        anchorStyle: null,
        /**
         * TODO
         * @cfg {ol.Style} boxStyle
         */
        boxStyle: null,
        /**
         * An ol.Collection of ol.layers.Base. If not defined on construction, the
         * layers of the parentMap will be used.
         */
        layers: [],
        /**
         * The magnification is the relationship in which the resolution of the
         * overviewmaps view is bigger then resolution of the parentMaps view.
         * @cfg {Number} magnification
         */
        magnification: 5,
        /**
         * A configured map or a configuration object for the map constructor.
         * This is the overviewMap itself.
         * @cfg {ol.Map} map
         */
        map: null,
        /**
         * A configured map or a configuration object for the map constructor.
         * This should be the map the overviewMap is bind to.
         * @cfg {ol.Map} parentMap
         */
        parentMap: null,
        /**
         * Shall a click on the overview map recenter the parent map?
         *
         * @cfg {boolean} recenterOnClick Whether we shall recenter the parent
         *     map on a click on the overview map or not.
         */
        recenterOnClick: true,
        /**
         * Duration time in milliseconds of the panning animation when we
         * recenter the map after a click on the overview. Only has effect
         * if #recenterOnClick is true.
         *
         * @cfg {number} recenterDuration Amount of milliseconds for panning
         *     the parent map to the clicked location.
         */
        recenterDuration: 500
    },
    statics: {
        /**
         *
         */
        rotateCoordsAroundCoords: function(coords, center, rotation) {
            var cosTheta = Math.cos(rotation);
            var sinTheta = Math.sin(rotation);
            var x = (cosTheta * (coords[0] - center[0]) - sinTheta * (coords[1] - center[1]) + center[0]);
            var y = (sinTheta * (coords[0] - center[0]) + cosTheta * (coords[1] - center[1]) + center[1]);
            return [
                x,
                y
            ];
        },
        /**
         *
         */
        rotateGeomAroundCoords: function(geom, centerCoords, rotation) {
            var me = this;
            var ar = [];
            var coords;
            if (geom instanceof ol.geom.Point) {
                ar.push(me.rotateCoordsAroundCoords(geom.getCoordinates(), centerCoords, rotation));
                geom.setCoordinates(ar[0]);
            } else if (geom instanceof ol.geom.Polygon) {
                coords = geom.getCoordinates()[0];
                coords.forEach(function(coord) {
                    ar.push(me.rotateCoordsAroundCoords(coord, centerCoords, rotation));
                });
                geom.setCoordinates([
                    ar
                ]);
            }
            return geom;
        }
    },
    /**
     * @private
     */
    boxFeature: null,
    /**
     * @private
     */
    anchorFeature: null,
    /**
     * The ol.layer.Vector displaying the extent geometry of the parentMap.
     *
     * @private
     */
    extentLayer: null,
    /**
     * Whether we already rendered an ol.Map in this component. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,
    constructor: function() {
        this.initOverviewFeatures();
        this.callParent(arguments);
    },
    /**
     * TODO
     */
    initComponent: function() {
        var me = this;
        if (!me.getParentMap()) {
            Ext.Error.raise('No parentMap defined for overviewMap');
        } else if (!(me.getParentMap() instanceof ol.Map)) {
            Ext.Error.raise('parentMap is not an instance of ol.Map');
        }
        me.initOverviewMap();
        me.on('beforedestroy', me.onBeforeDestroy, me);
        me.on('resize', me.onResize, me);
        me.callParent();
    },
    /**
     * TODO
     */
    initOverviewFeatures: function() {
        var me = this;
        me.boxFeature = new ol.Feature();
        me.anchorFeature = new ol.Feature();
        me.extentLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
    },
    /**
     * TODO
     */
    initOverviewMap: function() {
        var me = this,
            parentMap = me.getParentMap(),
            parentLayers;
        if (me.getLayers().length < 1) {
            parentLayers = me.getParentMap().getLayers();
            parentLayers.forEach(function(layer) {
                if (layer instanceof ol.layer.Tile || layer instanceof ol.layer.Image) {
                    me.getLayers().push(layer);
                }
            });
        }
        me.getLayers().push(me.extentLayer);
        if (!me.getMap()) {
            var parentView = parentMap.getView();
            var olMap = new ol.Map({
                    controls: new ol.Collection(),
                    interactions: new ol.Collection(),
                    view: new ol.View({
                        center: parentView.getCenter(),
                        zoom: parentView.getZoom(),
                        projection: parentView.getProjection()
                    })
                });
            me.setMap(olMap);
        }
        Ext.each(me.getLayers(), function(layer) {
            me.getMap().addLayer(layer);
        });
        /*
         * Set the OverviewMaps center or resolution, on property changed
         * in parentMap.
         */
        parentMap.getView().on('propertychange', me.onParentViewPropChange, me);
        /*
         * Update the box after rendering a new frame of the parentMap.
         */
        parentMap.on('postrender', me.updateBox, me);
        /*
         * Initially set the center and resolution of the overviewMap.
         */
        me.setOverviewMapProperty('center');
        me.setOverviewMapProperty('resolution');
        me.extentLayer.getSource().addFeatures([
            me.boxFeature,
            me.anchorFeature
        ]);
    },
    /**
     * Called when a property of the parent maps view changes.
     *
     * @private
     */
    onParentViewPropChange: function(evt) {
        if (evt.key === 'center' || evt.key === 'resolution') {
            this.setOverviewMapProperty(evt.key);
        }
    },
    /**
     * Handler for the click event of the overview map. Recenters the parent
     * map to the clicked location.
     *
     * @private
     */
    overviewMapClicked: function(evt) {
        var me = this;
        var parentMap = me.getParentMap();
        var parentView = parentMap.getView();
        var currentMapCenter = parentView.getCenter();
        var panAnimation = ol.animation.pan({
                duration: me.getRecenterDuration(),
                source: currentMapCenter
            });
        parentMap.beforeRender(panAnimation);
        parentView.setCenter(evt.coordinate);
    },
    /**
     * Updates the Geometry of the extentLayer.
     */
    updateBox: function() {
        var me = this,
            parentExtent = me.getParentMap().getView().calculateExtent(me.getParentMap().getSize()),
            parentRotation = me.getParentMap().getView().getRotation(),
            parentCenter = me.getParentMap().getView().getCenter(),
            geom = ol.geom.Polygon.fromExtent(parentExtent);
        geom = me.self.rotateGeomAroundCoords(geom, parentCenter, parentRotation);
        me.boxFeature.setGeometry(geom);
        var anchor = new ol.geom.Point(ol.extent.getTopLeft(parentExtent));
        anchor = me.self.rotateGeomAroundCoords(anchor, parentCenter, parentRotation);
        me.anchorFeature.setGeometry(anchor);
    },
    /**
     * Set an OverviewMap property (center or resolution).
     */
    setOverviewMapProperty: function(key) {
        var me = this,
            parentView = me.getParentMap().getView(),
            overviewView = me.getMap().getView();
        if (key === 'center') {
            overviewView.set('center', parentView.getCenter());
        }
        if (key === 'resolution') {
            overviewView.set('resolution', me.getMagnification() * parentView.getResolution());
        }
    },
    /**
     * The applier for recenterOnClick method. Takes care of initially
     * registering an appropriate eventhandler and also unregistering if the
     * property changes.
     */
    applyRecenterOnClick: function(shallRecenter) {
        var me = this,
            map = me.getMap();
        if (!map) {
            // TODO or shall we have our own event, once we have a map?
            me.addListener('afterrender', function() {
                // set the property again, and re-trigger the 'apply…'-sequence
                me.setRecenterOnClick(shallRecenter);
            }, me, {
                single: true
            });
            return;
        }
        if (shallRecenter) {
            map.on('click', me.overviewMapClicked, me);
        } else {
            map.un('click', me.overviewMapClicked, me);
        }
    },
    /**
     * Cleanup any listeners we may have bound.
     */
    onBeforeDestroy: function() {
        var me = this,
            map = me.getMap(),
            parentMap = me.getParentMap(),
            parentView = parentMap && parentMap.getView();
        if (map) {
            // unbind recenter listener, if any
            map.un('click', me.overviewMapClicked, me);
        }
        if (parentMap) {
            // unbind parent listeners
            parentMap.un('postrender', me.updateBox, me);
            parentView.un('propertychange', me.onParentViewPropChange, me);
        }
    },
    /**
     * Update the size of the ol.Map onResize.
     */
    onResize: function() {
        // Get the corresponding view of the controller (the mapPanel).
        var me = this,
            div = me.getEl().dom,
            map = me.getMap();
        if (!me.mapRendered) {
            map.setTarget(div);
            me.mapRendered = true;
        } else {
            me.getMap().updateSize();
        }
    },
    /**
     *
     */
    applyAnchorStyle: function(style) {
        this.anchorFeature.setStyle(style);
        return style;
    },
    /**
     *
     */
    applyBoxStyle: function(style) {
        this.boxFeature.setStyle(style);
        return style;
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
Ext.define('GeoExt.data.model.print.LayoutAttributes', {
    extend: 'GeoExt.data.model.Base',
    fields: [
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'clientInfo',
            type: 'auto'
        }
    ]
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
Ext.define('GeoExt.data.model.print.Layout', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.LayoutAttributes'
    ],
    hasMany: [
        {
            name: 'attributes',
            associationKey: 'attributes',
            model: 'print.LayoutAttributes'
        }
    ],
    fields: [
        {
            name: 'name',
            type: 'string'
        }
    ]
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
Ext.define('GeoExt.data.model.print.Capability', {
    extend: 'GeoExt.data.model.Base',
    requires: [
        'GeoExt.data.model.print.Layout'
    ],
    hasMany: [
        {
            name: 'layouts',
            associationKey: 'layouts',
            model: 'print.Layout'
        }
    ],
    fields: [
        {
            name: 'app',
            type: 'string'
        },
        {
            name: 'formats'
        }
    ]
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * Provides an interface to a Mapfish or GeoServer print module.
 */
Ext.define('GeoExt.data.MapfishPrintProvider', {
    extend: 'Ext.Base',
    mixins: [
        'Ext.mixin.Observable'
    ],
    requires: [
        'GeoExt.data.model.print.Capability',
        'Ext.data.JsonStore'
    ],
    /**
     * @event ready
     * Fires after the PrintCapability store is loaded.
     * @param {GeoExt.data.MapfishPrintProvider} provider
     * The GeoExt.data.MapfishPrintProvider itself
     */
    config: {
        capabilities: null,
        url: ''
    },
    statics: {
        /**
         * Will return an array of serialized layers for mapfish print servlet
         * v3.0.
         *
         * @param {GeoExt.data.LayerStore, {ol.Collection.<ol.layer.Base>},
         * Array<ol.layer.Base>}
         *
         * @static
         */
        getSerializedLayers: function(layers) {
            var serializedLayers = [];
            var inputLayers = [];
            if (layers instanceof GeoExt.data.LayerStore) {
                layers.each(function(layerRec) {
                    var layer = layerRec.getOlLayer();
                    inputLayers.push(layer);
                });
            } else if (layers instanceof ol.Collection) {
                inputLayers = layers.getArray();
            } else {
                inputLayers = layers;
            }
            Ext.each(inputLayers, function(layer) {
                var source = layer.getSource();
                var serialized = {};
                if (source instanceof ol.source.TileWMS) {
                    serialized = {
                        "baseURL": source.getUrls()[0],
                        "customParams": source.getParams(),
                        "layers": [
                            source.getParams().LAYERS
                        ],
                        "opacity": layer.getOpacity(),
                        "styles": [
                            ""
                        ],
                        "type": "WMS"
                    };
                    serializedLayers.push(serialized);
                } else if (source instanceof ol.source.ImageWMS) {
                    serialized = {
                        "baseURL": source.getUrl(),
                        "customParams": source.getParams(),
                        "layers": [
                            source.getParams().LAYERS
                        ],
                        "opacity": layer.getOpacity(),
                        "styles": [
                            ""
                        ],
                        "type": "WMS"
                    };
                    serializedLayers.push(serialized);
                } else {}
            });
            // TODO implement serialization of other ol.source classes.
            return serializedLayers;
        },
        /**
         * Renders the extent of the printout. Will ensure that the extent is
         * always visible and that the ratio matches the ratio that clientInfo
         * contains
         */
        renderPrintExtent: function(mapComponent, extentLayer, clientInfo) {
            var mapComponentWidth = mapComponent.getWidth();
            var mapComponentHeight = mapComponent.getHeight();
            var currentMapRatio = mapComponentWidth / mapComponentHeight;
            var scaleFactor = 0.6;
            var desiredPrintRatio = clientInfo.width / clientInfo.height;
            var targetWidth;
            var targetHeight;
            var geomExtent;
            var feat;
            if (desiredPrintRatio >= currentMapRatio) {
                targetWidth = mapComponentWidth * scaleFactor;
                targetHeight = targetWidth / desiredPrintRatio;
            } else {
                targetHeight = mapComponentHeight * scaleFactor;
                targetWidth = targetHeight * desiredPrintRatio;
            }
            geomExtent = mapComponent.getView().calculateExtent([
                targetWidth,
                targetHeight
            ]);
            feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
            extentLayer.getSource().addFeature(feat);
            return feat;
        }
    },
    /**
     * @property
     * The capabiltyRec is an instance of 'GeoExt.data.model.print.Capability'
     * and contains the PrintCapabilities of the Printprovider.
     * @readonly
     */
    capabilityRec: null,
    constructor: function(cfg) {
        this.mixins.observable.constructor.call(this, cfg);
        if (!cfg.capabilities && !cfg.url) {
            Ext.Error.raise('Print capabilities or Url required');
        }
        this.initConfig(cfg);
        this.fillCapabilityRec();
    },
    /**
     * @private
     * Creates the store from object or url.
     */
    fillCapabilityRec: function() {
        // enhance checks
        var store;
        var capabilities = this.getCapabilities();
        var url = this.getUrl();
        var fillRecordAndFireEvent = function() {
                this.capabilityRec = store.getAt(0);
                this.fireEvent('ready', this);
            };
        if (capabilities) {
            // if capability object is passed
            store = Ext.create('Ext.data.JsonStore', {
                model: 'GeoExt.data.model.print.Capability',
                listeners: {
                    datachanged: fillRecordAndFireEvent,
                    scope: this
                }
            });
            store.loadRawData(capabilities);
        } else if (url) {
            // if servlet url is passed
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                model: 'GeoExt.data.model.print.Capability',
                proxy: {
                    type: 'jsonp',
                    url: url,
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: fillRecordAndFireEvent,
                    scope: this
                }
            });
        }
    }
});

/**
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.LayerTreeNode', {
    extend: 'GeoExt.data.model.Layer',
    requires: [
        'Ext.data.NodeInterface'
    ],
    mixins: [
        'Ext.mixin.Queryable'
    ],
    fields: [
        {
            name: 'leaf',
            type: 'boolean',
            convert: function(v, record) {
                var isGroup = record.get('isLayerGroup');
                if (isGroup === undefined || isGroup) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    constructor: function() {
        var layer;
        this.callParent(arguments);
        layer = this.getOlLayer();
        if (layer instanceof ol.layer.Base) {
            this.set('checked', layer.get('visible'));
            layer.on('change:visible', this.onLayerVisibleChange, this);
        }
    },
    onLayerVisibleChange: function(evt) {
        var target = evt.target;
        if (!this.__updating) {
            this.set('checked', target.get('visible'));
        }
    },
    /**
     * Overriden to foward changes to the underlying ol.Object. All changes on
     * the Ext.data.Models properties will be set on the ol.Object as well.
     *
     * @param {String} key
     * @param {Object} value
     * @param {Object} options
     *
     * @inheritDoc
     */
    set: function(key, newValue) {
        this.callParent(arguments);
        // forward changes to ol object
        if (key === 'checked') {
            this.__updating = true;
            this.getOlLayer().set('visible', newValue);
            this.__updating = false;
        }
    },
    /**
     * @inheritDoc
     */
    getRefItems: function() {
        return this.childNodes;
    },
    /**
     * @inheritDoc
     */
    getRefOwner: function() {
        return this.parentNode;
    }
}, function() {
    // make this an Ext.data.TreeModel
    Ext.data.NodeInterface.decorate(this);
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * A store that is synchronized with a GeoExt.data.LayerStore. It will be used
 * by a GeoExt.tree.Panel.
 */
Ext.define('GeoExt.data.TreeStore', {
    extend: 'Ext.data.TreeStore',
    model: 'GeoExt.data.model.LayerTreeNode',
    config: {
        /**
         * The ol.layer.Group that the tree is derived from.
         * @cfg {ol.layer.Group}
         */
        layerGroup: null,
        /**
         * The layer property that will be used to label tree nodes.
         * @cfg {String}
         */
        textProperty: 'name'
    },
    /**
     * Defines if the given ol.layer.Group while be shown as node or not.
     * @property {boolean}
     */
    showLayerGroupNode: false,
    /**
     * @cfg
     * @inheritdoc Ext.data.TreeStore
     */
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me.on('nodebeforeexpand', me.handleNodeBeforeExpand, me);
        me.on('noderemove', me.handleNodeRemove, me);
    },
    /**
     * Adds a layer as a child to a node. It can be either an
     * GeoExt.data.model.Layer or an ol.layer.Base.
     *
     * @param {Ext.data.NodeInterface} node
     * @param {GeoExt.data.model.Layer/ol.layer.Base} rec
     */
    addLayerNode: function(node, rec) {
        var me = this,
            layer = rec instanceof ol.layer.Base ? rec : rec.data;
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().once('add', this.onLayerCollectionChanged, this);
            layer.getLayers().once('remove', this.onLayerCollectionChanged, this);
            var folderNode = node.appendChild(layer);
            layer.getLayers().forEach(function(childLayer) {
                me.addLayerNode(folderNode, childLayer);
            });
        } else {
            layer.text = layer.get(me.getTextProperty());
            node.appendChild(layer);
        }
    },
    /**
     * Listens to the nodebeforeexpand event. Adds nodes corresponding to the
     * data type.
     *
     * @param {GeoExt.data.model.LayerTreeNode} node
     * @private
     */
    handleNodeBeforeExpand: function(node) {
        var me = this;
        if (node.isRoot()) {
            if (me.showLayerGroupNode) {
                me.addLayerNode(node, me.layerGroup);
            } else {
                var collection = me.layerGroup.getLayers();
                collection.once('remove', me.onLayerCollectionChanged, me);
                collection.once('add', me.onLayerCollectionChanged, me);
                collection.forEach(function(layer) {
                    me.addLayerNode(node, layer);
                });
            }
        }
    },
    /**
     * Listens to the noderemove event. Updates the tree with the current
     * map state.
     *
     * @param {GeoExt.data.model.LayerTreeNode} parentNode
     * @param {GeoExt.data.model.LayerTreeNode} removedNode
     * @private
     */
    handleNodeRemove: function(parentNode, removedNode) {
        var me = this;
        if (removedNode.isRoot()) {
            return;
        }
        var layer = removedNode.getOlLayer();
        if (layer instanceof ol.layer.Group) {
            var collection = layer.getLayers();
            collection.un('add', me.onLayerCollectionChanged, me);
            collection.un('remove', me.onLayerCollectionChanged, me);
        }
    },
    /**
     *  Remove children from rootNode and readd the layerGroup-collection.
     *
     *  @private
     */
    onLayerCollectionChanged: function() {
        var me = this;
        me.getRootNode().removeAll();
        if (me.showLayerGroupNode) {
            me.addLayerNode(me.getRootNode(), me.getLayerGroup());
        } else {
            var collection = me.getLayerGroup().getLayers();
            collection.once('remove', me.onLayerCollectionChanged, me);
            collection.once('add', me.onLayerCollectionChanged, me);
            collection.forEach(function(layer) {
                me.addLayerNode(me.getRootNode(), layer);
            });
        }
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * Simple model that maps an ol.Object to an Ext.data.Model.
 */
Ext.define('GeoExt.data.model.Object', {
    extend: 'GeoExt.data.model.Base',
    statics: {
        /**
         * Gets a reference to an ol contructor function.
         *
         * @param  {String} str Description of the form "ol.layer.Base"
         * @return {Function}   the ol constructor
         */
        getOlCLassRef: function(str) {
            var ref = ol,
                members;
            if (Ext.isString(str)) {
                members = str.split('.');
                // shift if description contains namespace
                if (Ext.Array.indexOf(members, 'ol') === 0) {
                    members.shift();
                }
                // traverse namespace to ref
                Ext.Array.each(members, function(member) {
                    ref = ref[member];
                });
            }
            return ref;
        }
    },
    /**
     * String description of the reference path to the wrapped ol class.
     * @type {String}
     *
     * @property
     */
    olClass: 'ol.Object',
    /**
     * the underlying ol.Object
     * @type {ol.Object}
     */
    olObject: null,
    proxy: {
        type: 'memory',
        reader: 'json'
    },
    /**
     * @inheritDoc
     */
    constructor: function(data) {
        var me = this,
            statics = this.statics(),
            OlClass = statics.getOlCLassRef(this.olClass);
        data = data || {};
        // init ol object if plain data is handed over
        if (!(data instanceof OlClass)) {
            data = new OlClass(data);
        }
        me.olObject = data;
        // init record with properties of underlying ol object
        me.callParent([
            this.olObject.getProperties()
        ]);
        me.olObject.on('propertychange', me.onPropertychange, me);
    },
    /**
     * Listener to propertychange events of the underlying ol.Object.
     * All changes on the object will be forwarded to the Ext.data.Model.
     *
     * @param  {ol.ObjectEvent} evt
     *
     * @private
     */
    onPropertychange: function(evt) {
        var target = evt.target,
            key = evt.key;
        if (!this.__updating) {
            this.set(key, target.get(key));
        }
    },
    /**
     * Overriden to foward changes to the underlying ol.Object. All changes on
     * the Ext.data.Models properties will be set on the ol.Object as well.
     *
     * @param {String|Object} key
     * @param {Object} value
     * @param {Object} options
     *
     * @inheritDoc
     */
    set: function(key, newValue) {
        var o = {};
        this.callParent(arguments);
        // forward changes to ol object
        this.__updating = true;
        // wrap simple set operations into an object
        if (Ext.isString(key)) {
            o[key] = newValue;
        } else {
            o = key;
        }
        // iterate over object setting changes to ol.Object
        Ext.Object.each(o, function(k, v) {
            this.olObject.set(k, v);
        }, this);
        this.__updating = false;
    },
    /**
     * Overriden to un all added event listeners on the ol.Object.
     *
     * @inheritDoc
     */
    destroy: function() {
        this.olObject.un('propertychange', this.onPropertychange, this);
        this.callParent(arguments);
    }
});

/**
 * Data model holding an OpenLayers feature.
 *
 * @class
 */
Ext.define('GeoExt.data.model.Feature', {
    extend: 'GeoExt.data.model.Object',
    /**
     * Returns the underlying Feature of this record.
     *
     * @return {ol.Feature}
     */
    getFeature: function() {
        return this.olObject;
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * Simple store that maps a ol.Collection to a Ext.data.Store.
 */
Ext.define('GeoExt.data.store.Collection', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.model.Object'
    ],
    /**
     * The ol collection this store syncs with.
     * @type {ol.Collection}
     *
     * @property
     */
    olCollection: null,
    model: 'GeoExt.data.model.Object',
    proxy: {
        type: 'memory',
        reader: 'json'
    },
    listeners: {
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @inheritDoc
         */
        add: function(store, records, index) {
            var coll = store.olCollection,
                length = records.length,
                i;
            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.insertAt(index + i, records[i].olObject);
            }
            store.__updating = false;
        },
        /**
         * Forwards changes on the Ext.data.Store to the ol.Collection.
         *
         * @inheritDoc
         */
        remove: function(store, records, index) {
            var coll = store.olCollection,
                length = records.length,
                i;
            store.__updating = true;
            for (i = 0; i < length; i++) {
                coll.removeAt(index);
            }
            store.__updating = false;
        }
    },
    constructor: function(config) {
        config = config || {};
        // cache ol.Collection on property
        if (config.data instanceof ol.Collection) {
            this.olCollection = config.data;
        } else // init ol.Collection if array is provided
        {
            this.olCollection = new ol.Collection(config.data || []);
        }
        delete config.data;
        config.data = this.olCollection.getArray();
        this.callParent([
            config
        ]);
        this.olCollection.on('add', this.onOlCollectionAdd, this);
        this.olCollection.on('remove', this.onOlCollectionRemove, this);
    },
    /**
     * Forwards changes to the ol.Collection to the Ext.data.Store.
     * @param  {ol.CollectionEvent} evt
     */
    onOlCollectionAdd: function(evt) {
        var target = evt.target,
            element = evt.element,
            idx = Ext.Array.indexOf(target.getArray(), element);
        if (!this.__updating) {
            this.insert(idx, element);
        }
    },
    /**
     * Forwards changes to the ol.Collection to the Ext.data.Store.
     * @param  {ol.CollectionEvent} evt
     */
    onOlCollectionRemove: function(evt) {
        var element = evt.element,
            idx = this.findBy(function(rec) {
                return rec.olObject === element;
            });
        if (idx !== -1) {
            if (!this.__updating) {
                this.removeAt(idx);
            }
        }
    },
    /**
     * @inheritDoc
     */
    destroy: function() {
        this.olCollection.un('add', this.onCollectionAdd, this);
        this.olCollection.un('remove', this.onCollectionRemove, this);
        delete this.olCollection;
        this.callParent(arguments);
    }
});

/**
 * A data store holding OpenLayers feature objects.
 *
 * @class
 */
Ext.define('GeoExt.data.store.Features', {
    extend: 'GeoExt.data.store.Collection',
    requires: [],
    model: 'GeoExt.data.model.Feature',
    config: {
        /**
         * @cfg {ol.Layer}
         * Initial layer holding features which will be added to the store
         */
        /**
         * @property {ol.Layer}
         * @readonly
         * The layer object which is in sync with this store
         */
        layer: null
    },
    /**
     * @cfg {ol.Map}
     * a map object to which a possible #layer will be added
     */
    map: null,
    /**
     * @cfg
     * Set this flag to true will create a vector #layer with the given
     * #features and ads it to the given #map (if available)
     */
    createLayer: false,
    /**
     * @private
     * @property
     * Shows if the #layer has been created by constructor
     */
    layerCreated: false,
    /**
     * @cfg {ol.Style}
     * An OpenLayers 3 style object to style the vector #layer representing
     * the features of this store
     */
    style: null,
    /**
     * @cfg {ol.Collection<ol.Feature>}
     * Initial set of features. Has to be an ol.Collection object with
     * ol.Feature objects in it.
     */
    features: null,
    /**
     * @private
     */
    constructor: function(config) {
        var me = this,
            cfg = config || {};
        if (me.style === null) {
            me.style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    })
                })
            });
        }
        if (cfg.features) {
            cfg.data = cfg.features;
        } else if (cfg.layer && cfg.layer instanceof ol.layer.Vector) {
            if (cfg.layer.getSource()) {
                cfg.data = cfg.layer.getSource().getFeatures();
            } else {
                cfg.data = [];
            }
        }
        me.callParent([
            cfg
        ]);
        // create a vector layer and add to map if configured accordingly
        if (me.createLayer === true && !me.layer) {
            me.drawFeaturesOnMap();
        }
    },
    /**
     * Returns the FeatureCollection which is in sync with this store.
     *
     * @returns {ol.Collection<ol.Featrues>}
     *   The underlying OpenLayers FeatureCollection
     */
    getFeatures: function() {
        return this.olCollection;
    },
    /**
     * @protected
     *
     * Overwrites the destroy function to ensure the #layer is removed from
     * the #map when it has been created automatically while construction in
     * case of destruction of this store.
     */
    destroy: function() {
        var me = this;
        if (me.map && me.layerCreated === true) {
            me.map.removeLayer(me.layer);
        }
        me.callParent(arguments);
    },
    /**
     * @private
     *
     * Draws the given #features on the #map
     */
    drawFeaturesOnMap: function() {
        var me = this;
        // create a layer representation of our features
        me.source = new ol.source.Vector({
            features: me.getFeatures()
        });
        me.layer = new ol.layer.Vector({
            source: me.source,
            style: me.style
        });
        // add layer to connected map, if available
        if (me.map) {
            me.map.addLayer(me.layer);
        }
        me.layerCreated = true;
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * @class
 */
Ext.define('GeoExt.panel.Popup', {
    requires: [],
    extend: 'Ext.panel.Panel',
    alias: [
        'widget.gx_popup',
        'widget.gx_panel_popup'
    ],
    config: {
        /**
         *
         */
        overlay: null,
        /**
         *
         */
        map: null
    },
    /**
     * @private
     */
    overlayElement: null,
    /**
     * @private
     */
    overlayElementCreated: false,
    /**
     *
     */
    cls: 'gx-popup',
    /**
     * @private
     */
    constructor: function(config) {
        var me = this,
            cfg = config || {},
            overlayElement;
        if (!Ext.isDefined(cfg.map)) {
            Ext.Error.raise("Required configuration 'map' not passed");
        }
        if (Ext.isDefined(cfg.renderTo)) {
            // use the passed element/string
            overlayElement = Ext.get(cfg.renderTo).dom;
        } else {
            // create a div we can reference in
            // order to bind this div to an ol overlay
            overlayElement = Ext.dom.Helper.append(Ext.getBody(), '<div>');
            // keep track of the fact that we created the element, we should
            // also clean it up once we are being destroyed.
            me.overlayElementCreated = true;
        }
        cfg.renderTo = overlayElement;
        me.overlayElement = overlayElement;
        me.callParent([
            cfg
        ]);
    },
    /**
     * @private
     */
    initComponent: function() {
        var me = this;
        me.on({
            afterrender: me.setOverlayElement,
            beforedestroy: me.onBeforeDestroy,
            scope: me
        });
        me.callParent();
        me.setupOverlay();
    },
    /**
     * @private
     */
    setupOverlay: function() {
        var me = this;
        var overlay = new ol.Overlay({
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });
        me.getMap().addOverlay(overlay);
        // fix layout of popup when its position changes
        overlay.on('change:position', me.doLayout, me);
        // make accessible as member
        me.setOverlay(overlay);
    },
    /**
     * @private
     */
    setOverlayElement: function() {
        // bind our containing div to the ol overlay
        this.getOverlay().set('element', this.overlayElement);
    },
    /**
     * (Re-)Positions the popup to the given coordinates.
     */
    position: function(coordinate) {
        var me = this;
        me.getOverlay().setPosition(coordinate);
    },
    /**
     * @private
     */
    onBeforeDestroy: function() {
        var me = this;
        if (me.overlayElementCreated && me.overlayElement) {
            var parent = me.overlayElement.parentNode;
            parent.removeChild(me.overlayElement);
        }
        me.getOverlay().un('change:position', me.doLayout, me);
    }
});

/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * An Ext.tree.Panel.
 *
 * Example:
 *
 *     var mapComponent = Ext.create('GeoExt.component.Map', {
 *         map: new ol.Map({
 *             layers: [layer],
 *             view: new ol.View({
 *                 center: [0, 0],
 *                 zoom: 2
 *             })
 *         })
 *     });
 *
 *     var mapPanel = Ext.create('Ext.panel.Panel', {
 *         title: 'GeoExt.component.Map Example',
 *         width: 800,
 *         height: 600,
 *         items: [mapComponent],
 *         renderTo: 'mapDiv' // ID of the target <div>. Optional.
 *     });
 *
 *     var treeStore = Ext.create('GeoExt.data.TreeStore', {
 *         model: 'GeoExt.data.TreeModel',
 *         layerStore: mapPanel.getStore()
 *     });
 *
 *     var treePanel = Ext.create('GeoExt.tree.Panel', {
 *         title: 'treePanel',
 *         width: 400,
 *         height: 600,
 *         store: treeStore,
 *         renderTo: 'treeDiv', // ID of the target <div>. Optional.
 *         rootVisible: false
 *     });
 * @class GeoExt.tree.Panel
 */
Ext.define('GeoExt.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: [
        "widget.gx_treepanel",
        "widget.gx_tree_panel"
    ],
    initComponent: function() {
        var me = this;
        me.callParent();
    }
});

