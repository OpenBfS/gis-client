/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * @class Koala.view.form.field.LanguageComboController
 */
Ext.define('Koala.view.form.field.LanguageComboController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-field-languagecombo',

    /**
     *
     */
    locale: null,

    /**
     * @private
     */
    erroneousTryToLoadDefaultLanguage: false,

    /**
     *
     */
    onLanguageChange: function(combo, newValue) {
        var me = this;
        if (!Ext.isEmpty(newValue)) {
            me.requestLanguageFile(newValue);
        }
    },

    /**
     *
     */
    requestLanguageFile: function(locale) {
        var me = this;
        var appLocaleUrlTpl = 'resources/locale/app-locale-{0}.json';
        var appLocaleUrl = Ext.util.Format.format(appLocaleUrlTpl, locale);

        me.locale = locale;

        Ext.Ajax.request({
            method: 'GET',
            url: appLocaleUrl,
            success: me.onLoadAppLocaleSuccess,
            failure: me.onLoadAppLocaleFailure,
            scope: me
        });
    },

    /**
     *
     */
    onLoadAppLocaleSuccess: function(resp) {
        var me = this;
        var respObj;

        if (resp && resp.responseText) {

            // try to parse the given string as JSON
            try {
                respObj = Ext.decode(resp.responseText);
                Ext.Logger.info('Succesfully loaded i18n file: ' + me.locale);
            } catch(err) {
                me.onLoadAppLocaleFailure();
                return false;
            } finally {
                if (respObj) {
                    me.setAppLanguage(respObj);
                    me.recreateSingletons();
                }
            }
        }
    },

    /**
     *
     */
    recreateSingletons: function(){
        Ext.MessageBox = Ext.Msg = new Ext.window.MessageBox();
    },

    /**
     *
     */
    onLoadAppLocaleFailure: function() {
        var me = this;
        var view = me.getView();
        var defaultLanguage = view.getDefaultLanguage();

        if (me.locale === defaultLanguage) {
            me.erroneousTryToLoadDefaultLanguage = true;
        }

        // load default language, but try only once to prevent killswitch
        if (!me.erroneousTryToLoadDefaultLanguage) {
            Ext.Logger.warn('Error on loading the selected i18n file! Will ' +
                    'try to load the default language ' + defaultLanguage +
                    ' instead.');
            me.requestLanguageFile(defaultLanguage);
        } else {
            Ext.Logger.error('٩(͡๏̯͡๏)۶ Could neither load the selected nor ' +
                    'the fallback i18n file! Bad front-end behaviour is to ' +
                    'be expected.');
        }
    },

    /**
     *
     */
    setAppLanguage: function(localeObj) {
        var me = this;
        var cq = Ext.ComponentQuery.query;
        var cqTpl = '{self.getName() === "{0}"}{getViewModel()}';
        var instantiatedClasses;
        var baseLocaleObj;

        Ext.iterate(localeObj, function(className, locale) {
            baseLocaleObj = {
                override: className
            };

            Ext.iterate(locale, function(key, value) {
                baseLocaleObj[key] = value;
            });

            // 1. override the class itself
            Ext.define(className + '.locale.' + me.locale, baseLocaleObj);

            // 2. Now we will handle the classes viewmodel, if exisiting.
            // The override has to be based on the unmodified classname in
            // this case
            var currentClass = Ext.ClassManager.get(className);
            if (currentClass && currentClass.getConfigurator) {
                var configurator = currentClass.getConfigurator();
                if (configurator && configurator.values &&
                    configurator.values.viewModel) {
                        var type = configurator.values.viewModel.type;
                        if (!Ext.isEmpty(type)) {
                            var viewClassName = Ext.ClassManager.getName(
                                Ext.ClassManager.getByAlias('viewmodel.' +
                                    type));
                            baseLocaleObj.override = viewClassName;
                            Ext.define(viewClassName, baseLocaleObj);
                        }
                }
            }

            // 3. override the classes already instantiated
            // get all instantiated classes (containing a view model)
            instantiatedClasses = cq(Ext.String.format(cqTpl, className));
            // set the locale for each class
            Ext.each(instantiatedClasses, function(clazz) {
                clazz.getViewModel().setData(locale.config.data);
            });
        });
    }
});
