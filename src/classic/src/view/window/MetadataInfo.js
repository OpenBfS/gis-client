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
 * @class Koala.view.window.MetadataInfo
 */
Ext.define("Koala.view.window.MetadataInfo", {
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
            listeners: {
                'beforeedit': function() {
                    return false;
                },
                'celldblclick': function(propGrid, td, cellIndex, record){
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
