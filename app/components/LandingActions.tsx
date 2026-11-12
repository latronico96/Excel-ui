
'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import styles from '../page.module.css';

type LandingActionsProps = {
    variant: 'nav' | 'hero';
};

export function LandingActions({ variant }: LandingActionsProps) {
    const { status } = useSession();
    const router = useRouter();

    const [demoLoading, setDemoLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [demoError, setDemoError] = useState('');

    useEffect(() => {
        if (variant === 'hero' && status === 'authenticated') {
            router.replace('/hoy');
        }
    }, [variant, status, router]);

    const handleLogin = async () => {
        setLoginLoading(true);

        try {
            await signIn('google', { callbackUrl: '/hoy' });
        } catch {
            setLoginLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setDemoError('');
        setDemoLoading(true);

        try {
            const response = await fetch('/api/auth/demo', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('No se pudo iniciar la demo.');
            }

            window.location.href = '/hoy';
        } catch {
            setDemoError(
                'No se pudo iniciar la demo. Probá de nuevo en unos segundos.'
            );
            setDemoLoading(false);
        }
    };

    if (status === 'authenticated') {
        return null;
    }

    if (variant === 'nav') {
        return (
            <button
                type="button"
                className={styles.navLogin}
                onClick={handleLogin}
                disabled={loginLoading}
            >
                {loginLoading ? 'Conectando...' : 'Iniciar sesión'}
            </button>
        );
    }

    return (
        <>
            <div className={styles.heroActions}>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleLogin}
                    disabled={loginLoading}
                >
                    {loginLoading ? 'Conectando...' : 'Continuar con Google'}
                    <ArrowRight size={17} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                >
                    {demoLoading ? 'Preparando demo...' : 'Explorar demo'}
                </button>
            </div>

            {demoError && (
                <p className={styles.errorMessage} role="alert">
                    {demoError}
                </p>
            )}
        </>
    );
}
