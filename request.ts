import request from "request-promise";
import uuid from "uuid/v4";

type Method = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DEL' | 'DELETE'

interface BuildParams {
  url: string
  method: Method
  body?: Any
  query?: Any
}

type AnyType = string | number | null | Any | Any[]

export class APIError extends Error {
  errorCode: string
  serviceName: string
  description: string
  userMessage: string
  datetime: Date
  traceId: string

  constructor(code: string, data) {
    super(data.description)
    this.errorCode = code
    this.traceId = data.traceId
    this.serviceName = data.serviceName
    this.description = data.description
    this.userMessage = data.userMessage
    this.datetime = new Date(data.datetime)
  }
}

interface Any {
  [key: string]: AnyType | AnyType[]
}

function query(obj: Any | AnyType, format = (v: string) => `${v}`) {
  const segmets: string[] = []

  if (typeof obj != 'object')
    throw new Error('Not object in object')

  for (let i in obj) {
    let v = obj[i]
    let k = format(i)

    if (typeof v == 'object')
      segmets.push(...query(v, (v: string) => `${k}[${v}]`))
    else
      segmets.push(`${k}=${v}`)
  }

  return segmets
}

export class BaseApi {
  private _key: string
  private _base = 'https://api.qiwi.com/partner/bill/v1/bills'

  set key(v: string) { this._key = v }

  constructor(key?: string) {
    this._key = key
  }

  generateId(): string {
    return uuid();
  }

  normalizeAmount(amount: string | number = 0) {
    return (+`${amount}`).toFixed(2);
  }

  getLifetimeByDay(days = 45) {
    const date = new Date();
    const timePlused = date.getTime() + days * 24 * 60 * 60 * 1000;

    date.setTime(timePlused);

    return this.normalizeDate(date);
  }

  queryStringify(obj: Any | AnyType) {
    return query(obj).join('&')
  }

  normalizeDate(date: Date) {
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

  async requestBuilder({ url, method, query = null, body = null }: BuildParams) {
    const key = this._key;
    const base = this._base;

    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json',
      Authorization: `Bearer ${key}`
    };

    return request({
      uri: `${base}/${url}`,
      method,
      headers,
      body: body,
      json: true
    }).then(e => {
      if (typeof e.errorCode == 'string') {
        const { errorCode, ...data } = e
        throw new APIError(errorCode, data)
      }
      return e
    });
  }
}