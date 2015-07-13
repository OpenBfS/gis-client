
Ext.define("Koala.view.panel.ThemeTree",{
    extend: "Ext.tree.Panel",
    xtype: 'k-panel-themetree',

    requires: [
        "Koala.view.panel.ThemeTreeController",
        "Koala.view.panel.ThemeTreeModel"
    ],

    controller: "k-panel-themetree",
    viewModel: {
        type: "k-panel-themetree"
    },

    rootVisible: false,
    
    autoScroll: true,
    
    height: 200,
    
    initComponent: function(){
        var store = Ext.create('Ext.data.TreeStore', {
//            proxy: {
//                type: 'ajax',
//                url : 'icons.json',
//                reader: {
//                    type: 'json',
////                    root: '',
////                    totalProperty:  'recordCount',
////                    successProperty: 'success'
//                }
//            }
            root: {
                expanded: true,
                children: [ {
                    text: 'aaa',
                    leaf: true
                }, {
                    text: 'bbb',
                    expanded: true,
                    children: [ {
                        text: 'bbb 1',
                        leaf: true
                    }, {
                        text: 'bbb 2',
                        leaf: true
                    } ]
                }, {
                    text: 'ccc',
                    leaf: true
                } ]
            }
        });
        this.store = store;
        this.callParent();
    }
});
