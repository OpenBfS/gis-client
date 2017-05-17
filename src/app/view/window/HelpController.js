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
 * @class Koala.view.window.HelpController
 */
Ext.define('Koala.view.window.HelpController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-help',

    removeTopicByTools: function() {
        var treelist = this.lookupReference('treelist'),
            store = treelist.getStore(),
            tools = store.getNodeById('tools');
        if (!Koala.util.AppContext.hasTool('addWmsBtn')) {
            tools.removeChild(store.getNodeById('toolsWms'));
        }
        if (!Koala.util.AppContext.hasTool('printBtn')) {
            tools.removeChild(store.getNodeById('toolsPrint'));
        }
        if (!Koala.util.AppContext.hasTool('importLocalDataBtn')) {
            tools.removeChild(store.getNodeById('toolsImport'));
        }
    },
    setTopic: function(topic, parentOfTopic) {
        var treelist = this.lookupReference('treelist'),
            store = treelist.getStore(),
            topicNode = (store) ? store.getNodeById(topic) : undefined;
        if (parentOfTopic) {
            var parentNode = store.getNodeById(parentOfTopic);
            parentNode.expand();
        }
        else if (topicNode) {
            treelist.setSelection(topicNode);
        }
    }
});
