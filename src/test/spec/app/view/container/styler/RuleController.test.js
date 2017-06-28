Ext.Loader.syncRequire([
    'Koala.view.container.styler.RuleController'
]);

describe('Koala.view.container.styler.RuleController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.RuleController).to.not.be(undefined);
        });

        it('can be created', function() {
            var ctrl = Ext.create('Koala.view.container.styler.RuleController');
            expect(ctrl).not.to.be(undefined);
            expect(ctrl.getView()).not.to.be(undefined);
            expect(ctrl.getViewModel()).not.to.be(undefined);
        });
    });

    describe('#onBoxReady', function() {
        it('will not fail', function() {
            if (!Ext.isModern) {
                var rule = Ext.create('Koala.view.container.styler.Rule');
                var ctrl = rule.getController();
                expect(ctrl.onBoxReady.bind(ctrl)).to.throwException();
            }
        });
    });
});
