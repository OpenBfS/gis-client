Ext.Loader.syncRequire(['Koala.util.Fullscreen']);

describe('Koala.util.Fullscreen', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen).to.not.be(undefined);
        });
    });
    describe('#isInFullscreen', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen.isInFullscreen).to.not.be(undefined);
        });
        it('it returns a Boolean', function() {
            var fullScreen = Koala.util.Fullscreen.isInFullscreen();
            expect(fullScreen).to.be.a('boolean');
        });
    });
    describe('#requestFullscreen', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen.requestFullscreen).to.not.be(undefined);
        });
    });
    describe('#exitFullscreen', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen.exitFullscreen).to.not.be(undefined);
        });
    });
    describe('#toggleFullscreen', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen.toggleFullscreen).to.not.be(undefined);
        });
    });
    describe('#isFullscreenSupported', function() {
        it('is defined', function() {
            expect(Koala.util.Fullscreen.isFullscreenSupported).to.not.be(undefined);
        });
        it('it returns a Boolean', function() {
            var supported = Koala.util.Fullscreen.isFullscreenSupported();
            expect(supported).to.be.a('boolean');
        });
    });
});
