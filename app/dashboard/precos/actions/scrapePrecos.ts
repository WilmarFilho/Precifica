// app/dashboard/precos/actions/scrapePrecos.ts
"use server";

import { chromium } from 'playwright';

export async function buscarPrecosExternos() {
    // Adicionamos args para garantir que o Chrome apareça no Windows
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized'] // Abre em tela cheia para facilitar sua visão
    });

    const context = await browser.newContext({
        viewport: null // Necessário para o start-maximized funcionar
    });
    const page = await context.newPage();

    try {
        await page.goto('https://loja.suzano.com.br/suzano/pt/login');

        await page.fill('input[name="j_username"]', process.env.FORNECEDOR_USER!);
        await page.fill('input[name="j_password"]', process.env.FORNECEDOR_PASS!);

        console.log("Clicando no botão de entrar...");

        // 2. Usa o ID exato que você encontrou
        // 'force: true' ignora se houver algum overlay (banner de cookies) por cima
        await page.click('#login-btn-check', { force: true });
        
        // 3. Aguarda a mudança de página
        await page.waitForURL(url => url.href.includes('/pt'), { 
            timeout: 15000, 
            waitUntil: 'domcontentloaded' 
        });

        console.log("Login realizado com sucesso, navegando para produtos...");

        // 4. Ir para a página de produtos
        await page.goto('https://loja.suzano.com.br/suzano/pt/Papel-Gr%C3%A1fico/Papel-Couch%C3%A9-Design/c/COUCHE_SZ_DESIGN', {
            waitUntil: 'domcontentloaded'
        });

        // 5. Extrair os dados corretamente
        // Esperamos o seletor aparecer para garantir que o Ajax terminou
        const seletorPreco = '.priceSuzanoAjax';
        await page.waitForSelector(seletorPreco, { timeout: 10000 });

        // Extraímos o texto usando o Playwright
        const precoTexto = await page.locator(seletorPreco).first().innerText();

        // Limpeza do valor para retornar um número
        const precoLimpo = precoTexto
            .replace('R$', '')
            .replace(/\s/g, '') // remove espaços e &nbsp;
            .replace('.', '')   // remove ponto de milhar
            .replace(',', '.'); // troca vírgula decimal por ponto

        const precoNumero = parseFloat(precoLimpo);

        console.log("Preço extraído:", precoTexto);
        console.log("Preço numérico:", precoNumero);

        await browser.close();

        return {
            success: true,
            data: {
                texto: precoTexto,
                valor: precoNumero
            }
        };

    } catch (error) {
        await browser.close();
        console.error("Erro no scraping:", error);
        return { success: false, error: "Falha ao buscar preços externos." };
    }
}