Ext.Loader.syncRequire([
    'Koala.view.window.RoutingVehicle'
]);

describe('Koala.view.window.RoutingVehicle', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.RoutingVehicle).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.window.RoutingVehicle');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });

    describe('#initComponent', function() {
        it('fills the start field with given values', function() {
            var mockAddress = {
                address: 'foo',
                latitude: 52,
                longitude: 13
            };
            var cmp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    start: mockAddress
                }
            });

            var fieldVal = cmp.down('[name=start]').getSelection();
            expect(fieldVal.get('address')).to.equal(mockAddress.address);
            expect(fieldVal.get('latitude')).to.equal(mockAddress.latitude);
            expect(fieldVal.get('longitude')).to.equal(mockAddress.longitude);
        });

        it('fills the end field with given values', function() {
            var mockAddress = {
                address: 'foo',
                latitude: 52,
                longitude: 13
            };
            var cmp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    end: mockAddress
                }
            });

            var fieldVal = cmp.down('[name=end]').getSelection();
            expect(fieldVal.get('address')).to.equal(mockAddress.address);
            expect(fieldVal.get('latitude')).to.equal(mockAddress.latitude);
            expect(fieldVal.get('longitude')).to.equal(mockAddress.longitude);
        });

        it('fills the description field with given values', function() {
            var mockDescription = 'foo bar';
            var cmp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    description: mockDescription
                }
            });

            var fieldVal = cmp.down('[name=description]').getValue();
            expect(fieldVal).to.equal(mockDescription);
        });

        it('fills the time_window field with given values', function() {
            var mockTimeWindow = [1, 1];
            var cmp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    time_window: mockTimeWindow
                }
            });

            var startDay = cmp.down('[name=time_window] [name=startday]').getValue();
            var startTime = cmp.down('[name=time_window] [name=starttime]').getValue();
            var endDay = cmp.down('[name=time_window] [name=endday]').getValue();
            var endTime = cmp.down('[name=time_window] [name=endtime]').getValue();

            expect(startDay).to.not.be(null);
            expect(startTime).to.not.be(null);
            expect(endDay).to.not.be(null);
            expect(endTime).to.not.be(null);
        });

        it('fills the breaks field with given values', function() {
            var mockBreaks = [{time_windows: [[1, 1]]}];
            var cmp = Ext.create('Koala.view.window.RoutingVehicle', {
                vehicle: {
                    breaks: mockBreaks
                }
            });

            var store = cmp.down('[name=breaks]').store;

            expect(store.count()).to.equal(1);
        });
    });
});
