# AGENTS.md � SAAS Gamifica��o (Laravel 9 + Inertia + React 18 + MySQL + Tailwind)
Porta 8080. Sempre traduzir termos t�cnicos entre par�nteses: ex.: backend (servidor), frontend (interface), props (propriedades), redirect (redirecionamento), pagination (pagina��o).
Metodologia: diagn�stico ? corre��o ? valida��o. Uma corre��o por vez. Explique did�tico.

## Comandos padr�o ap�s altera��es
npm run build
php artisan config:clear && php artisan cache:clear

## Objetivo atual (IMEDIATO)
Corrigir esources/js/Pages/Admin/Badges/Index.jsx para listar badges rec�m-criadas sem refresh manual.

### Checklist da corre��o
- Garantir BadgeController@index retornando Inertia::render('Admin/Badges/Index', ['badges' => Badge::latest()->paginate(10)->withQueryString()]).
- Ap�s store, fazer edirect()->route('admin.badges.index')->with('success', '...') (reidrata as props).
- No Index.jsx, ler const { badges, flash } = usePage().props;
  - Renderizar tabela a partir de adges.data.
  - Bot�o �Atualizar�: outer.reload({ only: ['badges'], preserveScroll: true, preserveState: true }).
  - Delete: outer.delete(route('admin.badges.destroy', id), { onSuccess: () => router.reload({ only: ['badges'] }) }).
  - Pagina��o: percorrer adges.links e navegar com outer.get(link.url, {}, { preserveState: true, preserveScroll: true }).
- Toler�ncia a undefined (optional chaining).

### Teste esperado
1) Criar badge ? redireciona ao index ? item aparece na lista.  
2) Bot�o �Atualizar� refaz a listagem.  
3) Excluir ? recarrega somente badges.  
4) Pagina��o funciona mantendo estado/rolagem.

### Pr�ximo (depois disso)
Replicar padr�o para **Atividades** (Activities) � mesmo fluxo de index/store/Index.jsx.
