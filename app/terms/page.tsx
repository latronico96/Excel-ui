
import Link from 'next/link';

export const metadata = {
    title: 'Términos y Condiciones | Ordená tus Finanzas',
    description:
        'Consultá los términos y condiciones de uso de Ordená tus Finanzas.',
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsPage() {
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
            <h1>Términos y Condiciones</h1>
            <p>Última actualización: 11 de noviembre de 2026</p>

            <p>
                Bienvenido a <strong>Ordená tus Finanzas</strong>. Al acceder o
                utilizar la aplicación, aceptás estos términos y condiciones.
                Si no estás de acuerdo con ellos, te pedimos que no utilices el servicio.
            </p>

            <h2>1. Descripción del servicio</h2>
            <p>
                Ordená tus Finanzas es una aplicación destinada a facilitar la
                organización y el seguimiento de las finanzas personales o compartidas.
            </p>
            <p>
                Entre sus funcionalidades se encuentran el registro de ingresos y
                gastos, la administración de categorías, medios de pago, movimientos
                recurrentes, espacios de trabajo, integrantes y resúmenes financieros.
            </p>
            <p>
                Las funcionalidades disponibles pueden cambiar con el tiempo.
            </p>

            <h2>2. Registro y cuenta de usuario</h2>
            <p>
                Para utilizar determinadas funcionalidades es necesario iniciar sesión
                mediante una cuenta de Google.
            </p>
            <p>
                Sos responsable de mantener la seguridad de tu cuenta y de las
                actividades realizadas mediante ella. Debés proporcionar información
                correcta y notificarnos si detectás un uso no autorizado.
            </p>

            <h2>3. Espacios de trabajo y permisos</h2>
            <p>
                La aplicación permite crear espacios de trabajo e invitar a otras
                personas a participar. Cada integrante puede tener diferentes permisos
                según el rol asignado.
            </p>
            <p>
                El usuario que administra un espacio es responsable de gestionar
                adecuadamente las invitaciones y los permisos de sus integrantes.
            </p>
            <p>
                No debés compartir información financiera con personas a las que no
                quieras conceder acceso.
            </p>

            <h2>4. Uso adecuado del servicio</h2>
            <p>Al utilizar la aplicación, te comprometés a:</p>
            <ul>
                <li>Ingresar información veraz y utilizar el servicio de buena fe.</li>
                <li>No intentar acceder a cuentas o espacios ajenos sin autorización.</li>
                <li>No interferir con el funcionamiento o la seguridad del servicio.</li>
                <li>No utilizar la aplicación para actividades ilegales.</li>
                <li>No realizar acciones que puedan perjudicar a otros usuarios.</li>
            </ul>

            <h2>5. Información financiera y responsabilidad</h2>
            <p>
                La aplicación es una herramienta de organización y seguimiento
                financiero. No constituye asesoramiento financiero, contable,
                impositivo ni legal.
            </p>
            <p>
                Sos responsable de revisar la información que ingresás y de verificar
                los resultados y cálculos antes de utilizarlos para tomar decisiones.
            </p>
            <p>
                La aplicación no reemplaza el asesoramiento de profesionales
                calificados.
            </p>

            <h2>6. Datos y eliminación de información</h2>
            <p>
                La información que ingresás se utiliza para brindar las funcionalidades
                del servicio y se administra de acuerdo con nuestra Política de
                Privacidad.
            </p>
            <p>
                Podés eliminar espacios de trabajo desde la aplicación. Esta acción
                no elimina automáticamente tu cuenta de usuario.
            </p>
            <p>
                Actualmente, la eliminación de una cuenta debe solicitarse por correo
                electrónico a:
            </p>
            <p>
                <a href="mailto:ignacio.latronico96@gmail.com">
                    ignacio.latronico96@gmail.com
                </a>
            </p>

            <h2>7. Disponibilidad y modificaciones</h2>
            <p>
                Procuramos mantener el servicio disponible y funcionando correctamente,
                pero no garantizamos que esté libre de interrupciones, errores o
                períodos de mantenimiento.
            </p>
            <p>
                Podemos modificar, agregar o discontinuar funcionalidades cuando
                resulte necesario para mejorar, mantener o proteger la aplicación.
            </p>

            <h2>8. Limitación de responsabilidad</h2>
            <p>
                En la medida permitida por la legislación aplicable, no asumimos
                responsabilidad por decisiones financieras tomadas exclusivamente
                sobre la base de la información mostrada por la aplicación, errores
                derivados de datos ingresados incorrectamente o interrupciones
                ocasionadas por servicios externos.
            </p>
            <p>
                Esta limitación no excluye responsabilidades que legalmente no puedan
                ser limitadas.
            </p>

            <h2>9. Privacidad</h2>
            <p>
                El tratamiento de los datos personales se rige por nuestra{' '}
                <Link href="/privacy">Política de Privacidad</Link>, que forma parte
                de estos términos.
            </p>

            <h2>10. Modificaciones de los términos</h2>
            <p>
                Podemos actualizar estos términos cuando existan cambios en el
                servicio o en las obligaciones legales aplicables. La versión vigente
                estará disponible en esta página con su fecha de actualización.
            </p>

            <h2>11. Contacto</h2>
            <p>
                Para consultas, soporte o cualquier cuestión relacionada con estos
                términos, podés escribir a:
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
