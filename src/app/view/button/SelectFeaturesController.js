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
 * @class Koala.view.button.SelectFeaturesController
 */
Ext.define('Koala.view.button.SelectFeaturesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-selectfeatures',
    requires: [
        'BasiGX.util.Map',
        'Koala.util.Object',
        'Koala.util.Layer',
        'Koala.util.SelectFeatures'
    ],

    isActive: false,
    mapComponent: null,
    dragBoxInteraction: null,
    singleClickListener: null,
    selectionLayer: null,
    legendTree: null,
    layerToSelectOn: null,
    clearKeyListener: null,
    shiftSelectKeyListener: null,
    shiftKeyPressed: false,
    ctrlKeyPressed: false,

    /**
     * Handler when the select features button is toggled
     * @param {object} btn The button that has been pressed
     */
    onToggle: function(btn, pressed) {
        this.setupSelectionLayer();
        this.isActive = pressed;
        if (this.isActive) {
            this.enableSelectControl();
        } else {
            this.disableSelectControl();
        }
    },

    /**
     *
     */
    setupSelectionLayer: function() {
        if (!this.mapComponent) {
            this.mapComponent = BasiGX.util.Map.getMapComponent('k-component-map');
        }

        if (!this.selectionLayer) {
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            this.selectionLayer = new ol.layer.Vector({
                source: new ol.source.Vector,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: [255, 0, 0, 0.5]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [255, 0, 0, 0.5],
                        width: 3
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: [255, 0, 0, 0.5]
                        })
                    })
                })
            });
            this.selectionLayer.set(displayInLayerSwitcherKey, false);
            this.mapComponent.map.addLayer(this.selectionLayer);
            var mainVm = Ext.ComponentQuery.query('app-main')[0].getViewModel();
            mainVm.set('selectedFeaturesLayer', this.selectionLayer);
        }
    },

    /**
     * Handles the activation of interactions to select features
     */
    enableSelectControl: function() {
        var viewModel = this.getViewModel();
        if (!this.legendTree) {
            this.legendTree = Ext.ComponentQuery.query(
                'k-panel-routing-legendtree, k-panel-mobilelegend > treelist')[0];
        }

        var selection = this.legendTree.getSelection();
        if (selection.length !== 1) {
            Ext.Msg.alert(
                viewModel.get('error'),
                viewModel.get('noSingleActiveLayerFound')
            );
            this.getView().setPressed(false);
            return;
        }

        if (!this.mapComponent) {
            this.mapComponent = BasiGX.util.Map.getMapComponent('k-component-map');
        }

        if (!this.dragBoxInteraction) {
            this.dragBoxInteraction = new ol.interaction.DragBox({
                condition: function() {
                    return this.ctrlKeyPressed;
                }.bind(this)
            });
            this.mapComponent.map.addInteraction(this.dragBoxInteraction);
        }
        if (!this.singleClickListener) {
            this.singleClickListener = this.mapComponent.map.on(
                'click', this.singleSelect.bind(this));
        }
        this.dragBoxInteraction.setActive(true);
        this.dragBoxInteraction.on('boxend', this.boxEnd, this);
        this.dragBoxInteraction.on('boxstart', this.boxStart, this);

        // disable maps dragzoom control (shift + mousedrag) and double click zoom
        this.mapComponent.map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom ||
                interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(false);
            }
        });

        // disable the hover plugin as it interferes with selections
        var hoverPlugin = this.mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.getCmp().setPointerRest(false);
        }

        // register the cleanup key listener
        window.addEventListener('keydown', this.keydownHandler, true);
        window.addEventListener('keyup', this.keyupHandler, true);
    },

    /**
     * Handles the deactivation and reactivation of interactions
     * and clears the selected features
     */
    disableSelectControl: function() {
        if (this.dragBoxInteraction) {
            this.dragBoxInteraction.setActive(false);
        }
        if (this.singleClickListener) {
            this.mapComponent.map.un('click', this.singleSelect);
        }
        if (this.selectionLayer) {
            this.selectionLayer.getSource().clear();
        }
        // enable maps dragzoom control (shift + mousedrag) and double click zoom
        this.mapComponent.map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DoubleClickZoom ||
                interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(true);
            }
        });

        // reenable the hover plugin
        var hoverPlugin = this.mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.getCmp().setPointerRest(true);
        }

        // disable keylistener
        window.removeEventListener('keydown', this.keydownHandler, true);
        window.removeEventListener('keyup', this.keyupHandler, true);
    },

    /**
     * Handler called for keydown events to check for shift selections
     * and cleanupKey
     * @param {Event} event The browser event
     */
    keydownHandler: function(event) {
        var me = Ext.ComponentQuery.query(
            'k-button-selectfeatures')[0].getController();
        var key = event.key.toLowerCase();
        if (key === 'escape') {
            me.selectionLayer.getSource().clear();
        } else if (key === 'shift') {
            me.shiftKeyPressed = true;
        } else if (key === 'control') {
            me.ctrlKeyPressed = true;
        }
    },

    /**
     * Handler called for keyup events to check for shift selections
     * @param {Event} event The browser event
     */
    keyupHandler: function(event) {
        var me = Ext.ComponentQuery.query(
            'k-button-selectfeatures')[0].getController();
        var key = event.key.toLowerCase();
        if (key === 'shift') {
            me.shiftKeyPressed = false;
        } else if (key === 'control') {
            me.ctrlKeyPressed = false;
        }
    },

    /**
     * Handler called when features get selected by single click
     */
    singleSelect: function(e) {
        this.mapComponent.setLoading(true);
        this.determineLayerToSelectOn();
        // mockup a bbox with a resolution dependent buffer
        var buffer = this.mapComponent.map.getView().getResolution() * 5;
        var extent = [];
        extent.push(
            e.coordinate[0],
            e.coordinate[1],
            e.coordinate[0],
            e.coordinate[1]
        );
        extent[0] = extent[0] - buffer;
        extent[1] = extent[1] - buffer;
        extent[2] = extent[2] + buffer;
        extent[3] = extent[3] + buffer;

        if (this.layerToSelectOn instanceof ol.layer.Vector) {
            Koala.util.SelectFeatures.getFeaturesFromVectorLayerByBbox(
                this.layerToSelectOn,
                this.selectionLayer,
                extent
            );
            this.mapComponent.setLoading(false);
        } else {
            Koala.util.SelectFeatures.getFeaturesFromWmsLayerByBbox(
                this.layerToSelectOn,
                this.selectionLayer,
                extent
            );
        }
    },

    /**
     * Handler after a box drawing has been finished
     */
    boxEnd: function() {
        this.mapComponent.setLoading(true);
        var extent = this.dragBoxInteraction.getGeometry().getExtent();
        if (this.layerToSelectOn instanceof ol.layer.Vector) {
            Koala.util.SelectFeatures.getFeaturesFromVectorLayerByBbox(
                this.layerToSelectOn,
                this.selectionLayer,
                extent
            );
            this.mapComponent.setLoading(false);
        } else {
            Koala.util.SelectFeatures.getFeaturesFromWmsLayerByBbox(
                this.layerToSelectOn,
                this.selectionLayer,
                extent
            );
        }

    },

    /**
     * Method sets the currently selected layer from the tree as the candidate
     * on which selection shall happen
     */
    determineLayerToSelectOn: function() {
        var viewModel = this.getViewModel();
        var selection = this.legendTree.getSelection();
        if (selection.length !== 1) {
            Ext.Msg.alert(
                viewModel.get('error'),
                viewModel.get('noSingleActiveLayerFound')
            );
            this.getView().setPressed(false);
            this.mapComponent.setLoading(false);
            return;
        }
        this.layerToSelectOn = selection[0].getOlLayer();
    },

    /**
     * Handler when a box drawing starts
     */
    boxStart: function() {
        this.determineLayerToSelectOn();
    }

});
