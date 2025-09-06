import { Link } from '@inertiajs/react';

export default function DashboardSimple({ auth }) {
    console.log('DashboardSimple props:', auth);
    
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <Link href={route('logout')} method="post" as="button" style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Logout
                </Link>
            </div>
            
            <h1>Dashboard Simple</h1>
            <p>Auth object: {JSON.stringify(auth)}</p>
            {auth && auth.user && (
                <div>
                    <p>Nome: {auth.user.name}</p>
                    <p>Email: {auth.user.email}</p>
                    <p>Role: {auth.user.role}</p>
                </div>
            )}
        </div>
    );
}