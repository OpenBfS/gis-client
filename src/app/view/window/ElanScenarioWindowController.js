/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.CloneWindowController
 */
Ext.define('Koala.view.window.ElanScenarioWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-elanscenarios',

    requires: [
    ],

    changes: [],

    /**
     * Object containing event objects and display html strings
     */
    eventObjs: {},

    /**
     * Html templates to be used for various entries.
     * The String $VALUE will be replaced by scenario content
     */
    displayTemplate: {
        //Used for title string
        title: 'Ereignis:<p style=\'font-size: 2em; margin: 5px 0 10px 0;\'><a href="$LINK" target="_blank"> $VALUE</a></p>',
        //Use for string that marks the event as changed or unchanged
        change: {
            changed: '<div style=\'color:red; margin: 0;\'>$VALUE<br></div>',
            unchanged: '$VALUE<br>'
        },
        //Used for event keys
        key: {
            //Field was modified
            unchanged: '<b>$VALUE</b>: ',
            //Field is unmodified
            changed: '<div style=\'color:red; margin: 0;\'><b>$VALUE</b>: '
        },
        //Used for event values
        value: {
            unchanged: '$VALUE <br>',
            changed: '$VALUE<br></div>'
        }
    },

    /**
     * Keys to be displayed in the event window
     */
    displayValues: ['description',
        'EventType.title',
        'TimeOfEvent',
        'OperationMode.title',
        'modified',
        'modified_by'
    ],

    /**
     * Key that contains the event title
     */
    titleProperty: 'title',

    /**
     * Key that contains the link to the event
     */
    linkProperty: '@id',

    /**
     * Parse elan object and create a String representation
     * @param {Object} scenario Scenario object
     * @return String represenation
     */
    parseElanObject: function(scenario) {
        var me = this;
        var scenarioString = '';

        //Add title
        var title = scenario[me.titleProperty];
        scenarioString += me.displayTemplate.title.replace('$VALUE', title);
        //Add hyperlink to title
        var link = scenario[me.linkProperty];
        scenarioString = scenarioString.replace('$LINK', link);

        //Check if Scenario was changed
        var changeString = me.getViewModel().get('unchangedText');
        var changeTemplate = me.displayTemplate.change.unchanged;
        if (Ext.Array.contains(me.changes, scenario.id)) {
            window.console.log(me);
            changeString = me.getViewModel().get('changedText');
            changeTemplate = me.displayTemplate.change.changed;
        }
        scenarioString += changeTemplate.replace('$VALUE', changeString);

        //Check for changes since last update
        var changedFields = Ext.Array.contains(me.changes, scenario.id) ?
            me.getChanges(scenario): [];

        //Add display values
        Ext.Array.each(this.displayValues, function(key) {
            var value = me.getPropertyByString(scenario, key);//scenario[key];
            value = value ? value : '';
            //TODO: Insert proper string
            var keyString = 'key_' + key.replace('.','_');
            keyString = me.getViewModel().get(keyString);
            var boolTRUE = me.getViewModel().get('true');
            var boolFALSE = me.getViewModel().get('false');
            if (typeof value === 'boolean') {
                value = value? boolTRUE: boolFALSE;
            }

            //Choose template
            var keyTpl;
            var valTpl;
            if (Ext.Array.contains(me.changes, scenario.id)
                && Ext.Array.contains(changedFields, key)) {
                keyTpl = me.displayTemplate.key.changed;
                valTpl = me.displayTemplate.value.changed;
            } else {
                keyTpl = me.displayTemplate.key.unchanged;
                valTpl = me.displayTemplate.value.unchanged;
            }
            scenarioString += keyTpl.replace('$VALUE', keyString);
            scenarioString += valTpl.replace('$VALUE', value);
        });
        return scenarioString;
    },

    /**
     * Sort an object holding events by modified date
     * @param {Object} newEvents Event object
     * @return {Array} Array containing object ids, sorted by modified date, asc.
     */
    sortEventsByModifiedDate: function(newEvents) {
        return Ext.Array.sort(Ext.Object.getKeys(newEvents),function(a, b) {
            if (newEvents[a]['modified'] > newEvents[b]['modified']) {
                return -1;
            } else if (newEvents[a]['modified'] < newEvents[b]['modified']) {
                return 1;
            }
            return 0;
        });
    },

    /**
     * Updates the event list without updating its content.
     * Can be used to remove a now inactive event without reseting
     * change markers.
     */
    updateEventList: function() {
        var me = this;
        var content = '';
        var newEvents = me.eventObjs;

        //Check if an event has been removed
        var eventKeys = Koala.util.LocalStorage.getDokpoolEventKeys();
        Ext.Object.each(newEvents, function(key) {
            if (!Ext.Array.contains(eventKeys, key)) {
                delete newEvents[key];
            }
        });

        //Sort events by modified date
        var displayOrder = me.sortEventsByModifiedDate(newEvents);

        if (!newEvents || newEvents === '') {
            content = me.getViewModel().get('emptyText');
        }
        displayOrder.forEach(function(key) {
            var value = me.eventObjs[key].displayText;
            content += value + '<br />';
        });
        var cmp = this.getView().down('panel');
        if (!cmp) {
            // modern
            cmp = this.getView();
        }
        cmp.setHtml(content);
    },

    /**
     * Update the window content using the localStorage module.
     * Note: The event content itself is not refresh using the remote server
     * @param {boolean} preserveChanges If true, changes are not cleared
     */
    updateContent: function(preserveChanges) {
        var me = this;
        //If viewmodel was not created: skip
        if (!me.getViewModel()) {
            return;
        }
        var content = '';
        var newEvents = Koala.util.LocalStorage.getDokpoolEvents();

        //Sort events by modified date
        var displayOrder = me.sortEventsByModifiedDate(newEvents);

        if (!newEvents || newEvents === '') {
            content = me.viewModel.get('emptyText');
        }
        Ext.Object.each(newEvents, function(key, value) {
            var text = me.parseElanObject(value);
            newEvents[key].displayText = text;
        });
        displayOrder.forEach(function(key) {
            var value = newEvents[key].displayText;
            content += value + '<br />';
        });
        var cmp = this.getView().down('panel');
        if (!cmp) {
            // modern
            cmp = this.getView();
        }
        cmp.setHtml(content);
        me.eventObjs = newEvents;
        if (!preserveChanges) {
            this.changes = [];
        }
    },

    /**
     * Get object property by string
     * @param {Object} o Object to get property from
     * @param {String} s String path
     * @return {} Property
     */
    getPropertyByString: function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1');
        s = s.replace(/^\./, '');
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    },

    /**
     * Get fields of an event that changed since last update
     * @param {Object} event Event object
     * @return {Array} Array containing the names of the changed fields
     */
    getChanges: function(event) {
        var me = this;
        var changes = [];
        var id = event.id;
        me.displayValues.forEach(function(key) {
            if (!me.eventObjs[id]
                || !me.getPropertyByString(me.eventObjs[id], key)
                || me.getPropertyByString(me.eventObjs[id], key) !== me.getPropertyByString(event, key)) {
                changes.push(key);
            }
        });
        return changes;
    },

    /**
     * Saves event that have been changed
     * @param {String} eventId Event ID that has changed
     */
    eventChanged: function(eventId) {
        this.changes.push(eventId);
    },

    /**
     * Check if this window has pending changes that has not been shown
     * @return true If changes are pending.
     */
    hasChanges: function() {
        return this.changes.length > 0;
    }

});
