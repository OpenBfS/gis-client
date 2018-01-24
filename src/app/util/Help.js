/* Copyright (c) 2018 Bundesamt fuer Strahlenschutz
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
 * @class Koala.util.Help
 */
Ext.define('Koala.util.Help', {

    requires: [
        'Koala.view.window.HelpWindow',
        'BasiGX.util.Animate'
    ],

    statics: {
        topic: null,
        parentOfTopic: null,

        /**
         * Opens the help-window. If topic and parentOfTopic is defined  (see 'HelpModel' helpNavItems-ID)
         * the respective page will be shown, the topic in the navigation will be selected and the parent-node
         * of the topic will be opened. If neither are defined, the help-window opens the default page.
         */
        showHelpWindow: function() {
            var me = this;
            var helpWin = Ext.ComponentQuery.query('k-window-help')[0];
            if (!helpWin) {
                helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                helpWin.on('afterlayout', function() {
                    var helpWinController = this.getController();
                    helpWinController.setTopic(me.topic, me.parentOfTopic);
                }, helpWin, {single: true});
            } else {
                BasiGX.util.Animate.shake(helpWin);
                var helpWinController = helpWin.getController();
                helpWinController.setTopic(me.topic, me.parentOfTopic);
            }
        }
    }

});
