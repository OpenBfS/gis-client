/* Copyright (c) 2017 Bundesamt fuer Strahlenschutz
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
 * @class Koala.view.window.ImprintModel
 */
Ext.define('Koala.view.window.ImprintModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.k-window-imprint',

    formulas: {
        selectionHtml: function(get) {
            var selection = get('treelist.selection'),
                view = this.getView(),
                imprintController = view.getController(),
                imprintHtmlUrl,
                titleText;

            if (selection) {
                imprintHtmlUrl = (selection.getData()) ? selection.getData().content : null;
                imprintController.setHtmlInPanel(imprintHtmlUrl);
                titleText = (selection.getData()) ? selection.getData().text : null;
                view.setTitle(titleText);
            } else {
                return 'No node selected';
            }
        }
    },

    stores: {
        imprintNavItems: {
            type: 'tree',
            root: {
                children: [{
                    id: 'imprint',
                    text: '{imprint.title}',
                    content: 'resources/imprint.html',
                    leaf: true
                }, {
                    id: 'sitePolicy',
                    text: '{sitePolicy.title}',
                    content: 'resources/sitepolicy.html',
                    leaf: true
                }, {
                    id: 'accessibility',
                    text: '{accessibility.title}',
                    content: 'resources/accessibility.html',
                    leaf: true
                }]
            }
        }
    }
});
