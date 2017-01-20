/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * Permalink FormPanel
 *
 * Used to show a permalink of the mapstate (center, zoom, visible layers)
 *
 * @class Koala.view.form.Permalink
 */
Ext.define("Koala.view.form.Permalink", {
    extend: "BasiGX.view.form.Permalink",

    xtype: 'k-form-permalink',

    requires: [
        'Koala.view.form.PermalinkModel',

        'Koala.util.Routing'
    ],

    viewModel: {
        type: "k-form-permalink"
    },

    items: [{
        xtype: 'textfield',
        name: 'textfield-permalink',
        editable: false,
        listeners: {
            afterrender: function(textfield){
                var permalink = textfield.up('form').getPermalink();
                textfield.setValue(permalink);
            },
            change: function(textfield){
                var width = Ext.util.TextMetrics.measure(
                    textfield.getEl(), textfield.getValue()).width;
                textfield.setWidth(width + 20);
            }
        }
    }],

    getPermalink: function(){
        var route = Koala.util.Routing.getRoute();
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        return permalink;
    }

});
