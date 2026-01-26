export default function PrivacyPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
            <h1>Política de Privacidad</h1>
            <p>Última actualización: 25 de enero de 2026</p>

            <p>Esta aplicación ("Excel-UI") respeta su privacidad y se compromete a proteger sus datos personales.</p>

            <h2>1. Datos que recopilamos</h2>
            <p>Excel-UI no almacena sus datos en servidores propios. La aplicación actúa como una interfaz entre usted y su propia cuenta de Google Drive.</p>
            <ul>
                <li><strong>Información de perfil:</strong> Obtenemos su nombre y correo electrónico a través de Google OAuth para identificar su sesión.</li>
                <li><strong>Acceso a Google Drive/Sheets:</strong> Solicitamos permiso para crear y editar un archivo específico en su Google Drive para almacenar sus registros de ingresos y gastos.</li>
            </ul>

            <h2>2. Uso de los datos</h2>
            <p>Los datos a los que accedemos solo se utilizan para:</p>
            <ul>
                <li>Permitirle registrar, editar y visualizar sus movimientos financieros.</li>
                <li>Generar resúmenes automáticos dentro de sus propias hojas de cálculo.</li>
            </ul>

            <h2>3. Almacenamiento y Seguridad</h2>
            <p>Todos sus datos financieros se almacenan exclusivamente en su cuenta personal de Google Drive. Nosotros no tenemos acceso a sus archivos fuera de los que la aplicación crea bajo su autorización ("drive.file").</p>

            <h2>4. Compartir datos con terceros</h2>
            <p>No vendemos, alquilamos ni compartimos sus datos personales con terceros. Su información permanece privada en su entorno de Google.</p>

            <h2>5. Sus derechos</h2>
            <p>Usted puede revocar el acceso de esta aplicación a su cuenta de Google en cualquier momento desde la configuración de seguridad de su cuenta de Google.</p>

            <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <a href="/" style={{ color: 'var(--primary, #c54b8c)', textDecoration: 'none' }}>Volver al inicio</a>
            </div>
        </div>
    );
}
