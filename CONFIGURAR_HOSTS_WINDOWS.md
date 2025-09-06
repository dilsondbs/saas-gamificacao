# 🌐 CONFIGURAR HOSTS WINDOWS - GUIA PASSO A PASSO

## 📍 **LOCALIZAÇÃO DO ARQUIVO HOSTS**
```
C:\Windows\System32\drivers\etc\hosts
```

## 🔧 **PASSO A PASSO COMPLETO**

### **1. Abrir Notepad como Administrador**
1. Pressione **Windows + R**
2. Digite: `notepad`
3. **Clique com botão direito** no Notepad
4. Selecione **"Executar como administrador"**
5. Confirme no UAC (Controle de Conta de Usuário)

### **2. Abrir o Arquivo Hosts**
1. No Notepad (como admin), pressione **Ctrl + O**
2. Navegue para: `C:\Windows\System32\drivers\etc\`
3. No campo "Nome do arquivo", digite: `hosts`
4. Altere o filtro para **"Todos os arquivos (*.*)"**
5. Clique em **"Abrir"**

### **3. Adicionar Entradas dos Tenants**
Adicione essas linhas **NO FINAL** do arquivo:

```hosts
# === SaaS Gamificação Multi-Tenant ===
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
127.0.0.1 vemcomigoj.localhost
127.0.0.1 empresa-teste.localhost
# === Fim SaaS Gamificação ===
```

### **4. Salvar e Fechar**
1. Pressione **Ctrl + S** para salvar
2. Feche o Notepad

### **5. Limpar Cache DNS**
Abra **Prompt de Comando como Administrador**:
```cmd
ipconfig /flushdns
```

## ✅ **VERIFICAR SE FUNCIONOU**

### **Teste 1: Ping**
```cmd
ping escola-teste.saas-gamificacao.local
```
**Resultado esperado:** `Resposta de 127.0.0.1`

### **Teste 2: Navegador**
Abra no navegador:
- `http://escola-teste.saas-gamificacao.local:8080`
- Deve carregar a página de login do tenant

## 🚀 **APÓS CONFIGURAR HOSTS**

### **URLs Funcionais:**
- **Central SaaS:** `http://saas-gamificacao.local:8080`
- **Tenant Escola:** `http://escola-teste.saas-gamificacao.local:8080`
- **Tenant VemComigoJá:** `http://vemcomigoj.localhost:8080`
- **Tenant Empresa:** `http://empresa-teste.localhost:8080`

### **Login de Teste (Escola):**
- **Admin:** `admin@saas-gamificacao.com` / `password`
- **Instructor:** `joao@saas-gamificacao.com` / `password`
- **Student:** `aluno1@saas-gamificacao.com` / `password`

## 🔄 **ALTERNATIVA: MÉTODO RÁPIDO**

### **PowerShell como Administrador:**
```powershell
# Adicionar todas as entradas de uma vez
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value @"

# === SaaS Gamificação Multi-Tenant ===
127.0.0.1 saas-gamificacao.local
127.0.0.1 escola-teste.saas-gamificacao.local
127.0.0.1 vemcomigoj.localhost
127.0.0.1 empresa-teste.localhost
# === Fim SaaS Gamificação ===
"@

# Limpar cache DNS
ipconfig /flushdns
```

## ⚠️ **TROUBLESHOOTING**

### **Problema: "Acesso negado"**
- Certifique-se que está executando como **Administrador**

### **Problema: "Arquivo não encontrado"**
- Verifique se o caminho está correto
- Certifique-se de mostrar **"Todos os arquivos"**

### **Problema: "Site não carrega"**
- Verifique se o Laravel está rodando na porta 8080
- Execute: `ipconfig /flushdns`
- Teste com `ping escola-teste.saas-gamificacao.local`

### **Problema: "Página em branco"**
- Verifique se o Laravel serve está rodando
- Cheque se não há erros no terminal do servidor

## 🎯 **PRÓXIMOS TESTES APÓS HOSTS**

1. **Acesse:** `http://escola-teste.saas-gamificacao.local:8080`
2. **Login como Admin:** `admin@saas-gamificacao.com` / `password`
3. **Deve redirecionar para:** `/admin/dashboard`
4. **Teste outros perfis:** Instructor e Student

## 📞 **PRECISA DE AJUDA?**

Se encontrar problemas, execute os comandos de verificação:
```cmd
# Verificar arquivo hosts
type C:\Windows\System32\drivers\etc\hosts

# Verificar DNS
nslookup escola-teste.saas-gamificacao.local

# Verificar conectividade
telnet 127.0.0.1 8080
```