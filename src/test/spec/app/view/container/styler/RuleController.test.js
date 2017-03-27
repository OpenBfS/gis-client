Ext.Loader.syncRequire([
    'Koala.view.container.styler.RuleController'
]);

describe('Koala.view.container.styler.RuleController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.RuleController).to.not.be(undefined);
        });
    });
});
