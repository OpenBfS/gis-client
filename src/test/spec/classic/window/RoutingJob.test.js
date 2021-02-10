Ext.Loader.syncRequire([
    'Koala.view.window.RoutingJob'
]);

describe('Koala.view.window.RoutingJob', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.RoutingJob).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.window.RoutingJob');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });

    describe('#initComponent', function() {
        it('fills the address field with given values', function() {
            var mockAddress = {
                address: 'foo',
                latitude: 52,
                longitude: 13
            };
            var cmp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    address: mockAddress
                }
            });

            var fieldVal = cmp.down('[name=address]').getSelection();
            expect(fieldVal.get('address')).to.equal(mockAddress.address);
            expect(fieldVal.get('latitude')).to.equal(mockAddress.latitude);
            expect(fieldVal.get('longitude')).to.equal(mockAddress.longitude);
        });

        it('fills the description field with given values', function() {
            var mockDescription = 'foo bar';
            var cmp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    description: mockDescription
                }
            });

            var fieldVal = cmp.down('[name=description]').getValue();
            expect(fieldVal).to.equal(mockDescription);
        });

        it('fills the service field with given values', function() {
            var mockService = 60 * 30;
            var cmp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    service: mockService
                }
            });

            var fieldVal = cmp.down('[name=service]').getValue();
            expect(fieldVal).to.equal(mockService);
        });

        it('fills the priority field with given values', function() {
            var mockPriority = 2;
            var cmp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    priority: mockPriority
                }
            });

            var fieldVal = cmp.down('[name=priority]').getValue();
            expect(fieldVal).to.equal(mockPriority);
        });

        it('fills the time_windows field with given values', function() {
            var mockTimeWindows = [[1, 10]];
            var cmp = Ext.create('Koala.view.window.RoutingJob', {
                job: {
                    time_windows: mockTimeWindows
                }
            });

            var store = cmp.down('[name=time_windows]').getStore();
            expect(store.count()).to.equal(1);

            var timeWindows = store.getAllAsTimestamp();
            expect(timeWindows[0][0]).to.equal(mockTimeWindows[0][0]);
            expect(timeWindows[0][1]).to.equal(mockTimeWindows[0][1]);
        });
    });
});
