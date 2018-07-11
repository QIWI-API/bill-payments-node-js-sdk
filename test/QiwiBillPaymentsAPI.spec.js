const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const assert = chai.assert;

const testConfig = require('./config.js');

const SECRET_KEY = testConfig.merchantSecretKey;

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

const billId = qiwiApi.generateId();

const publicKey = testConfig.merchantSecretKey;

const amount = 200.345;

const fields = {
    amount,
    currency: 'RUB',
    expirationDatetime: qiwiApi.getLifetimeByDay(1),
    providerName: 'Test',
    comment: 'test'
};

describe('qiwi api v4', () => {
    try {
        let link = '';

        // TODO check response structure

        it('creates payment form', () => {
            const testLink = `https://oplata.qiwi.com/create?publicKey=${publicKey}&amount=${parseFloat(
                amount
            ).toFixed(2)}&billId=${billId}`;

            link = qiwiApi.createPaymentForm({
                publicKey,
                amount,
                billId
            });

            assert.equal(link, testLink);
        });

        describe('util', () => {
            const merchantSecret = 'test-merchant-secret-for-signature-check';
            const validSignatureFromNotificationServer =
                '07e0ebb10916d97760c196034105d010607a6c6b7d72bfa1c3451448ac484a3b';

            const invalidSignatureFromNotificationServer = 'foo';

            const notificationData = {
                bill: {
                    siteId: 'test',
                    billId: 'test_bill',
                    amount: {value: 1, currency: 'RUB'},
                    status: {value: 'PAID', datetime: '2018-03-01T11:16:12'},
                    customer: {},
                    extra: {},
                    creationDatetime: '2018-03-01T11:15:39',
                    expirationDatetime: '2018-04-15T11:15:39'
                },
                version: '3'
            };

            describe('signature check', () => {
                it('should return false on wrong signature', () => {
                    assert.equal(
                        false,
                        qiwiApi.checkNotificationSignature(
                            invalidSignatureFromNotificationServer,
                            notificationData,
                            merchantSecret
                        )
                    );
                });

                it('should return true on valid signature', () => {
                    assert.equal(
                        true,
                        qiwiApi.checkNotificationSignature(
                            validSignatureFromNotificationServer,
                            notificationData,
                            merchantSecret
                        )
                    );
                });
            });
        });

        describe('requests: ', () => {
            it('create bill', async () => {
                await qiwiApi.createBill(billId, fields);
            });

            it('returns valid bill info', async () => {
                await qiwiApi.getBillInfo(billId);
            });

            it('cancel unpaid bill', async function () {
                await qiwiApi.cancelBill(billId);
            });

            it('gets refund info', async () => {
                await qiwiApi.getRefundInfo(
                    testConfig.billIdForGetRefundInfoTest,
                    testConfig.billRefundIdForGetRefundInfoTest
                );
            });

            it('makes refund', async function () {
                await qiwiApi.refund(
                    testConfig.billIdForGetRefundInfoTest,
                    Date.now(),
                    '0.01',
                    'RUB'
                );
            });
        });
    } catch (e) {
        console.error(e);
    }
});
