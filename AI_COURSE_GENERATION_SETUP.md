# 🤖 Sistema de Geração Automática de Cursos com IA

## Visão Geral

Este sistema permite que instrutores criem cursos completos automaticamente usando Inteligência Artificial (Google Gemini). O professor pode inserir qualquer conteúdo (texto ou arquivos PDF/TXT) e a IA gerará automaticamente:

- ✅ Estrutura completa do curso com módulos organizados
- ✅ Atividades variadas (quizzes, leituras, exercícios práticos)
- ✅ Sistema de pontuação e badges
- ✅ Conteúdo didático baseado no material fornecido

## 📋 Funcionalidades Implementadas

### 1. **Backend - Integração com Gemini API**
- `AICourseGeneratorService` - Serviço principal de geração com IA
- Integração via HTTP REST com Google Gemini
- Prompt engineering otimizado para formato JSON educacional
- Validação de conteúdo (limite 50KB)
- Parsing inteligente de respostas da IA
- Tratamento de erros robusto

### 2. **Backend - Controller e Rotas**
- `CourseController@createWithAI` - Página de criação
- `CourseController@generateFromContent` - Geração definitiva
- `CourseController@previewGenerated` - Preview antes de criar
- Validação de arquivos TXT/PDF (máximo 2MB)
- Extração automática de conteúdo de arquivos

### 3. **Frontend - Interface Completa**
- **Página `CreateCourseWithAI.jsx`** com abas organizadas:
  - 📝 **Inserir Conteúdo**: Digite/cole texto ou faça upload
  - 👁️ **Preview**: Visualize como ficará o curso
  - ✅ **Resultado**: Confirmação e redirecionamento

### 4. **Funcionalidades Avançadas**
- Upload de arquivos PDF/TXT com extração automática
- Loading states durante processamento da IA
- Preview detalhado antes da criação final
- Validação em tempo real de tamanho
- Redirecionamento automático para edição

## 🛠️ Configuração e Instalação

### Passo 1: Configurar API Key do Gemini

1. **Obtenha sua chave da API do Google Gemini**:
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma nova API key
   - Copie a chave gerada

2. **Configure no arquivo `.env`**:
   ```env
   GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

### Passo 2: Verificar Dependências

O sistema já está configurado com todas as dependências necessárias:
- ✅ Guzzle HTTP Client (já instalado)
- ✅ PDF Parser (já instalado)
- ✅ Inertia.js (já instalado)
- ✅ React components (implementados)

### Passo 3: Executar Migrações

```bash
php artisan migrate
```

### Passo 4: Testar a Implementação

Execute nosso comando de teste:
```bash
php artisan ai:test-course-generation
```

Este comando verificará:
- ✅ Configuração da API key
- ✅ Validação de conteúdo
- ✅ Geração de prompts
- ✅ Chamadas à API (se configurada)
- ✅ Parsing de respostas
- ✅ Dependências e modelos

## 🚀 Como Usar

### Para Instrutores:

1. **Acesse o Sistema**:
   - Faça login com uma conta de instrutor
   - Vá para `/instructor/dashboard`
   - Clique em "🤖 Criar com IA" ou "Professor Assistente IA"

2. **Insira o Conteúdo**:
   - **Opção 1**: Digite ou cole texto diretamente
   - **Opção 2**: Faça upload de arquivo PDF ou TXT

3. **Gere Preview**:
   - Clique em "Ver Preview" para visualizar antes de criar
   - Veja a estrutura completa do curso gerado

4. **Confirme a Criação**:
   - Clique em "Gerar Curso com IA"
   - Aguarde o processamento (pode demorar 10-30 segundos)
   - Será redirecionado para editar o curso criado

## 📊 Estrutura Gerada pela IA

### Curso Completo:
```json
{
  "title": "Título otimizado do curso",
  "description": "Descrição pedagógica",
  "points_per_completion": 100,
  "modules": [
    {
      "title": "Nome do módulo",
      "activities": [
        {
          "type": "quiz",
          "title": "Quiz sobre o tópico",
          "questions": [...]
        },
        {
          "type": "reading", 
          "title": "Material de leitura",
          "content": "Conteúdo didático"
        },
        {
          "type": "assignment",
          "title": "Exercício prático",
          "content": "Instruções detalhadas"
        }
      ]
    }
  ]
}
```

### Badges Automáticos:
- 🌟 **Iniciante**: Primeira atividade concluída
- 🚀 **Progredindo**: 50% do curso concluído  
- 🏆 **Mestre**: Curso 100% concluído

## 🔧 Arquivos Implementados

### Backend:
- `app/Services/AICourseGeneratorService.php` - Serviço principal
- `app/Http/Controllers/Instructor/CourseController.php` - Controller atualizado
- `app/Services/MaterialContentExtractor.php` - Extração de arquivos
- `app/Console/Commands/TestAICourseGeneration.php` - Comando de teste
- `config/services.php` - Configuração da API
- `.env.example` - Template de configuração

### Frontend:
- `resources/js/Pages/Instructor/CreateCourseWithAI.jsx` - Página principal
- `resources/js/Pages/Instructor/Dashboard.jsx` - Links adicionados

### Rotas:
```php
// routes/web.php
Route::get('courses/ai/create', [CourseController::class, 'createWithAI']);
Route::post('courses/ai/generate', [CourseController::class, 'generateFromContent']);
Route::post('courses/ai/preview', [CourseController::class, 'previewGenerated']);
```

## 💡 Dicas para Melhores Resultados

### Conteúdo Ideal:
- ✅ Use textos bem estruturados com títulos e subtítulos
- ✅ Inclua informações detalhadas sobre o assunto  
- ✅ Textos maiores geram cursos mais completos
- ✅ Organize o conteúdo de forma lógica e sequencial

### Formatos Suportados:
- 📝 **Texto**: Cole diretamente (máximo 50KB)
- 📄 **PDF**: Upload de arquivo (máximo 2MB)
- 📄 **TXT**: Upload de arquivo (máximo 2MB)

## 🔍 Troubleshooting

### Problema: "Gemini API key not configured"
**Solução**: Configure `GEMINI_API_KEY` no arquivo `.env`

### Problema: "Content exceeds 50KB limit"
**Solução**: Reduza o tamanho do conteúdo ou divida em múltiplos cursos

### Problema: "Failed to generate course content"
**Soluções**:
1. Verifique se a API key está correta
2. Verifique se há créditos disponíveis na conta Google
3. Tente com conteúdo menor/mais simples
4. Verifique os logs em `storage/logs/laravel.log`

### Problema: "Invalid response from Gemini API"
**Solução**: O conteúdo pode ser muito complexo. Simplifique ou organize melhor.

## 📈 Próximos Passos (Futuras Melhorias)

- [ ] **Cache de respostas** para evitar reprocessamento
- [ ] **Templates de prompt** para diferentes tipos de curso
- [ ] **Suporte a mais formatos** (DOCX, PPTX)
- [ ] **Geração de imagens** para ilustrações
- [ ] **Múltiplas linguagens** de saída
- [ ] **Integração com outros modelos** de IA
- [ ] **Edição assistida** por IA de cursos existentes
- [ ] **Analytics** de performance da IA

## 🎯 Status do Projeto

- ✅ **Backend completo** - Serviços, controllers, validações
- ✅ **Frontend completo** - Interface responsiva e intuitiva  
- ✅ **Integração API** - Google Gemini configurada
- ✅ **Testes** - Comando de validação criado
- ✅ **Documentação** - Guia completo de uso

**🎉 O sistema está pronto para uso em produção!**

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Execute `php artisan ai:test-course-generation` para diagnóstico
2. Verifique os logs em `storage/logs/laravel.log`
3. Consulte esta documentação
4. Teste com conteúdo simples primeiro

**Data de Implementação**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementação Completa