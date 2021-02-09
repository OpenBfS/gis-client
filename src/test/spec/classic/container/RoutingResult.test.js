Ext.Loader.syncRequire(['Koala.view.container.RoutingResult']);

describe('Koala.view.container.RoutingResult', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.RoutingResult).to.not.be(undefined);
        });
    });

    describe('#initComponent', function() {
        it('can be initialized', function() {
            var comp = Ext.create('Koala.view.container.RoutingResult');
            expect(comp).to.not.be(undefined);
        });
    });

});
