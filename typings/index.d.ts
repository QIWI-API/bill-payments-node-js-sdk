declare module '@qiwi/bill-payments-node-js-sdk' {

  type RequestBuilderArguments = {
    url: string,
    method: string,
    body?: Record<any, any>,
  }

  export type CreatePublicFormArguments = {
    billId: string | number,
    publicKey: string,
    amount: string | number,
    successUrl: string,
  }

  export type CreateBillArguments = {
    amount: string | number,
    currency: string,
    comment?: string,
    expirationDateTime: string,
    customFields?: Record<any, any>,
    phone?: string,
    email?: string,
    account?: string,
    successUrl?: string,
  }

  export default class QiwiBillPaymentsAPI {
    private _key: string

    public constructor (key: string)

    public set key (key: string)

    private _requestBuilder ({ url, method, body }: RequestBuilderArguments): Promise<Record<any, any>>
    private _normalizeAmount (amount?: number | string): string

    public checkNotificationSignature (
      signature: string,
      notificationBody: Record<any, any>,
      merchantSecret: string
    ): boolean

    public getLifetimeByDay (days?: number): string

    public normalizeDate (date: Date): string

    public generateId (): string

    public createPaymentForm (params: CreatePublicFormArguments): Promise<Record<any, any>>

    public createBill (billId: string | number, params: CreateBillArguments): Promise<Record<any, any>>

    public getBillInfo (billId: string | number): Promise<Record<any, any>>

    public cancelBill (billId: string | number): Promise<Record<any, any>>

    public getRefundInfo (billId: string | number): Promise<Record<any, any>>

    public refund (
      billId: string | number,
      refundId: string | number,
      amount?: number,
      currency?: string
    ): Promise<Record<any, any>>

  }
}
