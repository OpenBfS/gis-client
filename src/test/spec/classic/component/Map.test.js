Ext.Loader.syncRequire(['Koala.view.component.Map']);

describe('Koala.view.component.Map', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.Map).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {

        describe('#styleFromGnos', function() {
            it('is defined', function() {
                expect(Koala.view.component.Map.styleFromGnos).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.view.component.Map.styleFromGnos).to.be.a(Function);
            });
        });
    });
});
