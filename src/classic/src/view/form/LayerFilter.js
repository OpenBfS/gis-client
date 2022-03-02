/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.LayerFilter
 */
Ext.define('Koala.view.form.LayerFilter', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-layerfilter',

    requires: [
        'Ext.form.field.Date',
        'Ext.form.ComboBox',
        'Ext.ux.form.MultiSelect',

        'Koala.util.Date',
        'Koala.util.Filter',

        'Koala.view.form.LayerFilterController',
        'Koala.view.form.LayerFilterModel'
    ],

    controller: 'k-form-layerfilter',
    viewModel: {
        type: 'k-form-layerfilter'
    },
    layout: 'anchor',
    bodyCls: 'k-form-layerfilter',
    defaults: {
        anchor: '100%'
    },
    padding: 5,
    scrollable: 'true',

    ignoreFields: [
        'minutespinner',
        'hourspinner',
        'minminutespinner',
        'minhourspinner',
        'maxminutespinner',
        'maxhourspinner'
    ],

    listeners: {
        beforerender: 'onBeforeRenderLayerFilterForm',
        beforedestroy: 'onBeforeDestroyLayerFilterForm'
    },

    config: {
        metadata: null,
        filters: null,
        format: null,
        /**
         * This config determines if we are to add a new layer with folter on
         * form submission or if we need to update an existing one.
         *
         * @type {ol.layer.Layer}
         */
        layer: null
    },

    /**
     * Initializes the LayerFilter.
     */
    initComponent: function() {
        var me = this;
        me.callParent();

        me.maxHeight = Ext.getBody().getViewSize().height*0.9;

        var filters = me.getFilters();

        if (!filters || filters.length < 1) {
            me.addWithoutFilterBtn();
            return;
        }

        me.hasTimeFilter = false;
        me.hasPointInTimeFilter = false;
        var timeFilter;
        me.useTimeSelectComponent = true;

        Ext.each(filters, function(filter, idx) {
            var type = (filter.type || '').toLowerCase();
            switch (type) {
                case 'timerange':
                    // Currently, if at least one filter has set useTimeSelectComponent to false,
                    // timeSelectComponents will be deactivated for all filters.
                    if (Ext.isDefined(filter.useTimeSelectComponent) && filter.useTimeSelectComponent === 'false') {
                        me.useTimeSelectComponent = false;
                    }
                    if (me.useTimeSelectComponent) {
                        me.chartContainer = me.add({
                            html: '<div class="timeselect-chart"></div>',
                            height: 100,
                            width: 400,
                            hidden: true
                        });
                    }
                    me.addTimeRangeFilter(filter, idx);
                    me.hasTimeFilter = true;
                    timeFilter = filter;
                    break;
                case 'pointintime':
                    // Currently, if at least on filter has set useTimeSelectComponent to false,
                    // timeSelectComponents will be deactivated for all filters.
                    if (Ext.isDefined(filter.useTimeSelectComponent) && filter.useTimeSelectComponent === 'false') {
                        me.useTimeSelectComponent = false;
                    }
                    if (me.useTimeSelectComponent) {
                        me.chartContainer = me.add({
                            html: '<div class="timeselect-chart"></div>',
                            height: 100,
                            width: 400,
                            hidden: true
                        });
                    }
                    me.addPointInTimeFilter(filter, idx);
                    me.hasTimeFilter = true;
                    me.hasPointInTimeFilter = true;
                    timeFilter = filter;
                    break;
                case 'rodostime':
                case 'value':
                    me.addValueFilter(filter, idx);
                    break;
                default:
                    Ext.log.warn('Unexpected filter type: ' + filter.type);
                    break;
            }
        });

        if (me.hasTimeFilter) {
            var autorefresh = me.getAutorefreshCheckbox();
            me.add(autorefresh);
            var dropdown = me.getAutorefreshDropdown();
            me.add(dropdown);
        }

        var submitButton = me.getSubmitButton();
        me.add(submitButton);
        me.getForm().isValid();

        Ext.each(filters, function(filter) {
            var field = me.down('[name=' + filter.param + ']');
            me.getController().onFilterChanged(field);
        });
        if (me.hasPointInTimeFilter && me.useTimeSelectComponent) {
            window.setTimeout(this.setupTimeSelectChart.bind(this, timeFilter), 0);
        } else if (me.hasTimeFilter && me.useTimeSelectComponent) {
            window.setTimeout(this.setupTimeSelectChart.bind(this, false, timeFilter), 0);
        }
    },

    fetchTimeSelectData: function(minValue, maxValue) {
        if (this.chartContainer) {
            this.chartContainer.setLoading(true);
        }
        var me = this;
        var Objects = Koala.util.Object;
        var metadata = this.getMetadata();
        var context = Koala.util.AppContext.getAppContext().data.merge;
        var url = context.urls['geoserver-base-url'] + '/wps';
        var propertyName;
        var layerNameOverride;
        var timeFilter;
        Ext.each(metadata.filters, function(filter) {
            if (filter.type === 'pointintime' || filter.type === 'timerange') {
                propertyName = filter.param;
                layerNameOverride = filter.layerName;
                timeFilter = filter;
            }
        });
        if (timeFilter.allowedValues) {
            var currentFilters = this.getController().updateFiltersFromForm(metadata.filters);
            var ctx = Objects.arrayToObject(currentFilters, 'param', 'effectivevalue');
            Ext.each(currentFilters, function(filter) {
                if (filter.type === 'pointintime') {
                    ctx.currentDate = filter.effectivedatetime.toISOString();
                }
                if (filter.type === 'timerange') {
                    ctx.minDate = filter.effectivemindatetime.toISOString();
                    ctx.maxDate = filter.effectivemaxdatetime.toISOString();
                }
                if (filter.type === 'value') {
                    ctx[filter.param] = ctx[filter.param] || filter.defaultValue;
                }
            });
            return new Ext.Promise(function(resolve) {
                Koala.util.String.replaceTemplateStringsWithPromise(timeFilter.allowedValues, ctx, undefined, undefined, true)
                    .then(function(data) {
                        me.chartContainer.setLoading(false);
                        resolve({
                            responseText: data
                        });
                    });
            });
        }
        var layerName;
        if (metadata.layerConfig.wms) {
            layerName = metadata.layerConfig.wms.layers;
        } else {
            var vectorUrl = new URL(metadata.layerConfig.vector.url);
            layerName = vectorUrl.searchParams.get('typeName');
        }
        if (layerNameOverride) {
            layerName = layerNameOverride;
        }
        var inputs = 'layerName=' + layerName;
        inputs += ';propertyName=' + propertyName;
        inputs += ';filter=' + encodeURIComponent(propertyName + ' >= \'' + minValue.toISOString() + '\' and ' +
            propertyName + ' <= \'' + maxValue.toISOString() + '\'');
        return Ext.Ajax.request({
            url: url,
            timeout: 120000,
            params: {
                request: 'Execute',
                service: 'WPS',
                version: '1.0.0',
                identifier: 'gs:DistinctValues',
                rawDataOutput: 'result',
                dataInputs: inputs
            }
        });
    },

    setupTimeSelectChart: function(pointInTimeFilter, filter) {
        var me = this;
        var metadata = this.getMetadata();
        this.pointInTimeFilter = pointInTimeFilter;
        this.filter = filter;
        if (pointInTimeFilter) {
            this.duration = moment.duration(metadata.layerConfig.timeSeriesChartProperties.duration);
            this.duration = this.duration.asMilliseconds() / 3 + this.duration.asMilliseconds();
        } else {
            this.duration = moment.duration(filter.maxduration);
            this.duration = this.duration.asMilliseconds() / 3 + this.duration.asMilliseconds();
        }
        var resolution;
        var unit;
        if (pointInTimeFilter) {
            resolution = parseInt(pointInTimeFilter.interval, 10);
            unit = pointInTimeFilter.unit;
        } else {
            resolution = parseInt(filter.interval, 10);
            unit = filter.unit;
        }

        var f = filter || pointInTimeFilter;
        var startMinValue;
        if (f.maxdatetimeinstant) {
            this.maxValue = f.maxdatetimeinstant;
            if (this.maxValue === Koala.util.Filter.NOW_STRING) {
                this.maxValue = Koala.util.Date.getUtcMoment(new Date());
            } else {
                this.maxValue = Koala.util.Date.getUtcMoment(this.maxValue);
            }
            startMinValue = this.maxValue.clone().subtract(this.duration);
        }
        if (f.mindatetimeinstant) {
            this.minValue = f.mindatetimeinstant;
            this.minValue = Koala.util.Date.getUtcMoment(this.minValue);
        }

        this.resolution = resolution * (unit === 'minutes' ? 1 :
            unit === 'hours' ? 60 : unit === 'days' ? 60 * 24 : 1);

        me.chartContainer.setHidden(false);
        me.chartContainer.setLoading(true);
        this.currentStartValue = startMinValue;
        this.currentEndValue = this.maxValue.clone();
        this.fetchTimeSelectData(startMinValue, this.maxValue)
            .then(function(response) {
                me.updateTimeSelectComponentData(response);
            });
    },

    updateTimeFilters: function() {
        var me = this;
        if (this.currentStartValue && this.currentEndValue) {
            this.fetchTimeSelectData(this.currentStartValue, this.currentEndValue)
                .then(function(response) {
                    if (me.useTimeSelectComponent) {
                        me.updateTimeSelectComponentData(response);
                    }
                });
        }
    },

    updateTimeSelectComponentData: function(response) {
        var me = this;
        if (!me.useTimeSelectComponent) {
            return;
        }
        var languageSelect = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        if (!languageSelect && Ext.isModern) {
            // modern
            languageSelect = Ext.ComponentQuery.query('k-field-languageselect')[0];
        }
        var elm = document.querySelector('.timeselect-chart');
        this.chartContainer.setLoading(false);
        var json = JSON.parse(response.responseText);
        if (json.success === false) {
            me.chartContainer.el.dom.style.display = 'none';
            return;
        }
        var data = [];
        Ext.each(json, function(d) {
            var date = Koala.util.Date.getUtcMoment(d.val);
            data.push(date.valueOf());
        });
        data.sort();
        this.timeSelectConfig = {
            data: data,
            resolution: this.resolution,
            duration: this.duration,
            color: 'rgb(204, 204, 204)',
            selectedColor: 'rgb(85, 127, 162)',
            hoverColor: 'rgb(255, 0, 0)',
            page: 0,
            useBrush: !this.pointInTimeFilter,
            brushExtent: [[0, 0], [400, 180]],
            initialBrushSelection: [400 / 3, 400],
            showTooltip: true,
            locale: languageSelect.getValue(),
            onSelectionChange: function(startDateTime, endDateTime) {
                // HBD: onSelectionChange will also be called, when
                //      the chart was created. In this case, startDateTime
                //      and endDateTime will be 0. We have to ignore
                //      this onSelectionChange call, as it will otherwise
                //      overwrite the TimeRangeFields to 01.01.1970.
                //      This of course now also disables the change event
                //      in case someone actually selects 01.01.1970 as
                //      startDateTime and endDateTime.
                if (startDateTime === 0 && endDateTime === 0) {
                    return;
                }
                if (me.pointInTimeFilter) {
                    var value = Koala.util.Date.getTimeReferenceAwareMomentDate(
                        moment(startDateTime));
                    var component = me.down('[name=' + me.pointInTimeFilter.param + ']');
                    // We ignore the change events when updating the fields
                    // to prevent triggering a chain of multiple change events.
                    // Instead, we just trigger the change event for the last
                    // field we update here.
                    var hourSpinner = component.up().down('[name=hourspinner]');
                    hourSpinner.suspendEvents();
                    hourSpinner.setValue(value.hour());
                    hourSpinner.resumeEvents(false);
                    var minuteSpinner = component.up().down('[name=minutespinner]');
                    minuteSpinner.suspendEvents();
                    minuteSpinner.setValue(value.minute());
                    minuteSpinner.resumeEvents(false);

                    component.setValue(value);
                } else {
                    var minComponent = me.down('[name=mincontainer]');
                    var maxComponent = me.down('[name=maxcontainer]');
                    var startValue = Koala.util.Date.getTimeReferenceAwareMomentDate(
                        moment(startDateTime));
                    var endValue = Koala.util.Date.getTimeReferenceAwareMomentDate(
                        moment(endDateTime));
                    // We ignore the change events when updating the fields
                    // to prevent triggering a chain of multiple change events.
                    // Instead, we just trigger the change event for the last
                    // field we update here.
                    var minHourSpinner = minComponent.up().down('[name=minhourspinner]');
                    minHourSpinner.suspendEvents();
                    minHourSpinner.setValue(startValue.hour());
                    minHourSpinner.resumeEvents(false);
                    var minMinuteSpinner = minComponent.up().down('[name=minminutespinner]');
                    minMinuteSpinner.suspendEvents();
                    minMinuteSpinner.setValue(startValue.minute());
                    minMinuteSpinner.resumeEvents(false);
                    var minDatefield = me.down('[name=mincontainer] > datefield');
                    minDatefield.suspendEvents();
                    minDatefield.setValue(startValue);
                    minDatefield.resumeEvents(false);

                    var maxHourSpinner = maxComponent.down('[name=maxhourspinner]');
                    maxHourSpinner.suspendEvents();
                    maxHourSpinner.setValue(endValue.hour());
                    maxHourSpinner.resumeEvents(false);
                    var maxMinuteSpinner = maxComponent.down('[name=maxminutespinner]');
                    maxMinuteSpinner.suspendEvents();
                    maxMinuteSpinner.setValue(endValue.minute());
                    maxMinuteSpinner.resumeEvents(false);

                    me.down('[name=maxcontainer] > datefield').setValue(endValue);
                }
            }
        };

        if (this.timeSelectComponent) {
            if (this.pointInTimeFilter) {
                this.timeSelectConfig.selectedTime = this.timeSelectComponent.getSelectedTime();
            } else {
                this.timeSelectConfig.selectedTimeRange = this.timeSelectComponent.getSelectedTimeRange();
            }
        } else {
            if (this.pointInTimeFilter) {
                this.timeSelectConfig.selectedTime = this.pointInTimeFilter.effectivedatetime ?
                    this.pointInTimeFilter.effectivedatetime.unix() * 1000 :
                    moment(this.pointInTimeFilter.defaulttimeinstant, this.pointInTimeFilter.defaulttimeformat).unix() * 1000;
            } else {
                if (this.filter.effectivemindatetime) {
                    this.timeSelectConfig.selectedTimeRange = [this.filter.effectivemindatetime.unix() * 1000, this.filter.effectivemaxdatetime.unix() * 1000];
                } else {
                    this.timeSelectConfig.selectedTimeRange = [
                        moment(this.filter.defaultstarttimeinstant, this.filter.defaultstarttimeformat).unix() * 1000,
                        moment(this.filter.defaultendtimeinstant, this.filter.defaultendtimeformat).unix() * 1000
                    ];
                }
            }
        }
        var size = [400, 100];
        if (this.chartConfig) {
            size = this.chartConfig.size;
        }
        this.chartConfig = {
            components: [this.timeSelectComponent = new D3Util.TimeSelectComponent(this.timeSelectConfig)],
            size: size
        };

        this.chartRenderer = new D3Util.ChartRenderer(this.chartConfig);
        if (data.length) {
            this.chartRenderer.render(elm);
        }
        this.chartContainer.up().on('resize', function(self, newWidth, newHeight, oldWidth) {
            if (newWidth !== oldWidth) {
                me.updateTimeSelectComponent('resize', newWidth);
            }
        });

        var buttons = this.down('container[name=navigation-buttons]');
        if (buttons) {
            this.remove(buttons);
        }

        var chartContainerIndex = this.items.indexOf(this.chartContainer);
        // Only show navigation buttons when the chart is visible.
        // I.e. if the chartContainer was added and data is not empty.
        if (chartContainerIndex > -1 && data.length) {
            this.insert(chartContainerIndex, {
                xtype: 'container',
                name: 'navigation-buttons',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-angle-left',
                        margin: '0 0 5 5',
                        width: 50,
                        handler: function() {
                            me.updateTimeSelectComponent('pageBackward');
                        }
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-angle-right',
                        margin: '0 0 5 5',
                        width: 50,
                        handler: function() {
                            me.updateTimeSelectComponent('pageForward');
                        }
                    }
                ]
            });
        }

    },

    updateTimeSelectComponent: function(reason, newVal) {
        var me = this;
        if (!me.useTimeSelectComponent) {
            return;
        }
        if (reason === 'resize') {
            me.timeSelectConfig.brushExtent = [[0, 0], [newVal, 180]];
            me.timeSelectConfig.initialBrushSelection = [newVal / 3, newVal];
            me.chartConfig.size = [newVal, 100];
        } else if (reason === 'pageForward' || reason === 'pageBackward') {
            if (me.timeSelectComponent) {
                if (me.pointInTimeFilter) {
                    me.timeSelectConfig.selectedTime = me.timeSelectComponent.getSelectedTime();
                } else {
                    me.timeSelectConfig.selectedTimeRange = me.timeSelectComponent.getSelectedTimeRange();
                }
            }
            var newStartValue, newEndValue;
            var maxPages = Math.ceil(this.timeSelectComponent.getPages());
            var currentPage = this.timeSelectConfig.page;
            var nextPage = currentPage;
            if (reason === 'pageForward') {
                newStartValue = this.currentStartValue.clone().add(this.duration);
                newEndValue = this.currentEndValue.clone().add(this.duration);
                if (newEndValue.isAfter(this.maxValue)) {
                    newEndValue = this.maxValue.clone();
                    newStartValue = this.maxValue.clone().subtract(this.duration);
                }
                // pages are 0-based, so currentPage should never equal maxPages
                if (currentPage + 1 < maxPages) {
                    nextPage = currentPage + 1;
                }
            } else {
                newStartValue = this.currentStartValue.clone().subtract(this.duration);
                newEndValue = this.currentEndValue.clone().subtract(this.duration);
                if (newStartValue.isBefore(this.minValue)) {
                    newStartValue = this.minValue.clone();
                    newEndValue = this.minValue.clone().add(this.duration);
                }
                if (currentPage - 1 >= 0) {
                    nextPage = currentPage - 1;
                }
            }
            this.currentStartValue = newStartValue;
            this.currentEndValue = newEndValue;
            var metadata = this.getMetadata();
            var timeFilter;
            Ext.each(metadata.filters, function(filter) {
                if (filter.type === 'pointintime' || filter.type === 'timerange') {
                    timeFilter = filter;
                }
            });
            // We do not want to trigger new requests when
            // templateUrls are used on time filters.
            // There, we just visualize the next page, as we
            // expect all data to be already loaded.
            // If no templateUrl was specified, we still want
            // to trigger loading the next slice, as there, only
            // data for the current page are loaded.
            if (timeFilter.allowedValues) {
                this.timeSelectComponent.setPage(nextPage);
            } else {
                this.fetchTimeSelectData(newStartValue, newEndValue)
                    .then(function(response) {
                        me.updateTimeSelectComponentData(response);
                    });
            }
        } else if (me.timeSelectConfig) {
            // date or time changed
            var min = reason.up('fieldset').down('[name=mincontainer] > datefield').getValue();
            var max = reason.up('fieldset').down('[name=maxcontainer] > datefield').getValue();
            me.timeSelectConfig.selectedTimeRange = [min, max];
        }

        if (me.timeSelectConfig) {
            me.chartConfig.components = [me.timeSelectComponent = new D3Util.TimeSelectComponent(me.timeSelectConfig)];
            me.chartRenderer = new D3Util.ChartRenderer(me.chartConfig);
            if (me.timeSelectConfig.data.length) {
                me.chartRenderer.render(document.querySelector('.timeselect-chart'));
            }
        }
    },

    /**
     * Returns a button for submitting the filter and handling the submssion via
     * correctly bound handlers. If this panel was constructed with a `layer`,
     * it will update the filter of that layer. If it was created without a
     * layer, the handler will create one and add it to the map.
     *
     * @return {Ext.button.Button} The button to submit the form, will either
     *     add a new layer with an appropriate filter or update the filter of
     *     an existing layer.
     */
    getSubmitButton: function() {
        var handler;
        var textBind;
        if (!this.getLayer()) {
            handler = 'submitFilter';
            textBind = '{buttonText}';
        } else {
            handler = 'changeFilterForLayer';
            textBind = '{buttonTextChangeFilter}';
        }
        return Ext.create('Ext.button.Button', {
            formBind: true,
            handler: handler,
            bind: {
                text: textBind
            }
        });
    },

    getAutorefreshCheckbox: function() {
        var layer = this.getLayer();
        var checked = false;
        if (layer) {
            var id = layer.metadata.id;
            checked = Koala.util.Autorefresh.prototype.autorefreshMap[id];
        }
        return Ext.create('Ext.form.field.Checkbox', {
            bind: {
                fieldLabel: '{refreshAutomatically}'
            },
            name: 'autorefreshcheckbox',
            checked: checked,
            labelWidth: '100%'
        });
    },

    getAutorefreshDropdown: function() {
        return Koala.util.Filter.createAutorefreshDropdown(this.layer,
            this.getViewModel());
    },

    addWithoutFilterBtn: function() {
        var addWithoutFilterButton = Ext.create('Ext.button.Button', {
            bind: {
                text: '{buttonTextNoFilter}'
            },
            handler: 'submitNoFilter'
        });
        this.add(addWithoutFilterButton);
    },

    /**
     * Adds a point in time filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type
     *     `pointintime`.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    addPointInTimeFilter: function(filter, idx) {
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var pointInTimeFilter = FilterUtil.createPointInTimeFieldset(me.getFormat(), filter, idx);
        me.add(pointInTimeFilter);
    },

    /**
     * Adds a timerange filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type timerange.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    addTimeRangeFilter: function(filter, idx) {
        var me = this;
        var ctrl = me.getController();
        var FilterUtil = Koala.util.Filter;
        var timeRangeFilter = FilterUtil.createTimeRangeFieldset(me.getFormat(), filter, idx);
        me.add(timeRangeFilter);

        Ext.each(timeRangeFilter.query('datefield'), function(field) {
            if (me.useTimeSelectComponent) {
                field.addListener('select', me.updateTimeSelectComponent.bind(me));
            }
        });
        Ext.each(timeRangeFilter.query('numberfield'), function(field) {
            field.addListener('spinend', function() {
                if (me.useTimeSelectComponent) {
                    me.updateTimeSelectComponent.apply(me, arguments);
                }
                ctrl.onFilterChanged.apply(ctrl, arguments);
            });
            field.addListener('specialkey', function() {
                if (me.useTimeSelectComponent) {
                    me.updateTimeSelectComponent.apply(me, arguments);
                }
                ctrl.onFilterChanged.apply(ctrl, arguments);
            });
        });
    },

    /**
     * Creates and adds a value filter at the specified index.
     *
     * @param {Object} filter A filter specification object of type `value`.
     * @param {Number} idx The index of the filter in the list of all filters.
     */
    addValueFilter: function(filter, idx) {
        var FilterUtil = Koala.util.Filter;
        var field = null;
        var value;
        if (filter.type === 'rodostime' && moment.isMoment(filter.effectivedatetime)) {
            value = filter.effectivedatetime.format();
        } else {
            value = filter.effectivevalue || filter.defaultValue;
        }

        var sharedCfg = {
            labelWidth: 120,
            name: filter.param,
            fieldLabel: filter.alias || filter.param,
            value: value,
            emptyText: filter.defaultValue
        };

        if (filter.allowedValues && filter.allowedValues !== 'null') {
            field = FilterUtil.getComboFromFilter(filter);
            if (Ext.isArray(value) && value.length > 1) {
                var joined = value.join(',');
                if (filter.allowedValues.includes(joined)) {
                    sharedCfg.value = [joined];
                }
            }
        } else {
            field = {
                xtype: 'textfield'
            };
        }
        if (filter.allowMultipleSelect && Ext.isString(sharedCfg.value)) {
            sharedCfg.value = [sharedCfg.value];
        }

        field = Ext.apply(field, sharedCfg);
        if (field.value === 'null' || field.value.length && field.value[0] === 'null') {
            field.value = '';
        }
        if (field.emptyText === 'null' || field.emptyText.length && field.emptyText[0] === 'null') {
            field.emptyText = '';
        }

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            padding: 5,
            defaults: {
                anchor: '100%'
            },
            layout: 'anchor',
            filterIdx: idx,
            items: field
        });
        this.add(fieldSet);
    }

});
