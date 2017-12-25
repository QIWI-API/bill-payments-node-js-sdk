const request = require('./request.js');
const { URLSearchParams }  = require('url');
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
     * @param      {Object}  args         The arguments
     * @param      {string}  args.url     The url
     * @param      {string}  args.method  The method
     * @param      {Object}  args.body    The body
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    async _requestBuilder({ url, method, body = null }) {

        const key = this._key;

        const headers = {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json',
            'Authorization': `Bearer ${key}`
        };

        const options = {
            hostname: 'qw-invoicing-api.qiwi.com',
            path: `/api/v3/prv/bills/${url}`,
            method,
            headers,
            body: new URLSearchParams(body)
        };


        try {

            const data = await request(options);

            return JSON.parse(data);

        } catch (e) {
            throw e;
        }
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
    createPaymentForm(params) {

        const url = 'https://oplata.qiwi.com/create';

        const query = new URLSearchParams({
            ...params
        });

        return `${url}?${query.toString()}`;
    }
    /**
     * Getting bill status
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
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
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    cancel(bill_id) {
        const options = {
            url: `${bill_id}/reject`,
            method: 'POST'
        };

        return this._requestBuilder(options);
    }
    /**
     * Getting refund status
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    getRefundStatus(bill_id, refund_id) {

        const options = {
            url: `${bill_id}/refund/${refund_id}`,
            method: 'GET'
        };

        return this._requestBuilder(options);
    }
    /**
     * Refund paid bill
     *
     * @param      {(string|number)}  bill_id  The bill identifier
     * @param      {(string|number)}  refund_id  The refund identifier
     * @return     {Promise<Object>|Error}  Return Promise with result
     */
    refund(bill_id, refund_id) {

        const options = {
            url: `${bill_id}/refund/${refund_id}`,
            method: 'PUT'
        };

        return this._requestBuilder(options);
    }
}
