Ext.Loader.syncRequire([
    'Koala.view.grid.RoutingJobs'
]);

describe('Koala.view.grid.RoutingJobs', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.grid.RoutingJobs).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.grid.RoutingJobs');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });
});
