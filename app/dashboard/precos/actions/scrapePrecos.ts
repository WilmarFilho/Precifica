"use server";
// app/dashboard/precos/actions/scrapePrecos.ts

import { chromium } from 'playwright';

export async function buscarPrecosExternos() {
    // Definindo um User-Agent de um Chrome real no Windows
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const browser = await chromium.launch({ 
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    try {
        // Criamos o contexto com um tamanho de tela padrão e User-Agent real
        const context = await browser.newContext({
            userAgent,
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();

        console.log("Acessando página de login da Suzano...");
        
        // Aumentamos o timeout e esperamos a rede acalmar
        await page.goto('https://loja.suzano.com.br/suzano/pt/login', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });

        // Verificação extra: Tirar um print se houver erro (ajuda muito a debugar)
        // await page.screenshot({ path: 'debug_login.png' });

        console.log("Preenchendo credenciais...");
        
        // Usando seletores mais resilientes (por ID costuma ser melhor que Name)
        const userField = 'input#j_username';
        const passField = 'input#j_password';
        
        await page.waitForSelector(userField, { timeout: 15000 });
        await page.fill(userField, process.env.FORNECEDOR_USER || '');
        await page.fill(passField, process.env.FORNECEDOR_PASS || '');
        
        console.log("Clicando no botão de login...");
        await page.click('#login-btn-check');

        // Espera o carregamento pós-login
        await page.waitForLoadState('networkidle');

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