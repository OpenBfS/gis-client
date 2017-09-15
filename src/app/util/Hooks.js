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
        'BasiGX.view.component.Map',
        'Koala.util.DokpoolContext'
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
            var argumentName;
            try {
                argumentName = attributeRec.get('name');
            } catch (err) {
                //e.g. there's no function "get()"
                argumentName = attributeRec.name;
            }
            if (argumentName && this.beforeAdd[argumentName] &&
                    Ext.isFunction(this.beforeAdd[argumentName])) {
                this.beforeAdd[argumentName](form, attributeRec, attributeFields);
            }
        },

        /**
        * Checks if a beforePost-hook is configured. If yes it just pipes the
        * params to the corresponding hook-function.
        *
        * @param {Koala.view.form.Print} form The print form.
        * @param {Object} postAttributes The attributes as they are supposed to
        *                                be posted to the printservlet.n]
        */
        executeBeforePostHook: function(form, postAttributes) {
            var me = this;
            Ext.iterate(me.beforePost, function(key) {
                if (me.keyMap(postAttributes, key)) {
                    me.beforePost[key](form, key, postAttributes);
                }
            });
        },

        /**
        * returns value for nested key:value objects
        * e.g. postAttributes
        * @param {Object} obj The object with nested key:values
        *                     e.g. postAttributes
        * @param "String" attrString The key that is searched for
        * @return "String" if key matched
        *         undefined if key didn't match
        */
        keyMap: function(obj, attrString) {
            var path = attrString.split('.');
            for (var i in path) {
                try {
                    obj = obj[path[i]];
                } catch (e) {
                    return undefined;
                }
            }
            return obj;
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
            /*
            * Hooks for MapFish part
            */
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
            },
            map: function(form, attributeRec, attributeFields) {
                var clientInfo = attributeRec.get('clientInfo');
                attributeFields.bind = {
                    title: '{map_label}' + ' (' +
                        clientInfo.width + ' × ' +
                        clientInfo.height + ')'
                };
            },
            /*
            northArrow: function(form, attributeRec, attributeFields) {
                attributeFields.bind = {
                    fieldLabel: '{northArrowLabel}'
                };
                attributeFields.bind = {
                    boxLabel: '{northArrowBoxLabel}'
                };
            },
            scaleBar: function(form, attributeRec, attributeFields) {
                attributeFields.bind = {
                    fieldLabel: '{scaleBar_label}'
                };
                attributeFields.bind = {
                    boxLabel: '{scaleBar_boxLabel}'
                };
            },
*/
            map_attribution: function(form, attributeRec, attributeFields) {
                attributeFields.items[0].bind = {
                    fieldLabel: '{map_attribution_label}'
                };
            },
            is_exercise: function(form, attributeRec, attributeFields) {
                attributeFields.bind = {
                    fieldLabel: '{is_exercise_label}'
                };
            },
            title: function(form, attributeRec, attributeFields) {
                attributeFields.items[0].bind = {
                    fieldLabel: '{title_label}'
                };
            },
            description: function(form, attributeRec, attributeFields) {
                attributeFields.items[0].bind = {
                    fieldLabel: '{description_label}'
                };
            },
            comment: function(form, attributeRec, attributeFields) {
                attributeFields.items[0].bind = {
                    fieldLabel: '{comment_label}'
                };
            },
            impressum: function(form, attributeRec, attributeFields) {
                attributeFields.items[0].bind = {
                    fieldLabel: '{impressum_label}'
                };
            },

            doc_creator: function(form, attributeRec, attributeFields) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userName = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/imis_user/username', '');
                attributeFields.items[0].value = userName;
                attributeFields.items[0].bind = {
                    fieldLabel: '{doc_creator_label}'
                };
                attributeFields['hidden'] = true;
            },
            /*
            * Hooks for IRIX part
            */
            User: function(form, attributeFields) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userName = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/imis_user/username', '');
                attributeFields.value = userName;
                attributeFields.rawValue = userName;
                attributeFields['hidden'] = true;
            },
            DokpoolContentType: function(form, attributeFields) {
                attributeFields.on({
                    change: function() {
                        // console.log('DokpoolContentType changed');
                    }
                });
            },
            DokpoolBehaviour: function(form, attributeFields) {
                attributeFields.setBind({
                    title: '{DokpoolBehaviour_label}'
                });
                attributeFields.layout = {
                    type: 'hbox',
                    pack: 'justify',
                    align: 'stretch'
                };
            //ToDo: check how to properly rearrange items in
            //additional container with
            //layout type = 'hbox'
            },
            IsElan: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Elan_label}'
                });
                attributeFields.fieldLabel = '';
            },
            IsDoksys: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Doksys_label}'
                });
                attributeFields.fieldLabel = '';
            },
            IsRodos: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Rodos_label}'
                });
                attributeFields.fieldLabel = '';
            },
            IsRei: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Rei_label}'
                });
                attributeFields.fieldLabel = '';
            },
            DokpoolMeta: function(form, attributeFields) {
                attributeFields.setBind({
                    title: '{DokpoolMeta_label}'
                });
            },
            Identification: function(form, attributeFields) {
                attributeFields.setBind({
                    title: '{Identification_label}'
                });
            },
            DokpoolGroupFolder: function(form, attributeFields) {
                attributeFields.hidden = true;
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
         * @param {Koala.view.form.Print} form The print form.
         * @param {String} key The name of the intercepted attribute.
         * @param {Object} postAttributes The attributes as they are supposed to
         *                                be posted to the printservlet.
         */
        beforePost: {
/*
            'title': function(form, key, postAttributes) {
                var newTitle = '<div><b>MAP-TITLE FROM HOOK</b></div>';
                postAttributes.title = newTitle;
            },
*/
            'DokpoolMeta.DokpoolGroupFolder': function(form, key, postAttributes) {
                var DokpoolContentType = postAttributes.DokpoolMeta.DokpoolContentType;
                var Confidentiality = postAttributes.Identification.Confidentiality;
                //                var DokpoolName = postAttributes.DokpoolMeta.DokpoolName;
                if (DokpoolContentType && Confidentiality) {
                    //console.log('DokpoolContentType: ' + DokpoolContentType + ' && Confidentiality: ' + Confidentiality);
                    var DokpoolGroupFolder = form.dokpoolContext.getPath(Confidentiality,DokpoolContentType);
                    postAttributes.DokpoolMeta.DokpoolGroupFolder = DokpoolGroupFolder;
                // } else {
                //     console.log('DokpoolContentType OR Confidentiality missing');
                }
            }
        }
    }
});
