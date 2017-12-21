const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const axios = require('axios');
const assert = chai.assert;


const key = 'eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTk5NmI5ZWQ2NmQwNzdkMTg5ZjMwYzZhY2RjMzg1In19';

const qiwiRestApi = new QiwiBillPaymentsAPI(key);



const bill_id = '12345678';

const refund_id = '0734';

const public_key = '2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc';

const amount = 200;


describe('qiwi api v3', async () => {

     try {

        let link = '';

        it('creates payment form', () => {

            const testLink = `https://oplata.qiwi.com/create?public_key=${public_key}&amount=${amount}&bill_id=${bill_id}`;

            link = qiwiRestApi.createPaymentForm({ public_key, amount, bill_id });

            console.log(link)

            assert.equal(link, testLink);

        });

        describe('requests', async () => {

            before(() => {
                console.log('before')
            });



            it('returns valid bill status', async () => {

                try {

                    const data = await qiwiRestApi.getStatus(bill_id);

                    assert.equal( data.result_code, 'SUCCESS');

                } catch (e) {
                    throw e;
                }
            });

            it('cancels bill', async () =>  {

                try {

                    const data = await qiwiRestApi.cancel(bill_id);

                    assert.equal( data.result_code, 'SUCCESS');

                } catch (e) {
                    throw e;
                }

            });
        });

    } catch (e) {
        console.error(e);

    }


});


