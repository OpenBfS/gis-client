/* Copyright (c) 2015 	Marco Pochert, Bundesamt fuer Strahlenschutz
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
 * @class Koala.view.window.HelpWindow
 */
Ext.define("Koala.view.window.HelpWindow", {
    extend: "Ext.window.Window",
    xtype: "k-window-help",

    requires: [
        "Ext.list.Tree",
        "Koala.view.window.HelpController",
        "Koala.view.window.HelpModel"
    ],

    controller: "k-window-help",
    viewModel: {
        type: "k-window-help"
    },

    bind: {
        title: '{title}'
    },
    	
    width: 1335,
    height: 750,
    layout: 'border',
    minWidth: 500,
//    maxWidth: window.innerWidth - 100,
    minHeight: 300,
//    maxHeight: window.innerHeight - 100,

    resizable: true,
    maximizable: true,
    //TODO: implement minimize-function
//    minimizable: true,
//    constrain: true,

    //Navigation-Panel
    items: [{
    	xtype: 'panel',
    	region: 'west',
    	width: 260,
    	split: true,
//    	reference: 'treelistContainer',
    	layout: {
    		type: 'vbox'
//    		align: 'stretch'
    	},
    	border: false,
    	items: [{
    		xtype: 'treelist',
    		reference: 'treelist',
    		expanderOnly: false,
    		bind: '{navItems}'
    	}]
    },
    //Content
    {
    	region: 'center',
    	autoScroll: true,//"This cfg has been deprecated since 5.1.0 - Use scrollable instead" -> but scrollable is not working
    	bodyPadding: 10,
    	bind: {
    		html: '{selectionHtml}'
    	}
    }],
    //select 'preface' at initialization
    listeners:{
	    afterlayout: function() {
	    	var treelist = this.lookupReference('treelist'),
	    	store = treelist.getStore(),
	    	selection = treelist.getSelection();
	    	if (store && !selection){
		    	var node = treelist.getStore().getNodeById('select');
		    	treelist.setSelection(node);
	    	}
	    }
    }
});
