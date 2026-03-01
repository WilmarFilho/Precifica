// app/dashboard/precos/actions/scrapePrecos.ts

import { chromium } from 'playwright';

export async function buscarPrecosExternos() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const browser = await chromium.launch({ 
        // Em produção, SEMPRE true. Em local, pode ser false para você ver.
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', // Previne crash em containers com pouca memória RAM
            '--disable-gpu'
        ]
    });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        // 1. Ir para login
        await page.goto('https://loja.suzano.com.br/suzano/pt/login', { 
            waitUntil: 'domcontentloaded' 
        });

        // 2. Login (Use o ID que você encontrou!)
        await page.fill('input[name="j_username"]', process.env.FORNECEDOR_USER!);
        await page.fill('input[name="j_password"]', process.env.FORNECEDOR_PASS!);
        await page.click('#login-btn-check', { force: true });

        // 3. Esperar redirecionar
        await page.waitForURL(url => url.href.includes('/pt'), { timeout: 20000 });

        // 4. Ir para o produto
        await page.goto('https://loja.suzano.com.br/suzano/pt/Papel-Gr%C3%A1fico/Papel-Couch%C3%A9-Design/c/COUCHE_SZ_DESIGN');
        
        // 5. Pegar o preço
        const seletorPreco = '.priceSuzanoAjax';
        await page.waitForSelector(seletorPreco, { timeout: 30000 });
        const precoTexto = await page.locator(seletorPreco).first().innerText();
        
        // Limpar o texto (ex: "R$ 278,07" -> 278.07)
        const valorNumerico = parseFloat(precoTexto.replace(/[^\d,]/g, '').replace(',', '.'));

        return { success: true, data: { valor: valorNumerico, texto: precoTexto } };

    } catch (error: any) {
        console.error("Erro no scraping em produção:", error.message);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}