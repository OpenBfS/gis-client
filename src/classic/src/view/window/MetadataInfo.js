Ext.define("Koala.view.window.MetadataInfo",{
    extend: "Ext.window.Window",

    requires: [
        "Koala.view.window.MetadataInfoController",
        "Koala.view.window.MetadataInfoModel"
    ],

    controller: "k-window-metadatainfo",
    viewModel: {
        type: "k-window-metadatainfo"
    },

    config: {
        propertyGrid: null,
        record: null
    },

    initComponent: function(cfg){
        var me = this;
        me.callParent(cfg);

        me.setPropertyGrid(Ext.create('Ext.grid.property.Grid', {
            width: 400,
            listeners : {
                'beforeedit' : function() {
                    return false;
                },
                'celldblclick': function(propGrid, td, cellIndex, record, tr, rowIndex, e, eOpts){
                    Ext.Msg.alert(record.get('name'), record.get('value'));
                }
            },
            source: {
                "Typ": me.getRecord().get('type'),
                "Name": me.getRecord().get('name'),
                "ID": me.getRecord().get('fileIdentifier'),
                "Abstract": me.getRecord().get('abstract'),
                "Servicetyp": me.getRecord().get('serviceType'),
                "Quelle": me.getRecord().get('source'),
                "Kontakt": me.getRecord().get('contact')
            }
        }));
        me.add(me.getPropertyGrid());
    }
});
