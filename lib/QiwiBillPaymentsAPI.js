const request = require('./request.js');
const { URLSearchParams } = require('url');
const uuid = require('uuid/v4');
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
     * Generate lifetime in format
     *
     * @param        {number}  days        Days of lifetime
     * @returns      {string}  Lifetime in ISO
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
     * Creating invoice
     *
     * @param      {Object}           params                          The parameters
     * @param      {(string|number)}  [params.bill_id]                The bill identifier
     * @param      {string}           params.public_key               The public_key
     * @param      {(string|number)}  params.amount                   The amount
     * @param      {string}           params.currency                 The currency
     * @param      {string}           params.comment                  The bill comment
     * @param      {string}           params.expiration_date_time     The bill expiration datetime (ISOstring)
     * @param      {Object}           params.extra                    The bill extra data
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
            url: `get?billId=${bill_id}`,
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
            url: `refund/get?billId=${bill_id}&refundExtId=${refund_id}`,
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
