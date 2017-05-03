/* Copyright (c) 2017 Bundesamt fuer Strahlenschutz
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
 * Header Panel
 *
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 *
 * @class Koala.view.panel.Header
 */
Ext.define('Koala.view.panel.Header', {
    extend: 'Ext.panel.Panel',
    xtype: 'k-panel-header',

    requires: [
        'Koala.view.panel.HeaderController',
        'Koala.view.panel.HeaderModel',

        'Ext.Img'
    ],

    controller: 'k-panel-header',
    viewModel: {
        type: 'k-panel-header'
    },

    config: {
        addLogo: true,
        logoUrl: 'resources/images/logo.png',
        link: 'http://www.bfs.de/DE/home/home_node.html',
        logoAltText: 'Logo',
        logoHeight: 80,
        logoWidth: 200,
        logoMargin: '0 50px',
        additionalItems: []
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: 5,

    cls: 'basigx-header',


    items: [],

    /**
     * Initializes this header panel.
     */
    initComponent: function() {
        var me = this;

        var additionalItems = me.getAdditionalItems();
        // add additional items
        if (!Ext.isEmpty(additionalItems) &&
                Ext.isArray(additionalItems)) {
            Ext.each(additionalItems, function(item) {
                me.items.push(item);
            });
        }

        // add logo
        if (me.getAddLogo() === true) {
            me.addLogoItem();
        }

        me.callParent();
    },

    /**
     * Adds a `Ext.Img` to the list of items in this panel.
     */
    addLogoItem: function() {
        var me = this;
        var logo = {
            xtype: 'image',
            margin: me.getLogoMargin(),
            alt: me.getLogoAltText(),
            src: me.getLogoUrl(),
            height: me.getLogoHeight(),
            width: me.getLogoWidth(),
            bind: {
                title: '{logoTooltip}'
            },
            autoEl: {
                tag: 'a',
                href: me.getLink(),
                target: '_blank'
            }
        };

        me.items.push(logo);
    },

    /**
     * Adds a background gradient from white to the passed color, with a full
     * opaque variant as fallback for IE 9.
     *
     * @param {String} color A CSS color.
     */
    setBackgroundColor: function(color) {
        this.setStyle({
            'background-color': color, //fallback for ie9 and lower
            'background': 'linear-gradient(to right, white, ' + color + ')'
        });
    }
});
