Ext.Loader.syncRequire(['Koala.util.Hooks']);

describe('Koala.util.Hooks', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Hooks).to.not.be(undefined);
        });
    });
    describe('#executeBeforeAddHook', function() {
        it('is defined', function() {
            expect(Koala.util.Hooks.executeBeforeAddHook).to.not.be(undefined);
        });
    });
    describe('#executeBeforePostHook', function() {
        it('is defined', function() {
            expect(Koala.util.Hooks.executeBeforePostHook).to.not.be(undefined);
        });
    });
});
