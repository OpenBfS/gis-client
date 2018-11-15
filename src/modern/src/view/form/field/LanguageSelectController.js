Ext.define('Koala.view.form.field.LanguageSelectController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-field-languageselect',

    /**
     * The abbrev of the active language.
     *
     * @type {String}
     */
    locale: null,

    /**
     *
     */
    onInitialize: function() {
        var me = this;
        var view = me.getView();

        view.setValue(view.getDefaultLanguage());
        me.requestLanguageFile(view.getDefaultLanguage());
    },

    /**
     *
     */
    onLanguageChange: function(combo, newValue) {
        var me = this;
        newValue = Ext.isString(newValue) ? newValue : newValue.get('code');

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
            } catch (err) {
                me.onLoadAppLocaleFailure();
                return false;
            } finally {
                if (respObj) {
                    me.setAppLanguage(respObj);
                    me.setMomentJsLocale(me.locale);
                    Koala.util.Layer.repaintLayerFilterIndication();
                }
            }
        }
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

            // 2. Now we will handle the classes viewmodel, if existing.
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
    },

    /**
     * Sets the format for Moment.js to the selected locale.
     *
     * @method setMomentJsLocale
     * @param {String} locale The locale identifier to set.
     */
    setMomentJsLocale: function(locale) {
        moment.locale(locale);
    }
});
