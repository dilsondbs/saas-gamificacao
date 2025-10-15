<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste - Seletor de Tenant</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .current-tenant {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #2196F3;
        }
        .tenant-selector {
            margin: 20px 0;
        }
        select, button {
            padding: 10px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #2196F3;
            color: white;
            cursor: pointer;
        }
        button:hover {
            background: #1976D2;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
        }
        .helper-functions {
            background: #f0f8f0;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #4CAF50;
        }
        .helper-functions code {
            background: #e8f5e8;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 Teste do Sistema Multi-Tenant</h1>

        <div class="current-tenant">
            <h3>Tenant Atual:</h3>
            @if($currentTenant)
                <strong>{{ $currentTenant->name }}</strong> (ID: {{ $currentTenant->id }})
                <br>
                <small>{{ $currentTenant->description }}</small>
                <br>
                <small>Plano: {{ $currentTenant->plan }} | Usuários: {{ $currentTenant->max_users }} | Cursos: {{ $currentTenant->max_courses }}</small>
            @else
                <span style="color: #666;">Nenhum tenant selecionado</span>
            @endif
        </div>

        <div class="tenant-selector">
            <h3>Trocar Tenant:</h3>
            <form method="GET" action="{{ url()->current() }}">
                <select name="switch_tenant" required>
                    <option value="">Selecione um tenant...</option>
                    @foreach($tenants as $tenant)
                        <option value="{{ $tenant->id }}" {{ $currentTenantId == $tenant->id ? 'selected' : '' }}>
                            {{ $tenant->name }} ({{ $tenant->plan }})
                        </option>
                    @endforeach
                </select>
                <button type="submit">Trocar</button>
            </form>

            <form method="GET" action="{{ url()->current() }}" style="margin-top: 10px;">
                <input type="hidden" name="switch_tenant" value="">
                <button type="submit" style="background: #f44336;">Limpar Tenant</button>
            </form>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <h4>Informações da Sessão:</h4>
                <p><strong>Domínio Central:</strong> {{ $isCentralDomain ? 'Sim' : 'Não' }}</p>
                <p><strong>Usuário Logado:</strong> {{ auth()->check() ? auth()->user()->name : 'Não logado' }}</p>
                <p><strong>Tenant na Sessão:</strong> {{ session('current_tenant_id', 'Nenhum') }}</p>
            </div>

            <div class="info-box">
                <h4>Debug Info:</h4>
                <p><strong>Host:</strong> {{ request()->getHost() }}</p>
                <p><strong>URL:</strong> {{ url()->current() }}</p>
                <p><strong>Tenants Total:</strong> {{ $tenants->count() }}</p>
            </div>
        </div>

        <div class="helper-functions">
            <h4>Funções Helper Disponíveis:</h4>
            <p><code>tenant()</code> - Retorna o tenant atual</p>
            <p><code>tenant_id()</code> - Retorna o ID do tenant atual</p>
            <p><code>has_tenant()</code> - Verifica se há tenant ativo</p>
            <p><code>is_central_domain()</code> - Verifica se é domínio central</p>
            <p><code>tenant_switch($id)</code> - Troca tenant programaticamente</p>
            <p><code>tenant_clear()</code> - Limpa tenant da sessão</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
            <a href="{{ route('dashboard') }}" style="color: #2196F3; text-decoration: none;">← Voltar ao Dashboard</a>
        </div>
    </div>
</body>
</html>