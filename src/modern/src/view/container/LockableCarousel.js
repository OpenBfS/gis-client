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
 * @class Koala.view.container.LockableCarousel
 */
Ext.define('Koala.view.container.LockableCarousel', {
    extend: 'Ext.Carousel',

    xtype: 'lockable-carousel',

    locked: false,

    initialize: function() {
        this.onDragOrig = this.onDrag;
        this.onDrag = function(e) {
            // we need to skip the first drag event in order to prevent swipe
            // since we use the itemtouch* events in the mobile main controller
            // and event.preventDefault/stopPropagation don't seem to help us
            if (this.locked === 1) {
                this.locked = false;
                return;
            }
            if (!this.locked) {
                this.onDragOrig(e);
            }
        };
    },

    lock: function() {
        this.locked = true;
    },

    unlock: function() {
        this.locked = 1;
    }
});
