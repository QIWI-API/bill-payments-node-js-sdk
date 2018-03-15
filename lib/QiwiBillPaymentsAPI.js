const crypto = require('crypto');
const request = require('./request.js');
const { URLSearchParams } = require('url');
const uuid = require('uuid/v4');

const VALUE_SEPARATOR = '|';
const DEFAULT_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';

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
            hostname: 'api.qiwi.com',
            path: `/b2b/bills/v3/${url}`,
            method,
            headers,
            body: JSON.stringify(body)
        };

        try {
            const data = await request(options);

            return JSON.parse(data);
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
            "billId": notificationBody.bill.bill_id,
            "amount.value": notificationBody.bill.amount.value.toFixed(2),
            "amount.currency": notificationBody.bill.amount.currency,
            "siteId": notificationBody.bill.site_id,
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

        return date.toISOString().split('.')[0];
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
     * @param      {(string|number)}  params.bill_id     The bill identifier
     * @param      {string}           params.public_key  The public_key
     * @param      {(string|number)}  params.amount      The amount
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    createPaymentForm (params) {
        const url = 'https://oplata.qiwi.com/create';

        const amount = this._normalizeAmount(params.amount);

        const query = new URLSearchParams({
            ...params,
            amount
        });

        return `${url}?${query.toString()}`;
    }
    /**
     * Creating bill
     *
     * @param      {(string|number)}  bill_id                           The bill identifier
     * @param      {Object}           params                            The parameters
     * @param      {(string|number)}  params.amount                     The amount
     * @param      {string}           params.currency                   The currency
     * @param      {string}           [params.comment]                  The bill comment
     * @param      {string}           [params.expiration_date_time]     The bill expiration datetime (ISOstring)
     * @param      {Object}           [params.extra]                    The bill extra data
     * @param      {string}           params.phone                      The phone
     * @param      {string}           params.email                      The email
     * @param      {string}           params.account                    The account
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    createBill (bill_id, params) {
        const options = {
            url: `create`,
            method: 'POST',
            body: {
                amount: {
                    currency: params.currency,
                    value: this._normalizeAmount(params.amount)
                },
                bill_id,
                comment: params.comment,
                expiration_date_time: params.expiration_date_time,
                customer: {
                    phone: params.phone,
                    email: params.email,
                    account: params.account
                },
                extra: params.extra
            }
        };

        return this._requestBuilder(options);
    }
    /**
     * Getting bill info
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    getBillInfo (bill_id) {
        const options = {
            url: `get?bill_id=${bill_id}`,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }
    /**
     * Cancelling unpaid bill
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    cancelBill (bill_id) {
        const options = {
            url: `reject`,
            method: 'POST',
            body: {
                bill_id
            }
        };

        return this._requestBuilder(options);
    }
    /**
     * Getting refund info
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    getRefundInfo (bill_id, refund_id) {
        const options = {
            url: `refund/get?bill_id=${bill_id}&refund_id=${refund_id}`,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }
    /**
     * Refund paid bill
     *
     * @param      {(string|number)}  bill_id    The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @param      {(string|number)}  amount     The amount
     * @param      {(string)}         currency   The currency
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    refund (bill_id, refund_id, amount = 0, currency = 'RUB') {
        amount = this._normalizeAmount(amount);

        const options = {
            url: `refund`,
            method: 'POST',
            body: {
                amount: {
                    currency,
                    value: amount
                },
                bill_id,
                refund_id
            }
        };

        return this._requestBuilder(options);
    }
};
