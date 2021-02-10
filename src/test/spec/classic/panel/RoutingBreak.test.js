Ext.Loader.syncRequire([
    'Ext.data.Store',
    'Koala.view.panel.RoutingBreak'
]);

describe('Koala.view.panel.RoutingBreak', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.RoutingBreak).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.panel.RoutingBreak');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });

    describe('#initComponent', function() {

        it('fills the description field with given values', function() {
            var mockDescription = 'foo bar';
            var mockStore = Ext.create('Ext.data.Store', {
                data: [{
                    description: mockDescription
                }]
            });

            var cmp = Ext.create('Koala.view.panel.RoutingBreak', {
                break: mockStore.first()
            });

            var fieldVal = cmp.down('[name=description]').getValue();
            expect(fieldVal).to.equal(mockDescription);
        });

        it('fills the service field with given values', function() {
            var mockService = 30 * 60;
            var mockStore = Ext.create('Ext.data.Store', {
                data: [{
                    service: mockService
                }]
            });

            var cmp = Ext.create('Koala.view.panel.RoutingBreak', {
                break: mockStore.first()
            });

            var fieldVal = cmp.down('[name=service]').getValue();
            expect(fieldVal).to.equal(mockService);
        });

        it('fills the time_windows field with given values', function() {
            var mockTimeWindows = [[1, 1]];
            var mockStore = Ext.create('Ext.data.Store', {
                data: [{
                    time_windows: mockTimeWindows
                }]
            });

            var cmp = Ext.create('Koala.view.panel.RoutingBreak', {
                break: mockStore.first()
            });

            var fieldVal = cmp.down('[name=time_windows]').getStore().getAllAsTimestamp();
            expect(fieldVal[0][0]).to.equal(mockTimeWindows[0][0]);
            expect(fieldVal[0][1]).to.equal(mockTimeWindows[0][1]);
        });

    });
});
