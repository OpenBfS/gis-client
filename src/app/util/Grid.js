/* Copyright (c) 2020 Bundesamt fuer Strahlenschutz
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
 * @class Koala.util.Grid
 */
Ext.define('Koala.util.Grid', {

    requires: [
        'Koala.util.Date'
    ],

    statics: {
        updateGridFeatures: function(grid, gridFeatures) {
            var types = {};
            var columns = [];
            var fields = [];
            var data = [];
            var store = grid.getStore();

            Ext.each(gridFeatures, function(feat) {
                Ext.iterate(feat.properties, function(propName, prop) {
                    var type = null;
                    var tempProp;

                    //store recognizes 'id' -> no duplicates allowed
                    if (propName.toLowerCase() === 'id') {
                        tempProp = feat.properties[propName];
                        delete feat.properties[propName];
                        propName = 'elementId';
                        feat.properties[propName] = tempProp;
                    }
                    //define data types
                    if (typeof prop === 'number') {
                        type = 'number';
                    } else if (typeof prop === 'string') {
                        if (parseFloat(prop[0])) {
                            var dateVal = moment(prop, moment.ISO_8601, true);
                            type = (dateVal.isValid()) ? 'date' : 'string';
                        } else {
                            type = 'string';
                        }
                    }
                    if (!types[propName]) {
                        types[propName] = [type];
                    } else {
                        types[propName].push(type);
                    }
                });
                feat.properties.feature = JSON.stringify(feat);
                data.push(feat.properties);
            });
            //field and column assignment
            Ext.iterate(types, function(propName, prop) {
                var field = {
                    name: propName,
                    type: ''
                };
                var column = {
                    text: propName,
                    dataIndex: propName,
                    //itemId: propName, //if needed, remove empty spaces from propName before
                    filter: {
                        type: ''
                    }
                };
                var uniqueTypes = Ext.Array.unique(prop);
                if (uniqueTypes.length > 1) {
                    uniqueTypes = Ext.Array.remove(uniqueTypes, null);
                }
                uniqueTypes = (uniqueTypes.indexOf('string') > -1) ? ['string'] : uniqueTypes;
                field.type = column.filter.type = uniqueTypes[0];

                if (field.type === 'date') {
                    column.renderer = function(val) {
                        var dateVal = moment(val, moment.ISO_8601, true);
                        return Koala.util.Date.getFormattedDate(dateVal);
                    };
                }

                fields.push(field);
                columns.push(column);
            });
            grid.setColumns(columns);
            store.setFields(fields);
            store.loadData(data, false);
        }
    }

});
