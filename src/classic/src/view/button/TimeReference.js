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
 * @class Koala.view.button.TimeReference
 */
Ext.define("Koala.view.button.TimeReference", {
    extend: "Ext.button.Button",
    xtype: "k-button-timereference",

    statics: {
        UTC: 'UTC',
        LOCAL: 'local'
    },

    requires: [
        "Koala.view.button.TimeReferenceController",
        "Koala.view.button.TimeReferenceModel"
    ],

    controller: "k-button-timereference",
    viewModel: {
        type: "k-button-timereference"
    },

    enableToggle: true,

    listeners: {
        afterrender: 'setTextBinds',
        toggle: 'setTextBinds'
    },

    config: {
        pressed: true
    },

    /**
     *
     */
    getCurrent: function(){
        var staticMe = Koala.view.button.TimeReference;
        return this.pressed ? staticMe.UTC : staticMe.LOCAL;
    }
});
