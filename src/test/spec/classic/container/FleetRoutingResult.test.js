Ext.Loader.syncRequire(['Koala.view.container.FleetRoutingResult']);

describe('Koala.view.container.FleetRoutingResult', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.FleetRoutingResult).to.not.be(undefined);
        });
    });

    describe('#initComponent', function() {
        it('can be initialized', function() {
            var comp = Ext.create('Koala.view.container.FleetRoutingResult');
            expect(comp).to.not.be(undefined);
        });
    });

});
