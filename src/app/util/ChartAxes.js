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
 * A utility class with chart manipulation functions regarding axes.
 *
 * @class Koala.util.ChartAxes
 */
Ext.define('Koala.util.ChartAxes', {

    requires: [
        'Koala.view.component.D3BaseController',
        'Koala.util.Date',
        'Koala.util.Object',
        'Koala.util.ChartConstants'
    ],

    statics: {

        showToggleScaleMenu: function(attachedSeries, chart, elm, label) {
            attachedSeries = JSON.parse(attachedSeries);
            var items = [chart.getAxes().left];
            items = items.concat(attachedSeries);
            var menuItems = [];
            var i = 0;
            var controller = chart.getController();

            Ext.each(items, function(axis, idx) {
                var text = axis.yAxisLabel;
                if (!text) {
                    text = label + ' ' + (++i);
                }
                menuItems.push({
                    text: text,
                    handler: function() {
                        if (idx === 0) {
                            controller.toggleScale();
                        } else {
                            controller.toggleScale('y' + (idx - 1));
                        }
                    }
                });
            });

            var menu = Ext.create({
                items: menuItems,
                xtype: 'menu'
            });
            if (elm) {
                menu.showBy(elm, 'tl');
            } else {
                Ext.Viewport.setMenu(menu, {
                    side: 'right'
                });
                Ext.Viewport.showMenu('right');
            }
        }

    }

});
