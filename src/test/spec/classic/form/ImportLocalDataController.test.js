Ext.Loader.syncRequire([
    'Koala.view.form.ImportLocalDataController',
    'Koala.view.form.ImportLocalData'
]);

describe('Koala.view.form.ImportLocalDataController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.ImportLocalDataController).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.form.ImportLocalData');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });

    describe('#flipCoords', function() {
        it('can flip coordinates', function() {
            var cmp = Ext.create('Koala.view.form.ImportLocalData');
            var coords = [1,2,3];
            coords = cmp.getController().flipCoords(coords);
            expect(coords).to.be.eql([2,1,3]);
        });

        it('can flip polygon coordinates', function() {
            var cmp = Ext.create('Koala.view.form.ImportLocalData');
            var coords = [[1,2,3], [3,2,1]];
            coords = cmp.getController().flipCoords(coords);
            expect(coords).to.be.eql([[2,1,3], [2,3,1]]);
        });
    });

    describe('#retransformFlipAndTransform', function() {
        it('transforms and flips', function() {
            var cmp = Ext.create('Koala.view.form.ImportLocalData');
            var fmt = new ol.format.WKT();
            var feat = fmt.readFeature('POINT(1 2)');
            cmp.getController().retransformFlipAndTransform(feat, 'EPSG:4326', 'EPSG:4326');
            expect(feat.getGeometry().getCoordinates()[0]).to.be(2);
        });
    });

    describe('#cancelClicked', function() {
        it('closes the window', function() {
            var cmp = Ext.create('Koala.view.form.ImportLocalData');
            var win = {};
            win.close = sinon.spy();
            cmp.up = sinon.stub().returns(win);
            cmp.getController().cancelClicked();
            expect(win.close.calledOnce).to.be(true);
        });
    });
});
