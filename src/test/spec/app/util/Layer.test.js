Ext.Loader.syncRequire(['Koala.util.Layer', 'Koala.util.String']);

describe('Koala.util.Layer', function() {
    var oldTxtUntil = Koala.util.Layer.txtUntil;
    var oldDefaultFormat = Koala.util.String.defaultDateFormat;
    beforeEach(function() {
        // mock up successful i18n
        Koala.util.Layer.txtUntil = 'bis';
        Koala.util.String.defaultDateFormat = 'd.m.Y K\\o\\a\\l\\a';
        Koala.Application = {};
        Koala.Application.isLocal = function() {
            return false;
        };
        Koala.Application.isUtc = function() {
            return true;
        };
    });
    afterEach(function() {
        // un-mock successful i18n
        Koala.util.Layer.txtUntil = oldTxtUntil;
        Koala.util.String.defaultDateFormat = oldDefaultFormat;
        delete Koala.Application;
    });


    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Layer).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#metadataHasFilters', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.be.a(Function);
            });
            it('does not throw if called without metadata', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.not.throwException();
            });
            it('returns false without metadata', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters()
                ).to.be(false);
            });
            it('returns true if filters defined and filled', function() {
                var metadata = {
                    filters: [
                        {}
                    ]
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(true);
            });
            it('supports also the old way with only one filter', function() {
                var metadata = {
                    filter: {}
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(true);
            });
            it('returns false if filters defined but empty', function() {
                var metadata = {
                    filters: []
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(false);
            });
            it('returns false when neither filter nor filters', function() {
                var metadatas = [
                    {}, // empty
                    { Filter: {} }, // wrong spelling
                    { fiLterS: [ {} ] }, // wrong spelling
                    { foo: { filters: [ {} ] } }, // nesting wrong
                    { foo: { filter: {} } } // nesting wrong
                ];
                metadatas.forEach(function(md) {
                    expect(
                        Koala.util.Layer.metadataHasFilters(md)
                    ).to.be(false);
                });
            });
            it('returns false when filters is not an array', function() {
                var metadatas = [
                    { filters: undefined },
                    { filters: null },
                    { filters: 'foo' },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function() {} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md) {
                    expect(
                        Koala.util.Layer.metadataHasFilters(md)
                    ).to.be(false);
                });
            });
        });

        describe('#getFiltersFromMetadata', function() {
            it('returns the filters if correctly configured', function() {
                var filters = [{foo: 'bar'}, {humpty: 'dumpty'}];
                var metadata = {
                    filters: filters
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got).to.be(filters);
                expect(got).to.have.length(2);
            });
            it('normalizes the old way with only one filter to array', function() {
                var filter = {humpty: 'dumpty'};
                var metadata = {
                    filter: filter
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got[0]).to.eql(filter);
                expect(got).to.have.length(1);
            });
            it('merges old and new syntax to a combined array', function() {
                var filters = [{foo: 'bar'}, {humpty: 'dumpty'}];
                var filter = {baz: 'bor'};
                var metadata = {
                    filters: filters,
                    filter: filter
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got[0]).to.eql(filters[0]);
                expect(got[1]).to.eql(filters[1]);
                expect(got[2]).to.eql(filter);
                expect(got).to.have.length(3);
            });
            it('return null if no filters defined', function() {
                var metadatas = [
                    {}, // empty
                    { Filter: {} }, // wrong spelling
                    { fiLterS: [ {} ] }, // wrong spelling
                    { foo: { filters: [ {} ] } }, // nesting wrong
                    { foo: { filter: {} } }, // nesting wrong
                    { filters: undefined },
                    { filters: null },
                    { filters: 'foo' },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function() {} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md) {
                    var got = Koala.util.Layer.getFiltersFromMetadata(md);
                    expect(got).to.be(null);
                });
            });
        });

        describe('#getFiltersTextFromMetadata', function() {
            it('returns the empty string if no filter', function() {
                var metadatas = [
                    {}, // empty
                    { Filter: {} }, // wrong spelling
                    { fiLterS: [ {} ] }, // wrong spelling
                    { foo: { filters: [ {} ] } }, // nesting wrong
                    { foo: { filter: {} } }, // nesting wrong
                    { filters: undefined },
                    { filters: null },
                    { filters: 'foo' },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function() {} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md) {
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(md);
                    expect(got).to.be('');
                });
            });
            it('returns an empty text for rodos-filter', function() {
                var metadata = {
                    filters: [{
                        type: 'rodostime'
                    }]
                };
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                expect(got).to.be('');
            });
            it('returns a text for key-value-filter', function() {
                var metadata = {
                    filters: [{
                        type: 'value',
                        param: 'foo',
                        operator: '=',
                        effectivevalue: '\'bar\''
                    }]
                };
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                // #stringifyValueFilter should be tested separately
                var filterRepr = Koala.util.Layer.stringifyValueFilter(
                        metadata.filters[0], true
                    );
                expect(got).to.not.be('');
                expect(got.indexOf(filterRepr)).to.not.be(-1);
            });
            it('returns a localized text for point-in-time-filter (de)', function() {
                var metadata = {
                    filters: [{
                        type: 'pointintime',
                        effectivedatetime: moment.utc('1980-11-28')
                    }]
                };
                moment.locale('de');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                expect(got).to.not.be('');
                expect(got.indexOf('28. November 1980 00:00')).to.not.be(-1);
            });
            it('returns a localized text for point-in-time-filter (en)',
                function() {
                    var metadata = {
                        filters: [{
                            type: 'pointintime',
                            effectivedatetime: moment.utc('1980-11-28')
                        }]
                    };
                    moment.locale('en');
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                    expect(got).to.not.be('');
                    expect(got.indexOf('November 28, 1980 12:00 AM')).to.not.be(-1);
                }
            );
            it('returns a localized text for point-in-time-filter (fr)',
                function() {
                    var metadata = {
                        filters: [{
                            type: 'pointintime',
                            effectivedatetime: moment.utc('1980-11-28')
                        }]
                    };
                    moment.locale('fr');
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                    expect(got).to.not.be('');
                    expect(got.indexOf('28 novembre 1980 00:00')).to.not.be(-1);
                }
            );
            it('returns a localized text for timerange-filter (de)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('de');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('28. November 1980 00:00')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('28. November 1998 00:00')).to.not.be(-1);
            });
            it('returns a localized text for timerange-filter (en)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('en');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('November 28, 1980 12:00 AM')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('November 28, 1998 12:00 AM')).to.not.be(-1);
            });
            it('returns a localized text for timerange-filter (fr)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('fr');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('28 novembre 1980 00:00')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('28 novembre 1998 00:00')).to.not.be(-1);
            });
        });

        describe('#getOrderedFlatLayers', function() {
            it('returns a flat list for a basic array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: true
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(3);
                expect(got[0]).to.be(layers[0]);
                expect(got[1]).to.be(layers[1]);
                expect(got[2]).to.be(layers[2]);
            });
            it('returns a flat list for a hierarchical array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: false,
                    children: [
                        { leaf: true },
                        { leaf: true }
                    ]
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(4);
                expect(got[0]).to.be(layers[0]);
                expect(got[1]).to.be(layers[1].children[0]);
                expect(got[2]).to.be(layers[1].children[1]);
                expect(got[3]).to.be(layers[2]);
            });
            it('returns a flat list for a deeply nested array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: false,
                    children: [{
                        leaf: false,
                        children: [{
                            leaf: false,
                            children: [{
                                leaf: false,
                                children: [{
                                    leaf: false,
                                    children: [{
                                        leaf: true
                                    }]
                                }]
                            }]
                        }]
                    }]
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(3);
                expect(got[0]).to.be(layers[0]);
                var expected = layers[1].children[0].children[0].children[0]
                    .children[0].children[0];
                expect(got[1]).to.be(expected);
                expect(got[2]).to.be(layers[2]);
            });
            it('returns a flat and skips falsy layers', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                        leaf: true
                    },
                    undefined,
                    null,
                    false,
                    0,
                    ''
                ];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(1);
                expect(got[0]).to.be(layers[0]);
            });
        });
    });
});
