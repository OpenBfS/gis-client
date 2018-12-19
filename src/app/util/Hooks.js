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
        'Koala.util.DokpoolContext',
        'Koala.util.DokpoolRequest'
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
            Text: function(form, attributeRec) {
                //getRoute (skipLayers=false, skipFilters=false)
                var route = Koala.util.Routing.getRoute(false,false);
                var hrefWithoutHash = window.location.origin +
                    window.location.pathname +
                    window.location.search;
                var permalink = hrefWithoutHash + '#' + route;
                var textField = attributeRec.down('textfield');
                var defaultVal = textField.getValue();
                var newLine = '<br>';
                var permalinkTag = '<a target="_blank" href="' + permalink + '">{Permalink_text}</a>';
                var newVal = (defaultVal) ? defaultVal + newLine + permalinkTag : permalinkTag;

                textField.setBind({
                    value: newVal
                });
            },
            User: function(form, attributeFields) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userName = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/imis_user/username', '');
                attributeFields.value = userName;
                attributeFields.rawValue = userName;
                attributeFields['hidden'] = true;
            },
            DokpoolDocumentOwner:function(form, attributeFields) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userName = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/imis_user/username', '');
                attributeFields.value = userName;
                attributeFields.rawValue = userName;
                attributeFields['hidden'] = true;
            },
            requestType: function(form, attributeFields) {
                attributeFields.on({
                    change: function() {
                        var createPrintBtn = form.up().down('button[name="createPrint"]');
                        if (createPrintBtn && attributeFields.value !== 'respond') {
                            createPrintBtn.setBind({
                                text: '{printButtonDokpoolText}'
                            });
                        } else {
                            createPrintBtn.setBind({
                                text: '{printFormat:uppercase} {printButtonSuffix}'
                            });
                        }
                    }
                });
            },
            DokpoolContentType: function(form, attributeFields) {
                attributeFields.on({
                    change: function() {
                        var doksysMetaFieldset = form.down('[name=Doksys]');
                        Koala.util.Hooks.onChangeDokpoolContentType(this.value,doksysMetaFieldset);
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
            //TODO: check how to properly rearrange items in
            //additional container with
            //layout type = 'hbox'
            },
            IsElan: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Elan_label}'
                });
                attributeFields.fieldLabel = '';

                attributeFields.on({
                    change: function() {
                        var me = this,
                            isChecked = me.getValue(),
                            tagfieldScenario = me.up('fieldset[name="irix"]').down('tagfield[name="Scenarios"]');

                        if (tagfieldScenario) {
                            if (isChecked) {
                                tagfieldScenario.setDisabled(false);
                            } else {
                                tagfieldScenario.reset();
                                tagfieldScenario.setDisabled(true);
                            }
                        }
                    }
                });
            },
            IsDoksys: function(form, attributeFields) {
                attributeFields.setBind({
                    boxLabel: '{DokpoolBehaviour_Doksys_label}'
                });
                attributeFields.fieldLabel = '';
                attributeFields.on({
                    change: function() {
                        var me = this;
                        //var dokpoolMetaFieldset = Ext.ComponentQuery.query('[name=DokpoolMeta]')[0];
                        var doksysFieldset = Ext.ComponentQuery.query('[name=Doksys]')[0];
                        if (me.checked === true) {
                            Ext.log('checked IsDoksys');
                            //dokpoolMetaFieldset.show();
                            doksysFieldset.show();
                        } else {
                            Ext.log('unchecked IsDoksys');
                            //dokpoolMetaFieldset.hide();
                            doksysFieldset.hide();
                        }
                    }
                });
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
                //for time being always hide!
                // the one and only remaining field (others are shown elsewhere)
                // is "DokpoolName" which has only one allowed value: 'Bund'
                attributeFields.setVisible(false);
            },
            Doksys: function(form, attributeFields) {
                attributeFields.setBind({
                    title: '{Doksys_label}'
                });
            },
            Scenarios: function(form, attributeFields) {
                attributeFields.setBind({
                    fieldLabel: '{ElanScenarios_label}'
                });

                Koala.util.DokpoolRequest.getActiveElanScenarios()
                    .then(function(elanResponse) {
                        var store,
                            data = [],
                            valueField = attributeFields.valueField,
                            displayField = attributeFields.displayField;

                        if (!elanResponse.items) {
                            Ext.toast('unexpected Elan scenarios response - ' + JSON.stringify(elanResponse));
                            return;
                        }
                        store = Ext.create('Ext.data.Store');
                        elanResponse.items.forEach(function(item) {
                            var dataRow = {};
                            var splValueField = item[valueField].split('/');
                            var adjValueField = splValueField[splValueField.length-1];
                            dataRow[valueField] = adjValueField;
                            dataRow[displayField] = item[displayField];
                            data.push(dataRow);
                        });
                        store.setData(data);
                        store.setFields([valueField, displayField]);
                        attributeFields.setStore(store);
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
        * handles value dependencies
        * of form fields
        * @param {Object} obj The print form
        */
        beforeRender: function(printForm) {
            // debugger;
            var DokpoolContentType = printForm.down('[name=DokpoolContentType]'),
                isElan = printForm.down('[name=IsElan]');

            DokpoolContentType.fireEvent('change');
            isElan.fireEvent('change');
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
            },
            //move Doksys to DokpoolMeta
            'Doksys': function(form, key, postAttributes) {
                postAttributes.DokpoolMeta.Doksys = postAttributes.Doksys;
                delete postAttributes.Doksys;
            },

            //move DokpoolDocumentOwner to DokpoolMeta
            'DokpoolDocumentOwner': function(form, key, postAttributes) {
                postAttributes.DokpoolMeta.DokpoolDocumentOwner = postAttributes.DokpoolDocumentOwner;
                delete postAttributes.DokpoolDocumentOwner;
            },

            //Permalink gets updated before post
            'Text': function(form, key, postAttributes) {
                var route = Koala.util.Routing.getRoute();
                var hrefWithoutHash = window.location.origin +
                    window.location.pathname +
                    window.location.search;
                var permalink = hrefWithoutHash + '#' + route;
                var text = postAttributes[key];
                var hrefs = text.match(/href="(.*?)"/g);
                var obsPermalink;

                if (hrefs) {
                    if (hrefs.length > 1) {
                        for (var i = 0; i < hrefs.length; i++) {
                            if (hrefs[i].includes(window.location.origin) && hrefs[i].includes('#map')) {
                                obsPermalink = hrefs[i];
                                break;
                            }
                        }
                    } else {
                        obsPermalink = hrefs[0];
                    }
                    postAttributes[key] = text.replace(obsPermalink, 'href="' + permalink + '"');
                }
            }
        },


        /*
        * handles visibility of dokpool metadata fields
        * according to selected 'DokpoolContentType'
        * @param {String} current value of field 'DokpoolContentType'
        * @param {object} {Koala.view.form.Print} form The print form.
        * @param {object} {Object} attributeFields The config object of the formular
        *        fields that will be created.
        */
        onChangeDokpoolContentType: function(value, doksysMetaFieldset) {
            Ext.log('onChangeDokpoolContentType '+ value);
            var fields = doksysMetaFieldset.items.items;
            var visibleFields = [];

            if (value.match(/projection$/) || value.match(/^instructions/) || value.match(/^protectiveactions/)) {
                //console.log('Matched a string that ends with \'projection\'');
                visibleFields = [
                    /*
                    'CalculationDate',
                    'Model',
                    'NumericWeatherPredictionDate',
                    'PrognosisBegin',
                    'PrognosisEnd',
                    'PrognosisForm',
                    'PrognosisType',
                    'ProjectName',
                    'ProjectUser',
                    'ReleaseSite',
                    'ReleaseStart',
                    'ReleaseStop',
                    'ReportId'
                    */
                ];
            } else if (value.match(/^trajectory/)) {
                //console.log('Matched a string that starts with \'trajectory\'');
                visibleFields = [
                    'Area',
                    'NetworkOperator',
                    'OperationMode',
                    'Purpose',
                    'TrajectoryEndLocation',
                    'TrajectoryEndTime',
                    'TrajectoryStartLocation',
                    'TrajectoryStartTime',
                    'Type'
                ];
            } else {
                //console.log('Any other string. Most probably: \'gammadoserate\'');
                visibleFields = [
                    'Area',
                    'DataType',
                    'Dom',
                    'Duration',
                    'LegalBase',
                    'MeasurementCategory',
                    'MeasuringProgram',
                    'NetworkOperator',
                    'OperationMode',
                    'Purpose',
                    'SampleType',
                    'SampleTypeId',
                    'SamplingBegin',
                    'SamplingEnd',
                    'Status',
                    'Type'
                ];
            }

            for (var i = 0, l = fields.length; i < l; i++) {
                //console.log(fields[i].name);
                var field = fields[i];
                field.setVisible(false);
                if (Ext.Array.contains(visibleFields,fields[i].name)) {
                    //console.log('set visible: ' + fields[i].name);
                    field.setVisible(true);
                }
            }
        }
    }
});
