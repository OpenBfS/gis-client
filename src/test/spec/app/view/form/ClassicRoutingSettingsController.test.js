Ext.Loader.syncRequire([
    'Koala.view.form.ClassicRoutingSettingsController'
]);

describe('Koala.view.form.ClassicRoutingSettingsController', function() {
    describe('Basics', function() {

        it('is defined', function() {
            expect(Koala.view.form.ClassicRoutingSettingsController).to.not.be(undefined);
        });

        it('can be created', function() {
            var ctrl = new Koala.view.form.ClassicRoutingSettingsController();
            expect(ctrl).to.not.be('undefined');
        });

    });
});
