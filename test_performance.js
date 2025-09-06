// Script de Teste de Performance Automatizado
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PerformanceTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {},
            summary: {},
            issues: []
        };
        this.testUrls = [
            'http://localhost:8000',
            'http://localhost:8000/login',
            'http://localhost:8000/register',
            'http://localhost:8000/dashboard'
        ];
    }

    async runAllTests() {
        console.log('🚀 Iniciando testes de performance...\n');
        
        try {
            await this.testServerResponse();
            await this.testAssetLoading();
            await this.testDatabaseQueries();
            await this.testMemoryUsage();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Erro durante os testes:', error.message);
        }
    }

    async testServerResponse() {
        console.log('🌐 Testando tempo de resposta do servidor...');
        
        for (const url of this.testUrls) {
            try {
                const start = Date.now();
                const { stdout } = await execAsync(`curl -s -w "%{time_total}" -o /dev/null "${url}"`);
                const responseTime = parseFloat(stdout) * 1000; // Converter para ms
                
                this.results.tests[url] = {
                    responseTime: responseTime,
                    status: responseTime < 1000 ? 'good' : responseTime < 3000 ? 'warning' : 'poor'
                };
                
                console.log(`  ${url}: ${responseTime.toFixed(2)}ms ${this.getStatusIcon(responseTime)}`);
                
                if (responseTime > 3000) {
                    this.results.issues.push(`Tempo de resposta lento para ${url}: ${responseTime.toFixed(2)}ms`);
                }
            } catch (error) {
                console.log(`  ${url}: ❌ Erro - ${error.message}`);
                this.results.tests[url] = { error: error.message };
                this.results.issues.push(`Falha ao acessar ${url}: ${error.message}`);
            }
        }
    }

    async testAssetLoading() {
        console.log('\n📦 Verificando assets compilados...');
        
        const buildPath = path.join(__dirname, 'public', 'build');
        const manifestPath = path.join(buildPath, 'manifest.json');
        
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const assets = Object.keys(manifest);
            
            console.log(`  ✅ Manifest encontrado com ${assets.length} assets`);
            
            // Verificar tamanho dos assets principais
            const assetsPath = path.join(buildPath, 'assets');
            if (fs.existsSync(assetsPath)) {
                const files = fs.readdirSync(assetsPath);
                let totalSize = 0;
                
                files.forEach(file => {
                    const filePath = path.join(assetsPath, file);
                    const stats = fs.statSync(filePath);
                    const sizeKB = (stats.size / 1024).toFixed(2);
                    totalSize += stats.size;
                    
                    if (stats.size > 500 * 1024) { // > 500KB
                        console.log(`  ⚠️  Asset grande: ${file} (${sizeKB}KB)`);
                        this.results.issues.push(`Asset grande: ${file} (${sizeKB}KB)`);
                    }
                });
                
                const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
                console.log(`  📊 Tamanho total dos assets: ${totalSizeMB}MB`);
                
                this.results.tests.assets = {
                    totalFiles: files.length,
                    totalSizeMB: parseFloat(totalSizeMB),
                    status: totalSize < 5 * 1024 * 1024 ? 'good' : 'warning' // < 5MB
                };
            }
        } else {
            console.log('  ❌ Manifest não encontrado. Execute: npm run build');
            this.results.issues.push('Assets não compilados - execute npm run build');
        }
    }

    async testDatabaseQueries() {
        console.log('\n🗄️  Testando consultas do banco de dados...');
        
        try {
            // Testar algumas consultas básicas através do Artisan
            const queries = [
                'php artisan tinker --execute="echo \\App\\Models\\User::count();"',
                'php artisan tinker --execute="echo \\App\\Models\\Tenant::count();"'
            ];
            
            for (const query of queries) {
                try {
                    const start = Date.now();
                    const { stdout } = await execAsync(query, { cwd: __dirname });
                    const queryTime = Date.now() - start;
                    
                    console.log(`  ✅ Query executada em ${queryTime}ms`);
                    
                    if (queryTime > 1000) {
                        this.results.issues.push(`Query lenta detectada: ${queryTime}ms`);
                    }
                } catch (error) {
                    console.log(`  ❌ Erro na query: ${error.message}`);
                    this.results.issues.push(`Erro de banco de dados: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`  ❌ Erro ao testar banco: ${error.message}`);
        }
    }

    async testMemoryUsage() {
        console.log('\n💾 Analisando uso de memória...');
        
        try {
            // Verificar memória do processo PHP
            const { stdout } = await execAsync('php -r "echo round(memory_get_peak_usage()/1024/1024, 2);"');
            const memoryMB = parseFloat(stdout);
            
            console.log(`  📊 Pico de memória PHP: ${memoryMB}MB`);
            
            this.results.tests.memory = {
                peakUsageMB: memoryMB,
                status: memoryMB < 128 ? 'good' : memoryMB < 256 ? 'warning' : 'poor'
            };
            
            if (memoryMB > 256) {
                this.results.issues.push(`Alto uso de memória: ${memoryMB}MB`);
            }
        } catch (error) {
            console.log(`  ❌ Erro ao verificar memória: ${error.message}`);
        }
    }

    getStatusIcon(responseTime) {
        if (responseTime < 1000) return '🟢';
        if (responseTime < 3000) return '🟡';
        return '🔴';
    }

    async generateReport() {
        console.log('\n📋 Gerando relatório...');
        
        // Calcular estatísticas
        const responseTimes = Object.values(this.results.tests)
            .filter(test => test.responseTime)
            .map(test => test.responseTime);
            
        if (responseTimes.length > 0) {
            this.results.summary = {
                averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
                maxResponseTime: Math.max(...responseTimes),
                minResponseTime: Math.min(...responseTimes),
                totalIssues: this.results.issues.length
            };
        }
        
        // Salvar relatório
        const reportPath = path.join(__dirname, 'performance_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log('\n📊 RESUMO DOS TESTES:');
        console.log('=' .repeat(50));
        
        if (this.results.summary.averageResponseTime) {
            console.log(`⏱️  Tempo médio de resposta: ${this.results.summary.averageResponseTime.toFixed(2)}ms`);
            console.log(`🚀 Resposta mais rápida: ${this.results.summary.minResponseTime.toFixed(2)}ms`);
            console.log(`🐌 Resposta mais lenta: ${this.results.summary.maxResponseTime.toFixed(2)}ms`);
        }
        
        if (this.results.tests.assets) {
            console.log(`📦 Total de assets: ${this.results.tests.assets.totalFiles} arquivos`);
            console.log(`💾 Tamanho dos assets: ${this.results.tests.assets.totalSizeMB}MB`);
        }
        
        if (this.results.tests.memory) {
            console.log(`🧠 Uso de memória: ${this.results.tests.memory.peakUsageMB}MB`);
        }
        
        console.log(`⚠️  Total de problemas: ${this.results.issues.length}`);
        
        if (this.results.issues.length > 0) {
            console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
            this.results.issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        console.log(`\n📄 Relatório salvo em: ${reportPath}`);
        
        // Gerar relatório HTML
        await this.generateHTMLReport();
    }

    async generateHTMLReport() {
        const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Performance - SaaS Gamificação</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center; min-width: 150px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-poor { color: #dc3545; }
        .issue { background: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .success { background: #d4edda; color: #155724; padding: 10px; margin: 5px 0; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Relatório de Performance</h1>
        <p><strong>Data/Hora:</strong> ${new Date(this.results.timestamp).toLocaleString()}</p>
        
        <h2>📈 Métricas Gerais</h2>
        <div>
            ${this.results.summary.averageResponseTime ? `
            <div class="metric">
                <div class="metric-value status-${this.results.summary.averageResponseTime < 1000 ? 'good' : 'warning'}">
                    ${this.results.summary.averageResponseTime.toFixed(0)}ms
                </div>
                <div>Tempo Médio</div>
            </div>
            ` : ''}
            
            ${this.results.tests.assets ? `
            <div class="metric">
                <div class="metric-value status-${this.results.tests.assets.status === 'good' ? 'good' : 'warning'}">
                    ${this.results.tests.assets.totalSizeMB}MB
                </div>
                <div>Tamanho Assets</div>
            </div>
            ` : ''}
            
            ${this.results.tests.memory ? `
            <div class="metric">
                <div class="metric-value status-${this.results.tests.memory.status === 'good' ? 'good' : this.results.tests.memory.status === 'warning' ? 'warning' : 'poor'}">
                    ${this.results.tests.memory.peakUsageMB}MB
                </div>
                <div>Uso Memória</div>
            </div>
            ` : ''}
            
            <div class="metric">
                <div class="metric-value status-${this.results.issues.length === 0 ? 'good' : 'warning'}">
                    ${this.results.issues.length}
                </div>
                <div>Problemas</div>
            </div>
        </div>

        <h2>🌐 Teste de URLs</h2>
        <table>
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Tempo de Resposta</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(this.results.tests)
                    .filter(([url, data]) => url.startsWith('http'))
                    .map(([url, data]) => `
                        <tr>
                            <td>${url}</td>
                            <td>${data.responseTime ? data.responseTime.toFixed(2) + 'ms' : 'Erro'}</td>
                            <td class="status-${data.status || 'poor'}">${data.status || data.error || 'Erro'}</td>
                        </tr>
                    `).join('')}
            </tbody>
        </table>

        ${this.results.issues.length > 0 ? `
        <h2>🚨 Problemas Encontrados</h2>
        ${this.results.issues.map(issue => `<div class="issue">❌ ${issue}</div>`).join('')}
        ` : `
        <div class="success">✅ Nenhum problema crítico encontrado!</div>
        `}

        <h2>💡 Recomendações</h2>
        <ul>
            <li>Mantenha os assets otimizados com <code>npm run build</code></li>
            <li>Configure cache Redis para melhor performance</li>
            <li>Use CDN para assets estáticos em produção</li>
            <li>Monitore consultas lentas no banco de dados</li>
            <li>Configure compressão gzip/brotli no servidor</li>
        </ul>
    </div>
</body>
</html>`;

        const htmlPath = path.join(__dirname, 'performance_report.html');
        fs.writeFileSync(htmlPath, htmlReport);
        console.log(`📄 Relatório HTML salvo em: ${htmlPath}`);
    }
}

// Executar testes se chamado diretamente
if (require.main === module) {
    const tester = new PerformanceTester();
    tester.runAllTests().then(() => {
        console.log('\n✅ Testes de performance concluídos!');
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Erro nos testes:', error);
        process.exit(1);
    });
}

module.exports = PerformanceTester;