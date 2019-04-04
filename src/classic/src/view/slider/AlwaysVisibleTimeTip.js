/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
Ext.define('Koala.view.slider.AlwaysVisibleTimeTip', {
    extend: 'Ext.slider.Tip',
    pluginId: 'k-time-tip',
    alias: 'plugin.k-time-tip',
    align: 't-b?',
    offsets: [0, 0],

    init: function(slider) {
        var me = this;
        me.callParent(arguments);
        slider.removeListener('dragend', me.hide);
        slider.on({
            scope: me,
            change: me.onSlide,
            afterrender: function() {
                me.intervalHandle = window.setInterval(function() {
                    if (!slider.isVisible()) {
                        window.clearInterval(me.intervalHandle);
                        try {
                            slider.destroy();
                        } catch (e) {
                            // ignore broken sliders
                        }
                    }
                    if (slider.destroyed || slider.destroying) {
                        return;
                    }
                    me.onSlide(slider, null, slider.thumbs[0]);
                }, 100);
            }
        });
    },

    getText: function(thumb) {
        var time = moment(thumb.value * 1000);
        time = Koala.util.Date.getTimeReferenceAwareMomentDate(time);
        return Koala.util.Date.getFormattedDate(time);
    },

    doDestroy: function() {
        window.clearInterval(this.intervalHandle);
        this.callParent();
    }

});
