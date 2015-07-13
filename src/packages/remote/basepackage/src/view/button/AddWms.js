/*global Ext, ol*/
/*jshint curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80*/
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
Ext.define("Basepackage.view.button.AddWms",{
    extend: "Ext.button.Button",
    xtype: 'base-button-addwms',

    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.AddWms'
    ],

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    /**
     *
     */
    handler: function(){
        Ext.create('Ext.window.Window', {
            title: 'WMS hinzufügen',
            width: 500,
            height: 400,
            layout: 'fit',
            items: [
                {
                    xtype: 'base-form-addwms'
                }
            ]
        }).show();
    },

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'WMS hinzufügen…',
            text: 'WMS <span style="font-size: 1.7em; '+
                'font-weight: normal;">⊕</span>'
        }
    }
});
