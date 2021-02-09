Ext.Loader.syncRequire([
    'Koala.view.form.ClassicRoutingSettings'
]);

describe('Koala.view.form.ClassicRoutingSettings', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.ClassicRoutingSettings).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.form.ClassicRoutingSettings');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });
});
