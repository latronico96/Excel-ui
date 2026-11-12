
import Link from 'next/link';

export const metadata = {
    title: 'Política de Privacidad | Ordená tus Finanzas',
    description:
        'Conocé qué datos recopila Ordená tus Finanzas, cómo se utilizan y cómo podés ejercer tus derechos.',
    alternates: {
        canonical: "/privacy",
    },
};


export default function PrivacyPage() {
    return (
        <main
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '2rem',
                fontFamily: 'sans-serif',
                lineHeight: '1.7',
            }}
        >
            <h1>Política de Privacidad</h1>
            <p>Última actualización: 11 de noviembre de 2026</p>

            <p>
                En <strong>Ordená tus Finanzas</strong> nos comprometemos a proteger
                la privacidad de las personas que utilizan la aplicación. Esta
                política explica qué información recopilamos, para qué la utilizamos
                y qué opciones tenés para administrar tus datos.
            </p>

            <h2>1. Información que recopilamos</h2>
            <p>
                Para prestar el servicio podemos recopilar y almacenar las siguientes
                categorías de información:
            </p>
            <ul>
                <li>
                    <strong>Datos de cuenta:</strong> nombre, dirección de correo
                    electrónico e imagen de perfil, cuando estén disponibles mediante
                    el inicio de sesión con Google.
                </li>
                <li>
                    <strong>Datos financieros:</strong> ingresos, gastos, movimientos,
                    descripciones, fechas, categorías y demás información que ingreses
                    voluntariamente.
                </li>
                <li>
                    <strong>Datos de espacios de trabajo:</strong> nombres de espacios,
                    configuraciones, integrantes, roles e invitaciones.
                </li>
                <li>
                    <strong>Datos técnicos:</strong> información necesaria para
                    mantener la sesión, autenticar usuarios, proteger y operar el
                    servicio.
                </li>
            </ul>

            <h2>2. Cómo utilizamos la información</h2>
            <p>Utilizamos la información para:</p>
            <ul>
                <li>Crear y administrar tu cuenta.</li>
                <li>Permitir el registro y seguimiento de ingresos y gastos.</li>
                <li>Generar resúmenes y estadísticas financieras.</li>
                <li>Administrar espacios de trabajo, integrantes y permisos.</li>
                <li>Proteger la aplicación y prevenir usos indebidos.</li>
                <li>Atender consultas y solicitudes de soporte.</li>
            </ul>

            <h2>3. Almacenamiento y servicios de terceros</h2>
            <p>
                A diferencia de una aplicación que utiliza Google Sheets como
                almacenamiento, Ordená tus Finanzas guarda la información de la
                aplicación en su propia base de datos.
            </p>
            <p>
                La infraestructura tecnológica y los servicios externos que permiten
                operar la aplicación pueden procesar información técnica o datos
                necesarios para prestar sus funciones. Entre los servicios utilizados
                se encuentran Google para la autenticación, Vercel para el alojamiento
                de la aplicación y Neon para la infraestructura de base de datos.
            </p>
            <p>
                Google se utiliza para facilitar el inicio de sesión. Los movimientos
                financieros que ingresás en Ordená tus Finanzas no se almacenan en
                Google Sheets ni en Google Drive.
            </p>

            <h2>4. Acceso y espacios de trabajo</h2>
            <p>
                La información de cada espacio de trabajo se encuentra sujeta a los
                permisos y roles de sus integrantes. Los usuarios que tengan acceso
                a un mismo espacio podrán visualizar o administrar la información
                según los permisos asignados por la aplicación.
            </p>
            <p>
                No compartas invitaciones ni credenciales con personas a las que no
                quieras conceder acceso.
            </p>

            <h2>5. Compartir información</h2>
            <p>
                No comercializamos ni vendemos datos personales. La información
                puede ser procesada por los proveedores tecnológicos necesarios para
                operar el servicio o ser accesible para otros integrantes de un espacio
                de trabajo de acuerdo con sus permisos.
            </p>
            <p>
                También podremos comunicar información cuando exista una obligación
                legal o un requerimiento válido de una autoridad competente.
            </p>

            <h2>6. Conservación y eliminación de datos</h2>
            <p>
                Podés eliminar un espacio de trabajo desde las funcionalidades
                disponibles en la aplicación. La eliminación de un espacio de trabajo
                no implica automáticamente la eliminación de tu cuenta de usuario.
            </p>
            <p>
                Actualmente, la aplicación no ofrece una opción de eliminación
                automática de la cuenta. Si querés solicitar la eliminación de tu
                cuenta y los datos personales asociados, escribinos a:
            </p>
            <p>
                <a href="mailto:ignacio.latronico96@gmail.com">
                    ignacio.latronico96@gmail.com
                </a>
            </p>
            <p>
                Para proteger tu información, podremos solicitar datos adicionales
                que permitan verificar que sos el titular de la cuenta. Las solicitudes
                serán evaluadas y gestionadas según las obligaciones legales aplicables
                y las necesidades operativas del servicio.
            </p>

            <h2>7. Seguridad</h2>
            <p>
                Adoptamos medidas técnicas y organizativas razonables para proteger
                la información frente al acceso, modificación o divulgación no
                autorizados. Sin embargo, ningún sistema informático puede garantizar
                una seguridad absoluta.
            </p>

            <h2>8. Derechos de los usuarios</h2>
            <p>
                Podés solicitar información sobre los datos personales asociados a
                tu cuenta, así como pedir su actualización, corrección o eliminación
                cuando corresponda.
            </p>
            <p>
                Para ejercer estos derechos, contactanos mediante el correo indicado
                en esta política.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
                Podemos actualizar esta política para reflejar cambios en la
                aplicación, sus funcionalidades o las obligaciones legales aplicables.
                Publicaremos la versión vigente en esta página e indicaremos su fecha
                de actualización.
            </p>

            <h2>10. Contacto</h2>
            <p>
                Si tenés preguntas sobre esta política o sobre el tratamiento de tus
                datos personales, podés escribirnos a:
            </p>
            <p>
                <a href="mailto:ignacio.latronico96@gmail.com">
                    ignacio.latronico96@gmail.com
                </a>
            </p>

            <p style={{ marginTop: '2rem' }}>
                <Link href="/">Volver a Ordená tus Finanzas</Link>
            </p>
        </main>
    );
}
