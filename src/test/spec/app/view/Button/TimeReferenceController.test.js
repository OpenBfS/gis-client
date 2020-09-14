Ext.Loader.syncRequire([
    'Koala.view.button.TimeReferenceController'
]);

describe('Koala.view.button.TimeReferenceController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.button.TimeReferenceController).to.not.be(undefined);
        });

        it('binds translated texts', function() {
            var ctrl = new Koala.view.button.TimeReferenceController();
            Koala.view.button.TimeReference = {UTC: 'utc'};
            var btn = {};
            btn.setBind = sinon.stub();
            btn.blur = sinon.stub();
            btn.getCurrent = sinon.stub();
            ctrl.setTextBinds(btn);
            window.setTimeout(function() {
                expect(btn.setBind.calledOnce).to.be(true);
                expect(btn.blur.calledOnce).to.be(true);
            }, 1100);
        });
    });
});
