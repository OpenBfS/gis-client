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
 * Menu Panel
 * 
 * Used to show a menu containing different panels of your choice, e.g.
 * the print form panel
 * 
 */
Ext.define("Basepackage.view.panel.Menu",{
    extend: "Ext.panel.Panel",
    xtype: "base-panel-menu",

    requires: [
        "Ext.layout.container.Accordion",
        "Basepackage.view.form.Print",
        "Basepackage.view.button.AddWms"
    ],

    viewModel: {
        data: {
            closedMenuTitle: 'Menu schließen',
            openedMenuTitle: 'Menu anzeigen'
        }
    },

    defaultListenerScope: true,

    headerPosition: 'bottom',

    collapsible: true,

    hideCollapseTool: true,

    titleCollapse: true,

    titleAlign: 'center',

    activeItem: 1,

    defaults: {
        // applied to each contained panel
        hideCollapseTool: true,
        titleCollapse: true
    },

    layout: {
        // layout-specific configs go here
        type: 'accordion',
        titleCollapse: false,
        animate: true
    },

    items: [],

    listeners: {
        collapse: 'setTitleAccordingToCollapsedState',
        expand: 'setTitleAccordingToCollapsedState',
        afterrender: 'setTitleAccordingToCollapsedState'
    },

    setTitleAccordingToCollapsedState: function(menu){
        if (menu.getCollapsed() === false) {
            menu.setBind({
                title: '{closedMenuTitle}'
            });
        } else {
            menu.setBind({
                title: '{openedMenuTitle}'
            });
        }
    }
});
