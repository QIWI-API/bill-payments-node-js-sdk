const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const assert = chai.assert;


const key = 'eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTk5NmI5ZWQ2NmQwNzdkMTg5ZjMwYzZhY2RjMzg1In19';

const qiwiRestApi = new QiwiBillPaymentsAPI(key);



const bill_id = '123445';

const public_key = '5nAq6abtyCz4tcDj89e5w7Y5i524LAFmzrsN6bQTQ3ceEvMvCq55ToeErzhxNemD6rMzCtzRx9jhV5kUUUyG2BC9sqbKjkRVuFjWXicbby5XJjUAnKNcNDdfEZ';

const amount = 200;


describe('qiwi api v3', () => {
    it('creates payment form', () => {

        const testLink = `https://oplata.qiwi.com/create?public_key=${public_key}&amount=${amount}&bill_id=${bill_id}`;

        const link = qiwiRestApi.createPaymentForm(public_key, amount, bill_id);
        console.log(link);

        assert.equal(link, testLink);

    });

    it('returns valid bill status', async () => {

        try {
            const data = await qiwiRestApi.getStatus(bill_id);

            console.log('info: ', data);



        } catch (e) {
            console.log('err: ', e)
        }
    });

    /*it('cancels bill', function(done) {
        qiwiRestApi.cancel(bill_id).then(data => {

            done();
        });
    });*/
});


