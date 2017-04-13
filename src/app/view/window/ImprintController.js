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
 * @class Koala.view.window.ImprintController
 */
Ext.define('Koala.view.window.ImprintController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-imprint',

    setTopic: function(topic) {
        var me = this,
            treelist = me.lookupReference('treelist'),
            store = treelist.getStore(),
            topicNode = store.getNodeById(topic),
            imprintHtmlUrl = (topicNode.getData()) ? topicNode.getData().content : null;

        treelist.setSelection(topicNode);

        if (imprintHtmlUrl) {
            me.setHtmlInPanel(imprintHtmlUrl);
        }
    },

    setHtmlInPanel: function(imprintHtmlUrl) {
        var panel = this.lookupReference('imprintPanel');

        Ext.Ajax.request({
            method: 'GET',
            url: imprintHtmlUrl,
            success: function(response) {
                panel.setHtml(response.responseText);
            },
            failure: function(response) {
                Ext.log.warn('Loading imprint-HTML failed: ', response);
            }
        });
    }
});
