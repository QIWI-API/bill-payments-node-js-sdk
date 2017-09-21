const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const assert = chai.assert;


const key = 'eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjIwNDIsImFwaV91c2VyX2lkIjo1NjYwMzk3Miwic2VjcmV0IjoiQjIwODlDNkI5Q0NDNTdCNDQzNjM0MTBGRkExREFEMDczOTVCRDIyNUQ0MDBCMjlCRkFFRDM5OEZBOTBENDBEMiJ9fQ==';

const qiwiRestApi = new QiwiBillPaymentsAPI(key);



const bill_id = 'test-bill';

const public_key = '5nAq6abtyCz4tcDj89e5w7Y5i524LAFmzrsN6bQTQ3ceEvMvCq55ToeErzhxNemD6rMzCtzRx9jhV5kUUUyG2BC9sqbKjkRVuFjWXicbby5XJjUAnKNcNDdfEZ';

const amount = 200;

describe('qiwi api v3', function() {
    it('creates payment form', function(done) {

        const testLink = 'https://oplata.qiwi.com/form?public_key=5nAq6abtyCz4tcDj89e5w7Y5i524LAFmzrsN6bQTQ3ceEvMvCq55ToeErzhxNemD6rMzCtzRx9jhV5kUUUyG2BC9sqbKjkRVuFjWXicbby5XJjUAnKNcNDdfEZ&amount=200&bill_id=test-bill';

        const link = qiwiRestApi.createPaymentForm(public_key, amount, bill_id);

        assert.equal(link, testLink);

        done();

    });

    it('returns valid bill status', function(done) {
        qiwiRestApi.getStatus(bill_id).then(data => {
            console.log(data);
            /*done();*/
        });
    });

    it('cancels bill', function(done) {
        qiwiRestApi.cancel(bill_id).then(data => {
            console.log(data);
            /*done();*/
        });
    });
});
