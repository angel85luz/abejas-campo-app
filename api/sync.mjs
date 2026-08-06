const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Método no permitido" }, 405);
    }

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    if (!token || !baseId || !tableName) {
      console.error("Faltan variables de entorno de Airtable.");
      return json(
        { ok: false, error: "La sincronización no está configurada en el servidor." },
        500
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "JSON inválido." }, 400);
    }

    if (!body || !Array.isArray(body.records)) {
      return json({ ok: false, error: "Falta el arreglo records." }, 400);
    }

    if (body.records.length < 1 || body.records.length > 10) {
      return json(
        { ok: false, error: "Cada sincronización debe contener entre 1 y 10 registros." },
        400
      );
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
      return json({ ok: false, error: "Formato de registros inválido." }, 400);
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
        console.error("Error de Airtable:", airtableResponse.status, responseText);
        return json(
          {
            ok: false,
            error: "Airtable rechazó la sincronización.",
            status: airtableResponse.status
          },
          airtableResponse.status
        );
      }

      let airtableData = {};
      try {
        airtableData = responseText ? JSON.parse(responseText) : {};
      } catch {
        airtableData = {};
      }

      return json({
        ok: true,
        created: Array.isArray(airtableData.records)
          ? airtableData.records.length
          : body.records.length
      });
    } catch (error) {
      console.error("Error de conexión con Airtable:", error);
      return json(
        { ok: false, error: "No se pudo conectar con Airtable." },
        502
      );
    }
  }
};
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Método no permitido" }, 405);
    }

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    if (!token || !baseId || !tableName) {
      console.error("Faltan variables de entorno de Airtable.");
      return json(
        { ok: false, error: "La sincronización no está configurada en el servidor." },
        500
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "JSON inválido." }, 400);
    }

    if (!body || !Array.isArray(body.records)) {
      return json({ ok: false, error: "Falta el arreglo records." }, 400);
    }

    if (body.records.length < 1 || body.records.length > 10) {
      return json(
        { ok: false, error: "Cada sincronización debe contener entre 1 y 10 registros." },
        400
      );
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
      return json({ ok: false, error: "Formato de registros inválido." }, 400);
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
        console.error("Error de Airtable:", airtableResponse.status, responseText);
        return json(
          {
            ok: false,
            error: "Airtable rechazó la sincronización.",
            status: airtableResponse.status
          },
          airtableResponse.status
        );
      }

      let airtableData = {};
      try {
        airtableData = responseText ? JSON.parse(responseText) : {};
      } catch {
        airtableData = {};
      }

      return json({
        ok: true,
        created: Array.isArray(airtableData.records)
          ? airtableData.records.length
          : body.records.length
      });
    } catch (error) {
      console.error("Error de conexión con Airtable:", error);
      return json(
        { ok: false, error: "No se pudo conectar con Airtable." },
        502
      );
    }
  }
};
