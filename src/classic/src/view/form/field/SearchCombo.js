Ext.define("Koala.view.form.field.SearchCombo",{
    extend: "Ext.form.field.ComboBox",
    xtype: "k-form-field-searchcombo",

    requires: [
        "Ext.window.Toast"
    ],

    controller: "k-form-field-searchcombo",
    viewModel: {
        type: "k-form-field-searchcombo"
    },

    store: [],

    labelWidth: null,

    minChars: 3,

    hideTrigger: true,

    bind: {
        emptyText: '{emptyText}'
    },

    listeners: {
        change: function(combo, newValue, oldValue){
            var multiPanel = Ext.ComponentQuery.query('k-panel-multisearch')[0];
            if(newValue){
                if(multiPanel) {
                    multiPanel.show(combo);
                }
                this.doSpatialSearch(newValue);
                this.doMetadataSearch(newValue);
            } else {
                if(multiPanel) {
                    multiPanel.getEl().slideOut('t', {
                        duration: 250,
                        callback:function(){
                            multiPanel.hide();
                        }
                    });
                }
            }
        }
    },

    doSpatialSearch: function(value){
        var spatialGrid = Ext.ComponentQuery.query('k-grid-spatialsearch')[0];
        var spatialStore = spatialGrid.getStore();

        spatialStore.getProxy().setExtraParam('cql_filter', "NAME ilike '%" + value + "%'");
        spatialStore.load();
    },

    doMetadataSearch: function(value){
        var metadataGrid = Ext.ComponentQuery.query('k-grid-metadatasearch')[0];
        var metadataStore = metadataGrid.getStore();

        metadataStore.getProxy().setExtraParam('constraint', "AnyText like '%" + value + "%'");
        metadataStore.load();
    },

    /**
     * TODO why do we need this? Without this, the data from the view template
     * is not applied.
     */
    setEmptyText: function(txt){
        this.emptyText = txt;
        this.applyEmptyText();
    }


});
