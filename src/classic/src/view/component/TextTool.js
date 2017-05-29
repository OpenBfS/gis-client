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
 * @class Koala.view.component.TextTool
 */
Ext.define('Koala.view.component.TextTool', {
    extend: 'Ext.Component',
    xtype: 'k-component-texttool',

    /**
     * The `type` of the tool that this TextTool is connected to. A tool with
     * this `type` should be added to the father panel.
     *
     * @cfg {String}
     */
    connectedToolType: '',

    /**
     * The `selector` to find the panel that this Textool (usually in a header)
     * is a child of. The default, `'panel'`, will be correct for the 'regular'
     * usecase.
     *
     * @cfg {String}
     */
    fatherSelector: 'panel',

    /**
     * Th class that we will add to the element when the mose ids hovering over
     * the component
     *
     * @cfg {String}
     */
    mouseOverTextCls: 'k-over-clickable',

    toolEl: null,

    /**
     * Initializes the TextTool component.
     */
    initComponent: function() {
        var me = this;
        me.callParent();
        me.on({
            afterrender: me.registerEventListeners,
            beforedestroy: me.unregisterEventListeners,
            scope: me
        });
    },

    /**
     * Registers the click handler that triggers the Tool's action and some
     * otherhandlers on our element and the connected tool element (mainly
     * for hovering).
     *
     * @private
     */
    registerEventListeners: function() {
        var me = this;
        var el = me.getEl();
        el.on('click', me.handleTextToolClick, me);
        me.bindOwnHoverHandlers();
        me.bindToolHoverHandlers();
    },

    /**
     * Unregisters the click handler that triggers the Tool's action and some
     * other handlers on our element and the connected tool element (mainly
     * for hovering).
     *
     * @private
     */
    unregisterEventListeners: function() {
        var me = this;
        var el = me.getEl();
        el.un('click', me.handleTextToolClick, me);
        me.unbindOwnHoverHandlers();
        me.unbindToolHoverHandlers();
        me.toolEl = null; // nullify the reference to the tool's element
    },

    /**
     * Binds the `mouseover`/`mouseout` handlers of our HTML element.
     *
     * @private
     */
    bindOwnHoverHandlers: function() {
        var me = this;
        var el = me.getEl();
        el.on({
            mouseover: me.addHoverCls,
            mouseout: me.removeHoverCls,
            scope: me
        });
    },

    /**
     * Unbinds the `mouseover`/`mouseout` handlers of our HTML element.
     *
     * @private
     */
    unbindOwnHoverHandlers: function() {
        var me = this;
        var el = me.getEl();
        el.un({
            mouseover: me.addHoverCls,
            mouseout: me.removeHoverCls,
            scope: me
        });
    },

    /**
     * Binds the `mouseover`/`mouseout` handlers of the connected tool's HTML
     * element.
     *
     * @private
     */
    bindToolHoverHandlers: function() {
        var me = this;
        var father = me.up(me.fatherSelector);
        var selector = 'tool[type="' + me.connectedToolType + '"]';
        var tool = father.down(selector);
        tool.on('afterrender', function(toolComponent) {
            var toolEl = toolComponent.getEl();
            toolEl.on({
                mouseover: me.addHoverCls,
                mouseout: me.removeHoverCls,
                scope: me
            });
            me.toolEl = toolEl; // store it so we can unbind later
        }, me);
    },

    /**
     * Unbinds the `mouseover`/`mouseout` handlers of the connected tool's HTML
     * element.
     *
     * @private
     */
    unbindToolHoverHandlers: function() {
        var me = this;
        var toolEl = me.toolEl; // this is set in #bindToolHoverHandlers
        if (toolEl) {
            toolEl.un({
                mouseover: me.addHoverCls,
                mouseout: me.removeHoverCls,
                scope: me
            });
        }
    },

    /**
     * Adds the #mouseOverTextCls to the HTML element of the TextTool.
     *
     * @private
     */
    addHoverCls: function() {
        this.getEl().addCls(this.mouseOverTextCls);
    },

    /**
     * Removes the #mouseOverTextCls to the HTML element of the TextTool.
     *
     * @private
     */
    removeHoverCls: function() {
        this.getEl().removeCls(this.mouseOverTextCls);
    },

    /**
     * This method (bound as click listnerer for the TextTools element) triggers
     * the handler method of the connected tool.
     *
     * This is only tested with a 'named' handler, which must be resolved from
     * a controller first. Inline handlers must be tested separately.
     *
     * @param {Ext.event.Event} evt The ExtJS (i.e. wrapped native) event.
     * @private
     */
    handleTextToolClick: function(evt) {
        evt.stopEvent();
        var me = this;
        var father = me.up(me.fatherSelector);
        var selector = 'tool[type="' + me.connectedToolType + '"]';
        var tool = father.down(selector);
        var handler = tool.handler;
        var ctrl = tool.getController() || father.getController();
        if (handler in ctrl) {
            ctrl[handler].call(ctrl);
        }
        return false;
    }
});
