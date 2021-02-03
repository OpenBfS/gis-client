Ext.Loader.syncRequire([
    'Koala.view.form.field.GeocodingCombo'
]);

describe('Koala.view.form.field.GeocodingCombo', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.field.GeocodingCombo).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.form.field.GeocodingCombo');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });

});
