# Universal payments API Node.js SDK

[![Build Status](https://travis-ci.org/vicimpa/qiwi-sdk.svg?branch=master)](https://travis-ci.org/vicimpa/qiwi-sdk)
[![npm (scoped)](https://img.shields.io/npm/v/@vicimpa/qiwi-sdk.svg)](https://www.npmjs.com/package/@vicimpa/qiwi-sdk)

Node.js SDK модуль для внедрения единого платежного протокола эквайринга и QIWI Кошелька.

## Установка и подключение

Установка с помощью npm:

```bash
$ npm install @vicimpa/qiwi-sdk --save
```

Подключение:

```javascript
const { QiwiPaymentsAPI } = require('@vicimpa/qiwi-sdk');
```

```javascript
import { QiwiPaymentsAPI } from "@vicimpa/qiwi-sdk";
```

## Документация

**Пошаговое руководство по работе с SDK (для физических лиц)**: https://developer.qiwi.com/ru/p2p-sdk-guide/#integration-sdk <br>
**API P2P-счетов (для физических лиц)**: https://developer.qiwi.com/ru/p2p-payments <br>
**API QIWI Кассы (для юридических лиц)**: https://developer.qiwi.com/ru/bill-payments

## Авторизация

Для использования SDK требуется `SECRET_KEY`, подробности в документации — [для физ.лиц](https://developer.qiwi.com/ru/p2p-payments/#auth), [для юр.лиц](https://developer.qiwi.com/ru/bill-payments/#auth).

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

По умолчанию пользователю доступно несколько способов оплаты. В платежной форме параметры счета передаются в открытом виде в ссылке. Далее клиенту отображается форма с выбором способа оплаты. При использовании этого способа нельзя гарантировать, что все счета выставлены мерчантом, в отличие от выставления по API.

Через API все параметры передаются в закрытом виде, так же в API поддерживаются операции выставления и отмены счетов, возврата средств по оплаченным счетам (только для юр. лиц), а также проверки статуса выполнения операций.


### Платежная форма

Простой способ для интеграции. При открытии формы клиенту автоматически выставляется счет. Параметры счета передаются в открытом виде в ссылке. Далее клиенту отображается платежная форма с выбором способа оплаты. При использовании этого способа нельзя гарантировать, что все счета выставлены мерчантом, в отличие от выставления по API.

Метод `createPaymentForm` создает платежную форму. В параметрах нужно указать: ключ идентификации провайдера, полученный в личном кабинете QIWI `publicKey`, идентификатор счета `billId` внутри вашей системы и сумму `amount`. В результате будет получена ссылка на форму оплаты, которую можно передать клиенту.

Подробнее о доступных параметрах в документации — [для физ. лиц](https://developer.qiwi.com/ru/p2p-payments/#http), [для юр. лиц](https://developer.qiwi.com/ru/bill-payments/#http).

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

Подробное описание параметров для выставления счёта представлено в [руководстве по работе с SDK](https://developer.qiwi.com/ru/p2p-sdk-guide/#step4), а так же в документации [для физ.лиц](https://developer.qiwi.com/ru/p2p-payments/#create) и [для юр. лиц](https://developer.qiwi.com/ru/bill-payments/#create)

```javascript
const billId = 'cc961e8d-d4d6-4f02-b737-2297e51fb48e';

const fields = {
    amount: 1.00,
    currency: 'RUB',
    comment: 'test',
    expirationDateTime: '2018-03-02T08:44:07',
    email: 'example@mail.org',
    account : 'client4563',
    successUrl: 'http://test.ru/'
};

qiwiApi.createBill( billId, fields ).then( data => {
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

Метод `getBillInfo` возвращает информацию о счете. В параметрах нужно указать идентификатор счета `billId` внутри вашей системы, в результате будет получен ответ со статусом счета. Подробнее в документации — [для физ.лиц](https://developer.qiwi.com/ru/p2p-payments/#invoice-status), [для юр.лиц](https://developer.qiwi.com/ru/bill-payments/#invoice-status).

```javascript
const billId = 'cc961e8d-d4d6-4f02-b737-2297e51fb48e';

qiwiApi.getBillInfo(billId).then( data => {
    //do with data
});
```

Ответ:

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
    "changedDateTime": "2018-07-12T10:31:06.846+03:00"
  },
  "comment": "test",
  "creationDateTime": "2018-07-12T10:31:06.846+03:00",
  "expirationDateTime": "2018-08-26T10:31:06.846+03:00",
  "payUrl": "https://oplata.qiwi.com/form/?invoice_uid=ee3ad91d-cfb8-4dbf-8449-b6859fdfec3c"
}
```

### Отмена неоплаченного счета

Метод `cancelBill` отменяет неоплаченный счет. В параметрах нужно указать идентификатор счета `billId` внутри вашей системы, в результате будет получен ответ с информацией о счете. Подробнее в документации — [для физ.лиц](https://developer.qiwi.com/ru/p2p-payments/#cancel), [для юр.лиц](https://developer.qiwi.com/ru/bill-payments/#cancel).

```javascript
const billId = 'cc961e8d-d4d6-4f02-b737-2297e51fb48e';

qiwiApi.cancelBill(billId).then( data => {
    //do with data
});
```

Ответ:

```json
{
  "siteId": "270305",
  "billId": "cc961e8d-d4d6-4f02-b737-2297e51fb48e",
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
  "payUrl": "https://oplata.qiwi.com/form/?invoice_uid=cc961e8d-d4d6-4f02-b737-2297e51fb48e"
}
```

### Возврат средств
#### ! Метод недоступен для физических лиц

Методом `refund` производит возврат средств. В параметрах нужно указать идентификатор счета `billId`, идентификатор возврата `refundId` внутри вашей системы, сумму возврата `amount` и валюту возврата `currency`. Подробнее в [документации](https://developer.qiwi.com/ru/bill-payments/#refund).

```javascript
const billId = 'cc961e8d-d4d6-4f02-b737-2297e51fb48e';
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
const billId = 'cc961e8d-d4d6-4f02-b737-2297e51fb48e';
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
            billId: 'cc961e8d-d4d6-4f02-b737-2297e51fb48e',
            amount: {value: 1, currency: 'RUB'},
            status: {value: 'PAID'}
        },
        version: '3'
    };
  
    const secretKey = 'eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTnONPININONPN090MTg5Z**********************';
  
    qiwiApi.checkNotificationSignature(
        validSignatureFromNotificationServer, notificationData, secretKey
    ); // true

    ```

## Требования

* **Node.js v7.0.0**, запуск c флагом `--harmony`
* **Node.js v7.6.0** или выше 

## Лицензия

[MIT](LICENSE)
