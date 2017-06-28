Ext.Loader.syncRequire([
    'Koala.view.form.field.LanguageSelect'
]);

describe('Koala.view.form.field.LanguageSelectController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.field.LanguageSelect).to.not.be(undefined);
        });

        it('can be created', function() {
            var comp = Ext.create('Koala.view.form.field.LanguageSelect');
            expect(comp.getController()).to.not.be(undefined);
        });
    });

    describe('#onLanguageChange', function() {
        var comp = Ext.create('Koala.view.form.field.LanguageSelect');
        var ctrl = comp.getController();
        sinon.spy(ctrl, 'requestLanguageFile');
        ctrl.onLanguageChange(null, 'en');
        expect(ctrl.requestLanguageFile.calledOnce).to.be(true);
    });
});
