/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.form.RodosFilter
 */
Ext.define('Koala.view.form.RodosFilter', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-rodosfilter',

    requires: [
        'BasiGX.util.Animate',

        'Koala.util.Object'
    ],

    maxHeight: null,
    maxWidth: 800,

    layout: 'form',

    controller: 'k-form-rodosfilter',

    viewModel: 'k-form-rodosfilter',

    initComponent: function() {
        var me = this;
        me.callParent();
        var appContext = BasiGX.view.component.Map.guess().appContext;
        if (appContext) {
            var configuredRodosProjects = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/rodos-projects', false
            );
            var configuredRodosResults = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/rodos-results', false
            );
        }

        if (configuredRodosProjects) {
            me.getViewModel().set('rodosProjectsUrl', configuredRodosProjects);
            me.getViewModel().set('rodosProjectsUrl', configuredRodosProjects);
        }

        if (configuredRodosResults) {
            me.getViewModel().set('rodosResultsUrl', configuredRodosResults);
            me.getViewModel().set('rodosResultsUrl', configuredRodosResults);
        }
    },

    items: [{
        xtype: 'fieldset',
        bind: {
            title: '{rodosProjectFieldsetTitle}'
        },
        name: 'rodos-project-fieldset',
        layout: 'form',
        items: [{
            xtype: 'combo',
            name: 'projectCombo',
            bind: {
                fieldLabel: '{projectComboLabel}',
                store: '{projectStore}'
            },
            allowBlank: false,
            forceSelection: true,
            displayField: 'name',
            valueField: 'project_uid',
            listeners: {
                select: 'onProjectSelected'
            }
        }]
    }],

    bbar: [{
        bind: {
            text: '{removeAllLayers}'
        },
        buttonAlign: 'right',
        handler: 'removeRodosLayers'
    }]

});
