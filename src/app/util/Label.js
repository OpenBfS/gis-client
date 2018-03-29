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
 * @class Koala.util.Label
 */
Ext.define('Koala.util.Label', {

    statics: {

        /**
         * The buffer used for spacing between labels
         * @type {Number}
         */
        distanceBuffer: 20,

        /**
         * Determines if labels can be wrapped
         *
         * @param  {String} selector The selector containing the text elements
         * @param  {String} subSelector The subSelector for single text elements
         * @param  {Integer} leftPadding The amount of padding to the left,
         *     beginning from the second line. Needed for legends with images
         * @param  {Integer} lineHeight The lineHeight in em to use
         * @param {Boolean} ignoreNeighbors Flag indicating if neighbors should
         *     be respected. Should be false e.g. when used on an x-axis.
         */
        handleLabelWrap: function(selector, subSelector, leftPadding, lineHeight, ignoreNeighbors) {
            var node = d3.select(selector).node();
            if (!node) {
                return;
            }
            var width = node.getBoundingClientRect().width;
            var length;
            if (ignoreNeighbors) {
                length = width - Koala.util.Label.distanceBuffer - (leftPadding || 0);
            } else {
                var neighborCount = d3.selectAll(selector + (subSelector || ' > g > text')).size();
                length = width / neighborCount - Koala.util.Label.distanceBuffer - (leftPadding || 0);
            }
            d3.selectAll(selector + (subSelector || ' > g > text'))
                .call(Koala.util.Label.wordWrap, length, leftPadding, lineHeight);
        },

        /**
         * Handles word wrapping
         *
         * @param  {Object} textEl The text element collection
         * @param  {Integer} width The maximum width to use
         * @param  {Integer} leftPadding The amount of padding to the left
         * @param  {Integer} lineHeight The lineHeight in em to use
         */
        wordWrap: function(textEl, width, leftPadding, lineHeight) {
            textEl.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lh = lineHeight || 0.2, // ems
                    dy = parseFloat(text.attr('dy')),
                    tspan = text.text(null)
                        .append('tspan')
                        .attr('x', 0)
                        .attr('dy', dy + 'em');
                word = words.pop();
                var i = 0;
                while (word) {
                    line.push(word);
                    tspan.text(line.join(' '));
                    if (tspan.node().getComputedTextLength() > width) {
                        // keep the first line if it already does not fit,
                        // else replace current content
                        if (i !== 0) {
                            line.pop();
                            tspan.text(line.join(' '));
                            line = [word];
                            tspan = text.append('tspan')
                                .attr('x', i > 0 ? leftPadding || 0 : 0)
                                .attr('dy', lh + dy + 'em')
                                .text(word);
                        }
                    }
                    word = words.pop();
                    i++;
                }
            });
        },

        /**
         * Calculate the minimum legend width by extracting the width of the
         * biggest label.
         * @param  {String} id the id of the chart
         * @return {Number}    the length of the biggest legend label
         */
        getMinimumLegendWidth: function(id) {
            var max = 0;
            d3.selectAll(id + ' .k-d3-shape-group-legend text')
                .each(function() {
                    max = Math.max(this.getBBox().width, max);
                });
            return max;
        }
    }
});
