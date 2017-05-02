/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.button.toggleFullscreen
 */
Ext.define('Koala.view.button.toggleFullscreen', {
    extend: 'Ext.Button',
    xtype: 'k-button-togglefullscreen',

    requires: [
        'Koala.view.button.toggleFullscreenController',
        'Koala.view.button.toggleFullscreenModel'
    ],

    controller: 'k-button-togglefullscreen',
    viewModel: {
        type: 'k-button-togglefullscreen'
    },

    glyph: 'xf065@FontAwesome',

    scale: 'large',

    enableToggle: true,

    bind: {
        text: null,
        tooltip: '{tooltip}'
    },

    initComponent: function() {
        var me = this;
        var browserPrefixes = ['', 'webkit', 'moz', 'ms'];

        Ext.each(browserPrefixes, function(browserPrefix) {
            var event = browserPrefix + 'fullscreenchange';
            document.addEventListener(event, function() {
                var fullscreen = Koala.util.Fullscreen.isInFullscreen();
                var glyphCode = fullscreen ? 'xf066' : 'xf065';
                me.setGlyph(glyphCode + '@FontAwesome');
            });
        });
    },

    listeners: {
        toggle: 'onToggle'
    }

});
