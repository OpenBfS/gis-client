Ext.Loader.syncRequire([
    'Koala.view.form.FleetRoutingSettings'
]);

describe('Koala.view.form.FleetRoutingSettings', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.FleetRoutingSettings).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.form.FleetRoutingSettings');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });
});
