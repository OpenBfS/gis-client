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
 * @class Koala.view.panel.Header
 */
Ext.define("Koala.view.panel.Header", {
    extend: "Ext.panel.Panel",
    xtype: "k-panel-header",

    requires: [
        "Ext.Img",

        "Koala.view.form.field.LanguageCombo",
        "Koala.view.form.field.SearchCombo",
        "Koala.view.toolbar.Header"
    ],

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: 5,

    cls: 'koala-header',

    items: [
        {
            xtype: 'image',
            width: 200,
            margin: '0 50px',
            // TODO for some strange reason we cannot use bind here...
            alt: 'Logo Bundesamt für Strahlenschutz',
            height: 78,
            src: 'classic/resources/img/bfs-logo.png'
        },
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'left'
            },
            items: [
                {
                    xtype: 'k-form-field-searchcombo',
                    width: 500
                },
                {
                    xtype: 'button',
                    glyph: 'xf057@FontAwesome',
                    style: {
                        borderRadius: 0
                    },
                    handler: function(btn){
                        btn.up().down('k-form-field-searchcombo').clearValue();
                    }
                }
            ]
        },
        {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'right'
            },
            items: {
                xtype: 'k-toolbar-header'
            }
        }
    ]
});
