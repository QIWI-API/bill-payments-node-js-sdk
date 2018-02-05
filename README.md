# Universal payments API Node.js SDK

[![Build Status](https://travis-ci.org/secondtonone/bill-payments-rest-api-node-js-sdk.svg?branch=master)](https://travis-ci.org/secondtonone/bill-payments-rest-api-node-js-sdk)

Node.js SDK модуль для внедрения единого платежного протокола эквайринга и QIWI Кошелька.

## Установка и подключение

Установка с помощью npm:

```bash
$ npm install git+https://github.com/QIWI-API/bill-payments-node-js-sdk.git --save
```

Подключение:

```javascript
const QiwiBillPaymentsAPI = require('bill-payments-node-js-sdk');
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

### Статус счета

Метод `getStatus` проверяет статус оплаты счета. В параметрах нужно указать идентификатор счета `bill_id` внутри вашей системы, в результате будет получен ответ со статусом счета. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const bill_id = '893794793973';

qiwiApi.getStatus(bill_id).then( data => {
    //do with data
});
```

Ответ:

```json
{
    "bill": {
        "amount": 200,
        "bill_id": "893794793973",
        "comment": "Text comment",
        "creation_datetime": "2017-08-13T14:30:00.000Z",
        "currency": "RUB",
        "expiration_datetime": "2017-10-13T14:30:00.000Z",
        "extras": {},
        "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=755ac889-6f94-4f82-a0b8-3dffc24afa60",
        "site_id": 520170,
        "status": "WAITING",
        "status_update_datetime": "2017-09-03T14:30:00.000Z",
        "user": {}
    },
    "result_code": "SUCCESS"
}
```

### Отмена неоплаченного счета

Метод `cancel` отменяет неоплаченный счет. В параметрах нужно указать идентификатор счета `bill_id` внутри вашей системы, в результате будет получен ответ с информацией о счете. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const bill_id = '893794793973';

qiwiApi.cancel(bill_id).then( data => {
    //do with data
});
```

Ответ:

```json
{
    "bill": {
        "amount": 200,
        "bill_id": "893794793973",
        "comment": "Text comment",
        "creation_datetime": "2017-08-13T14:30:00.000Z",
        "currency": "RUB",
        "expiration_datetime": "2017-10-13T14:30:00.000Z",
        "extras": {},
        "pay_url": "https://oplata.qiwi.com/form/?invoice_uid=755ac889-6f94-4f82-a0b8-3dffc24afa60",
        "site_id": 520170,
        "status": "REJECTED",
        "status_update_datetime": "2017-09-03T14:30:00.000Z",
        "user": {}
    },
    "result_code": "SUCCESS"
}
```

### Возврат средств

Методом `refund` производит возврат средств. В параметрах нужно указать идентификатор счета `bill_id`, идентификатор возврата `refund_id` внутри вашей системы и сумму возврата `amount`. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund).

```javascript
const bill_id = '893794793973';
const refund_id = '899343443';
const amount = 12;

qiwiApi.refund(bill_id, refund_id, amount).then( data => {
    //do with data
});
```

В результате будет получен ответ c информацией о возврате:

```json
{
    "refund": {
        "amount": 12,
        "currency": "RUB",
        "date_time": "2017-09-03T14:30:00.000Z",
        "refund_id": "899343443",
        "status": "PARTIAL",
        "txn_id": 1234
    },
    "result_code": "SUCCESS"
}
```

### Статус возврата

Метод `getRefundStatus` запрашивает статус возврата, в параметрах нужно указать идентификатор счета `bill_id`, идентификатор возврата `refund_id` внутри вашей системы. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund-status).

```javascript
const bill_id = '893794793973';
const refund_id = '899343443';

qiwiApi.getRefundStatus(bill_id, refund_id).then( data => {
    //do with data
});
```

В результате будет получен ответ cо статусом о возврате:

```json
{
    "refund": {
        "amount": 12,
        "currency": "RUB",
        "date_time": "2017-09-03T14:30:00.000Z",
        "refund_id": "899343443",
        "status": "PARTIAL",
        "txn_id": 1234
    },
    "result_code": "SUCCESS"
}
```

### Вспомогательные методы

* Для генерирования `bill_id`, `refund_id` можно использовать метод `generateId`. Метод возвращает строку в формате UUID v4:

    ```javascript
    const bill_id = qiwiApi.generateId();
    //e9b47ee9-b2f9-4b45-9438-52370670e2a6
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
