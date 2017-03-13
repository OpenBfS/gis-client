Ext.Loader.syncRequire(['Koala.util.Date']);

describe('Koala.util.Date', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Date).to.not.be(undefined);
        });
    });
    describe('Constant ISO_FORMAT is ISO compatible', function() {
        it('is defined', function() {
            expect(Koala.util.Date.ISO_FORMAT).to.not.be(undefined);
        });
        it('is a string', function() {
            expect(Koala.util.Date.ISO_FORMAT).to.be.a('string');
        });
        it('can be used to format a date to iso format', function() {
            var format = Koala.util.Date.ISO_FORMAT;
            var inDate = new Date();
            var formatted = Ext.Date.format(inDate, format);
            // from http://stackoverflow.com/a/3143231
            var expectedRegExp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
            expect(formatted).to.match(expectedRegExp);
        });
    });
    describe('Static functions', function() {

        describe('#getUTCOffsetInMinutes', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Date.getUTCOffsetInMinutes
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Date.getUTCOffsetInMinutes
                ).to.be.a(Function);
            });
            it('has a different "view" than getTimezoneOffset', function() {
                var got = Koala.util.Date.getUTCOffsetInMinutes();
                var expected = (new Date()).getTimezoneOffset();
                if (Math.abs(got) === 0) {
                    // Called in the UTC timezone, we need to skip this test
                    expect(true).to.be(true);
                } else {
                    expect(got).to.not.be(expected);
                }
            });
            it('still is compatible to getTimezoneOffset', function() {
                var got = Koala.util.Date.getUTCOffsetInMinutes();
                var expected = -1 * ((new Date()).getTimezoneOffset());
                if (Math.abs(got) === 0) {
                    // Called in the UTC timezone, we need to skip this test
                    // We do not want to mess with +0 and -0…
                    expect(true).to.be(true);
                } else {
                    expect(got).to.be(expected);
                }
            });
        });

        describe('#makeLocal', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Date.makeLocal
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Date.makeLocal
                ).to.be.a(Function);
            });
            it('returns a different date', function() {
                var inDate = new Date();
                var got = Koala.util.Date.makeLocal(inDate);
                expect(inDate).to.not.be(got);
            });
            it('returns "later"/"earlier" dates depending on offset',
                function() {
                    var inDate = new Date();
                    var got = Koala.util.Date.makeLocal(inDate);
                    var offset = Koala.util.Date.getUTCOffsetInMinutes();

                    if (offset > 0) {
                        expect(got).to.be.above(inDate);
                    } else if (offset < 0) {
                        expect(got).to.be.below(inDate);
                    } else {
                        expect(got).to.eql(inDate);
                    }
                }
            );
        });

        describe('#makeUtc', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Date.makeUtc
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Date.makeUtc
                ).to.be.a(Function);
            });
            it('returns a different date', function() {
                var inDate = new Date();
                var got = Koala.util.Date.makeUtc(inDate);
                expect(inDate).to.not.be(got);
            });
            it('returns "later"/"earlier" dates depending on offset',
                function() {
                    var inDate = new Date();
                    var got = Koala.util.Date.makeUtc(inDate);
                    var offset = Koala.util.Date.getUTCOffsetInMinutes();

                    if (offset > 0) {
                        expect(got).to.be.below(inDate);
                    } else if (offset < 0) {
                        expect(got).to.be.above(inDate);
                    } else {
                        expect(got).to.eql(inDate);
                    }
                }
            );
        });
    });
});
