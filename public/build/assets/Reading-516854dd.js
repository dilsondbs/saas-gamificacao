import{r as i,G as R,j as t,a as e,S as b,A as d,F as v}from"./app-8c0852e1.js";import{A as f}from"./AuthenticatedLayout-59e9d229.js";import"./ApplicationLogo-b365625c.js";import"./transition-f64bd92e.js";function I({auth:N,activity:s,course:c,userActivity:j,hasCompleted:l}){const m=N.user,[a,w]=i.useState(!1),[n,C]=i.useState(0),[P]=i.useState(new Date),{post:$,processing:u}=R();i.useEffect(()=>{if(a&&!l){const o=setInterval(()=>{C(r=>r>=100?(clearInterval(o),100):r+1)},200);return()=>clearInterval(o)}},[a,l]);const _=()=>{w(!0)},y=()=>{$(route("student.quiz.submit",s.id),{answers:{},reading_completed:!0,time_spent:Math.floor((new Date-P)/1e3)})},p=(()=>{var h,g,x;const o=((h=s.content)==null?void 0:h.module)||"Módulo Geral",r=(g=s.content)==null?void 0:g.real_content,A=(x=s.content)==null?void 0:x.module;return r&&r.content?{title:r.title||s.title,content:`
                    <h2>📖 ${r.title||s.title}</h2>
                    <p><strong>Módulo:</strong> ${o}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Conteúdo do Material</h3>
                        <div class="real-content">
                            ${r.content.replace(/\n/g,"</p><p>")}
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
                            <li><strong>Palavras:</strong> ${r.word_count} palavras</li>
                            <li><strong>Tempo estimado:</strong> ${s.duration_minutes} minutos</li>
                            <li><strong>Fonte:</strong> Material do curso</li>
                        </ul>
                    </div>
                `}:A?{title:s.title,content:`
                    <h2>📖 ${s.title}</h2>
                    <p><strong>Módulo:</strong> ${o}</p>
                    
                    <div class="content-section">
                        <h3>🎯 Objetivo desta Lição</h3>
                        <p>${s.description}</p>
                    </div>

                    <div class="content-section">
                        <h3>📚 Conteúdo Principal</h3>
                        <p>Nesta seção, você aprenderá sobre os conceitos fundamentais relacionados a <strong>${o}</strong>. 
                        Este material introdutório foi cuidadosamente elaborado para fornecer uma base sólida de conhecimento.</p>
                        
                        <h4>🔍 Pontos Importantes:</h4>
                        <ul>
                            <li>Compreensão dos conceitos básicos de ${o}</li>
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
                            <li>Resolver questões relacionadas ao ${o}</li>
                            <li>Aplicar os conceitos em exercícios práticos</li>
                        </ul>
                    </div>
                `}:{title:s.title,content:`
                    <h2>📖 ${s.title}</h2>
                    
                    <div class="content-section">
                        <h3>🎯 Descrição</h3>
                        <p>${s.description||"Material de estudo importante para seu aprendizado."}</p>
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
                        <p>Tempo sugerido para esta atividade: <strong>${s.duration_minutes} minutos</strong></p>
                    </div>
                `}})();return l?t(f,{user:m,header:e("h2",{className:"font-semibold text-xl text-gray-800 leading-tight",children:"✅ Leitura Concluída"}),children:[e(b,{title:`Leitura: ${s.title}`}),e("div",{className:"py-8",children:t("div",{className:"max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6",children:[t("div",{className:"bg-green-50 border border-green-200 rounded-xl p-8 text-center",children:[e("div",{className:"text-6xl mb-4",children:"🎉"}),e("h1",{className:"text-3xl font-bold text-green-800 mb-4",children:"Parabéns! Leitura Concluída!"}),t("p",{className:"text-lg text-green-700 mb-6",children:["Você completou com sucesso: ",e("strong",{children:s.title})]}),e("div",{className:"bg-green-100 border border-green-300 rounded-lg p-4 mb-6",children:t("div",{className:"flex items-center justify-center",children:[e("span",{className:"text-2xl mr-2",children:"🏆"}),t("span",{className:"text-lg font-medium text-green-800",children:["+",s.points_value," pontos conquistados!"]})]})})]}),t("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e("button",{onClick:()=>d.get(route("student.courses.show",c.id)),className:"px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200",children:"📚 Voltar ao Curso"}),e("button",{onClick:()=>d.get(route("student.dashboard")),className:"px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200",children:"🎯 Ver Dashboard Atualizado"})]})]})})]}):t(f,{user:m,header:t("div",{className:"flex items-center justify-between",children:[t("h2",{className:"font-semibold text-xl text-gray-800 leading-tight",children:["📖 ",s.title]}),t("div",{className:"flex items-center space-x-4 text-sm",children:[t("div",{className:"bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium",children:["🏆 ",s.points_value," pts"]}),t("div",{className:"text-gray-600",children:["⏱️ ",s.duration_minutes," min"]})]})]}),children:[e(b,{title:`Leitura: ${s.title}`}),e("div",{className:"py-8",children:t("div",{className:"max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6",children:[a&&n<100&&t("div",{className:"bg-white rounded-xl shadow-lg p-6",children:[t("div",{className:"flex items-center justify-between mb-2",children:[e("span",{className:"text-sm font-medium text-gray-700",children:"Progresso da Leitura"}),t("span",{className:"text-lg font-bold text-purple-600",children:[Math.round(n),"%"]})]}),e("div",{className:"w-full bg-gray-200 rounded-full h-4 shadow-inner",children:e("div",{className:"bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 relative overflow-hidden",style:{width:`${n}%`},children:e("div",{className:"absolute inset-0 bg-white opacity-20 animate-pulse"})})}),e("div",{className:"mt-2 text-xs text-gray-500 text-center",children:"Continue lendo para ganhar os pontos desta atividade!"})]}),e("div",{className:"bg-white rounded-xl shadow-lg overflow-hidden",children:e("div",{className:"p-8",children:a?t("div",{children:[e("div",{className:"prose prose-lg max-w-none",dangerouslySetInnerHTML:{__html:p.content},style:{lineHeight:"1.8",color:"#374151"}}),n>=100&&t("div",{className:"mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center",children:[e("div",{className:"text-4xl mb-4",children:"🎉"}),e("h3",{className:"text-xl font-bold text-green-800 mb-2",children:"Leitura Concluída!"}),e("p",{className:"text-green-700 mb-4",children:"Parabéns! Você completou toda a leitura."}),e("button",{onClick:y,disabled:u,className:"px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg",children:u?t(v,{children:[e("span",{className:"animate-spin mr-2",children:"⏳"}),"Finalizando..."]}):t(v,{children:[e("span",{className:"mr-2",children:"✅"}),"Finalizar e Ganhar ",s.points_value," Pontos"]})})]})]}):t("div",{className:"text-center",children:[e("div",{className:"text-6xl mb-6",children:"📖"}),e("h1",{className:"text-3xl font-bold text-gray-900 mb-4",children:p.title}),e("p",{className:"text-lg text-gray-600 mb-8",children:s.description}),t("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[t("div",{className:"text-center p-4 bg-purple-50 rounded-lg",children:[e("div",{className:"text-2xl font-bold text-purple-600",children:"📚"}),e("div",{className:"text-sm text-gray-600 mt-2",children:"Material de Estudo"})]}),t("div",{className:"text-center p-4 bg-blue-50 rounded-lg",children:[t("div",{className:"text-2xl font-bold text-blue-600",children:["⏱️ ",s.duration_minutes,"min"]}),e("div",{className:"text-sm text-gray-600 mt-2",children:"Tempo Estimado"})]}),t("div",{className:"text-center p-4 bg-green-50 rounded-lg",children:[t("div",{className:"text-2xl font-bold text-green-600",children:["🏆 ",s.points_value]}),e("div",{className:"text-sm text-gray-600 mt-2",children:"Pontos Possíveis"})]})]}),t("button",{onClick:_,className:"px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg",children:[e("span",{className:"mr-2",children:"🚀"}),"Iniciar Leitura"]})]})})}),t("div",{className:"flex justify-between items-center",children:[e("button",{onClick:()=>d.get(route("student.courses.show",c.id)),className:"px-6 py-3 text-gray-600 hover:text-gray-800 transition-all font-medium",children:"← Voltar ao Curso"}),e("div",{className:"text-sm text-gray-500",children:"💡 Leia com atenção para absorver melhor o conteúdo"})]})]})}),e("style",{jsx:!0,children:`
                .prose h2 { color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
                .prose h3 { color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .prose h4 { color: #4b5563; margin-top: 1rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 1rem; }
                .prose ul { margin: 1rem 0; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.5rem; }
                .content-section { margin: 2rem 0; padding: 1.5rem; background: #f9fafb; border-radius: 0.75rem; border-left: 4px solid #8b5cf6; }
            `})]})}export{I as default};
