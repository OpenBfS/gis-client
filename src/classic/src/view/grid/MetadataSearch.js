Ext.define("Koala.view.grid.MetadataSearch",{
    extend: "Ext.grid.Panel",
    xtype: "k-grid-metadatasearch", 

    requires: [
        "Koala.view.grid.MetadataSearchController",
        "Koala.view.grid.MetadataSearchModel",

        "Koala.store.MetadataSearch"
    ],

    controller: "k-grid-metadatasearch",
    viewModel: {
        type: "k-grid-metadatasearch"
    },

    store: {
        type: 'k-metadatasearch'
    },

    bind: {
        title: '{metadataSearchTitle}'
    },

    features : [{
        id: 'group',
        ftype: 'grouping',
        groupHeaderTpl : [
            '{name:this.formatName}', {
            formatName : function(name) {
                if(name === "dataset") return "Daten";
                if(name === "series") return "Datenserie";
                if(name === "service") return "Dienst";
            }
        } ]
    }],

    hideHeaders: true,

    columns:{
        items:[{
            text: 'Name',
            dataIndex: 'name',
            flex: 3,
            renderer: function (value, metadata, record) {
                metadata.tdAttr = 'data-qtip="' + value + '"';
                return value;
            }
        },{
            text: 'Service',
            dataIndex: 'serviceType',
            flex: 1
        },{
            xtype:'actioncolumn',
            width: '40px',
            tdCls: 'k-action-column',
            items: [{
                icon: 'classic/resources/img/map_add.png',
                tooltip: 'Zur Karte hinzufügen',
                handler: 'addToMap'
            }],
            renderer : function(value, meta, record, row, column, store, view) {
                if (record.get('type') === "dataset") {
                    meta.style = "display:none;";
                }
            } 
        }, {
            xtype:'actioncolumn',
            width: '40px',
            tdCls: 'k-action-column',
            items: [{
                icon: 'classic/resources/img/information.png',
                tooltip: 'Info',
                handler: 'getInfo'
            }]
        }]
    }
});
