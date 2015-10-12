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
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * AddWms Button
 *
 * Button used to instanciate the base-form-addwms in order to add a
 * WMS to the map
 *
 */
Ext.define("Basepackage.view.button.AddWms", {
    extend: "Ext.button.Button",
    xtype: 'base-button-addwms',

    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.AddWms',
        'Basepackage.util.Animate'
    ],

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    /**
    *
    */
   handler: function(){
       var win = Ext.ComponentQuery.query('[name=add-wms-window]')[0];
       if(!win){
           Ext.create('Ext.window.Window', {
               name: 'add-wms-window',
               title: 'WMS hinzufügen',
               width: 500,
               height: 400,
               layout: 'fit',
               items: [{
                   xtype: 'base-form-addwms'
               }]
           }).show();
       } else {
           Basepackage.util.Animate.shake(win);
       }
   },

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'WMS hinzufügen…',
            text: 'WMS <span style="font-size: 1.7em; ' +
                'font-weight: normal;">⊕</span>'
        }
    }
});
