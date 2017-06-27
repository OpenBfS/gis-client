var reqs = [
    'Koala.view.container.styler.ScaleDenominatorController',
    'Koala.view.container.styler.ScaleDenominatorModel'
];

if (!Ext.isModern) {
    reqs.push('Koala.view.container.styler.ScaleDenominator');
}
Ext.Loader.syncRequire(reqs);

describe('Koala.view.container.styler.ScaleDenominatorController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.ScaleDenominatorController).to.not.be(undefined);
        });

        it('can be created', function() {
            if (!Ext.isModern) {
                var view = Ext.create('Koala.view.container.styler.ScaleDenominator');
                expect(view.getController()).to.not.be(undefined);
            }
        });
    });

    describe('#onBoxReady', function() {
        if (!Ext.isModern) {
            var view = Ext.create('Koala.view.container.styler.ScaleDenominator');
            var ctrl = view.getController();
            var rule = {};
            rule.getScaleDenominator = sinon.stub();
            view.getViewModel().set('rule', rule);
            expect(ctrl.onBoxReady.bind(ctrl)).to.not.throwException();
        }
    });

    describe('#operatorComboChanged', function() {
        if (!Ext.isModern) {
            var view = Ext.create('Koala.view.container.styler.ScaleDenominator');
            sinon.spy(view, 'down');
            var ctrl = view.getController();
            ctrl.operatorComboChanged();
            expect(view.down.calledTwice).to.be(true);
        }
    });
});
