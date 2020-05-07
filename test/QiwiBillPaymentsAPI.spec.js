const QiwiBillPaymentsAPI = require('../lib/QiwiBillPaymentsAPI.js');
const chai = require('chai');
const packageJson = require('../package');
const assert = chai.assert;

const testConfig = require('./config.js');

const SECRET_KEY = testConfig.merchantSecretKey;

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

const billId = qiwiApi.generateId();

const publicKey = testConfig.merchantSecretKey;

const successUrl = 'http://test.ru/';

const amount = 200.345;

const CLIENT_NAME = 'node_sdk';

const fields = {
    amount,
    currency: 'RUB',
    expirationDateTime: qiwiApi.getLifetimeByDay(1),
    providerName: 'Test',
    comment: 'test',
    phone: '79999999999',
    email: 'test@test.ru',
    account: 'user uid on your side',
    customFields: {
        city: 'Москва',
        street: 'Арбат'
    },
    successUrl
};

describe('qiwi api v4', () => {
    try {
        let link = '';

        // TODO check response structure

        it('creates payment form', () => {
            const testLink = `https://oplata.qiwi.com/create?publicKey=${publicKey}&amount=${parseFloat(
                amount
            ).toFixed(2)}&billId=${billId}&successUrl=http%3A%2F%2Ftest.ru%2F&customFields[apiClient]=${CLIENT_NAME}&customFields[apiClientVersion]=${packageJson.version}`;

            link = qiwiApi.createPaymentForm({
                publicKey,
                amount,
                billId,
                successUrl
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
                    amount: {value: '1', currency: 'RUB'},
                    status: {value: 'PAID'}
                }
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
                const testCustomFields = Object.assign({
                    apiClient: CLIENT_NAME,
                    apiClientVersion: packageJson.version
                }, fields.customFields);
                const result = await qiwiApi.getBillInfo(billId);
                assert.deepEqual(result.customFields, testCustomFields);
            });

            it('cancel unpaid bill', async function () {
                await qiwiApi.cancelBill(billId);
            });

            it('gets refund info', async () => {
                try {
                    await qiwiApi.getRefundInfo(
                        testConfig.billIdForGetRefundInfoTest,
                        testConfig.billRefundIdForGetRefundInfoTest
                    );
                } catch (err) {
                    const {serviceName, errorCode, description, userMessage} = err.error;
                    assert.equal(serviceName, 'invoicing-api');
                    assert.equal(errorCode, 'api.invoice.not.found');
                    assert.equal(description, 'Invoice not found');
                    assert.equal(userMessage, 'Invoice not found');
                }
            });

            it('makes refund', async function () {
                try {
                    await qiwiApi.refund(
                        testConfig.billIdForGetRefundInfoTest,
                        Date.now(),
                        '0.01',
                        'RUB'
                    );
                } catch (err) {
                    const {serviceName, errorCode, description, userMessage} = err.error;
                    assert.equal(serviceName, 'invoicing-api');
                    assert.equal(errorCode, 'api.invoice.not.found');
                    assert.equal(description, 'Invoice not found');
                    assert.equal(userMessage, 'Invoice not found');
                }
            });
        });
    } catch (e) {
        console.error(e);
    }
});
