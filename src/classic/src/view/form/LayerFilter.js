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

        me.chartContainer = me.add({
            html: '<div class="timeselect-chart"></div>',
            height: 200,
            width: 400,
            hidden: true
        });

        me.maxHeight = Ext.getBody().getViewSize().height*0.9;

        var filters = me.getFilters();

        if (!filters || filters.length < 1) {
            me.addWithoutFilterBtn();
            return;
        }

        me.hasTimeFilter = false;
        me.hasPointInTimeFilter = false;
        var timeFilter;

        Ext.each(filters, function(filter, idx) {
            var type = (filter.type || '').toLowerCase();
            switch (type) {
                case 'timerange':
                    me.addTimeRangeFilter(filter, idx);
                    me.hasTimeFilter = true;
                    timeFilter = filter;
                    break;
                case 'pointintime':
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

        var metadata = this.getMetadata();
        var path = 'layerConfig/olProperties/filterDependencies';
        var depsString = Koala.util.Object.getPathStrOr(metadata, path, '{}');
        var deps = depsString;
        if (Ext.isString(depsString)) {
            deps = JSON.parse(depsString);
        }
        deps = Koala.util.Object.inverse(deps);
        Ext.each(filters, function(filter) {
            if (!deps[filter.alias]) {
                return;
            }
            var field = me.down('[name=' + filter.param + ']');
            me.getController().onFilterChanged(field);
        });
        if (me.hasPointInTimeFilter) {
            window.setTimeout(this.setupTimeSelectChart.bind(this, timeFilter), 0);
        } else if (me.hasTimeFilter) {
            window.setTimeout(this.setupTimeSelectChart.bind(this, false, timeFilter), 0);
        }
    },

    fetchTimeSelectData: function() {
        var metadata = this.getMetadata();
        var context = Koala.util.AppContext.getAppContext().data.merge;
        var url = context.urls['geoserver-base-url'] + '/ows';
        var propertyName;
        Ext.each(metadata.filters, function(filter) {
            if (filter.type === 'pointintime' || filter.type === 'timerange') {
                propertyName = filter.param;
            }
        });
        var inputs = 'layerName=' + metadata.layerConfig.wms.layers;
        inputs += ';propertyName=' + propertyName;
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
        var duration;
        if (pointInTimeFilter) {
            duration = moment.duration(metadata.layerConfig.timeSeriesChartProperties.duration);
            duration = duration.asMilliseconds() / 3 + duration.asMilliseconds();
        } else {
            duration = moment.duration(filter.maxduration);
            duration = duration.asMilliseconds() / 3 + duration.asMilliseconds();
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

        resolution = resolution * (unit === 'minutes' ? 1 :
            unit === 'hours' ? 60 : unit === 'days' ? 60 * 24 : 1);

        var elm = document.querySelector('.timeselect-chart');
        me.chartContainer.setHidden(false);
        me.chartContainer.setLoading(true);
        this.fetchTimeSelectData()
            .then(function(response) {
                me.chartContainer.setLoading(false);
                var data = [];
                Ext.each(JSON.parse(response.responseText), function(d) {
                    data.push(new Date(d.val).getTime());
                });
                data.sort();
                me.timeSelectConfig = {
                    data: data,
                    resolution: resolution,
                    duration: duration,
                    color: 'rgb(0, 255, 0)',
                    selectedColor: 'rgb(0, 0, 255)',
                    hoverColor: 'rgb(255, 0, 0)',
                    page: 0,
                    useBrush: !pointInTimeFilter,
                    brushExtent: [[0, 0], [400, 180]],
                    initialBrushSelection: [400 / 3, 400],
                    onSelectionChange: function(startDateTime, endDateTime) {
                        if (pointInTimeFilter) {
                            var component = me.down('[name=' + pointInTimeFilter.param + ']');
                            var value = Koala.util.Date.getTimeReferenceAwareMomentDate(
                                moment(startDateTime));
                            component.setValue(value);
                            component.up().down('[name=hourspinner]').setValue(value.hour());
                            component.up().down('[name=minutespinner]').setValue(value.minute());
                        } else {
                            var minComponent = me.down('[name=mincontainer]');
                            var maxComponent = me.down('[name=maxcontainer]');
                            var startValue = Koala.util.Date.getTimeReferenceAwareMomentDate(
                                moment(startDateTime));
                            var endValue = Koala.util.Date.getTimeReferenceAwareMomentDate(
                                moment(endDateTime));
                            me.down('[name=mincontainer] > datefield').setValue(startValue);
                            minComponent.up().down('[name=minhourspinner]').setValue(startValue.hour());
                            minComponent.up().down('[name=minminutespinner]').setValue(startValue.minute());

                            me.down('[name=maxcontainer] > datefield').setValue(endValue);
                            maxComponent.down('[name=maxhourspinner]').setValue(endValue.hour());
                            maxComponent.down('[name=maxminutespinner]').setValue(endValue.minute());
                        }
                    }
                };

                if (me.timeSelectComponent) {
                    if (pointInTimeFilter) {
                        me.timeSelectConfig.selectedTime = me.timeSelectComponent.getSelectedTime();
                    } else {
                        me.timeSelectConfig.selectedTimeRange = me.timeSelectComponent.getSelectedTimeRange();
                    }
                }
                me.chartConfig = {
                    components: [me.timeSelectComponent = new D3Util.TimeSelectComponent(me.timeSelectConfig)],
                    size: [400, 200]
                };

                me.chartRenderer = new D3Util.ChartRenderer(me.chartConfig);
                me.chartRenderer.render(elm);
                me.chartContainer.up().on('resize', function(self, newWidth, newHeight, oldWidth) {
                    if (newWidth !== oldWidth) {
                        me.updateTimeSelectComponent('resize', newWidth);
                    }
                });

                me.insert(0, {
                    xtype: 'container',
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-angle-left',
                            margin: '0 0 5 5',
                            width: 50,
                            handler: function() {
                                me.updateTimeSelectComponent('pageForward');
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-angle-right',
                            margin: '0 0 5 5',
                            width: 50,
                            handler: function() {
                                me.updateTimeSelectComponent('pageBackward');
                            }
                        }
                    ]
                });
            });
    },

    updateTimeSelectComponent: function(reason, newVal) {
        var me = this;
        if (reason === 'resize') {
            me.timeSelectConfig.brushExtent = [[0, 0], [newVal, 180]];
            me.timeSelectConfig.initialBrushSelection = [newVal / 3, newVal];
            me.chartConfig.size = [newVal, 200];
        } else if (reason === 'pageForward' || reason === 'pageBackward') {
            if (me.timeSelectComponent) {
                if (me.pointInTimeFilter) {
                    me.timeSelectConfig.selectedTime = me.timeSelectComponent.getSelectedTime();
                } else {
                    me.timeSelectConfig.selectedTimeRange = me.timeSelectComponent.getSelectedTimeRange();
                }
            }
            if (reason === 'pageForward') {
                me.timeSelectConfig.page = Math.max(0, me.timeSelectConfig.page - 1);
            } else {
                me.timeSelectConfig.page = Math.min(me.timeSelectComponent.getPages(), me.timeSelectConfig.page + 1);
            }
        } else {
            // date or time changed
            var min = reason.up('fieldset').down('[name=mincontainer] > datefield').getValue();
            var max = reason.up('fieldset').down('[name=maxcontainer] > datefield').getValue();
            me.timeSelectConfig.selectedTimeRange = [min, max];
        }

        me.chartConfig.components = [me.timeSelectComponent = new D3Util.TimeSelectComponent(me.timeSelectConfig)];
        me.chartRenderer = new D3Util.ChartRenderer(me.chartConfig);
        me.chartRenderer.render(document.querySelector('.timeselect-chart'));
    },

    /**
     * Returns a button for submitting the filter and handling the submssion via
     * correctly bound handlers. If thsi panel was cosntructed with a `layer`,
     * it will update the filter of that layer. If it was created without a
     * layer, the handler will create one and add it to the map.
     *
     * @return {Ext.button.Button} The button to submit the form, will either
     *     add anew layer with an appropriate filter or update the filter of
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
        var pointInTimeFilter = FilterUtil.createPointInTimeFieldset(
            me.getFormat(), filter, idx);
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
        var FilterUtil = Koala.util.Filter;
        var timeRangeFilter = FilterUtil.createTimeRangeFieldset(
            me.getFormat(), filter, idx);
        me.add(timeRangeFilter);

        Ext.each(timeRangeFilter.query('datefield'), function(field) {
            field.addListener('select', me.updateTimeSelectComponent.bind(me));
        });
        Ext.each(timeRangeFilter.query('numberfield'), function(field) {
            field.addListener('spinend', me.updateTimeSelectComponent.bind(me));
            field.addListener('specialkey', me.updateTimeSelectComponent.bind(me));
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
        if (filter.type === 'rodostime' &&
                moment.isMoment(filter.effectivedatetime)) {
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
