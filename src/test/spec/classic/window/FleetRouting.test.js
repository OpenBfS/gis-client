Ext.Loader.syncRequire([
    'Koala.view.window.FleetRouting'
]);

describe('Koala.view.window.FleetRouting', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.FleetRouting).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.window.FleetRouting');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });
});
