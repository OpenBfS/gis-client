Ext.Loader.syncRequire(['Koala.view.button.AvoidArea']);

describe('Koala.view.button.AvoidArea', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.button.AvoidArea).to.not.be(undefined);
        });
    });

    describe('#initComponent', function() {
        it('can be initialized', function() {
            var comp = Ext.create('Koala.view.button.AvoidArea');
            expect(comp).to.not.be(undefined);
        });
    });

    describe('References', function() {
        var comp = Ext.create('Koala.view.button.AvoidArea');
        it('names referenced layer correctly', function() {
            expect(comp.avoidAreaLayerName).to.be('routing-avoid-area-layer');
        });
    });

    // TODO: check if avoid area layer has been created
});
