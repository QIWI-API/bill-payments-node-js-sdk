const crypto = require("crypto");
const QiwiBillPaymentsAPI = require("../lib/QiwiBillPaymentsAPI.js");
const chai = require("chai");
const puppeteer = require("puppeteer");
const assert = chai.assert;

const SECRET_KEY =
    "eyJ2ZXJzaW9uIjoicmVzdF92MyIsImRhdGEiOnsibWVyY2hhbnRfaWQiOjUyNjgxMiwiYXBpX3VzZXJfaWQiOjcxNjI2MTk3LCJzZWNyZXQiOiJmZjBiZmJiM2UxYzc0MjY3YjIyZDIzOGYzMDBkNDhlYjhiNTk5NmI5ZWQ2NmQwNzdkMTg5ZjMwYzZhY2RjMzg1In19";

const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

const bill_id = crypto.randomBytes(5).toString("hex");

const public_key =
    "2tbp1WQvsgQeziGY9vTLe9vDZNg7tmCymb4Lh6STQokqKrpCC6qrUUKEDZAJ7mvFnzr1yTebUiQaBLDnebLMMxL8nc6FF5zfmGQnypdXCbQJqHEJW5RJmKfj8nvgc";

const amount = 200;

describe("qiwi api v3", () => {
    try {
        let link = "";

        it("creates payment form", () => {
            const testLink = `https://oplata.qiwi.com/create?public_key=${public_key}&amount=${amount}&bill_id=${bill_id}`;

            link = qiwiApi.createPaymentForm({
                public_key,
                amount,
                bill_id
            });

            assert.equal(link, testLink);
        });

        describe("requests: ", function() {
            this.timeout(3000);

            before(async () => {
                const browser = await puppeteer.launch({
                    args: ["--no-sandbox", "--disable-setuid-sandbox"]
                });
                const page = await browser.newPage();
                await page.goto(link, { waitUntil: "networkidle2" });
                await browser.close();
            });

            it("returns valid bill status", async () => {
                try {
                    const data = await qiwiApi.getStatus(bill_id);

                    assert.equal(data.result_code, "SUCCESS");
                } catch (e) {
                    throw e;
                }
            });

            it("cancel unpaid bill", async () => {
                try {
                    const data = await qiwiApi.cancel(bill_id);

                    assert.equal(data.result_code, "SUCCESS");
                } catch (e) {
                    throw e;
                }
            });
        });
    } catch (e) {
        console.error(e);
    }
});
