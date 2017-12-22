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
     * @param      {Object}  arg1         The argument 1
     * @param      {string}  arg1.url     The url
     * @param      {string}  arg1.method  The method
     * @param      {?string}  arg1.body    The body
     * @return     {Promise<Object>|Error}  Return promise with result
     */
    async _requestBuilder({ url, method, body = null }) {

        /*const key = new Buffer(this._key).toString('base64');
        */
        const key = this._key;

        const headers = {
            'Accept': 'application/json;charset=UTF-8',
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
     * @param      {(string|number)}  bill_id  The bill identifier
     * @return     {Promise<Object>|Error}  Return promise with result
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
            url: `${bill_id}/reject`,
            method: 'POST'
        };

        return this._requestBuilder(options);
    }
}
