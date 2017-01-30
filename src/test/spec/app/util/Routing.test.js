Ext.Loader.syncRequire(['Koala.util.Routing']);

describe('Koala.util.Routing', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Routing).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('onUnmatchedRoute', function() {
            // Should be enough as just it's existence is required.
            it('is a function', function() {
                expect(Koala.util.Routing.onUnmatchedRoute).to.be.a('function');
            });
        });

        describe('onMapRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onMapRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('beforeLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.beforeLayerTreeRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('onLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onLayerTreeRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('setRouteForView', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.setRouteForView).to.be.a('function');
            });
        });

        describe('filterToPermaObj', function() {
            //TODO Add more tests.
            it('is a function', function() {
                expect(Koala.util.Routing.filterToPermaObj).to.be.a('function');
            });
        });

    });
});
