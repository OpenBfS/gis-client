Ext.Loader.syncRequire(['Koala.util.String']);

describe('Koala.util.String', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.String).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {
        describe('isUuid', function() {
            it('is a function', function() {
                expect(Koala.util.String.isUuid).to.be.a(Function);
            });
            it('returns true for valid uuids', function() {
                expect(Koala.util.String.isUuid('241ae25f-c180-475b-9734-4947f75137e1')).to.be.ok();
            });
            it('returns false for invalid uuids', function() {
                expect(Koala.util.String.isUuid('241ae25f-c180-475b-9734-4947f75137e')).to.not.be.ok();
                expect(Koala.util.String.isUuid('241ae25f-c180-475b-97344947f75137e1')).to.not.be.ok();
                expect(Koala.util.String.isUuid('peter')).to.not.be.ok();
            });
        });

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
                var tpl = 'foo [[bar]]';
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be('foo BAR-VAL');
            });
            it('replaces only found placeholders', function() {
                var tpl = 'foo [[not-there]]';
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be('foo [[not-there]]');
            });
            it('does not replace the old syntax', function() {
                var tpl = 'foo {{bar}}';
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be('foo {{bar}}');
            });
            it('replaces strings in complex template', function() {
                var tpl = 'foo [[bar]], baz [[beng]] {{gee}} [no-replace]';
                var result = Koala.util.String.replaceTemplateStrings(
                    tpl, obj, false
                );
                expect(result).to.be(
                    'foo BAR-VAL, baz [[beng]] {{gee}} [no-replace]'
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

        describe('getValueFromSequence', function() {
            it('is a function', function() {
                expect(Koala.util.String.getValueFromSequence).to.be.a(Function);
            });
            it('returns a value from a sequence at an specified index', function() {
                var sequence = 'Peter,Paul,Ingrid';
                expect(Koala.util.String.getValueFromSequence(sequence, 0)).to.be('Peter');
                expect(Koala.util.String.getValueFromSequence(sequence, 1)).to.be('Paul');
                expect(Koala.util.String.getValueFromSequence(sequence, 2)).to.be('Ingrid');
            });
            it('returns the default value if out of index', function() {
                var sequence = 'Peter,Paul,Ingrid';
                expect(Koala.util.String.getValueFromSequence(sequence, 4, 'Dieter')).to.be('Dieter');
                expect(Koala.util.String.getValueFromSequence('', 1, 'Dieter')).to.be('Dieter');
                expect(Koala.util.String.getValueFromSequence(undefined, 1, 'Dieter')).to.be('Dieter');
            });
        });

        describe('getBool', function() {
            it('is a function', function() {
                expect(Koala.util.String.getBool).to.be.a(Function);
            });
            it('returns a boolified value', function() {
                expect(Koala.util.String.getBool('true')).to.be(true);
                expect(Koala.util.String.getBool('false')).to.be(false);
            });
            it('returns the default when specified and string is null', function() {
                expect(Koala.util.String.getBool(null, true)).to.be(true);
                expect(Koala.util.String.getBool(null, false)).to.be(false);
            });
            it('returns true when a truthy value is given as input or default', function() {
                expect(Koala.util.String.getBool(null, 'Peter')).to.be(true);
                expect(Koala.util.String.getBool('Peter')).to.be(true);
            });
        });

        describe('coerce', function() {
            it('is a function', function() {
                expect(Koala.util.String.coerce).to.be.a(Function);
            });
            it('transforms booleaen strings', function() {
                expect(Koala.util.String.coerce('true')).to.be(true);
                expect(Koala.util.String.coerce('false')).to.be(false);
            });
            it('transforms float strings', function() {
                expect(Koala.util.String.coerce('13.37')).to.be(13.37);
                expect(Koala.util.String.coerce('0.815')).to.be(0.815);
            });
            it('transforms array strings', function() {
                expect(Koala.util.String.coerce('[\'Peter\', \'Paul\']')).to.eql(['Peter', 'Paul']);
                expect(Koala.util.String.coerce('[13, \'Paul\']')).to.eql([13, 'Paul']);
                expect(Koala.util.String.coerce('[13, 37]')).to.eql([13, 37]);
            });
            it('transforms object strings', function() {
                expect(Koala.util.String.coerce('{peter: \'paul\', ingrid: \'dieter\'}')).
                    to.eql({peter: 'paul', ingrid: 'dieter'});
                expect(Koala.util.String.coerce('{peter: 13, ingrid: \'dieter\'}')).
                    to.eql({peter: 13, ingrid: 'dieter'});
                expect(Koala.util.String.coerce('{peter: 13, ingrid: 37}')).
                    to.eql({peter: 13, ingrid: 37});
            });
        });

    });
});
