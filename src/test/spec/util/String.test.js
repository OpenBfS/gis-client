Ext.Loader.syncRequire(['Koala.util.String']);

describe('Koala.util.String', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.String).to.not.be(undefined);
        });
    });
    describe('Static functions', function(){
        var obj = null;
        beforeEach(function(){
            obj = new ol.Object();
            obj.set('foo', 'FOO-VAL');
            obj.set('bar', 'BAR-VAL');
            obj.set('baz', 'BAZ-VAL');
            obj.set('gee', 'GEE-VAL');
            obj.set('no-replace', 'NO-REPLACE-VAL');
        });
        afterEach(function(){
            obj = null;
        });
        describe('#replaceTemplateStrings', function(){
            it('is defined', function() {
                expect(
                    Koala.util.String.replaceTemplateStrings
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.String.replaceTemplateStrings
                ).to.be.a(Function);
            });
            it('replaces strings in a tempate', function() {
                var tpl = "foo [[bar]]";
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be("foo BAR-VAL");
            });
            it('replaces only found placeholders', function() {
                var tpl = "foo [[not-there]]";
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be("foo [[not-there]]");
            });
            it('does not replace the old syntax', function() {
                var tpl = "foo {{bar}}";
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be("foo {{bar}}");
            });
            it('replaces strings in complex tempate', function() {
                var tpl = "foo [[bar]], baz [[beng]] {{gee}} [no-replace]";
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be(
                    "foo BAR-VAL, baz [[beng]] {{gee}} [no-replace]"
                );
            });
        });
    });
});
