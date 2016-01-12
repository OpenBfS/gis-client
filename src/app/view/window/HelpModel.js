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
		    if (selection) {
		    	console.log(selection.getData());
		    	console.log(selection.getPath('content'));
		        content = selection.getPath('content');
		        content = content.replace('//', '');
//		        var xTemplate = new Ext.XTemplate(
//	        		'<h1> {text} </h1>',
//	        		'<tpl for="content">',
//        			'<tpl switch="type">',
//        				'<tpl case="image">',
//        					'<img class="img" src="{content.src}" title="TEST-Title" alt="TEST-alt" width="{content.width}" height="{content.height}">',
//        				'<tpl default>',
//        					'<p> {content.src} </p>',
//	        			'</tpl>',
//	        		'</tpl>'
//		        ).apply(selection.getData());
		        //ERROR-Message: XTemplate evaluation exception: values.content is undefined
		        //im Beispiel wird overwrite()-Function verwendet
		        //vielleicht liegt hier der Fehler?!
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
        		expanded: true,
        		children: [
        		    {
        		    itemId: 'preface',
    		    	text: '{preface.title}',
    		    	content: '{preface.html}',
    		    	leaf: true
	        		}, {
					text: '{tools.title}',
					content: '{tools.html}',
					children: [{
	    				text: 'Sub-Werkzeuge1',
	    				leaf: true
					}, {					
	    				text: 'Sub-Werkzeuge2',
	    				leaf: true				
	    			}]
	        		}, {
					text: '{layerSelection.title}',
					content: '{layerSelection.html}',
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
	        		}]
		    }
	    }
    }
});
