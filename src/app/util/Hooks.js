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
 * A utility class to store hooks for the dynamization of parameters of the
 * printform.
 *
 * @class Koala.util.Hooks
 */
Ext.define('Koala.util.Hooks', {
    requires: [
        'BasiGX.view.component.Map'
    ],
    statics: {

        /**
         * Checks if a beforeAdd-hook is configured. If yes it just pipes the
         * params to the corresponding hook-function.
         *
         * @param {Koala.view.form.Print} form The print form.
         * @param {GeoExt.data.model.print.LayoutAttribute} attributeRec A
         *        GeoExt LayoutAttribute model. Which extends Ext.data.Model.
         * @param {Object} attributeFields The config object of the formular
         *        fields that will be created. You can modify this in place to
         *        adjust the form before it will be created.
         */
        executeBeforeAddHook: function(form, attributeFields, attributeRec) {
            var argumentName = attributeRec.get('name');
            if (argumentName && this.beforeAdd[argumentName] &&
                    Ext.isFunction(this.beforeAdd[argumentName])) {
                this.beforeAdd[argumentName](form, attributeRec, attributeFields);
            }
        },

        /**
        * Checks if a beforePost-hook is configured. If yes it just pipes the
        * params to the corresponding hook-function.
        *
         * @param {String} attributeName The name of the intercepted attribute.
         * @param {Object} attributeValue The value of the intercepted attribute.
         * @param {Object} postAttributes The attributes as they are supposed to
         *                                be posted to the printservlet.n]
         */
        executeBeforePostHook: function(attributeName, attributeValue, postAttributes) {
            if (attributeName && this.beforePost[attributeName] &&
                    Ext.isFunction(this.beforePost[attributeName])) {
                this.beforePost[attributeName](attributeName, attributeValue, postAttributes);
            }
        },

        /**
         * This object stores the hook functions called before the formular is
         * created.
         * To create a hook function just assign a function to an
         * attribute name like the param you want to modify. e.G. 'doc_creator'.
         *
         * To modify values mainpulate the "attributeFields" config Object.
         *
         * Every function receives thre parameters:
         * @param {Koala.view.form.Print} form The print form.
         * @param {GeoExt.data.model.print.LayoutAttribute} attributeRec A
         *        GeoExt LayoutAttribute model. Which extends Ext.data.Model.
         * @param {Object} attributeFields The config object of the formular
         *        fields that will be created. You can modify this in place to
         *        adjust the form before it will be created.
         */
        beforeAdd: {
            doc_creator: function(form, attributeRec, attributeFields) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userName = Koala.util.Object.getPathStrOr(appContext,
                        'data/merge/imis_user/username', '');
                attributeFields.items[0].value = userName;
            },
            legend_template: function(form, attributeRec, attributeFields) {
                var layoutCombo = form.down('combo[name="layout"]');
                var currentLayout = layoutCombo.getValue();
                attributeFields.hidden = true;
                attributeFields.value = currentLayout + '_legend.jasper';
            },
            map_template: function(form, attributeRec, attributeFields) {
                var layoutCombo = form.down('combo[name="layout"]');
                var currentLayout = layoutCombo.getValue();
                attributeFields.hidden = true;
                attributeFields.value = currentLayout + '_map.jasper';
            }
        },

        /**
         * This object stores the hook functions called before the formular
         * values are posted to the printservlet.
         * To create a hook function just assign a function to an
         * attribute name like the param you want to modify. e.G. 'doc_creator'.
         *
         * To modify the posted params manipulate the "postAttibtes" config
         * Object.
         *
         * @param {String} attributeName The name of the intercepted attribute.
         * @param {Object} attributeValue The value of the intercepted attribute.
         * @param {Object} postAttributes The attributes as they are supposed to
         *                                be posted to the printservlet.
         */
        beforePost: {
            doc_creator: function(attributeName, attributeValue, postAttributes) {
                if (attributeValue === 'Peter') {
                    postAttributes[attributeName] = attributeValue + ' Stöger';
                }
            }
        }
    }
});
