const request = require('./request.js');
const URLSearchParams = require('url').URLSearchParams;
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
    constructor(key) {
        this._key = key;
    }
    /**
     * Key setter
     *
     * @param      {string}  key     The key
     */
    set key(key) {
        this._key = key;
    }
    /**
     * Build request
     *
     * @param      {Object}  arg1         The argument 1
     * @param      {string}  arg1.url     The url
     * @param      {string}  arg1.method  The method
     * @param      {?string}  arg1.body    The body
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    async _requestBuilder({ url, method, body = null }) {

        const key = new Buffer(this._key).toString('base64');

        const headers = {
            'Accept': 'text/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${key}`
        };

        const options = {
            hostname: 'api.qiwi.com',
            path: `/api/v3/prv/bills/${url}`,
            method,
            headers,
            body: new URLSearchParams(body)
        };

        try {

            const data = await request(options);

            return JSON.parse(data);

        } catch (e) {
            console.error(e.message);
        }
    }
    /**
     * Creating checkout link
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    createPaymentForm(bill_id) {

        const options = {
            url: bill_id,
            method: 'PUT'
        };

        return this._requestBuilder(options);
    }
    /**
     * Getting bill status
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    getStatus(bill_id) {

        const options = {
            url: bill_id,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }
    /**
     * Cancelling unpaid bill
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    cancel(bill_id) {
        const options = {
            url: bill_id,
            method: 'PATCH',
            body: {
                status: 'rejected'
            }
        };

        return this._requestBuilder(options);
    }
    /**
     * Refund by paid bill
     *
     * @param      {(string|number)}  bill_id    The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @param      {?(string|number)}  amount     The amount
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    refund(bill_id, refund_id, amount = '') {
        const options = {
            url: `${bill_id}/refund/${refund_id}`,
            method: 'PUT',
            body: {
                amount
            }
        };

        return this._requestBuilder(options);
    }
    /**
     * Get status of refund
     *
     * @param      {(string|number)}  bill_id    The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    getRefundStatus(bill_id, refund_id) {
        const options = {
            url: `${bill_id}/refund/${refund_id}`,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }
}
