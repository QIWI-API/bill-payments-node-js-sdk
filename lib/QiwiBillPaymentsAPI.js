const crypto = require('crypto');
const request = require('request-promise');
const { URLSearchParams } = require('url');
const uuid = require('uuid/v4');
const packageJson = require('../package');

const VALUE_SEPARATOR = '|';
const DEFAULT_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';
const CLIENT_NAME = 'node_sdk';
/**
 * Class for rest v 3.
 *
 * @class
 */
module.exports = class QiwiBillPaymentsAPI {
    /**
     * Constructs the object.
     *
     * @param      {string}  key     The key
     */

    constructor (key) {
        this._key = key;
    }

    /**
     * Key setter
     *
     * @param      {string}  key     The key
     */
    set key (key) {
        this._key = key;
    }

    /**
     * Build request
     *
     * @param      {Object}  args         The arguments
     * @param      {string}  args.url     The url
     * @param      {string}  args.method  The method
     * @param      {Object}  args.body    The body
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    async _requestBuilder ({ url, method, body = null }) {
        const key = this._key;

        const headers = {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
            Authorization: `Bearer ${key}`
        };

        const options = {
            uri: `https://api.qiwi.com/partner/bill/v1/bills/${url}`,
            method,
            headers,
            body: body,
            json: true
        };

        try {
            return await request(options);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Normalize amount
     *
     * @param      {(string|number)}  amount     The amount
     * @return     {string}  Return Promise with result
     */
    _normalizeAmount (amount = 0) {
        return parseFloat(amount).toFixed(2);
    }

    /**
     * Checks notification data signature
     *
     * @param       {string}    signature                  The signature
     * @param       {Object}    notificationBody           The notification body
     * @param       {string}    merchantSecret             The merchant key for validating signature
     * @return      {boolean}   Signature is valid or not
     */
    checkNotificationSignature (signature, notificationBody, merchantSecret) {
        /* eslint-disable */
        const processedNotificationData = {
            "billId": notificationBody.bill.billId,
            "amount.value": Number(notificationBody.bill.amount.value).toFixed(2),
            "amount.currency": notificationBody.bill.amount.currency,
            "siteId": notificationBody.bill.siteId,
            "status": notificationBody.bill.status.value
        };
        /* eslint-enable */

        const convertedNotificationData = Object.keys(processedNotificationData)
            .sort()
            .map((key) => processedNotificationData[key].toString())
            .join(VALUE_SEPARATOR);

        const hash = crypto
            .createHmac(DEFAULT_ALGORITHM, merchantSecret)
            .update(convertedNotificationData)
            .digest(DEFAULT_ENCODING);

        return hash === signature;
    }

    /**
     * Generate lifetime in format
     *
     * @param       {number}  days        Days of lifetime
     * @return      {string}  Lifetime in ISO
     */
    getLifetimeByDay (days = 45) {
        const date = new Date();

        const timePlused = date.getTime() + days * 24 * 60 * 60 * 1000;

        date.setTime(timePlused);

        return this.normalizeDate(date);
    }

    /**
     * Normalize date in api format
     * @param {Date} date - Date object
     * @returns {string} Date in api format
     */
    normalizeDate (date) {
        const tzo = -date.getTimezoneOffset();
        const dif = tzo >= 0 ? '+' : '-';
        const pad = function (num) {
            const norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(tzo / 60) +
            ':' + pad(tzo % 60);
    }

    /**
     * Generate id
     *
     * @return     {string}  Return uuid v4
     */
    generateId () {
        return uuid();
    }

    /**
     * Creating checkout link
     *
     * @param      {Object}           params             The parameters
     * @param      {(string|number)}  params.billId     The bill identifier
     * @param      {string}           params.publicKey  The publicKey
     * @param      {(string|number)}  params.amount      The amount
     * @param      {string}           params.successUrl The success url
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    createPaymentForm (params) {
        const url = 'https://oplata.qiwi.com/create';

        const amount = this._normalizeAmount(params.amount);

        const query = new URLSearchParams({
            ...params,
            amount
        });

        return `${url}?${query.toString()}&customFields[apiClient]=${CLIENT_NAME}&customFields[apiClientVersion]=${packageJson.version}`;
    }

    /**
     * Creating bill
     *
     * @param      {(string|number)}  billId                            The bill identifier
     * @param      {Object}           params                            The parameters
     * @param      {(string|number)}  params.amount                     The amount
     * @param      {string}           params.currency                   The currency
     * @param      {string}           [params.comment]                  The bill comment
     * @param      {string}           params.expirationDateTime         The bill expiration datetime (ISOstring)
     * @param      {Object}           [params.customFields]             The bill custom fields
     * @param      {Object}           [params.extra]                    The bill custom fields (deprecated, will be removed soon)
     * @param      {string}           params.phone                      The phone
     * @param      {string}           params.email                      The email
     * @param      {string}           params.account                    The account
     * @param      {string}           params.successUrl                 The success url
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    async createBill (billId, params) {
        params.customFields = Object.assign({
            apiClient: CLIENT_NAME,
            apiClientVersion: packageJson.version
        }, params.customFields);
        const options = {
            url: billId,
            method: 'PUT',
            body: {
                amount: {
                    currency: params.currency,
                    value: this._normalizeAmount(params.amount)
                },
                comment: params.comment,
                expirationDateTime: params.expirationDateTime,
                customer: {
                    phone: params.phone,
                    email: params.email,
                    account: params.account
                },
                customFields: params.customFields || params.extra // extra is deprecated, will be removed in next minor update
            }
        };

        let bill = await this._requestBuilder(options);
        if (bill.payUrl && params.successUrl) {
            bill.payUrl = `${bill.payUrl}&successUrl=${encodeURIComponent(params.successUrl)}`;
        }
        return bill;
    }

    /**
     * Getting bill info
     *
     * @param      {(string|number)}  billId  The bill identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    getBillInfo (billId) {
        const options = {
            url: billId,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }

    /**
     * Cancelling unpaid bill
     *
     * @param      {(string|number)}  billId  The bill identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    cancelBill (billId) {
        const options = {
            url: `${billId}/reject`,
            method: 'POST'
        };

        return this._requestBuilder(options);
    }

    /**
     * Getting refund info
     * Method is not available for individuals
     *
     * @param      {(string|number)}  billId  The bill identifier
     * @param      {(string|number)}  refundId  The refund identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    getRefundInfo (billId, refundId) {
        const options = {
            url: `${billId}/refunds/${refundId}`,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }

    /**
     * Refund paid bill
     * Method is not available for individuals
     *
     * @param      {(string|number)}  billId    The bill identifier
     * @param      {(string|number)}  refundId  The refund identifier
     * @param      {(string|number)}  amount     The amount
     * @param      {(string)}         currency   The currency
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    refund (billId, refundId, amount = 0, currency = 'RUB') {
        amount = this._normalizeAmount(amount);

        const options = {
            url: `${billId}/refunds/${refundId}`,
            method: 'PUT',
            body: {
                amount: {
                    currency,
                    value: amount
                }
            }
        };

        return this._requestBuilder(options);
    }
};
