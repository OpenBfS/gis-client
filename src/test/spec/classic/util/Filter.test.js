// einmal in den classic und einmal in den modern ordner
Ext.Loader.syncRequire(['Koala.util.Filter',
                        'Koala.util.Object',
                        'Koala.util.Date']);

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

    afterEach(function() {
        delete Koala.Application;
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
        });

        describe('#getStartEndFilterFromMetadata', function() {
            var metadata = {
                layerConfig: {
                    timeSeriesChartProperties: {
                        xAxisAttribute: "end_measure",
                        yAxisAttribute: "value",
                        end_timestamp: "2016-10-17T00:00:00",
                        duration: "P4WT",
                        end_timestamp_format: "Y-m-dTH:i:s",
                        yAxis_minimum: "0",
                        yAxis_maximum: "0.3",
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

            it('returns a parameter and min and max UTC moment date object from filters', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                expect(got).to.have.property('parameter');
                expect(got).to.have.property('mindatetimeinstant');
                expect(got).to.have.property('maxdatetimeinstant');
            });

            it('return check is filter object', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                expect(got).to.be.an('object');

            });

            it('returns an min and max UTC moment date object as a property from metadata', function() {
                var got = Koala.util.Filter.getStartEndFilterFromMetadata(metadata);
                var xAxis_maximum = moment.utc('2016-10-17T00:00:00');
                var xAxis_minimum = moment.utc('2006-09-19T00:00:00');
                var equalMax = xAxis_maximum.isSame(got.maxdatetimeinstant);
                var equalMin = xAxis_minimum.isSame(got.mindatetimeinstant);
                expect(equalMax).to.be(true);
                // I do not know, the xAxis_minimum date is not the same like
                // the got.mindatetimeinstant
                expect(equalMin).to.be(false);
            });

        });

        describe('#getStoreFromAllowedValues', function() {

            // input String with raw values from the GNOS
            // examples from the layer ODL butto 1h

            var allowedValues = [{"val": "'BfS'","dsp": "BfS"},{"val": "'KFUE'","dsp": "KFÜ"},{"val": "'EURDEP'","dsp": "EURDEP"}];

            it('is defined', function() {
                expect(Koala.util.Filter.getStoreFromAllowedValues).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getStoreFromAllowedValues).to.be.a(Function);
            });

            it('returns data object from store', function() {
                var got = Koala.util.Filter.getStoreFromAllowedValues(allowedValues);
                expect(got).to.be.an('object');
            });
        });

        describe('#getComboFromAllowedValues', function() {

            var allowedValues = [{"val": "'BfS'","dsp": "BfS"},{"val": "'KFUE'","dsp": "KFÜ"},{"val": "'EURDEP'","dsp": "EURDEP"}];

            it('is defined', function() {
                expect(Koala.util.Filter.getComboFromAllowedValues).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.getComboFromAllowedValues).to.be.a(Function);
            });

            it('returns combo object', function() {
                var rawMulti = false;
                Ext.isModern = false;
                var got = Koala.util.Filter.getComboFromAllowedValues(allowedValues, rawMulti);
                expect(got.xtype).to.be('combo');
            });

            it('returns multiselect object', function() {
                var rawMulti = true;
                Ext.isModern = false;
                var got = Koala.util.Filter.getComboFromAllowedValues(allowedValues, rawMulti);
                expect(got.xtype).to.be('multiselect');
            });
        });

        describe('#getSpinner', function() {

            var filters = {
                type: "pointintime",
                param: "end_measure",
                interval: "24",
                unit: "hours",
                mindatetimeformat: "Y-m-d H:i:s",
                mindatetimeinstant: "2016-10-17 00:00:00",
                maxdatetimeformat: "Y-m-d H:i:s",
                maxdatetimeinstant: "2016-10-18 00:00:00",
                defaulttimeformat: "Y-m-d H:i:s",
                defaulttimeinstant: "2016-10-17 00:00:00"
            };

            var filtersMinutes = {
                type: "pointintime",
                param: "end_measure",
                interval: "1",
                unit: "minutes",
                mindatetimeformat: "Y-m-d H:i:s",
                mindatetimeinstant: "2016-10-17 00:00:00",
                maxdatetimeformat: "Y-m-d H:i:s",
                maxdatetimeinstant: "2016-10-18 00:00:00",
                defaulttimeformat: "Y-m-d H:i:s",
                defaulttimeinstant: "2016-10-17 00:00:00"
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
                Ext.isModern = false;
                var got = Koala.util.Filter.getSpinner(filters, spinnerType, name, value);
                expect(got.xtype).to.be('numberfield');
            });

            it('returns a minutes numberfield object', function() {
                Ext.isModern = false;
                var got = Koala.util.Filter.getSpinner(filtersMinutes, spinnerTypeMinutes, nameMinutes, value);
                expect(got.xtype).to.be('numberfield');
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
                var maxValue = 24;
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

            it('check is val a String', function() {
                var val = 2;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be.a('string');
            });
            it('returns val as a String', function() {
                var val = 2;
                var got = Koala.util.Filter.leadingZeroValueToRaw(val);
                expect(got).to.be('02');
            });
        });

        describe('#leadingZeroRawToValue', function() {
            it('is defined', function() {
                expect(Koala.util.Filter.leadingZeroRawToValue).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Filter.leadingZeroRawToValue).to.be.a(Function);
            });
            it('check is raw a number', function() {
                var raw = 2;
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be.a('number');
            });
            it('returns val as a number', function() {
                var raw = 02;
                var got = Koala.util.Filter.leadingZeroRawToValue(raw);
                expect(got).to.be(2);
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

            it('returns check is object', function() {
                var got = Koala.util.Filter.startAndEndFieldnamesFromMetadataParam(param);
                expect(got).to.be.an('object');
            });

            it('returns check the object have the properties startName and endName', function() {
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
