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
 * @class Koala.view.window.HelpModel
 */
Ext.define('Koala.view.window.HelpModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-help',
    
    formulas: {
    	selectionHtml: function(get) {
		        var selection = get('treelist.selection'),
		        content;
		        console.log("get = " + get);
		    if (selection) {
		        content = selection.getPath('content', '-sep-');
		        content = content.replace(/-sep--sep-|-sep-/g, '');
		        return content;
		    } else {
		        return 'No node selected';
		    }
		}
    },
    stores: {
//        title: '',
//        prefaceTitle: '',
//        preface: '',
//        toolsTitle: '',
//        layerSelectionTitle: '',
//        mapNavigationTitle: '',
//        legendTitle: '',
    	
        navItems: {
        	type: 'tree',        	
        	root: {
        		children: [
        		    {
        		    itemId: 'preface',
    		    	text: '{preface.title}',
    		    	content: '{preface.html}',
    		    	leaf: true
	        		}, {
	        		text: '{quickRef.title}',
	        		content: '{quickRef.html}',
	        		leaf: true
	        		}, {
	        		text: '{profileSelection.title}',
	        		content: '{profileSelection.html}',
	        		leaf: true
	        		}, {
	        		text: '{map.title}',
	        		content: '{map.html}',
	        		leaf: true
	        		}, {
					text: '{tools.title}',
					content: '{tools.html}',
					children: [{
	    				text: '{tools.wms.title}',
	    				content: '{tools.wms.html}',
	    				leaf: true
					}, {					
	    				text: '{tools.print.title}',
	    				content: '{tools.print.html}',
	    				leaf: true				
	    			}]
	        		}, {
					text: '{layerSelection.title}',
					content: '{layerSelection.html}',
					leaf: true
	        		}, {
	        		text: '{searchField.title}',
	        		content: '{searchField.html}',
	        		leaf: true
	        		}, {
	        		text: '{settings.title}',
	        		content: '{settings.html}',
	        		leaf: true
	        		}, {	        			
					text: '{mapNavigation.title}',
					content: '{mapNavigation.html}',
					children: [{
						text: 'Sub-Navigation1',
						leaf: true
					}, {
						text: 'Sub-Navigation2',
						leaf: true
						}]
	        		}, {
	        		text: '{legend.title}',
	        		content: '{legend.html}',
		        	leaf: true	
	        		}, {
	        		text: '{geographicOverview.title}',
	        		content: '{geographicOverview.html}',
	        		leaf: true
	        		}]
		    }
	    }
    }
});
