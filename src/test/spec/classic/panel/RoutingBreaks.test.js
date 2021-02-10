Ext.Loader.syncRequire([
    'Koala.view.panel.RoutingBreaks'
]);

describe('Koala.view.panel.RoutingBreaks', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.RoutingBreaks).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.panel.RoutingBreaks');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });
});
