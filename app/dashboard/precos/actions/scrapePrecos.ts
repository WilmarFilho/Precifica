"use server";
// app/dashboard/precos/actions/scrapePrecos.ts

import { chromium } from 'playwright';

export async function buscarPrecosExternos() {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    const browser = await chromium.launch({ 
        headless: false, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled' // Ajuda a evitar detecção de bot
        ]
    });

    try {
        const context = await browser.newContext({
            userAgent,
            viewport: { width: 1280, height: 720 },
            locale: 'pt-BR'
        });
        
        const page = await context.newPage();

        console.log("🚀 Acessando Suzano...");
        
        // Timeout maior para o carregamento inicial da página
        await page.goto('https://loja.suzano.com.br/suzano/pt/login', { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });

        console.log("✍️ Preenchendo credenciais...");
        
        // Seletores baseados no HTML fornecido
        const userSelector = 'input[name="j_username"]';
        const passSelector = 'input[name="j_password"]';
        const buttonSelector = 'button#login-btn-check';

        // Espera o campo estar visível e pronto para receber dados
        await page.waitForSelector(userSelector, { state: 'visible', timeout: 30000 });
        
        // Pequena pausa para garantir que scripts de validação carregaram
        await page.waitForTimeout(1000);

        // Foca e preenche (mais seguro que apenas .fill em alguns sites)
        await page.focus(userSelector);
        await page.fill(userSelector, process.env.FORNECEDOR_USER || '');
        
        await page.focus(passSelector);
        await page.fill(passSelector, process.env.FORNECEDOR_PASS || '');
        
        console.log("🖱️ Clicando no botão de login...");
        
        // Clica e aguarda a navegação de uma vez só
        await Promise.all([
            page.click(buttonSelector),
            page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => console.log("Aviso: Navegação demorada, continuando..."))
        ]);

        console.log("📦 Indo para a página do produto...");
        await page.goto('https://loja.suzano.com.br/suzano/pt/Papel-Gr%C3%A1fico/Papel-Couch%C3%A9-Design/c/COUCHE_SZ_DESIGN', {
            waitUntil: 'networkidle',
            timeout: 80000
        });
        
        console.log("💰 Extraindo preço...");
        const seletorPreco = '.priceSuzanoAjax';
        
        // Espera o seletor de preço aparecer (ele parece ser carregado via Ajax)
        await page.waitForSelector(seletorPreco, { state: 'attached', timeout: 30000 });
        
        const precoTexto = await page.locator(seletorPreco).first().innerText();
        
        // Limpeza robusta do valor
        const valorNumerico = parseFloat(
            precoTexto
                .replace('R$', '')
                .replace(/\./g, '') // Remove pontos de milhar
                .replace(',', '.')  // Troca vírgula decimal por ponto
                .trim()
        );

        console.log(`✅ Sucesso: ${precoTexto} -> ${valorNumerico}`);

        return { 
            success: true, 
            data: { 
                valor: valorNumerico, 
                texto: precoTexto.trim() 
            } 
        };

    } catch (error: any) {
        console.error("🚨 Erro no scraping:", error.message);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}


