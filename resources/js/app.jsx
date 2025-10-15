import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

console.log('🚀 App.js iniciando...');

// Configurar CSRF token para Axios (usa cookie XSRF-TOKEN automaticamente)
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
axios.defaults.withCredentials = true;

// Obter token CSRF da meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    // Configurar para Axios também aceitar X-CSRF-TOKEN
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    console.log('🔑 CSRF Token configurado:', token.substring(0, 10) + '...');
} else {
    console.warn('⚠️ CSRF Token não encontrado na meta tag!');
}

// Função global para renovar CSRF token
window.refreshCsrfToken = async function() {
    try {
        const response = await axios.get('/refresh-csrf');
        const newToken = response.data.csrf_token;

        // Atualizar meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            metaTag.setAttribute('content', newToken);
        }

        // Atualizar axios
        axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;

        console.log('🔄 CSRF Token renovado com sucesso');
        return newToken;
    } catch (error) {
        console.error('❌ Erro ao renovar CSRF token:', error);
        throw error;
    }
};

// Interceptor global do Inertia para garantir CSRF token em todas as requisições
router.on('before', (event) => {
    const method = event.detail.visit.method.toLowerCase();

    // Apenas para métodos que modificam dados
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (token) {
            // Garantir que o header está configurado
            if (!event.detail.visit.headers) {
                event.detail.visit.headers = {};
            }
            event.detail.visit.headers['X-CSRF-TOKEN'] = token;

            console.log(`🔐 CSRF token adicionado à requisição ${method.toUpperCase()}`);
        } else {
            console.error('❌ CSRF Token não encontrado!');
        }
    }
});

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

console.log('📱 Criando Inertia App...');
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        console.log('⚙️ Setup do Inertia executando...');

        // Atualizar CSRF token com o mais recente das props
        if (props.initialPage.props.csrf_token) {
            const freshToken = props.initialPage.props.csrf_token;
            axios.defaults.headers.common['X-CSRF-TOKEN'] = freshToken;

            // Atualizar meta tag também
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', freshToken);
            }

            console.log('🔄 CSRF Token atualizado:', freshToken.substring(0, 10) + '...');
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
