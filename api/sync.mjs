export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      error: "Método no permitido"
    });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  if (!token || !baseId || !tableName) {
    console.error("Faltan variables de entorno de Airtable.");

    return res.status(500).json({
      ok: false,
      error: "La sincronización no está configurada en el servidor."
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        ok: false,
        error: "JSON inválido."
      });
    }
  }

  if (!body || !Array.isArray(body.records)) {
    return res.status(400).json({
      ok: false,
      error: "Falta el arreglo records."
    });
  }

  if (body.records.length < 1 || body.records.length > 10) {
    return res.status(400).json({
      ok: false,
      error: "Cada sincronización debe contener entre 1 y 10 registros."
    });
  }

  const validRecords = body.records.every((record) => {
    return (
      record &&
      typeof record === "object" &&
      record.fields &&
      typeof record.fields === "object" &&
      !Array.isArray(record.fields)
    );
  });

  if (!validRecords) {
    return res.status(400).json({
      ok: false,
      error: "Formato de registros inválido."
    });
  }

  const airtableUrl =
    "https://api.airtable.com/v0/" +
    encodeURIComponent(baseId) +
    "/" +
    encodeURIComponent(tableName);

  try {
    const airtableResponse = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: body.records,
        typecast: true
      })
    });

    const responseText = await airtableResponse.text();

    if (!airtableResponse.ok) {
      console.error(
        "Error de Airtable:",
        airtableResponse.status,
        responseText
      );

      return res.status(airtableResponse.status).json({
        ok: false,
        error: "Airtable rechazó la sincronización.",
        status: airtableResponse.status
      });
    }

    let airtableData = {};

    try {
      airtableData = responseText ? JSON.parse(responseText) : {};
    } catch {
      airtableData = {};
    }

    return res.status(200).json({
      ok: true,
      created: Array.isArray(airtableData.records)
        ? airtableData.records.length
        : body.records.length
    });
  } catch (error) {
    console.error("Error de conexión con Airtable:", error);

    return res.status(502).json({
      ok: false,
      error: "No se pudo conectar con Airtable."
    });
  }
}
