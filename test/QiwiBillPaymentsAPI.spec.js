const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const assert = chai.assert;
const testConfig = require('./config.js');

const SECRET_KEY = testConfig.merchantSecretKey;

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

const bill_id = qiwiApi.generateId();

const public_key = testConfig.merchantSecretKey;

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

        describe ('util', () => {
            const merchantSecret = 'test-merchant-secret-for-signature-check';
            const validSignatureFromNotificationServer =
                '07e0ebb10916d97760c196034105d010607a6c6b7d72bfa1c3451448ac484a3b';

            const invalidSignatureFromNotificationServer = 'foo';

            const notificationData = {
                bill: {
                    site_id: 'test',
                    bill_id: 'test_bill',
                    amount: { value: 1, currency: 'RUB' },
                    status: { value: 'PAID', datetime: '2018-03-01T11:16:12' },
                    customer: {},
                    extra: {},
                    creation_datetime: '2018-03-01T11:15:39',
                    expiration_datetime: '2018-04-15T11:15:39'
                },
                version: '3'
            };

            describe('signature check', () => {
                it('should return false on wrong signature', () => {
                    assert.equal(false, qiwiApi.checkNotificationSignature(
                        invalidSignatureFromNotificationServer, notificationData, merchantSecret
                    ));
                });

                it('should return true on valid signature', () => {
                    assert.equal(true, qiwiApi.checkNotificationSignature(
                        validSignatureFromNotificationServer, notificationData, merchantSecret
                    ));
                });
            });
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
