# Prompt para Codex (Backend)

Necesito que implementes endpoints y eventos socket para una **pantalla publica de turnos** (frontend Next.js ya listo).

## Contexto tecnico

- Base URL backend consumida por frontend: `NEXT_PUBLIC_API_URL`
- El frontend llama a `api.get("/public/display/calls?...")`, por lo tanto el endpoint real es:
  - `GET /api/public/display/calls`
- El frontend ya usa Socket.IO y registra sala publica con:
  - evento emitido por cliente: `public:join` con payload `{ branchId, serviceId }`
  - ack esperado: `{ ok: true, room: string }` o `{ ok: false, message: string }`

## 1) Endpoint a implementar

### `GET /api/public/display/calls`

#### Query params requeridos

- `branchId: string` (obligatorio)
- `serviceIds: string` (obligatorio, CSV, ejemplo `svc1,svc2,svc3`)

#### Reglas

- Debe devolver solo tickets **actualmente llamados** (estado `LLAMADO`) para la sucursal y servicios indicados.
- Ordenar por `calledAt` descendente.
- Limitar a un maximo razonable (ej. 20).

#### Respuesta permitida (cualquiera de estas 2 formas)

Opcion A:

```json
[
  {
    "id": "uuid",
    "code": "R0001",
    "type": "REGULAR",
    "status": "LLAMADO",
    "branchId": "b1",
    "branchName": "Sucursal Central",
    "serviceId": "s1",
    "serviceName": "Banco Pro",
    "serviceCode": "BAN",
    "windowId": "w1",
    "windowName": "Ventanilla 1",
    "calledAt": "2026-02-13T10:15:30.000Z",
    "createdAt": "2026-02-13T10:10:00.000Z"
  }
]
```

Opcion B:

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "R0001",
      "type": "REGULAR",
      "status": "LLAMADO",
      "branchId": "b1",
      "branchName": "Sucursal Central",
      "serviceId": "s1",
      "serviceName": "Banco Pro",
      "serviceCode": "BAN",
      "windowId": "w1",
      "windowName": "Ventanilla 1",
      "calledAt": "2026-02-13T10:15:30.000Z",
      "createdAt": "2026-02-13T10:10:00.000Z"
    }
  ]
}
```

## 2) Eventos Socket.IO que debe emitir backend

Emitir estos eventos cuando cambie el estado del ticket:

- `ticket:called`
- `ticket:recalled`
- `ticket:updated`
- `ticket:started`
- `ticket:finished`
- `ticket:cancelled`

El payload debe ser el ticket con esta forma (o envuelto como `{ ticket: ... }` o `{ data: ... }`):

```json
{
  "id": "uuid",
  "code": "R0001",
  "type": "REGULAR",
  "status": "LLAMADO",
  "branchId": "b1",
  "branchName": "Sucursal Central",
  "serviceId": "s1",
  "serviceName": "Banco Pro",
  "serviceCode": "BAN",
  "windowId": "w1",
  "windowName": "Ventanilla 1",
  "calledAt": "2026-02-13T10:15:30.000Z",
  "createdAt": "2026-02-13T10:10:00.000Z"
}
```

## 3) Salas publicas (importante)

Cuando el cliente emite `public:join` con `{ branchId, serviceId }`:

- validar que sucursal y servicio existan/esten activos
- unir socket a una sala estable (ej. `public:branch:{branchId}:service:{serviceId}`)
- responder ack `{ ok: true, room }`

Al emitir eventos de ticket, publicar tambien en esas salas publicas para que solo reciban lo que corresponde por sucursal/servicio.

## 4) Criterios de aceptacion

- El endpoint responde 200 con estructura valida y datos consistentes.
- Si faltan query params, responder 400 con mensaje claro.
- Los eventos llegan en tiempo real a clientes unidos por `public:join`.
- `ticket:started`, `ticket:finished`, `ticket:cancelled` permiten que frontend retire el ticket de pantalla.
- Campos `windowName` y `serviceName` deben venir completos (el frontend los usa para texto y voz).
