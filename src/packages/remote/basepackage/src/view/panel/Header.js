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
 * Header Panel
 * 
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 * 
 */
Ext.define("Basepackage.view.panel.Header",{
    extend: "Ext.panel.Panel",
    xtype: "base-panel-header",

    requires: [
        "Ext.Img"
    ],

    config: {
        addLogo: true,
        logoUrl: 'resources/images/logo.png',
        logoAltText: 'Logo',
        logoHeight: 80,
        logoWidth: 200,
        additionalItems: []
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: 5,

    cls: 'basepackage-header',


    items: [],

    /**
    *
    */
    initComponent: function() {
        var me = this;

        // add logo
        if(me.getAddLogo() === true) {
            me.addLogoItem();
        }

        var additionalItems = me.getAdditionalItems();
        // add additional items
        if(!Ext.isEmpty(additionalItems) &&
                Ext.isArray(additionalItems)) {
            Ext.each(additionalItems, function(item) {
                me.items.push(item);
            });
        }

        me.callParent();
    },

    /**
     *
     */
    addLogoItem: function() {
        var me = this;
        var logo = {
            xtype: 'image',
            margin: '0 50px',
            alt: me.getLogoAltText(),
            src: me.getLogoUrl(),
            height: me.getLogoHeight(),
            width: me.getLogoWidth()
        };

        me.items.push(logo);
   }
});
