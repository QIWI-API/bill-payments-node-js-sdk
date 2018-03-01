const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const assert = chai.assert;
const testConfig = require('./config');

const SECRET_KEY = testConfig.merchantSecretKey

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

const bill_id = qiwiApi.generateId();

const public_key = testConfig.merchantSecretKey

const amount = 200.345;

const fields = {
    amount,
    currency: 'RUB',
    expiration_date_time: qiwiApi.getLifetimeByDay(1),
    provider_name: 'Test',
    comment: 'test'
};

describe('qiwi api v3', () => {
    try {
        let link = '';

        // TODO check response structure

        it('creates payment form', () => {
            const testLink = `https://oplata.qiwi.com/create?public_key=${public_key}&amount=${parseFloat(
                amount
            ).toFixed(2)}&bill_id=${bill_id}`;

            link = qiwiApi.createPaymentForm({
                public_key,
                amount,
                bill_id
            });

            assert.equal(link, testLink);
        });

        describe('requests: ', () => {

            it('create bill', async () => {
                try {
                    const data = await qiwiApi.createBill(bill_id, fields);

                    assert.equal('SUCCESS', data.result_code);
                } catch (e) {
                    throw e;
                }
            });

            it('returns valid bill info', async () => {
                try {
                    const data = await qiwiApi.getBillInfo(bill_id);

                    assert.equal('SUCCESS', data.result_code);
                } catch (e) {
                    throw e;
                }
            });

            it('cancel unpaid bill', async () => {
                try {
                    const data = await qiwiApi.cancelBill(bill_id);

                    assert.equal('SUCCESS', data.result_code);
                } catch (e) {
                    throw e;
                }
            });

            it('gets refund info', async () => {
                try {
                    const data = await qiwiApi.getRefundInfo(
                        testConfig.billIdForGetRefundInfoTest, testConfig.billRefundIdForGetRefundInfoTest
                    );

                    assert.equal('SUCCESS', data.result_code);
                } catch (e) {
                    throw e;
                }
            });

            it('makes refund', async () => {
                try {
                    const data = await qiwiApi.refund(
                        testConfig.billIdForRefundTest, Date.now(), '0.01', 'RUB'
                    );

                    console.log(data);

                    assert.equal('SUCCESS', data.result_code);
                } catch (e) {
                    throw e;
                }
            });
        });
    } catch (e) {
        console.error(e);
    }
});
