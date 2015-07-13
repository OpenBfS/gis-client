Ext.define("Koala.view.panel.LayerSetChooser",{
    extend: "Ext.panel.Panel",
    xtype: 'k-panel-layersetchooser',

    requires: [
        "Koala.view.panel.LayerSetChooserController",
        "Koala.view.panel.LayerSetChooserModel",

        "Koala.view.view.LayerSet"
    ],

    controller: "k-panel-layersetchooser",
    viewModel: {
        type: "k-panel-layersetchooser"
    },

    bind: {
        title: '{title}'
    },

    hidden: true,
    region: 'center',
    layout: 'fit',

    minWidth: 150,
    minHeight: 170,
    
    id: 'img-chooser-dlg',

    items:{
        xtype: 'k-view-layerset',
        scrollable: true,
        id: 'img-chooser-view',
        listeners: {
            itemdblclick: 'onLayerSetDblClick'
        }
    },

    bbar: [
       {
           xtype: 'textfield',
           name : 'filter',
           fieldLabel: 'Filter',
           labelAlign: 'left',
           labelWidth: 45,
           flex: 1,
           listeners: {
               buffer: 200,
               change: 'filterLayerSetsByText'
           }
       }
    ],
    
    listeners: {
        afterrender: 'registerMenuBehaviour'
    }
});
