Ext.Loader.syncRequire(['Koala.util.Layer']);

describe('Koala.util.Layer', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Layer).to.not.be(undefined);
        });
    });
    describe('Static functions', function(){
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
            it('returns true if filters defined and filled', function(){
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
            it('returns false if filters defined but empty', function(){
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
                metadatas.forEach(function(md){
                    expect(
                        Koala.util.Layer.metadataHasFilters(md)
                    ).to.be(false);
                });
            });
            it('returns false when filters is not an array', function() {
                var metadatas = [
                    { filters: undefined },
                    { filters: null },
                    { filters: "foo" },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function(){} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md){
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
            it('merges old and new syntax to a combined array', function(){
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
            it('return null if no filters defined', function(){
                var metadatas = [
                    {}, // empty
                    { Filter: {} }, // wrong spelling
                    { fiLterS: [ {} ] }, // wrong spelling
                    { foo: { filters: [ {} ] } }, // nesting wrong
                    { foo: { filter: {} } }, // nesting wrong
                    { filters: undefined },
                    { filters: null },
                    { filters: "foo" },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function(){} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md){
                    var got = Koala.util.Layer.getFiltersFromMetadata(md);
                    expect(got).to.be(null);
                });
            });
        });
        describe('#getFiltersTextFromMetadata', function(){
            it('returns the empty string if no filter', function(){
                var metadatas = [
                    {}, // empty
                    { Filter: {} }, // wrong spelling
                    { fiLterS: [ {} ] }, // wrong spelling
                    { foo: { filters: [ {} ] } }, // nesting wrong
                    { foo: { filter: {} } }, // nesting wrong
                    { filters: undefined },
                    { filters: null },
                    { filters: "foo" },
                    { filters: {} },
                    { filters: true },
                    { filters: -42.11 },
                    { filters: function(){} },
                    { filters: /regex/ }
                ];
                metadatas.forEach(function(md){
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(md);
                    expect(got).to.be('');
                });
            });
        });
    });
});
