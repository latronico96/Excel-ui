export default function TermsPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
            <h1>Términos de Servicio</h1>
            <p>Última actualización: 25 de enero de 2026</p>

            <h2>1. Aceptación de los términos</h2>
            <p>Al utilizar Excel-UI, usted acepta quedar vinculado por estos términos. Si no está de acuerdo, le rogamos que no utilice la aplicación.</p>

            <h2>2. Descripción del servicio</h2>
            <p>Excel-UI es una herramienta de código abierto para la gestión de ingresos y gastos personales o de pequeños comercios utilizando Google Sheets como base de datos.</p>

            <h2>3. Responsabilidad del usuario</h2>
            <p>Usted es el único responsable de la exactitud de los datos ingresados y de mantener la seguridad de su cuenta de Google.</p>

            <h2>4. Limitación de responsabilidad</h2>
            <p>Esta aplicación se proporciona &quot;tal cual&quot;, sin garantías de ningún tipo. No nos hacemos responsables de pérdidas financieras, errores de cálculo o pérdida de acceso a su cuenta de Google.</p>

            <h2>5. Cambios en el servicio</h2>
            <p>Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento, aunque al ser una aplicación que utiliza su propio almacenamiento, sus datos siempre permanecerán en su Google Drive.</p>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <a href="/" style={{ color: 'var(--primary, #c54b8c)', textDecoration: 'none' }}>Volver al inicio</a>
            </div>
        </div>
    );
}
