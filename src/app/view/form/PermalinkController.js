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
 * @class Koala.view.form.PermalinkController
 */
Ext.define('Koala.view.form.PermalinkController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-permalink',

    requires: [
        'BasiGX.util.CopyClipboard',

        'Koala.util.Routing'
    ],

    /**
     *
     */
    onPermalinkTextAreaAfterRender: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var skipLayerFilters = viewModel.get('applyFilterCheckboxValue');

        me.updatePermalink(!skipLayerFilters);
    },

    /**
     *
     */
    onRefreshButtonClick: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var skipLayerFilters = viewModel.get('applyFilterCheckboxValue');

        me.updatePermalink(!skipLayerFilters);
    },

    /**
     *
     */
    onApplyFilterCheckboxChange: function(comp, newVal) {
        var me = this;

        me.updatePermalink(!newVal);
    },

    /**
     *
     */
    updatePermalink: function(skipLayerFilter) {
        var me = this;
        var viewModel = me.getViewModel();
        var permalink = me.getPermalink(skipLayerFilter);

        viewModel.set('permalinkValue', permalink);
    },

    /**
     *
     */
    onCopyToClipboardButtonBoxReady: function(btn) {
        btn.setHidden(!BasiGX.util.CopyClipboard.copyToClipboardSupported);
    },

    /**
     *
     */
    onCopyToClipboardButtonClick: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var permalink = viewModel.get('permalinkValue');

        BasiGX.util.CopyClipboard.copyTextToClipboard(permalink);
        Ext.ComponentQuery.query('[name=permalink-window]')[0].close();
    },

    /**
     *
     */
    getPermalink: function(skipLayerFilters) {
        var route = Koala.util.Routing.getRoute(false, skipLayerFilters);
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;

        return permalink;
    }
});
