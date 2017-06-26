Ext.Loader.syncRequire([
    'Koala.view.panel.Settings',
    'Koala.view.panel.SettingsController'
]);

describe('Koala.view.panel.Settings', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.Settings).to.not.be(undefined);
        });
    });
});

describe('Koala.view.panel.SettingsController', function() {
    it('handles utc change', function() {
        var ctrl = new Koala.view.panel.SettingsController();
        var view = TestUtil.getMockedElement();
        view.up.returns(view);
        var model = {};
        model.set = sinon.stub();
        view.getViewModel = sinon.stub().returns(model);
        ctrl.setView(view);
        ctrl.onUtcChanged();
        expect(model.set.calledOnce).to.be(true);
    });
});
