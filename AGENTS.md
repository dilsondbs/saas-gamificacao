# AGENTS.md — SAAS Gamificação (Laravel 9 + Inertia + React 18 + MySQL + Tailwind)
Porta 8080. Sempre traduzir termos técnicos entre parênteses: ex.: backend (servidor), frontend (interface), props (propriedades), redirect (redirecionamento), pagination (paginação).
Metodologia: diagnóstico ? correção ? validação. Uma correção por vez. Explique didático.

## Comandos padrão após alterações
npm run build
php artisan config:clear && php artisan cache:clear

## Objetivo atual (IMEDIATO)
Corrigir esources/js/Pages/Admin/Badges/Index.jsx para listar badges recém-criadas sem refresh manual.

### Checklist da correção
- Garantir BadgeController@index retornando Inertia::render('Admin/Badges/Index', ['badges' => Badge::latest()->paginate(10)->withQueryString()]).
- Após store, fazer edirect()->route('admin.badges.index')->with('success', '...') (reidrata as props).
- No Index.jsx, ler const { badges, flash } = usePage().props;
  - Renderizar tabela a partir de adges.data.
  - Botão “Atualizar”: outer.reload({ only: ['badges'], preserveScroll: true, preserveState: true }).
  - Delete: outer.delete(route('admin.badges.destroy', id), { onSuccess: () => router.reload({ only: ['badges'] }) }).
  - Paginação: percorrer adges.links e navegar com outer.get(link.url, {}, { preserveState: true, preserveScroll: true }).
- Tolerância a undefined (optional chaining).

### Teste esperado
1) Criar badge ? redireciona ao index ? item aparece na lista.  
2) Botão “Atualizar” refaz a listagem.  
3) Excluir ? recarrega somente badges.  
4) Paginação funciona mantendo estado/rolagem.

### Próximo (depois disso)
Replicar padrão para **Atividades** (Activities) — mesmo fluxo de index/store/Index.jsx.
