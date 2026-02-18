import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const optionNames: Record<string, string> = {
  makis: "Makis 🍣",
  chicharron: "Chicharrón 🥩",
  parrilla: "Parrilla de Pollo 🍗",
};

export async function POST(request: NextRequest) {
  try {
    const { option } = await request.json();
    const optionName = optionNames[option] ?? option;

    // ================================================================
    // TODO: Implementar envío de correo con SMTP de Google (Nodemailer)
    // ================================================================
    //
    // PASO 1 — Instalar dependencia:
    //   bun add nodemailer
    //   bun add -d @types/nodemailer
    //
    // PASO 2 — Crear archivo .env.local en la raíz del proyecto:
    //   SMTP_HOST=smtp.gmail.com
    //   SMTP_PORT=587
    //   SMTP_SECURE=false
    //   SMTP_USER=tu-correo@gmail.com
    //   SMTP_PASS=xxxx xxxx xxxx xxxx   <- Contraseña de aplicación de Google
    //   EMAIL_TO=destinatario@gmail.com
    //
    // NOTA: Para generar la contraseña de aplicación de Google:
    //   1. Ir a myaccount.google.com > Seguridad > Verificación en dos pasos
    //   2. Al final de esa página: "Contraseñas de aplicaciones"
    //   3. O accede directamente aquí: https://myaccount.google.com/apppasswords
    //   4. Crear una nueva para "Correo" en "Otro dispositivo"
    //
    // PASO 3 — Implementar la lógica de envío (reemplazar este bloque):
    //
    //   import nodemailer from 'nodemailer'
    //
    //   const transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: Number(process.env.SMTP_PORT),
    //     secure: process.env.SMTP_SECURE === 'true',
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASS,
    //     },
    //   })
    //
    //   await transporter.sendMail({
    //     from: `"Invitación Especial 💕" <${process.env.SMTP_USER}>`,
    //     to: process.env.EMAIL_TO,
    //     subject: '¡Aceptó la invitación! 💕',
    //     html: `
    //       <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
    //         <h1 style="color: #f43f5e;">¡Buenas noticias! 🎉</h1>
    //         <p style="font-size: 18px;">¡La invitación fue aceptada!</p>
    //         <p style="font-size: 16px;">La opción elegida fue:</p>
    //         <h2 style="color: #f43f5e; font-size: 24px;">${optionName}</h2>
    //         <p style="color: #888;">🍡 ¡Y no olvides los mochis en el camino!</p>
    //       </div>
    //     `,
    //   })
    //
    // ================================================================

    // Implementación del envío de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Invitación Especial 💕" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "¡Aceptó la invitación! 💕",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #f43f5e;">¡Buenas noticias! 🎉</h1>
          <p style="font-size: 18px;">¡La invitación fue aceptada!</p>
          <p style="font-size: 16px;">La opción elegida fue:</p>
          <h2 style="color: #f43f5e; font-size: 24px;">${optionName}</h2>
          <p style="color: #888;">🍡 ¡Y no olvides los mochis en el camino!</p>
        </div>
      `,
    });

    console.log(`[Email] Opción seleccionada: ${optionName}`);

    return NextResponse.json({
      success: true,
      message: `Confirmación registrada para: ${optionName}`,
    });
  } catch (error) {
    console.error("[Email] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
