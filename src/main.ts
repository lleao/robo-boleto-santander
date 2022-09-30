import puppeteer from "puppeteer";
import dotenv from "dotenv";

import { RequestInfo, RequestInit } from 'node-fetch';

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, init));


dotenv.config();

(async () => {
    const { CPF, BIRTH_DATE, MOTHERS_FIRST_NAME, HEADLESS_MODE } = process.env;
    const headless = HEADLESS_MODE === "true";
  
    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();
    await page.goto("https://www.santander.com.br/renegociacao/login?utm_source=boletos&utm_medium=atendimento&utm_campaign=segunda_via_boleto");
    await page.waitForNetworkIdle();
    if ( page.url().search("renegociacao/login") < 0) {
      console.error("Redirecionamento detectado. Cancelando...");
      return;
    }
    // await page.waitForSelector("input[formcontrolname=\"documentIDControl\"]");
    await findAndSetValue("input[formcontrolname=\"documentIDControl\"]", CPF || '');

    await page.click(".btn-continuar");
    // await page.waitForNetworkIdle();
    await page.waitForNavigation();

    await findAndSetValue("input[formcontrolname=\"dataNascimentoControl\"]", BIRTH_DATE || '');
    await findAndSetValue("input[formcontrolname=\"nameControl\"]", MOTHERS_FIRST_NAME || '');
    
    await page.waitForSelector("#ctaFullButton");
    await page.click("#ctaFullButton");

    if ( page.url().indexOf("pagina-de-erro") > -1 ) {
      console.error("Falha ao carregar");
      await browser.close();
      throw "Falha ao carregar";
    }
    await page.waitForSelector("#ctaButton", {timeout: 300000});
    await page.click("#ctaButton");
    
    async function findAndSetValue(inputSelector: string, inputValue: string) {
      await page.waitForSelector(inputSelector);
      await page.type(inputSelector, inputValue);
    }
    await page.waitForTimeout(10000);
    await browser.close();
  })();