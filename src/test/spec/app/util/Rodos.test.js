Ext.Loader.syncRequire(['Koala.util.Rodos']);

describe('Koala.util.Rodos', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos).to.not.be(undefined);
        });
    });
    describe('#requestLayersOfProject', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos.requestLayersOfProject).to.not.be(undefined);
        });
    });
    describe('#setRodosLayers', function() {
        it('is defined', function() {
            expect(Koala.util.Rodos.setRodosLayers).to.not.be(undefined);
        });
    });
});
