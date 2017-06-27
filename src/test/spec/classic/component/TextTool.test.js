Ext.Loader.syncRequire(['Koala.view.component.TextTool']);

describe('Koala.view.component.TextTool', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.TextTool).to.not.be(undefined);
        });
    });

    describe('#initComponent', function() {
        it('can be initialized', function() {
            var comp = Ext.create('Koala.view.component.TextTool');
            expect(comp).to.not.be('undefined');
        });
    });

    describe('#registerEventListeners', function() {
        it('does not fail', function() {
            var comp = Ext.create('Koala.view.component.TextTool');
            var elm = new Ext.dom.Element(document.createElement('div'));
            comp.up = sinon.stub().returns(elm);
            elm.down = sinon.stub().returns(elm);
            comp.getEl = sinon.stub().returns(elm);

            expect(comp.registerEventListeners.bind(comp)).to.not.throwException();
        });
    });

    describe('#unregisterEventListeners', function() {
        it('does not fail', function() {
            var comp = Ext.create('Koala.view.component.TextTool');
            var elm = new Ext.dom.Element(document.createElement('div'));
            comp.up = sinon.stub().returns(elm);
            elm.down = sinon.stub().returns(elm);
            comp.getEl = sinon.stub().returns(elm);

            expect(comp.unregisterEventListeners.bind(comp)).to.not.throwException();
        });
    });

    describe('#addHoverCls', function() {
        it('adds the class', function() {
            var comp = Ext.create('Koala.view.component.TextTool');
            var elm = new Ext.dom.Element(document.createElement('div'));
            comp.getEl = sinon.stub().returns(elm);
            comp.addHoverCls();
            expect(elm.hasCls(comp.mouseOverTextCls)).to.be(true);
        });
    });

    describe('#removeHoverCls', function() {
        it('removes the class', function() {
            var comp = Ext.create('Koala.view.component.TextTool');
            var elm = new Ext.dom.Element(document.createElement('div'));
            comp.getEl = sinon.stub().returns(elm);
            comp.addHoverCls();
            comp.removeHoverCls();
            expect(elm.hasCls(comp.mouseOverTextCls)).to.be(false);
        });
    });
});
