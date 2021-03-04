import { BaseApi, APIError } from "./request";
import crypto from "crypto";
import packageJson from "./package.json";
import { ReadStream } from "fs";

const VALUE_SEPARATOR = '|';
const DEFAULT_ALGORITHM = 'sha256';
const DEFAULT_ENCODING = 'hex';
const CLIENT_NAME = 'node_sdk';

interface Any {
  [key: string]: any
}

export type Currency = 'RUB' | 'KZT'

export { APIError }

export interface CreatePaymentFormParams {
  publicKey: string
  billId?: string
  amount?: number
  phone?: string
  email?: string
  account?: string
  comment?: string
  customFields?: Any & {
    paySourcesFilter?: 'qw' | 'card' | 'qw,card' | 'card,qw',
    themeCode?: string
  }
}

export interface CreateBillParams {
  currency?: Currency
  amount: number
  expirationDateTime: Date
  phone?: string
  email?: string
  account?: string
  comment?: string
  successUrl?: string
  customFields?: Any & {
    paySourcesFilter?: 'qw' | 'card' | 'qw,card' | 'card,qw',
    themeCode?: string
  }
}

export interface NitificationBody {
  bill: Bill
  version: number
}

export interface Bill {
  siteId: string
  billId: string
  amount: {
    currency: Currency
    value: number
  }
  status: {
    value: string
    changedDateTime: Date
  }
  customer: {
    phone?: string
    email?: string
    account?: string
  }
  customFields: {
    [key: string]: string
    paySourcesFilter: string
    themeCode: string
  }
  comment?: string
  creationDateTime: Date
  expirationDateTime: Date
  payUrl: string
}

const pack = (successUrl?: string) => {
  return bill => {
    if (bill.payUrl && successUrl)
      bill.payUrl = `${bill.payUrl}&successUrl=${encodeURIComponent(successUrl)}`;

    bill.amount.value = +bill.amount.value
    bill.status.changedDateTime = new Date(bill.status.changedDateTime)
    bill.creationDateTime = new Date(bill.creationDateTime)
    bill.expirationDateTime = new Date(bill.expirationDateTime)

    return bill as Bill
  }
}

export class QiwiPaymentsAPI extends BaseApi {
  async parseBody(v: ReadStream): Promise<NitificationBody> {
    const buff = await new Promise<Buffer>(resolve => {
      const c: Buffer[] = []
      v.on('data', d => c.push(Buffer.from(d)))
      v.on('end', () => resolve(Buffer.concat(c)))
    })
    const data = JSON.parse(buff.toString())

    return {
      version: +data.version,
      bill: pack()(data.bill)
    }
  }

  checkNotificationSignature(
    signature: string,
    notificationBody: NitificationBody,
    merchantSecret = this.key
  ) {
    const processedNotificationData = {
      "billId": notificationBody.bill.billId,
      "amount.value": Number(notificationBody.bill.amount.value).toFixed(2),
      "amount.currency": notificationBody.bill.amount.currency,
      "siteId": notificationBody.bill.siteId,
      "status": notificationBody.bill.status.value
    };

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

  createPaymentForm(params: CreatePaymentFormParams) {
    const url = 'https://oplata.qiwi.com/create';
    const amount = this.normalizeAmount(params.amount);
    const apiClient = CLIENT_NAME, apiClientVersion = packageJson.version;
    const customFields = { ...(params.customFields || {}), apiClient, apiClientVersion };
    const query = this.queryStringify({ ...params, ...(+amount ? { amount } : {}), customFields });
    return `${url}?${query.toString()}`;
  }

  async createBill(billId: string, params: CreateBillParams) {
    return this.requestBuilder({
      url: billId,
      method: 'PUT',
      body: {
        amount: {
          currency: params.currency || 'RUB',
          value: this.normalizeAmount(params.amount)
        },
        comment: params.comment,
        expirationDateTime: params.expirationDateTime.toISOString(),
        customer: {
          phone: params.phone,
          email: params.email,
          account: params.account
        },
        customFields: {
          apiClient: CLIENT_NAME,
          apiClientVersion: packageJson.version,
          ...(params.customFields)
        } // extra is deprecated, will be removed in next minor update
      }
    }).then(pack(params.successUrl));
  }

  async getBillInfo(billId: string) {
    return this.requestBuilder({
      url: billId,
      method: 'GET'
    }).then(pack());
  }

  async cancelBill(billId: string) {
    return this.requestBuilder({
      url: `${billId}/reject`,
      method: 'POST'
    }).then(pack());
  }

  // async getRefundInfo(billId: string, refundId: string) {
  //   return this.requestBuilder({
  //     url: `${billId}/refunds/${refundId}`,
  //     method: 'GET'
  //   });
  // }

  // async refund(billId: string, refundId: string, amount: string | number = 0, currency = 'RUB') {
  //   return this.requestBuilder({
  //     url: `${billId}/refunds/${refundId}`,
  //     method: 'PUT',
  //     body: {
  //       amount: {
  //         currency,
  //         value: this.normalizeAmount(amount)
  //       }
  //     }
  //   });
  // }
}