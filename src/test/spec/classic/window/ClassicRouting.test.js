Ext.Loader.syncRequire([
    'Koala.view.window.ClassicRouting'
]);

describe('Koala.view.window.ClassicRouting', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.ClassicRouting).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.window.ClassicRouting');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });
});
