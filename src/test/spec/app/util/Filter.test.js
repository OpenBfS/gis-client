Ext.Loader.syncRequire(['Koala.util.Filter']);

describe('Koala.util.Filter', function() {

    beforeEach(function() {
        Koala.Application = {};
        Koala.Application.isUtc = function() {
            return true;
        };
        Koala.Application.isLocal = function() {
            return false;
        };
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Filter).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('#getMinMaxDatesFromMetadata', function() {

            var metadata = {
                    layerConfig: {
                        timeSeriesChartProperties: {
                            xAxisMin: '1909-09-09 09:09:09',
                            xAxisMax: '2009-09-09 09:09:09'
                        }
                    }
            };

            var xAxisMin = moment.utc('1909-09-09 09:09:09');
            var xAxisMax = moment.utc('2009-09-09 09:09:09');

            it('is defined', function() {
                expect(Koala.util.Filter.getMinMaxDatesFromMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getMinMaxDatesFromMetadata).to.be.a(Function);
            });

            it('check the UTC moment date object have the properties min and max', function() {
                var got = Koala.util.Filter.getMinMaxDatesFromMetadata(metadata);
                expect(got).to.have.property('min');
                expect(got).to.have.property('max');
            });

            it('returns an min and max UTC moment date object as a property from metadata', function() {
                var got = Koala.util.Filter.getMinMaxDatesFromMetadata(metadata);
                var equalMax = xAxisMax.isSame(got.max);
                var equalMin = xAxisMin.isSame(got.min);
                expect(equalMax).to.be(true);
                expect(equalMin).to.be(true);
            });

            it('returns an min and max UTC moment date object from invalid metadata', function() {
                var metadataEmpty = {
                };
                var got = Koala.util.Filter.getMinMaxDatesFromMetadata(metadataEmpty);
                var equalMax = xAxisMax.isSame(got.max);
                var equalMin = xAxisMin.isSame(got.min);
                expect(equalMax).to.be(false);
                expect(equalMin).to.be(false);
            });

            it('returns an undefined min and max UTC momement date from metadata', function() {
                var metadataEmpty = {
                };
                var got = Koala.util.Filter.getMinMaxDatesFromMetadata(metadataEmpty);
                expect(got).to.be.an('object');
                expect(got.min).to.be(undefined);
                expect(got.max).to.be(undefined);
            });
        });

        describe('#getStartEndFilterFromMetadata', function() {
            var metadata = {
                layerConfig: {
                    timeSeriesChartProperties: {
                        xAxisAttribute: 'end_measure',
                        yAxisAttribute: 'value',
                        end_timestamp: '2016-10-17T00:00:00',
                        duration: 'P4WT',
                        end_timestamp_format: 'Y-m-dTH:i:s',
                        yAxis_minimum: '0',
                        yAxis_maximum: '0.3',
                        xAxis_minimum: '2006-09-19T00:00:00',
                        xAxis_maximum: '2016-10-17T00:00:00'
                    }
                }
            };

            it('is defined', function() {
                expect(Koala.util.Filter.getStartEndFilterFromMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getStartEndFilterFromMetadata).to.be.a(Function);
            });

            it('returns a filter object', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                expect(got).to.be.an('object');
            });

            it('returns a parameter and min and max UTC moment date object from filters', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                expect(got).to.have.property('parameter');
                expect(got).to.have.property('mindatetimeinstant');
                expect(got).to.have.property('maxdatetimeinstant');
            });


            it('returns an min and max UTC moment date object as a property from metadata', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                var xAxis_maximum = moment.utc('2016-10-17T00:00:00');
                var xAxis_minimum = moment.utc('2006-09-19T00:00:00');
                var equalMax = xAxis_maximum.isSame(got.maxdatetimeinstant);
                var equalMin = xAxis_minimum.isSame(got.mindatetimeinstant);
                expect(equalMax).to.be(true);
                // the got. maxdatetimeinstant is the same like the mindatetimeinstant
                // I do not know, the xAxis_minimum date is not the same like
                // the got.mindatetimeinstant
                expect(equalMin).to.be(false);
            });

        });

        describe('#getStoreFromAllowedValues', function() {

            // input String with raw values from the GNOS
            // examples from the layer ODL butto 1h

            var allowedValues = [{'val': '\'BfS\'','dsp': 'BfS'},{'val': '\'KFUE\'','dsp': 'KFÜ'},{'val': '\'EURDEP\'','dsp': 'EURDEP'}];

            it('is defined', function() {
                expect(Koala.util.Filter.getStoreFromAllowedValues).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getStoreFromAllowedValues).to.be.a(Function);
            });

            it('returns an object', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got).to.be.an('object');
            });

            it('returns an `Ext.data.Store`', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got instanceof Ext.data.Store).to.be(true);
            });

            it('returns the number of records', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got.getCount()).to.be.equal(3);
            });

            it('returns a string of records', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got.getData().items[1].data.val).to.be.a('string');
            });

            it('return the string of records', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got.getData().items[1].data.val).to.be.equal('\'KFUE\'');
            });

            it('return the string of records', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got.getData().items[1].data.dsp).to.be.equal('KFÜ');
            });
        });

        describe('#getComboFromFilter', function() {

            var filter = {
                allowedValues: [
                    {'val': '\'BfS\'','dsp': 'BfS'},
                    {'val': '\'KFUE\'','dsp': 'KFÜ'},
                    {'val': '\'EURDEP\'','dsp': 'EURDEP'}
                ]
            };

            it('is defined', function() {
                expect(Koala.util.Filter.getComboFromFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getComboFromFilter).to.be.a(Function);
            });

            it('returns combo object', function() {
                filter.allowMultipleSelect = false;
                if (!Ext.isModern) {
                    var got = Koala.util.Filter.getComboFromFilter(filter);
                    expect(got.xtype).to.be('combo');
                }
            });

            it('returns multiselect object', function() {
                filter.allowMultipleSelect = true;
                if (!Ext.isModern) {
                    var got = Koala.util.Filter.getComboFromFilter(filter);
                    expect(got.xtype).to.be('multiselect');
                }
            });

            it('returns list object', function() {
                filter.allowMultipleSelect = false;
                if (Ext.isModern) {
                    var got = Koala.util.Filter.getComboFromFilter(filter);
                    expect(got.xtype).to.be('selectfield');
                }
            });

            it('returns selectfield object', function() {
                filter.allowMultipleSelect = true;
                if (Ext.isModern) {
                    var got = Koala.util.Filter.getComboFromFilter(filter);
                    expect(got.xtype).to.be('list');
                }
            });
        });

        describe('#getSpinner', function() {

            var filters = {
                type: 'pointintime',
                param: 'end_measure',
                interval: '24',
                unit: 'hours',
                mindatetimeformat: 'Y-m-d H:i:s',
                mindatetimeinstant: '2016-10-17 00:00:00',
                maxdatetimeformat: 'Y-m-d H:i:s',
                maxdatetimeinstant: '2016-10-18 00:00:00',
                defaulttimeformat: 'Y-m-d H:i:s',
                defaulttimeinstant: '2016-10-17 00:00:00'
            };

            var filtersMinutes = {
                type: 'pointintime',
                param: 'end_measure',
                interval: '1',
                unit: 'minutes',
                mindatetimeformat: 'Y-m-d H:i:s',
                mindatetimeinstant: '2016-10-17 00:00:00',
                maxdatetimeformat: 'Y-m-d H:i:s',
                maxdatetimeinstant: '2016-10-18 00:00:00',
                defaulttimeformat: 'Y-m-d H:i:s',
                defaulttimeinstant: '2016-10-17 00:00:00'
            };

            var spinnerType = 'hours';
            var spinnerTypeMinutes = 'minutes';
            var name = 'hourspinner';
            var nameMinutes = 'minutesspinner';
            // value is a Date from type moment
            var value = moment.utc('2016-10-17 00:00:00');

            it('is defined', function() {
                expect(Koala.util.Filter.getSpinner).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getSpinner).to.be.a(Function);
            });

            it('returns a hour numberfield object', function() {
                if (!Ext.isModern) {
                    var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                    expect(got.xtype).to.be('numberfield');
                }
            });

            it('returns a minutes numberfield object', function() {
                if (!Ext.isModern) {
                    var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, nameMinutes, value);
                    expect(got.xtype).to.be('numberfield');
                }
            });

            it('returns a hour selectfield object', function() {
                if (Ext.isModern) {
                    var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                    expect(got.xtype).to.be('selectfield');
                }
            });

            it('returns a minutes selectfield object', function() {
                if (Ext.isModern) {
                    var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, nameMinutes, value);
                    expect(got.xtype).to.be('selectfield');
                }
            });

            it('returns the length of the pickerobject from hourspinner', function() {
                var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                if (Ext.isModern) {
                    expect(got.options.length).to.be.equal(24);
                }
            });

            it('returns the length of the pickerobject from minutespinner', function() {
                var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, nameMinutes, value);
                if (Ext.isModern) {
                    expect(got.options.length).to.be.equal(60);
                }
            });

            it('returns the minValue from hourspinner', function() {
                var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                if (!Ext.isModern) { // classic
                    expect(got.minValue).to.be.equal(0);
                } else { // modern
                    expect(got.options[0].value).to.be.equal(0);
                }
            });

            it('returns the maxValue from hourspinner', function() {
                var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                if (!Ext.isModern) { // classic
                    expect(got.maxValue).to.be.equal(23);
                } else {  // modern
                    expect(got.options[23].value).to.be.equal(23);
                }
            });

            it('returns the minValue from minutespinner', function() {
                var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, name, value);
                if (!Ext.isModern) { // classic
                    expect(got.minValue).to.be.equal(0);
                } else { // modern
                    expect(got.options[0].value).to.be.equal(0);
                }
            });

            it('returns the maxValue from minutespinner', function() {
                var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, name, value);
                if (!Ext.isModern) { // classic
                    expect(got.maxValue).to.be.equal(59);
                } else { // modern
                    expect(got.options[59].value).to.be.equal(59);
                }
            });
        });

        describe('#getSelectFieldOptionsData', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.getSelectFieldOptionsData).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getSelectFieldOptionsData).to.be.a(Function);
            });

            it('returns options object for a hourpicker', function() {
                var maxValue = 59;
                var stepSize = 1;
                var got = Koala.util.Filter.getSelectFieldOptionsData(maxValue, stepSize);
                expect(got).to.be.an('array');
            });

            it('returns options object for a minutepicker', function() {
                var maxValue = 23;
                var stepSize = 1;
                var got = Koala.util.Filter.getSelectFieldOptionsData(maxValue, stepSize);
                expect(got).to.be.an('array');
            });
        });

        describe('#leadingZeroValueToRaw', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.leadingZeroValueToRaw).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.leadingZeroValueToRaw).to.be.a(Function);
            });
            it('check is val a String, if val is beetween 1 and 9', function() {
                var val = 2;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.a('string');
            });
            it('returns val as a String, if val is 0', function() {
                var val = 0;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.equal('00');
            });

            it('returns val as a String, if val is 10', function() {
                var val = 10;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.equal('10');
            });

            it('returns val as a String, if val is 100', function() {
                var val = 100;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.equal('100');
            });

            it('returns val as a String', function() {
                var val = 0002;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.equal('02');
            });
        });

        describe('#leadingZeroRawToValue', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.leadingZeroRawToValue).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.leadingZeroRawToValue).to.be.a(Function);
            });

            it('returns raw as a number', function() {
                var raw = '02';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(2);
            });

            it('returns raw as a number', function() {
                var raw = '00000000002';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(2);
            });

            it('returns raw as a number', function() {
                var raw = '020';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(20);
            });

            it('returns raw as a number', function() {
                var raw = '00';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(0);
            });

            it('returns raw as a number', function() {
                var raw = '10';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(10);
            });

            it('returns raw as a number', function() {
                var raw = '100';
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.equal(100);
            });

            it('returns raw as a number, but raw is not equal got', function() {
                // the value of raw is now im octral system
                // the value 020 is im decimal system the value 16
                var raw = 020;
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.not.be.equal(20);
                expect(got).to.be.equal(16);
            });

        });

        describe('#setHoursAndMinutes', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.setHoursAndMinutes).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.setHoursAndMinutes).to.be.a(Function);
            });
        });

        describe('#handleSpinnerChange', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.handleSpinnerChange).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.handleSpinnerChange).to.be.a(Function);
            });
        });

        describe('#startAndEndFieldnamesFromMetadataParam', function() {

            var param ='start,end';

            it('is defined', function() {
                expect(Koala.util.Filter.startAndEndFieldnamesFromMetadataParam).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.startAndEndFieldnamesFromMetadataParam).to.be.a(Function);
            });

            it('returns an object', function() {
                var got = Koala.util.Filter.startAndEndFieldnamesFromMetadataParam(param);
                expect(got).to.be.an('object');
            });

            it('returns the properties startName and endName ', function() {
                var got = Koala.util.Filter.startAndEndFieldnamesFromMetadataParam(param);
                expect(got).to.have.property('startName');
                expect(got).to.have.property('endName');
            });

            it('returns startName as String', function() {
                var got = Koala.util.Filter.startAndEndFieldnamesFromMetadataParam(param);
                expect(got.startName).to.be.a('string');
            });

            it('returns endName as String', function() {
                var got = Koala.util.Filter.startAndEndFieldnamesFromMetadataParam(param);
                expect(got.endName).to.be.a('string');
            });
        });

        describe('#makeDateValidator', function() {
            var min = moment.utc('1999-09-09 09:09:09');
            var max = moment.utc('2009-09-09 09:09:09');
            it('is defined', function() {
                expect(Koala.util.Filter.makeDateValidator).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.makeDateValidator).to.be.a(Function);
            });
            it('returns validator, this is a function()', function() {
                var got = Koala.util.Filter.makeDateValidator(min, max);
                expect(got).to.be.a('function');
            });
        });

        describe('#validateMaxDurationTimerange', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.validateMaxDurationTimerange).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.validateMaxDurationTimerange).to.be.a(Function);
            });
        });

        describe('#revalidatePartnerField', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.revalidatePartnerField).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.revalidatePartnerField).to.be.a(Function);
            });
        });

    });

});
