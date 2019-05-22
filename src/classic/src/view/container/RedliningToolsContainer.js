/* Copyright (c) 2016-present terrestris
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
 * Container containing the redlining tools for the temporary drawing in the
 * client.
 *
 * @class Koala.view.container.RedliningToolsContainer
 */
Ext.define('Koala.view.container.RedliningToolsContainer', {
    extend: 'Ext.container.Container',

    xtype: 'k-container-redliningtoolscontainer',

    requires: [
        'Ext.button.Button',

        'Koala.view.container.RedliningToolsContainerController',
        'Koala.view.container.RedliningToolsContainerModel'
    ],

    viewModel: 'k-container-redliningtoolscontainer',

    controller: 'k-container-redliningtoolscontainer',

    width: 300,

    map: null,

    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     */
    helpTooltip: null,

    /**
     * The help tooltip element.
     * @type {Element}
     */
    helpTooltipElement: null,

    /**
     * The measure tooltip element.
     * @type {Element}
     */
    measureTooltipElement: null,

    /**
     * Overlay to show the measurement.
     * @type {ol.Overlay}
    */
    measureTooltip: null,

    defaults: {
        xtype: 'button',
        scale: 'large',
        ui: 'default-toolbar',
        margin: '0 0 10px 10px'
    },

    items: [{
        name: 'drawPointsBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawPointBtnTooltip}'
        },
        glyph: 'xf100@Flaticon',
        listeners: {
            toggle: 'onDrawPointsBtnToggle'
        }
    }, {
        name: 'drawLinesBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawLinesBtnTooltip}'
        },
        glyph: 'xf104@Flaticon',
        listeners: {
            toggle: 'onDrawLinesBtnToggle'
        }
    }, {
        name: 'drawPolygonsBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawPolygonsBtnTooltip}'
        },
        glyph: 'xf107@Flaticon',
        listeners: {
            toggle: 'onDrawPolygonsBtnToggle'
        }
    }, {
        name: 'modifyObjectBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{modifyObjectBtnTooltip}'
        },
        glyph: 'xf044@FontAwesome',
        listeners: {
            toggle: 'onModifyObjectBtnToggle'
        }
    }, {
        name: 'deleteObjectBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{deleteObjectBtnTooltip}'
        },
        glyph: 'xf12d@FontAwesome',
        listeners: {
            toggle: 'onDeleteObjectBtnToggle'
        }
    }, {
        name: 'clearObjectsBtn',
        bind: {
            tooltip: '{clearObjectsBtnTooltip}'
        },
        glyph: 'f2ed@FontAwesome',
        handler: 'onClearObjectsBtn'
    }],

    /**
     * @event redliningchanged
     * An event that fires everytime a feature is added, deleted, moved or
     * modified.
     * @param {Koala.view.container.RedliningToolsContainer} container
     *     The Redlining container.
     * @param {Object} state The current redlining state.
     */

    listeners: {
        boxready: 'onInit',
        added: 'onAdded',
        removed: 'onRemoved'
    },

    /**
     * Initializes this component
     */
    initComponent: function() {
        var me = this;
        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();
        me.callParent(arguments);

        me.createHelpTooltip();
        me.createMeasureTooltip();

        // var languageCombo = Ext.ComponentQuery.query(
        //     'k-form-field-languagecombo')[0];
        // var locale = languageCombo.getValue();
        // languageCombo.getController().requestLanguageFile(locale);
    },

    /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt
    */
    pointerMoveHandler: function(evt) {
        var me = this;
        var controller = me.getController();
        var viewModel = me.getViewModel();
        var continuePolygonMsg = viewModel.get('continuePolygonMsg');
        var continueLineMsg = viewModel.get('continueLineMsg');
        var helpMsg = viewModel.get('helpMsg');

        if (evt.dragging) {
            return;
        }

        if (controller.sketch) {
            var geom = controller.sketch.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }

        me.helpTooltipElement.innerHTML = helpMsg;
        me.helpTooltip.setPosition(evt.coordinate);
    },

    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip: function() {
        var me = this;
        if (me.measureTooltipElement) {
            me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement);
        }
        me.measureTooltipElement = document.createElement('div');
        me.measureTooltipElement.className = 'tooltip tooltip-measure';
        me.measureTooltip = new ol.Overlay({
            element: me.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        me.map.addOverlay(me.measureTooltip);
    },

    /**
    * Creates a new help tooltip
    */
    createHelpTooltip: function() {
        var me = this;
        if (me.helpTooltipElement) {
            me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement);
        }
        me.helpTooltipElement = document.createElement('div');
        me.helpTooltipElement.className = 'tooltip x-hidden';
        me.helpTooltip = new ol.Overlay({
            element: me.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        me.map.addOverlay(me.helpTooltip);
    }
});
