import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router } from '@inertiajs/react';

export default function Authenticated(props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const isCentral = props.isCentral || false;

    // Safe extraction with defaults
    const auth = props.auth || {};
    const user = props.user;
    const header = props.header;
    const children = props.children;

    // Use user prop directly if auth is not available
    const currentUser = user || auth.user || {};

    // Logout handler - usar useCallback para evitar re-renders
    const handleLogout = (e) => {
        e.preventDefault();

        // Usar método POST direto sem Ziggy
        window.location.href = '/login';

        // Fazer requisição de logout via fetch
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        }).then(() => {
            window.location.href = '/login';
        }).catch(() => {
            window.location.href = '/login';
        });
    };

    // Safety check for user object
    if (!currentUser || !currentUser.id) {
        console.log('No user found, showing loading...');
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href={isCentral ? "/central/dashboard" : "/"}>
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                {/* Central Navigation - Always show when in central context */}
                                {isCentral && (
                                    <>
                                        <NavLink href="/central/dashboard" active={window.location.pathname === '/central/dashboard'}>
                                            Painel Central
                                        </NavLink>
                                        <NavLink href="/central/tenants" active={window.location.pathname.startsWith('/central/tenants')}>
                                            Clientes
                                        </NavLink>
                                        <NavLink href="/central/billing" active={window.location.pathname === '/central/billing'}>
                                            Faturamento
                                        </NavLink>
                                        <NavLink href="/central/ai-usage" active={window.location.pathname === '/central/ai-usage'}>
                                            Uso da API
                                        </NavLink>
                                    </>
                                )}
                                
                                {/* Tenant Navigation */}
                                {!isCentral && currentUser?.role === 'admin' && (
                                    <NavLink href="/admin/dashboard" active={window.location.pathname === '/admin/dashboard'}>
                                        Painel
                                    </NavLink>
                                )}
                                {!isCentral && currentUser?.role === 'instructor' && (
                                    <NavLink href="/instructor/dashboard" active={window.location.pathname === '/instructor/dashboard'}>
                                        Painel
                                    </NavLink>
                                )}
                                {!isCentral && currentUser?.role === 'student' && (
                                    <NavLink href="/student/dashboard" active={window.location.pathname === '/student/dashboard'}>
                                        Painel
                                    </NavLink>
                                )}
                                
                                {/* Student Navigation (only in tenant context) */}
                                {!isCentral && currentUser?.role === 'student' && (
                                    <>
                                        <NavLink href="/student/courses" active={window.location.pathname === '/student/courses'}>
                                            Cursos
                                        </NavLink>
                                        <NavLink href="/student/badges" active={window.location.pathname === '/student/badges'}>
                                            Badges
                                        </NavLink>
                                        <NavLink href="/student/leaderboard" active={window.location.pathname === '/student/leaderboard'}>
                                            Ranking
                                        </NavLink>
                                    </>
                                )}
                                
                                {/* Instructor Navigation (only in tenant context) */}
                                {!isCentral && currentUser?.role === 'instructor' && (
                                    <>
                                        <NavLink href="/instructor/courses" active={window.location.pathname === '/instructor/courses'}>
                                            Meus Cursos
                                        </NavLink>
                                        <NavLink href="/instructor/students" active={window.location.pathname === '/instructor/students'}>
                                            Alunos
                                        </NavLink>
                                        <NavLink href="/eduai" active={window.location.pathname.startsWith('/eduai')}>
                                            🤖 EduAI
                                        </NavLink>
                                    </>
                                )}
                                
                                {/* Admin Navigation (only in tenant context) */}
                                {!isCentral && currentUser?.role === 'admin' && (
                                    <>
                                        <NavLink href="/admin/users" active={window.location.pathname.startsWith('/admin/users')}>
                                            Usuários
                                        </NavLink>
                                        <NavLink href="/admin/courses" active={window.location.pathname.startsWith('/admin/courses')}>
                                            Cursos
                                        </NavLink>
                                        <NavLink href="/admin/badges" active={window.location.pathname.startsWith('/admin/badges')}>
                                            Badges
                                        </NavLink>
                                        <NavLink href="/admin/activities" active={window.location.pathname.startsWith('/admin/activities')}>
                                            Atividades
                                        </NavLink>
                                        <NavLink href="/eduai" active={window.location.pathname.startsWith('/eduai')}>
                                            🤖 EduAI
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            {/* User Points Display (only for students) */}
                            {currentUser?.role === 'student' && currentUser?.total_points !== undefined && (
                                <div className="mr-4 flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    <span className="mr-1">⭐</span>
                                    {currentUser?.total_points} pontos
                                </div>
                            )}
                            
                            {/* User Role Badge */}
                            <div className={`mr-4 px-3 py-1 rounded-full text-xs font-medium ${
                                isCentral ? 'bg-blue-100 text-blue-800' :
                                currentUser?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                currentUser?.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {isCentral ? '🏢 Gerente SaaS' :
                                 currentUser?.role === 'admin' ? '👑 Administrador' :
                                 currentUser?.role === 'instructor' ? '👨‍🏫 Instrutor' :
                                 '🎓 Estudante'}
                            </div>
                            
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {currentUser.name}

                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href="/profile">Perfil</Dropdown.Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                                        >
                                            Sair
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        {/* Central Mobile Navigation - Always show when in central context */}
                        {isCentral && (
                            <>
                                <ResponsiveNavLink href="/central/dashboard" active={window.location.pathname === '/central/dashboard'}>
                                    Painel Central
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/central/tenants" active={window.location.pathname.startsWith('/central/tenants')}>
                                    Clientes
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/central/billing" active={window.location.pathname === '/central/billing'}>
                                    Faturamento
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/central/ai-usage" active={window.location.pathname === '/central/ai-usage'}>
                                    Uso da API
                                </ResponsiveNavLink>
                            </>
                        )}
                        
                        {/* Tenant Mobile Navigation */}
                        {!isCentral && currentUser?.role === 'admin' && (
                            <ResponsiveNavLink href="/admin/dashboard" active={window.location.pathname === '/admin/dashboard'}>
                                Painel
                            </ResponsiveNavLink>
                        )}
                        {!isCentral && currentUser?.role === 'instructor' && (
                            <ResponsiveNavLink href="/instructor/dashboard" active={window.location.pathname === '/instructor/dashboard'}>
                                Painel
                            </ResponsiveNavLink>
                        )}
                        {!isCentral && currentUser?.role === 'student' && (
                            <ResponsiveNavLink href="/student/dashboard" active={window.location.pathname === '/student/dashboard'}>
                                Painel
                            </ResponsiveNavLink>
                        )}
                        
                        {/* Student Mobile Navigation (only in tenant context) */}
                        {!isCentral && currentUser.role === 'student' && (
                            <>
                                <ResponsiveNavLink href="/student/courses" active={window.location.pathname === '/student/courses'}>
                                    Cursos
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/student/badges" active={window.location.pathname === '/student/badges'}>
                                    Badges
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/student/leaderboard" active={window.location.pathname === '/student/leaderboard'}>
                                    Ranking
                                </ResponsiveNavLink>
                            </>
                        )}
                        
                        {/* Instructor Mobile Navigation (only in tenant context) */}
                        {!isCentral && currentUser.role === 'instructor' && (
                            <>
                                <ResponsiveNavLink href="/instructor/courses" active={window.location.pathname === '/instructor/courses'}>
                                    Meus Cursos
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/instructor/students" active={window.location.pathname === '/instructor/students'}>
                                    Alunos
                                </ResponsiveNavLink>
                            </>
                        )}
                        
                        {/* Admin Mobile Navigation (only in tenant context) */}
                        {!isCentral && currentUser.role === 'admin' && (
                            <>
                                <ResponsiveNavLink href="/admin/users" active={window.location.pathname.startsWith('/admin/users')}>
                                    Usuários
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/admin/courses" active={window.location.pathname.startsWith('/admin/courses')}>
                                    Cursos
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/admin/badges" active={window.location.pathname.startsWith('/admin/badges')}>
                                    Badges
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/admin/activities" active={window.location.pathname.startsWith('/admin/activities')}>
                                    Atividades
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">
                                {currentUser.name}
                            </div>
                            <div className="font-medium text-sm text-gray-500">{currentUser.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href="/profile">Perfil</ResponsiveNavLink>
                            <button
                                onClick={handleLogout}
                                className="block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
