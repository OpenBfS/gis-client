Ext.Loader.syncRequire(['Koala.util.Date']);

describe('Koala.util.Date', function() {
    beforeEach(function() {
        // mock up successful i18n
        Koala.util.Layer.txtUntil = 'bis';
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
            expect(Koala.util.Date).to.not.be(undefined);
        });
    });
    describe('Constant DEFAULT_DATE_FORMAT is a valid Moment.js format', function() {
        it('is defined', function() {
            expect(Koala.util.Date.DEFAULT_DATE_FORMAT).to.not.be(undefined);
        });
        it('is a string', function() {
            expect(Koala.util.Date.DEFAULT_DATE_FORMAT).to.be.a('string');
        });
        it('can be used to format a Moment', function() {
            var format = Koala.util.Date.DEFAULT_DATE_FORMAT;
            var momentDate = moment(new Date);
            var formattedDate = momentDate.format(format);
            expect(formattedDate).to.be.a('string');
        });
    });
    describe('Static functions', function() {
        describe('#getUtcMoment', function() {
            it('is defined', function() {
                expect(Koala.util.Date.getUtcMoment).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Date.getUtcMoment).to.be.a(Function);
            });
            it('returns a moment date object', function() {
                var got = Koala.util.Date.getUtcMoment(
                    '1909-09-09 09:09:09');
                expect(got).to.be.a(moment);
            });
            it('returns an UTC moment date object', function() {
                var got = Koala.util.Date.getUtcMoment(
                    '1909-09-09 09:09:09');
                var isUtc = got.isUtc();
                expect(isUtc).to.be(true);
            });
            it('returns undefined on invalid input', function() {
                var got = Koala.util.Date.getUtcMoment(
                    '1909-09-09 09:09:09 BVB');
                expect(got).to.be(undefined);
            });
            it('can parse custom non-ISO formats', function() {
                var got = Koala.util.Date.getUtcMoment(
                    '1909-09-09 09:09:09 BVB', 'YYYY-MM-DD HH:mm:ss BVB');
                expect(got).to.be.a(moment);
            });
        });
        describe('#addUtcOffset', function() {
            it('is defined', function() {
                expect(Koala.util.Date.addUtcOffset).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Date.addUtcOffset).to.be.a(Function);
            });
            it('returns a moment date object', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.addUtcOffset(inputMoment);
                expect(got).to.be.a(moment);
            });
            it('creates a clone of the input moment', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.addUtcOffset(inputMoment);
                expect(got).to.not.be(inputMoment);
            });
            it('returns an UTC moment date object', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.addUtcOffset(inputMoment);
                var isUtc = got.isUtc();
                expect(isUtc).to.be(true);
            });
            it('returns undefined on invalid input', function() {
                var got = Koala.util.Date.addUtcOffset(new Date());
                expect(got).to.be(undefined);
            });
        });
        describe('#removeUtcOffset', function() {
            it('is defined', function() {
                expect(Koala.util.Date.removeUtcOffset).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Date.removeUtcOffset).to.be.a(Function);
            });
            it('returns a moment date object', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.removeUtcOffset(inputMoment);
                expect(got).to.be.a(moment);
            });
            it('creates a clone of the input moment', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.removeUtcOffset(inputMoment);
                expect(got).to.not.be(inputMoment);
            });
            it('returns a local moment date object', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.removeUtcOffset(inputMoment);
                var isUtc = got.isUtc();
                expect(isUtc).to.be(false);
            });
            it('returns undefined on invalid input', function() {
                var got = Koala.util.Date.removeUtcOffset(new Date());
                expect(got).to.be(undefined);
            });
        });
        describe('#getFormattedDate', function() {
            it('is defined', function() {
                expect(Koala.util.Date.getFormattedDate).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Date.getFormattedDate).to.be.a(Function);
            });
            it('returns undefined on invalid input', function() {
                var got = Koala.util.Date.getFormattedDate(new Date());
                expect(got).to.be(undefined);
            });
        });
        describe('#getTimeReferenceAwareMomentDate', function() {
            it('is defined', function() {
                expect(Koala.util.Date.getTimeReferenceAwareMomentDate).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Date.getTimeReferenceAwareMomentDate).to.be.a(Function);
            });
            it('returns a moment date object', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.getTimeReferenceAwareMomentDate(inputMoment);
                expect(got).to.be.a(moment);
            });
            it('creates a clone of the input moment', function() {
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.getTimeReferenceAwareMomentDate(inputMoment);
                expect(got).to.not.be(inputMoment);
            });
            it('returns an UTC moment if the application\'s time reference is UTC', function() {
                Koala.Application.isUtc = function() {
                    return true;
                };
                Koala.Application.isLocal = function() {
                    return false;
                };
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.getTimeReferenceAwareMomentDate(inputMoment);
                expect(got.isUtc()).to.be(true);
            });
            it('returns a local moment if the application\'s time reference is local', function() {
                Koala.Application.isUtc = function() {
                    return false;
                };
                Koala.Application.isLocal = function() {
                    return true;
                };
                var inputMoment = moment(new Date());
                var got = Koala.util.Date.getTimeReferenceAwareMomentDate(inputMoment);
                expect(got.isLocal()).to.be(true);
            });
            it('returns undefined on invalid input', function() {
                var got = Koala.util.Date.getTimeReferenceAwareMomentDate(new Date());
                expect(got).to.be(undefined);
            });
        });
    });
});
