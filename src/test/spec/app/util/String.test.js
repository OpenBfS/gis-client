Ext.Loader.syncRequire(['Koala.util.String']);

describe('Koala.util.String', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.String).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {
        describe('#replaceTemplateStrings', function() {
            var obj = null;
            beforeEach(function() {
                obj = new ol.Object();
                obj.set('foo', 'FOO-VAL');
                obj.set('bar', 'BAR-VAL');
                obj.set('baz', 'BAZ-VAL');
                obj.set('gee', 'GEE-VAL');
                obj.set('no-replace', 'NO-REPLACE-VAL');
            });
            afterEach(function() {
                obj = null;
            });
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
            it('replaces strings in a template', function() {
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
            it('replaces strings in complex template', function() {
                var tpl = "foo [[bar]], baz [[beng]] {{gee}} [no-replace]";
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be(
                    "foo BAR-VAL, baz [[beng]] {{gee}} [no-replace]"
                );
            });
        });
        describe('#utf8_to_b64 & #b64_to_utf8', function() {
            var utf8 = 'Süper Ömer &@d@m&eva';
            var b64 = 'U8O8cGVyIMOWbWVyICZAZEBtJmV2YQ==';

            it('#utf8_to_b64 transforms utf8 to b64', function() {
                var result = Koala.util.String.utf8_to_b64(utf8);
                expect(result).to.be(b64);
            });

            it('#b64_to_utf8 transforms b64 to utf8', function() {
                var result = Koala.util.String.b64_to_utf8(b64);
                expect(result).to.be(utf8);
            });

        });

    });
});
