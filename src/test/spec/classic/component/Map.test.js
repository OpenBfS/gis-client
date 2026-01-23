Ext.Loader.syncRequire(['Koala.view.component.Map']);

describe('Koala.view.component.Map', function() {
    // describe('Basics', function() {
    //     var testObjs;
    //     beforeEach(function() {
    //         testObjs = TestUtil.setupTestObjects({
    //             mapComponentOpts: {
    //                 appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
    //             }
    //         });
    //     });

    //     afterEach(function() {
    //         TestUtil.teardownTestObjects(testObjs);
    //     });
    //     it('is defined', function() {
    //         expect(Koala.view.component.Map).to.not.be(undefined);
    //     });

    //     it('can be created', function() {
    //         Koala.view.component.Map.prototype.up = sinon.stub().returns(testObjs.mapComponent);
    //         var map = new Koala.view.component.Map({map: testObjs.map});
    //         expect(map.initComponent.bind(map)).to.not.throwException();
    //     });

    //     it('delegates the hover click event', function() {
    //         Koala.view.component.Map.prototype.up = sinon.stub().returns(testObjs.mapComponent);
    //         var map = new Koala.view.component.Map({map: testObjs.map});
    //         var mockCtrl = {};
    //         mockCtrl.onHoverFeatureClick = sinon.stub();
    //         map.getController = sinon.stub().returns(mockCtrl);
    //         map.onHoverFeatureClick();
    //         expect(mockCtrl.onHoverFeatureClick.calledOnce).to.be(true);
    //     });
    // });

    // describe('Static functions', function() {

    //     describe('#styleFromGnos', function() {
    //         it('is defined', function() {
    //             expect(Koala.view.component.Map.styleFromGnos).to.not.be(undefined);
    //         });
    //         it('is a function', function() {
    //             expect(Koala.view.component.Map.styleFromGnos).to.be.a(Function);
    //         });
    //     });
    // });
});
