# Universal payments API Node.js SDK

[![Build Status](https://travis-ci.org/QIWI-API/bill-payments-node-js-sdk.svg?branch=master)](https://travis-ci.org/QIWI-API/bill-payments-node-js-sdk)
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

**API QIWI Кассы**: https://developer.qiwi.com/ru/bill-payments

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

По-умолчанию пользователю доступно несколько способов оплаты. В платежной форме параметры счета передаются в открытом виде в ссылке. Далее клиенту отображается форма с выбором способа оплаты. При использовании этого способа нельзя гарантировать, что все счета выставлены мерчантом, в отличие от выставления по API.
Через API все параметры передаются в закрытом виде , так же в API поддерживаются операции выставления и отмены счетов, возврата средств по оплаченным счетам, а также проверки статуса выполнения операций.


### Платежная форма

Простой способ для интеграции. При открытии формы клиенту автоматически выставляется счет. Параметры счета передаются в открытом виде в ссылке. Далее клиенту отображается платежная форма с выбором способа оплаты. При использовании этого способа нельзя гарантировать, что все счета выставлены мерчантом, в отличие от выставления по API.

Метод `createPaymentForm` создает платежную форму. В параметрах нужно указать: ключ идентификации провайдера, полученный в QIWI Кассе `publicKey`, идентификатор счета `billId` внутри вашей системы и сумму `amount`. В результате будет получена ссылка на форму оплаты, которую можно передать клиенту. Подробнее о доступных параметрах в [документации](https://developer.qiwi.com/ru/bill-payments/#http).

```javascript
const publicKey = '2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc';

const params = {
    publicKey,
    amount: 200,
    billId: '893794793973',
    successUrl: 'https://merchant.com/payment/success?billId=893794793973'
};

const link = qiwiApi.createPaymentForm(params);
```

В результате:

```
https://oplata.qiwi.com/create?publicKey=2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc&amount=200&billId=893794793973&successUrl=https%3A%2F%2Fmerchant.com%2Fpayment%2Fsuccess%3FbillId%3D893794793973&customFields[apiClient]=node_sdk&customFields[apiClientVersion]=3.1.2
```

### Выставление счета

Надежный способ для интеграции. Параметры передаются server2server с использованием авторизации. Метод позволяет выставить счет, при успешном выполнении запроса в ответе вернется параметр `payUrl` - ссылка для редиректа пользователя на платежную форму.

Метод `createBill` выставляет новый счет. В параметрах нужно указать: идентификатор счета `billId` внутри вашей системы и дополнительными параметрами `fields`. В результате будет получен ответ с данными о выставленном счете.

```javascript
const billId = '893794793973';

const fields = {
    amount: 1.00,
    currency: 'RUB',
    comment: 'test',
    expirationDateTime: '2018-03-02T08:44:07',
    email: 'example@mail.org',
    account : 'client4563',
    successUrl: 'http://test.ru/'
};

qiwiRestApi.createBill( billId, fields ).then( data => {
    //do with data
});
```

В результате:

```json
{
  "siteId": "270305",
  "billId": "cc961e8d-d4d6-4f02-b737-2297e51fb48e",
  "amount": {
    "currency": "RUB",
    "value": "200.34"
  },
  "status": {
    "value": "WAITING",
    "changedDateTime": "2018-07-12T10:28:38.855+03:00"
  },
  "comment": "test",
  "creationDateTime": "2018-07-12T10:28:38.855+03:00",
  "expirationDateTime": "2018-08-26T10:28:38.855+03:00",
  "payUrl": "https://oplata.qiwi.com/form/?invoice_uid=bb773791-9bd9-42c1-b8fc-3358cd108422&successUrl=http%3A%2F%2Ftest.ru%2F"
}
```

### Информация о счете

Метод `getBillInfo` возвращает информацию о счете. В параметрах нужно указать идентификатор счета `billId` внутри вашей системы, в результате будет получен ответ со статусом счета. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const billId = '893794793973';

qiwiApi.getBillInfo(billId).then( data => {
    //do with data
});
```

Ответ:

```json
{
  "siteId": "270305",
  "billId": "4fa5cb2a-942e-4e67-b552-ff10c71d6f8d",
  "amount": {
    "currency": "RUB",
    "value": "200.34"
  },
  "status": {
    "value": "WAITING",
    "changedDateTime": "2018-07-12T10:31:06.846+03:00"
  },
  "comment": "test",
  "creationDateTime": "2018-07-12T10:31:06.846+03:00",
  "expirationDateTime": "2018-08-26T10:31:06.846+03:00",
  "payUrl": "https://oplata.qiwi.com/form/?invoice_uid=ee3ad91d-cfb8-4dbf-8449-b6859fdfec3c"
}
```

### Отмена неоплаченного счета

Метод `cancelBill` отменяет неоплаченный счет. В параметрах нужно указать идентификатор счета `billId` внутри вашей системы, в результате будет получен ответ с информацией о счете. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const billId = '893794793973';

qiwiApi.cancelBill(billId).then( data => {
    //do with data
});
```

Ответ:

```json
{
  "siteId": "270305",
  "billId": "60418b7e-1e95-4ac0-936e-0b98d7a7fdae",
  "amount": {
    "currency": "RUB",
    "value": "200.34"
  },
  "status": {
    "value": "REJECTED",
    "changedDateTime": "2018-07-12T10:32:17.595+03:00"
  },
  "comment": "test",
  "creationDateTime": "2018-07-12T10:32:17.481+03:00",
  "expirationDateTime": "2018-08-26T10:32:17.481+03:00",
  "payUrl": "https://oplata.qiwi.com/form/?invoice_uid=a3fe62b2-9962-4d9d-9025-0766fb492546"
}
```

### Возврат средств
#### ! Метод недоступен для физических лиц

Методом `refund` производит возврат средств. В параметрах нужно указать идентификатор счета `billId`, идентификатор возврата `refundId` внутри вашей системы, сумму возврата `amount` и валюту возврата `currency`. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund).

```javascript
const billId = '893794793973';
const refundId = '899343443';
const amount = 12;
const currency = 'RUB'

qiwiApi.refund(billId, refundId, amount, currency).then( data => {
    //do with data
});
```

В результате будет получен ответ c информацией о возврате и о счете:

```json
{
  "amount": {
    "currency": "RUB",
    "value": "0.01"
  },
  "dateTime": "2018-07-12T10:34:02.191+03:00",
  "refundId": "1531380841742",
  "status": "PARTIAL"
}
```

### Информация о возврате
#### ! Метод недоступен для физических лиц

Метод `getRefundInfo` запрашивает статус возврата, в параметрах нужно указать идентификатор счета `billId`, идентификатор возврата `refundId` внутри вашей системы. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund-status).

```javascript
const billId = '893794793973';
const refundId = '899343443';

qiwiApi.getRefundInfo(billId, refundId).then( data => {
    //do with data
});
```

В результате будет получен ответ c информацией о возврате:

```json
{
  "amount": {
    "currency": "RUB",
    "value": "1.00"
  },
  "dateTime": "2018-07-11T15:06:55.987+03:00",
  "refundId": "1520425084283",
  "status": "PARTIAL"
}

```

### Вспомогательные методы

* Метод `generateId` возвращает строку в формате UUID v4, удобно для генерирования `billId`, `refundId`:

    ```javascript
    const billId = qiwiApi.generateId();
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
    
* Метод `checkNotificationSignature` осуществляет проверку подписи при нотификации о новом счете от сервера уведомлений QIWI. Принимает на вход подпись из входящего запроса, объект - тело запроса и secret ключ, с помощью которого должна осуществляться подпись:

    ```javascript
    const validSignatureFromNotificationServer =
          '07e0ebb10916d97760c196034105d010607a6c6b7d72bfa1c3451448ac484a3b';

    const notificationData = {
        bill: {
            siteId: 'test',
            billId: 'test_bill',
            amount: {value: 1, currency: 'RUB'},
            status: {value: 'PAID'}
        },
        version: '3'
    };
  
    const merchantSecret = 'test-merchant-secret-for-signature-check';
  
    qiwiApi.checkNotificationSignature(
        validSignatureFromNotificationServer, notificationData, merchantSecret
    ); // true

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
