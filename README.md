# Universal payments API Node.js SDK

[![Build Status](https://travis-ci.org/secondtonone/bill-payments-rest-api-node-js-sdk.svg?branch=master)](https://travis-ci.org/secondtonone/bill-payments-rest-api-node-js-sdk)
[![npm (scoped)](https://img.shields.io/npm/v/@qiwi/bill-payments-node-js-sdk.svg)](https://www.npmjs.com/package/@qiwi/bill-payments-node-js-sdk)

Node.js SDK модуль для внедрения единого платежного протокола эквайринга и QIWI Кошелька.

## Установка и подключение

Установка с помощью npm:

```bash
$ npm install @qiwi/bill-payments-node-js-sdk --save
```

Подключение:

```javascript
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
```

## Документация

**Универсальный платежный API**: https://developer.qiwi.com/ru/bill-payments

## Авторизация

Для использования SDK требуется `SECRET_KEY`, подробности в [документации](https://developer.qiwi.com/ru/bill-payments/#auth).

```javascript
const SECRET_KEY = 'eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTnONPININONPN090MTg5Z**********************';

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);
```

Смена `SECRET_KEY` на новый:

```javascript
const NEW_SECRET_KEY = 'kokoOKPzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTk5NmIbhchhbbHBHIBDBI**********************';

qiwiApi.key = NEW_SECRET_KEY;
```

## Примеры

### Платежная форма

Метод `createPaymentForm` создает платежную форму. В параметрах нужно указать: ключ идентификации провайдера, полученный в QIWI Кассе `public_key`, идентификатор счета `bill_id` внутри вашей системы и сумму `amount`. В результате будет получена ссылка на форму оплаты, которую можно передать клиенту. Подробнее о доступных параметрах в [документации](https://developer.qiwi.com/ru/bill-payments/#http).

```javascript
const public_key = '2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc';

const params = {
    public_key,
    amount: 200,
    bill_id: '893794793973'
};

const link = qiwiApi.createPaymentForm(params);
```

В результате:

```
https://oplata.qiwi.com/create?public_key=2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc&amount=200&bill_id=893794793973
```

### Выставление счета

Метод `createBill` выставляет новый счет. В параметрах нужно указать: идентификатор счета `bill_id` внутри вашей системы и дополнительными параметрами `fields`. В результате будет получен ответ с данными о выставленном счете.

```javascript
const bill_id = '893794793973';

const fields = {
    amount: 1.00,
    currency: 'RUB',
    comment: 'test',
    expiration_date_time: '2018-03-02T08:44:07'
};

qiwiRestApi.createBill( bill_id, fields ).then( data => {
    //do with data
});
```

В результате:

```json
{ 
  "result_code": "SUCCESS",
  "bill": { 
     "site_id": 529089,
     "bill_id": "be7597f6-52bc-46f2-beb8-8bd329d42170",
     "amount": { 
        "value": 1.00, 
        "currency": "RUB" 
     },
     "status": { 
        "value": "WAITING",
        "datetime": "2018-03-01T11:44:07" 
     },
     "comment": "test",
     "creation_datetime": "2018-03-01T11:44:07",
     "expiration_datetime": "2018-03-02T08:44:07",
     "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=be7597f6-52bc-46f2-beb8-8bd329d42170"
   } 
}
```

### Информация о счете

Метод `getBillInfo` проверяет статус оплаты счета. В параметрах нужно указать идентификатор счета `bill_id` внутри вашей системы, в результате будет получен ответ со статусом счета. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const bill_id = '893794793973';

qiwiApi.getBillInfo(bill_id).then( data => {
    //do with data
});
```

Ответ:

```json
{ 
  "result_code": "SUCCESS",
  "bill": { 
     "site_id": 529089,
     "bill_id": "be7597f6-52bc-46f2-beb8-8bd329d42170",
     "amount": { 
        "value": 1.00, 
        "currency": "RUB" 
     },
     "status": { 
        "value": "WAITING",
        "datetime": "2018-03-01T11:44:07" 
     },
     "comment": "test",
     "creation_datetime": "2018-03-01T11:44:07",
     "expiration_datetime": "2018-03-02T08:44:07",
     "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=be7597f6-52bc-46f2-beb8-8bd329d42170"
   } 
}
```

### Отмена неоплаченного счета

Метод `cancelBill` отменяет неоплаченный счет. В параметрах нужно указать идентификатор счета `bill_id` внутри вашей системы, в результате будет получен ответ с информацией о счете. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const bill_id = '893794793973';

qiwiApi.cancelBill(bill_id).then( data => {
    //do with data
});
```

Ответ:

```json
{ 
  "result_code": "SUCCESS",
  "bill": { 
     "site_id": 529089,
     "bill_id": "be7597f6-52bc-46f2-beb8-8bd329d42170",
     "amount": { 
        "value": 1.00, 
        "currency": "RUB" 
     },
     "status": { 
        "value": "WAITING",
        "datetime": "2018-03-01T11:44:07" 
     },
     "comment": "test",
     "creation_datetime": "2018-03-01T11:44:07",
     "expiration_datetime": "2018-03-02T08:44:07",
     "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=be7597f6-52bc-46f2-beb8-8bd329d42170"
  }
}
```

### Возврат средств

Методом `refund` производит возврат средств. В параметрах нужно указать идентификатор счета `bill_id`, идентификатор возврата `refund_id` внутри вашей системы и сумму возврата `amount`. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund).

```javascript
const bill_id = '893794793973';
const refund_id = '899343443';
const amount = 12;
const currency = 'RUB'

qiwiApi.refund(bill_id, refund_id, amount, currency).then( data => {
    //do with data
});
```

В результате будет получен ответ c информацией о возврате и о счете:

```json
{
  "refund": { 
     "refund_id": "2",
     "status": "FULL",
     "amount": { 
        "value": 1.42, 
        "currency": "RUB" 
     },
     "date_time": "2018-02-28T16:18:36" 
  },
  "bill": { 
     "site_id": 529089,
     "bill_id": "be7597f6-52bc-46f2-beb8-8bd329d42170",
     "amount": { 
        "value": 1.00, 
        "currency": "RUB" 
     },
     "status": { 
        "value": "WAITING",
        "datetime": "2018-03-01T11:44:07" 
     },
     "comment": "test",
     "creation_datetime": "2018-03-01T11:44:07",
     "expiration_datetime": "2018-03-02T08:44:07",
     "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=be7597f6-52bc-46f2-beb8-8bd329d42170"
  },
  "result_code": "SUCCESS"
}
```

### Информация о возврате

Метод `getRefundInfo` запрашивает статус возврата, в параметрах нужно указать идентификатор счета `bill_id`, идентификатор возврата `refund_id` внутри вашей системы. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund-status).

```javascript
const bill_id = '893794793973';
const refund_id = '899343443';

qiwiApi.getRefundInfo(bill_id, refund_id).then( data => {
    //do with data
});
```

В результате будет получен ответ c информацией о возврате:

```json
{ 
  "result_code": "SUCCESS",
  "refund": { 
     "refund_id": "2",
     "status": "FULL",
     "amount": { 
        "value": 1.42, 
        "currency": "RUB" 
     },
     "date_time": "2018-02-28T16:18:36" 
  } 
}

```

### Вспомогательные методы

* Метод `generateId` возвращает строку в формате UUID v4, удобно для генерирования `bill_id`, `refund_id`:

    ```javascript
    const bill_id = qiwiApi.generateId();
    //e9b47ee9-b2f9-4b45-9438-52370670e2a6
    ```

* Метод `getLifetimeByDay` генерирует дату до которой счет будет доступен для оплаты - `lifetime`. Входной параметр - сколько дней счет будет доступен, если не указанно, то по умолчанию 45 дней. Метод возвращает строку в формате ISO 8601 UTC±0:00:

    ```javascript
    //now: 2018-02-04T17:16:58.033Z
    const lifetime = qiwiApi.getLifetimeByDay(1);
    //2018-02-05T17:16:58.033Z
    ```

    ```javascript
    //now: 2018-02-04T17:16:58.033Z
    const lifetime = qiwiApi.getLifetimeByDay(0.5);
    //2018-02-05T05:16:58.033Z
    ```

## Тестирование

```bash
$ cd bill-payments-node-js-sdk
npm install
npm run test
```

## Требования

* **Node.js v7.0.0**, запуск c флагом `--harmony`
* **Node.js v7.6.0** или выше 

или 

* **Babel** с плагином `babel-preset-es2017`

## Лицензия

[MIT](LICENSE)
