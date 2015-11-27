Ext.Loader.syncRequire(['Koala.util.Duration']);

describe('Koala.util.Duration', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Duration).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#isoDurationToObject', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.isoDurationToObject
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.isoDurationToObject
                ).to.be.a(Function);
            });
            it('does not throw on undefined input', function() {
                expect(
                    Koala.util.Duration.isoDurationToObject
                ).to.not.throwException();
            });
            it('returns an object with keys for time units', function() {
                var stringDuration = "P1Y2M10DT2H30M";
                var durationObj = Koala.util.Duration.isoDurationToObject(
                        stringDuration
                    );
                var expectedKeys = [
                    "sign",
                    "years", "months", "weeks", "days",
                    "hours", "minutes", "seconds"
                ];
                expectedKeys.forEach(function(expectedKey) {
                    expect(expectedKey in durationObj).to.be(true);
                    expect(durationObj[expectedKey]).to.not.be(undefined);
                });
            });
            it('returns a 0 duration object on empty input', function() {
                var stringDuration = "";
                var durationObj = Koala.util.Duration.isoDurationToObject(
                        stringDuration
                    );
                var zeroKeys = [
                    "years", "months", "weeks", "days",
                    "hours", "minutes", "seconds"
                ];
                zeroKeys.forEach(function(zeroKey) {
                    expect(zeroKey in durationObj).to.be(true);
                    expect(durationObj[zeroKey]).to.be(0);
                });
                expect(durationObj.sign).to.be('+');
            });
            it('returns a 0 duration object on non-string input', function() {
                var zeroKeys = [
                    "years", "months", "weeks", "days",
                    "hours", "minutes", "seconds"
                ];
                var nonStringInputs = [
                    undefined, [], {}, /abc/, 1.23, null, function(){}
                ];

                nonStringInputs.forEach(function(nonStringInput){
                    var durationObj = Koala.util.Duration.isoDurationToObject(
                            nonStringInput
                        );
                    zeroKeys.forEach(function(zeroKey) {
                        expect(zeroKey in durationObj).to.be(true);
                        expect(durationObj[zeroKey]).to.be(0);
                    });
                    expect(durationObj.sign).to.be('+');
                });
            });
            it('correctly reads a fully specified iso string', function(){
                var stringDuration = "-P1Y2M3W4DT5H6M7.89S";
                var durationObj = Koala.util.Duration.isoDurationToObject(
                        stringDuration
                    );
                expect(durationObj.sign).to.be('-');
                expect(durationObj.years).to.be(1);
                expect(durationObj.months).to.be(2);
                expect(durationObj.weeks).to.be(3);
                expect(durationObj.days).to.be(4);
                expect(durationObj.hours).to.be(5);
                expect(durationObj.minutes).to.be(6);
                expect(durationObj.seconds).to.be(7.89);
            });
            it('correctly reads a partially specified iso string', function(){
                var stringDuration = "PT5H6S";
                var durationObj = Koala.util.Duration.isoDurationToObject(
                        stringDuration
                    );
                expect(durationObj.sign).to.be('+');
                expect(durationObj.years).to.be(0);
                expect(durationObj.months).to.be(0);
                expect(durationObj.weeks).to.be(0);
                expect(durationObj.days).to.be(0);
                expect(durationObj.hours).to.be(5);
                expect(durationObj.minutes).to.be(0);
                expect(durationObj.seconds).to.be(6);
            });
            it('supports float values for all numeric parts', function(){
                var stringDuration = "P1.1Y2.2M3.3W4.4DT5.5H6.6M7.7S";
                var durationObj = Koala.util.Duration.isoDurationToObject(
                        stringDuration
                    );
                expect(durationObj.sign).to.be('+');
                expect(durationObj.years).to.be(1.1);
                expect(durationObj.months).to.be(2.2);
                expect(durationObj.weeks).to.be(3.3);
                expect(durationObj.days).to.be(4.4);
                expect(durationObj.hours).to.be(5.5);
                expect(durationObj.minutes).to.be(6.6);
                expect(durationObj.seconds).to.be(7.7);
            });
        });

        describe('#secondsFromDuration', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.secondsFromDuration
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.secondsFromDuration
                ).to.be.a(Function);
            });
            it('returns the number of positive seconds in a duration',
                function(){
                    var duration = "PT5H6.7S";
                    var expected = 5 * 3600 + 6.7; // 5 hours + 6.7seconds
                    var got = Koala.util.Duration.secondsFromDuration(duration);
                    expect(got).to.be(expected);
                }
            );
            it('returns the number of negative seconds in a duration',
                function(){
                    var duration = "-PT5H6.7S";
                    var expected = -1 * (5 * 3600 + 6.7); // neg. 5 hours + 6.7seconds
                    var got = Koala.util.Duration.secondsFromDuration(duration);
                    expect(got).to.be(expected);
                }
            );
        });

        describe('#absoluteSecondsFromDuration', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.absoluteSecondsFromDuration
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.absoluteSecondsFromDuration
                ).to.be.a(Function);
            });
            it('returns the absolute number of seconds in a positive duration',
                function(){
                    var duration = "PT5H6.7S";
                    var expected = 5 * 3600 + 6.7; // 5 hours + 6.7seconds
                    var got = Koala.util.Duration.absoluteSecondsFromDuration(
                            duration
                        );
                    expect(got).to.be(expected);
                }
            );
            it('returns the absolute number of seconds in a negative duration',
                function(){
                    var duration = "-PT5H6.7S";
                    var expected = 5 * 3600 + 6.7; // 5 hours + 6.7seconds
                    var got = Koala.util.Duration.absoluteSecondsFromDuration(
                            duration
                        );
                    expect(got).to.be(expected);
                }
            );
        });

        describe('#secondsFromDurationObject', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.secondsFromDurationObject
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.secondsFromDurationObject
                ).to.be.a(Function);
            });
            it('returns the number of positive seconds in a duration object',
                function(){
                    var duration = "PT5H6.7S";
                    var durationObj = Koala.util.Duration.isoDurationToObject(
                            duration
                        );
                    var expected = 5 * 3600 + 6.7; // 5 hours + 6.7seconds
                    var got = Koala.util.Duration.secondsFromDurationObject(
                            durationObj
                        );
                    expect(got).to.be(expected);
                }
            );
            it('returns the number of negative seconds in a duration object',
                function(){
                    var duration = "-PT5H6.7S";
                    var durationObj = Koala.util.Duration.isoDurationToObject(
                            duration
                        );
                    // negative 5 hours + 6.7seconds
                    var expected = -1 * (5 * 3600 + 6.7);
                    var got = Koala.util.Duration.secondsFromDurationObject(
                            durationObj
                        );
                    expect(got).to.be(expected);
                }
            );
        });

        describe('#abs', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.abs
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.abs
                ).to.be.a(Function);
            });
            it('returns an already positive duration unchanged', function(){
                var duration = "PT5H6.7S";
                var expected = "PT5H6.7S";
                var got = Koala.util.Duration.abs(duration);
                expect(got).to.be(expected);
            });
            it('returns correct positive duration for a negative', function(){
                var duration = "-PT5H6.7S";
                var expected = "PT5H6.7S";
                var got = Koala.util.Duration.abs(duration);
                expect(got).to.be(expected);
            });
        });

        describe('#dateAddDuration', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.dateAddDuration
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.dateAddDuration
                ).to.be.a(Function);
            });
            it('adds a positive duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-29T08:00:08');
                var got = Koala.util.Duration.dateAddDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
            it('substracts a negative duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "-P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-27T07:43:52');
                var got = Koala.util.Duration.dateAddDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
        });

        describe('#dateSubtractAbsoluteDuration', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.dateSubtractAbsoluteDuration
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.dateSubtractAbsoluteDuration
                ).to.be.a(Function);
            });
            it('substracts a positive duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-27T07:43:52');
                var got = Koala.util.Duration.dateSubtractAbsoluteDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
            it('substracts a negative duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "-P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-27T07:43:52');
                var got = Koala.util.Duration.dateSubtractAbsoluteDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
        });

        describe('#dateAddAbsoluteDuration', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Duration.dateAddAbsoluteDuration
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Duration.dateAddAbsoluteDuration
                ).to.be.a(Function);
            });
            it('adds a positive duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-29T08:00:08');
                var got = Koala.util.Duration.dateAddAbsoluteDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
            it('adds a negative duration correctly', function(){
                var startDate = new Date('1980-11-28T07:52:00');
                var duration = "-P1DT8M8S"; // 1 day, 8 minutes and 8 seconds
                var expected = new Date('1980-11-29T08:00:08');
                var got = Koala.util.Duration.dateAddAbsoluteDuration(
                        startDate, duration
                    );
                expect(got).to.eql(expected);
            });
        });
    });
});
