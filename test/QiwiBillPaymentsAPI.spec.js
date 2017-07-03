const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');

const assert = chai.assert;

const key = '59058292';

const qiwiRestApi = new QiwiBillPaymentsAPI(key);

qiwiRestApi.key = key;

const billId = 'fdfvf5';
const refundId = '';
const amount = '';

describe('qiwi api v3', function() {
    it('creates payment form', function(done) {
        qiwiRestApi.createPaymentForm(billId).then(data => {
            console.log(data);
            // TODO assert
            done();
        });
    });

    it('returns valid bill status', function(done) {
        qiwiRestApi.getStatus(billId).then(data => {
            console.log(data);
            // TODO assert
            done();
        });
    });

    it('cancels bill', function(done) {
        qiwiRestApi.cancel(billId).then(data => {
            // TODO assert
            console.log(data);
            done();
        });
    });
});

/*qiwiRestApi.refund(billId, refundId, amount).then(data => {
    console.log(data);
});



qiwiRestApi.getRefundStatus(billId, refundId).then(data => {
    console.log(data);
});*/