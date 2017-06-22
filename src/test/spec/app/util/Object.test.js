Ext.Loader.syncRequire(['Koala.util.Object']);

describe('Koala.util.Object', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Object).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#getPathStrOr', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Object.getPathStrOr
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Object.getPathStrOr
                ).to.be.a(Function);
            });
            it('returns expected val for non-nested key', function() {
                var obj = {
                    a: 123
                };
                var path = 'a';
                var got = Koala.util.Object.getPathStrOr(obj, path);
                expect(got).to.be(123);
            });
            it('returns undefined for non-existing key', function() {
                var obj = {
                    a: 123
                };
                var path = 'b';
                var got = Koala.util.Object.getPathStrOr(obj, path);
                expect(got).to.be(undefined);
            });
            it('returns a configurable val for non-existing key', function() {
                var obj = {
                    a: 123
                };
                var path = 'b';
                var valWhenEmpty = 'New Way Home';
                var got = Koala.util.Object.getPathStrOr(
                    obj, path, valWhenEmpty
                );
                expect(got).to.be(valWhenEmpty);
            });
            it('returns expected val for nested key', function() {
                var obj = {
                    a: {
                        b: {
                            c: {
                                d: 456
                            }
                        }
                    }
                };
                var path = 'a/b/c/d';
                var got = Koala.util.Object.getPathStrOr(obj, path);
                expect(got).to.be(456);
            });
            it('returns undefined for non-existing key (deep-nested)',
                function() {
                    var obj = {
                        a: {
                            b: {
                                c: {
                                    d: 456
                                }
                            }
                        }
                    };
                    var path = 'a/b/c/NOTTHERE';
                    var got = Koala.util.Object.getPathStrOr(obj, path);
                    expect(got).to.be(undefined);
                }
            );
            it('returns a configurable val for non-existing key (deep-nested)',
                function() {
                    var obj = {
                        a: {
                            b: {
                                c: {
                                    d: 456
                                }
                            }
                        }
                    };
                    var path = 'a/b/c/NOTTHERE';
                    var valWhenEmpty = 'February Stars';
                    var got = Koala.util.Object.getPathStrOr(
                        obj, path, valWhenEmpty
                    );
                    expect(got).to.be(valWhenEmpty);
                }
            );
        });

        describe('#getPathOr', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Object.getPathOr
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Object.getPathOr
                ).to.be.a(Function);
            });
        });

        describe('#getConfigByPrefix', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Object.getConfigByPrefix
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Object.getConfigByPrefix
                ).to.be.a(Function);
            });
        });

        describe('#coerceAll', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Object.getPathOr
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Object.coerceAll
                ).to.be.a(Function);
            });
        });

        describe('#arrayToMap', function() {
            it('is defined', function() {
                expect(Koala.util.Object.arrayToMap).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Object.arrayToMap).to.be.a(Function);
            });
            it('transforms an array to a map', function() {
                var array = [{identifierField: 'key1'}, {identifierField: 'key2'}];
                var got = Koala.util.Object.arrayToMap(array, 'identifierField');
                var map = {
                    key1: {
                        identifierField: 'key1'
                    },
                    key2: {
                        identifierField: 'key2'
                    }
                };
                expect(got).to.eql(map);
            });
        });

        describe('#arrayToObject', function() {
            it('is defined', function() {
                expect(Koala.util.Object.arrayToObject).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Object.arrayToObject).to.be.a(Function);
            });
            it('transforms an array to a map', function() {
                var array = [{
                    key: 'a',
                    value: 'aa'
                }, {
                    key: 'b',
                    value: 'bb'
                }];
                var got = Koala.util.Object.arrayToObject(array, 'key', 'value');
                var map = {
                    a: 'aa',
                    b: 'bb'
                };
                expect(got).to.eql(map);
            });
        });

        describe('#inverse', function() {
            it('is defined', function() {
                expect(Koala.util.Object.inverse).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Object.inverse).to.be.a(Function);
            });
            it('transforms an array to a map', function() {
                var obj = {
                    foo: 'bar',
                    effzeh: 'bvb'
                };
                var got = Koala.util.Object.inverse(obj);
                var map = {
                    bar: 'foo',
                    bvb: 'effzeh'
                };
                expect(got).to.eql(map);
            });
        });

    });
});
