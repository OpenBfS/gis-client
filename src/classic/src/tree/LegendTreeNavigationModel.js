/* Copyright (c) 2020-present terrestris GmbH & Co. KG
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
 * @class Koala.tree.NavigationModel
 * @private
 * This class listens for key events fired from a {@link Koala.view.panel.RoutingLegendTree RoutingLegendTree}, and moves the currently focused item
 * by adding the class {@link #focusCls}.
 *
 * Navigation and interactions are defined by http://www.w3.org/TR/2013/WD-wai-aria-practices-20130307/#TreeView
 * or, if there are multiple visible columns, by http://www.w3.org/TR/2013/WD-wai-aria-practices-20130307/#treegrid
 */
Ext.define('Koala.tree.LegendTreeNavigationModel', {
    extend: 'Ext.tree.NavigationModel',

    alias: 'view.navigation.legendtree',
    requires: 'Ext.tree.NavigationModel',

    /**
     * @private
     * Focuses the currently active position.
     * This is used on view refresh and on replace.
     * NOTE: this is just a copy of Ext.grid.NavigationModel, modified not to scroll to
     * the focused cell.
     * @return {undefined}
     */
    focusPosition: function(position) {
        var me = this,
            view,
            row;

        me.item = me.cell = null;
        if (position && position.record && position.column) {
            view = position.view;

            // If the position is passed from a grid event, the rowElement will be stamped into it.
            // Otherwise, select it from the indicated item.
            if (position.rowElement) {
                row = me.item = position.rowElement;
            } else {
                // Get the dataview item for the position's record
                row = view.getRowByRecord(position.record);
                // If there is no item at that index, it's probably because there's buffered rendering.
                // This is handled below.
            }
            if (row) {

                // If the position is passed from a grid event, the cellElement will be stamped into it.
                // Otherwise, select it from the row.
                me.cell = position.cellElement || Ext.fly(row).down(position.column.getCellSelector(), true);

                // Maintain the cell as a Flyweight to avoid transient elements ending up in the cache as full Ext.Elements.
                if (me.cell) {
                    me.cell = new Ext.dom.Fly(me.cell);

                    // Maintain lastFocused in the view so that on non-specific focus of the View, we can focus the view's correct descendant.
                    view.lastFocused = me.lastFocused = me.position.clone();
                    me.focusItem(me.cell);
                    view.focusEl = me.cell;
                } else { // Cell no longer in view. Clear current position.
                    me.position.setAll();
                    me.record = me.column = me.recordIndex = me.columnIndex = null;
                }
            // View node no longer in view. Clear current position.
            // Attempt to scroll to the record if it is in the store, but out of rendered range.
            } else {
                row = view.dataSource.indexOf(position.record);
                me.position.setAll();
                me.record = me.column = me.recordIndex = me.columnIndex = null;

                // The reason why the row could not be selected from the DOM could be because it's
                // out of rendered range, so scroll to the row, and then try focusing it.
                if (row !== -1 && view.bufferedRenderer) {
                    me.lastKeyEvent = null;
                    view.bufferedRenderer.scrollTo(row, false, me.afterBufferedScrollTo, me);
                }
            }
        }
    }

});
