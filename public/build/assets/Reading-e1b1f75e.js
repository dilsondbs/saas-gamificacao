import{r as l,G as j,j as o,a as t,S as R,F as N,A as _}from"./app-2033c2ba.js";import{A as k}from"./AuthenticatedLayout-e732cd47.js";import"./ApplicationLogo-fbe97745.js";import"./transition-997472bc.js";const A=(i,e=400)=>{if(!i)return"";const p=i.replace(/<[^>]*>/g,""),d=document.createElement("div");d.innerHTML=p;const r=d.textContent||d.innerText||"";return r.length>e?r.substring(0,e).trim()+"...":r};function L({auth:i,activity:e,course:p,userActivity:d,hasCompleted:r}){const w=i.user,[a,m]=l.useState(!1),[c,u]=l.useState(0),[y]=l.useState(new Date),{post:q,processing:g}=j();l.useEffect(()=>{if(a&&!r){const n=setInterval(()=>{u(s=>s>=100?(clearInterval(n),100):s+1)},200);return()=>clearInterval(n)}},[a,r]);const P=()=>{m(!0)},M=()=>{q(route("student.quiz.submit",e.id),{answers:{},reading_completed:!0,time_spent:Math.floor((new Date-y)/1e3)})},h=(()=>{var x,b,f,v;if((x=e.content)!=null&&x.content&&typeof e.content.content=="string")return console.log("🎨 Usando HTML rico da atividade"),{title:e.title,content:e.content.content,wordCount:e.content.content.length,estimatedTime:Math.ceil(e.content.content.length/1e3)||5};const n=((b=e.content)==null?void 0:b.module)||"Módulo Geral",s=(f=e.content)==null?void 0:f.real_content,$=(v=e.content)==null?void 0:v.module;return s&&s.content?{title:s.title||e.title,content:`
                    <h2>📖 ${s.title||e.title}</h2>
                    <p><strong>Módulo:</strong> ${n}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Conteúdo do Material</h3>
                        <div class="real-content">
                            ${s.content.replace(/\n/g,"</p><p>")}
                        </div>
                    </div>

                    <div class="content-section">
                        <h3>💡 Para Refletir</h3>
                        <p>Após a leitura deste conteúdo, reflita sobre:</p>
                        <ul>
                            <li>Quais são os pontos principais apresentados?</li>
                            <li>Como esse conhecimento se aplica na prática?</li>
                            <li>Que questões surgem a partir desta leitura?</li>
                        </ul>
                    </div>

                    <div class="content-section">
                        <h3>📊 Informações</h3>
                        <ul>
                            <li><strong>Palavras:</strong> ${s.word_count} palavras</li>
                            <li><strong>Tempo estimado:</strong> ${e.duration_minutes} minutos</li>
                            <li><strong>Fonte:</strong> Material do curso</li>
                        </ul>
                    </div>
                `}:$?{title:e.title,content:`
                    <h2>📖 ${e.title}</h2>
                    <p><strong>Módulo:</strong> ${n}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Objetivo desta Lição</h3>
                        <p>${e.description}</p>
                    </div>

                    <div class="content-section">
                        <h3>📚 Conteúdo Principal</h3>
                        <p>Nesta seção, você aprenderá sobre os conceitos fundamentais relacionados a <strong>${n}</strong>. 
                        Este material introdutório foi cuidadosamente elaborado para fornecer uma base sólida de conhecimento.</p>
                        
                        <h4>🔍 Pontos Importantes:</h4>
                        <ul>
                            <li>Compreensão dos conceitos básicos de ${n}</li>
                            <li>Aplicação prática dos conhecimentos adquiridos</li>
                            <li>Preparação para atividades e avaliações subsequentes</li>
                            <li>Desenvolvimento de pensamento crítico na área</li>
                        </ul>

                        <h4>💡 Para Refletir:</h4>
                        <p>Como esses conceitos se aplicam em situações do mundo real? 
                        Pense em exemplos práticos onde você poderia utilizar esse conhecimento.</p>

                        <h4>🔗 Conexões:</h4>
                        <p>Este conteúdo se conecta diretamente com as próximas atividades do curso, 
                        especialmente os quizzes e exercícios práticos que validarão seu aprendizado.</p>
                    </div>

                    <div class="content-section">
                        <h3>✅ Próximos Passos</h3>
                        <p>Após completar esta leitura, você estará preparado para:</p>
                        <ul>
                            <li>Participar de discussões sobre o tema</li>
                            <li>Resolver questões relacionadas ao ${n}</li>
                            <li>Aplicar os conceitos em exercícios práticos</li>
                        </ul>
                    </div>
                `}:{title:e.title,content:`
                    <h2>📖 ${e.title}</h2>
                    
                    <div class="content-section">
                        <h3>🎯 Descrição</h3>
                        <p>${e.description||"Material de estudo importante para seu aprendizado."}</p>
                    </div>

                    <div class="content-section">
                        <h3>📚 Conteúdo de Estudo</h3>
                        <p>Este é um material fundamental para o curso. Dedique tempo suficiente para absorver 
                        completamente as informações apresentadas.</p>
                        
                        <p><strong>Dica de Estudo:</strong> Faça anotações dos pontos mais importantes e 
                        questione-se sobre como aplicar esse conhecimento.</p>
                    </div>

                    <div class="content-section">
                        <h3>⏰ Tempo Estimado</h3>
                        <p>Tempo sugerido para esta atividade: <strong>${e.duration_minutes} minutos</strong></p>
                    </div>
                `}})();return l.useEffect(()=>{r&&!a&&(m(!0),u(100))},[r]),o(k,{user:w,header:o("div",{className:"flex items-center justify-between",children:[o("h2",{className:"font-semibold text-xl text-gray-800 leading-tight",children:[r?"📖 Revisão: ":"📖 ",e.title]}),o("div",{className:"flex items-center space-x-4 text-sm",children:[r&&t("div",{className:"bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium",children:"✅ Concluída"}),o("div",{className:"bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium",children:["🏆 ",e.points_value," pts"]}),o("div",{className:"text-gray-600",children:["⏱️ ",e.duration_minutes," min"]})]})]}),children:[t(R,{title:`Leitura: ${e.title}`}),t("div",{className:"py-8",children:o("div",{className:"max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6",children:[a&&c<100&&!r&&o("div",{className:"bg-white rounded-xl shadow-lg p-6",children:[o("div",{className:"flex items-center justify-between mb-2",children:[t("span",{className:"text-sm font-medium text-gray-700",children:"Progresso da Leitura"}),o("span",{className:"text-lg font-bold text-purple-600",children:[Math.round(c),"%"]})]}),t("div",{className:"w-full bg-gray-200 rounded-full h-4 shadow-inner",children:t("div",{className:"bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 relative overflow-hidden",style:{width:`${c}%`},children:t("div",{className:"absolute inset-0 bg-white opacity-20 animate-pulse"})})}),t("div",{className:"mt-2 text-xs text-gray-500 text-center",children:"Continue lendo para ganhar os pontos desta atividade!"})]}),r&&t("div",{className:"bg-green-50 border border-green-200 rounded-xl p-4 text-center",children:o("div",{className:"flex items-center justify-center gap-2",children:[t("span",{className:"text-2xl",children:"✅"}),o("span",{className:"text-lg font-medium text-green-800",children:["Modo Revisão - Você já completou esta leitura e ganhou ",e.points_value," pontos"]})]})}),t("div",{className:"bg-white rounded-xl shadow-lg overflow-hidden",children:t("div",{className:"p-8",children:a?o("div",{children:[t("div",{className:`prose prose-lg prose-purple max-w-none
                                                   text-justify
                                                   prose-headings:text-purple-900 prose-headings:font-bold
                                                   prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                                                   prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b-2 prose-h2:border-purple-200 prose-h2:pb-2
                                                   prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                                                   prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed prose-p:text-justify
                                                   prose-strong:text-purple-800 prose-strong:font-bold prose-strong:bg-yellow-100 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded
                                                   prose-em:text-purple-600 prose-em:font-semibold prose-em:not-italic prose-em:bg-blue-50 prose-em:px-1
                                                   prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                                                   prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                                                   prose-li:mb-2 prose-li:text-gray-700 prose-li:text-justify
                                                   prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                                                   prose-blockquote:border-l-4 prose-blockquote:border-purple-500
                                                   prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-purple-50 prose-blockquote:py-3 prose-blockquote:my-4
                                                   prose-code:bg-purple-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                                                   prose-code:text-sm prose-code:text-purple-800 prose-code:font-semibold
                                                   prose-table:border-collapse
                                                   prose-table:border-2
                                                   prose-table:border-purple-300
                                                   prose-table:w-full
                                                   prose-table:my-6
                                                   prose-thead:bg-purple-100
                                                   prose-th:border-2
                                                   prose-th:border-purple-300
                                                   prose-th:px-4
                                                   prose-th:py-3
                                                   prose-th:text-left
                                                   prose-th:font-bold
                                                   prose-th:text-purple-900
                                                   prose-td:border
                                                   prose-td:border-purple-200
                                                   prose-td:px-4
                                                   prose-td:py-3
                                                   prose-td:text-gray-700`,dangerouslySetInnerHTML:{__html:h.content},style:{lineHeight:"1.9",fontSize:"1.05rem",textAlign:"justify",hyphens:"auto",WebkitHyphens:"auto",MozHyphens:"auto"}}),c>=100&&!r&&o("div",{className:"mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center",children:[t("div",{className:"text-4xl mb-4",children:"🎉"}),t("h3",{className:"text-xl font-bold text-green-800 mb-2",children:"Leitura Concluída!"}),t("p",{className:"text-green-700 mb-4",children:"Parabéns! Você completou toda a leitura."}),t("button",{onClick:M,disabled:g,className:"px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg",children:g?o(N,{children:[t("span",{className:"animate-spin mr-2",children:"⏳"}),"Finalizando..."]}):o(N,{children:[t("span",{className:"mr-2",children:"✅"}),"Finalizar e Ganhar ",e.points_value," Pontos"]})})]})]}):o("div",{className:"text-center",children:[t("div",{className:"text-6xl mb-6",children:"📖"}),t("h1",{className:"text-3xl font-bold text-gray-900 mb-4",children:h.title}),t("p",{className:"text-lg text-gray-600 mb-8",children:A(e.description,400)}),o("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[o("div",{className:"text-center p-4 bg-purple-50 rounded-lg",children:[t("div",{className:"text-2xl font-bold text-purple-600",children:"📚"}),t("div",{className:"text-sm text-gray-600 mt-2",children:"Material de Estudo"})]}),o("div",{className:"text-center p-4 bg-blue-50 rounded-lg",children:[o("div",{className:"text-2xl font-bold text-blue-600",children:["⏱️ ",e.duration_minutes,"min"]}),t("div",{className:"text-sm text-gray-600 mt-2",children:"Tempo Estimado"})]}),o("div",{className:"text-center p-4 bg-green-50 rounded-lg",children:[o("div",{className:"text-2xl font-bold text-green-600",children:["🏆 ",e.points_value]}),t("div",{className:"text-sm text-gray-600 mt-2",children:"Pontos Possíveis"})]})]}),o("button",{onClick:P,className:"px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg",children:[t("span",{className:"mr-2",children:"🚀"}),"Iniciar Leitura"]})]})})}),o("div",{className:"flex justify-between items-center",children:[t("button",{onClick:()=>_.get(route("student.courses.show",p.id)),className:"px-6 py-3 text-gray-600 hover:text-gray-800 transition-all font-medium",children:"← Voltar ao Curso"}),r?o("div",{className:"flex items-center gap-2 text-sm text-green-600 font-medium",children:[t("span",{children:"✅"}),t("span",{children:"Modo Revisão - Pontos já conquistados"})]}):t("div",{className:"text-sm text-gray-500",children:"💡 Leia com atenção para absorver melhor o conteúdo"})]})]})}),t("style",{children:`
                .prose h2 { color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
                .prose h3 { color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .prose h4 { color: #4b5563; margin-top: 1rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 1rem; }
                .prose ul { margin: 1rem 0; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.5rem; }
                .content-section { margin: 2rem 0; padding: 1.5rem; background: #f9fafb; border-radius: 0.75rem; border-left: 4px solid #8b5cf6; }
            `})]})}export{L as default};
