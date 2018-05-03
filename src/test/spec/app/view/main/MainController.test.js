Ext.Loader.syncRequire([
    'Koala.view.main.MainController',
    'Koala.view.panel.ThemeTree'
]);

describe('Koala.view.main.MainController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.main.MainController).to.not.be(undefined);
        });
        it('can be created', function() {
            var main = Ext.create('Koala.view.main.Main');
            expect(main).to.not.be(undefined);
        });
    });
});
