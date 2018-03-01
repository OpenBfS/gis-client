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
 * Permalink FormPanel
 *
 * Used to show a permalink of the mapstate (center, zoom, visible layers)
 *
 * @class Koala.view.form.Permalink
 */
Ext.define('Koala.view.form.Permalink', {
    extend: 'BasiGX.view.form.Permalink',

    xtype: 'k-form-permalink',

    requires: [
        'Koala.view.form.PermalinkModel',

        'Koala.util.Routing'
    ],

    viewModel: {
        type: 'k-form-permalink'
    },

    items: [{
        xtype: 'textarea',
        name: 'textfield-permalink',
        editable: false,
        listeners: {
            afterrender: function(textarea) {
                var permalink = textarea.up('form').getPermalink();
                textarea.setValue(permalink);
            }
            /*,
            change: function(textfield) {
                var width = Ext.util.TextMetrics.measure(
                    textfield.getEl(), textfield.getValue()).width;
                textfield.setWidth(width + 20);
            }*/
        }
    }],

    buttons: [{
        bind: {
            text: '{refreshBtnText}'
        },
        handler: function(btn) {
            var permalink = btn.up('form').getPermalink();
            var textfield = btn.up('form').down('textfield');
            textfield.setValue(permalink);
        }
    }, {
        bind: {
            text: '{copyToClipboardBtnText}'
        },
        listeners: {
            boxready: function(btn) {
                btn.setHidden(
                    !BasiGX.util.CopyClipboard.copyToClipboardSupported);
            },
            initialize: function(btn) {
                btn.setHidden(
                    !BasiGX.util.CopyClipboard.copyToClipboardSupported);
            }
        },
        handler: function(btn) {
            var textfield = btn.up('form').down('textfield');
            var value = textfield.getValue();

            BasiGX.util.CopyClipboard.copyTextToClipboard(value);
            Ext.ComponentQuery.query('[name=permalink-window]')[0].close();
        }
    }],
    getPermalink: function() {
        var route = Koala.util.Routing.getRoute();
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        return permalink;
    }

});
