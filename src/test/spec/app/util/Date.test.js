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
});
