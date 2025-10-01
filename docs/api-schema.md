# API Schema

Этот файл описывает HTTP и WebSocket интерфейсы, которые ожидает фронтенд.
Все URL можно переопределить переменными окружения, указанными в `.env`.

## Переменные окружения

- `NEXT_PUBLIC_API_BASE_URL` — базовый HTTP URL (по умолчанию `/api`).
- `NEXT_PUBLIC_API_PATIENTS_RECENT_URL` — явный URL для списка недавних пациентов.
- `NEXT_PUBLIC_API_PATIENTS_SEARCH_URL` — URL поиска пациентов.
- `NEXT_PUBLIC_API_PATIENTS_CREATE_URL` — URL создания пациента.
- `NEXT_PUBLIC_API_STUDIES_RECENT_URL` — URL списка недавних исследований.
- `NEXT_PUBLIC_WS_AI_URL` — WebSocket для AI-подсказок.
- `NEXT_PUBLIC_WS_BPM_URL` — WebSocket для частоты сердцебиения плода.
- `NEXT_PUBLIC_WS_UC_URL` — WebSocket для маточных сокращений.
- `NEXT_PUBLIC_IS_USING_MOC` — если `1/true`, фронт использует мок-данные и эмуляторы сокетов при ошибках сети; если `0/false`, ошибки пробрасываются и требуется живой бэкенд.

## REST API

Все ответы — `application/json`. Даты в формате ISO 8601 (UTC).

### GET `/api/patients/recent`
Возвращает последних пациентов, отображаемых на главной.

Ответ `200 OK`:
```json
[
  {
    "id": "pt-001",
    "fullName": "Иванов Иван Иванович",
    "lastStudyType": "Экспресс-ЭКГ",
    "lastStudyDate": "2024-05-12T08:30:00.000Z",
    "monitoringStatus": "stable"
  }
]
```

Поля `monitoringStatus`: `"stable" | "warning" | "critical"`.

### GET `/api/patients/search`
Поиск пациентов для модального окна.

Параметры:
- `query` (string, required) — часть ФИО, номера истории болезни и т.д.

Ответ `200 OK`:
```json
[
  {
    "id": "pt-002",
    "fullName": "Петрова Анастасия Сергеевна",
    "lastStudyType": "Холтеровское мониторирование",
    "lastStudyDate": "2024-05-08T14:15:00.000Z",
    "monitoringStatus": "warning",
    "birthDate": "1994-11-03",
    "medicalRecord": "MR-PT-002"
  }
]
```

При пустом `query` фронт не отправляет запрос.

### POST `/api/patients`
Создание пациента перед переходом к мониторингу.

Тело запроса:
```json
{
  "fullName": "Иванов Иван Иванович"
}
```

Ответ `201 Created` (можно 200 OK):
```json
{
  "id": "pt-123",
  "fullName": "Иванов Иван Иванович"
}
```

При ошибках возвращайте коды `4xx/5xx` с сообщением.

### GET `/api/studies/recent`
Список последних исследований (отображается на главной).

Ответ `200 OK`:
```json
[
  {
    "id": "st-1001",
    "patientId": "pt-001",
    "patientName": "Иванов Иван Иванович",
    "modality": "Холтеровское мониторирование",
    "status": "ready",
    "performedAt": "2024-05-11T16:20:00.000Z",
    "findingsSummary": "Синусовый ритм, редкие одиночные экстрасистолы"
  }
]
```

Поля `status`: `"ready" | "processing" | "scheduled"`.

> Примечание: при `NEXT_PUBLIC_IS_USING_MOC=0` фронт **не** использует заглушки. Все приведённые выше структуры должны возвращаться сервером.

## WebSocket API

Каждое соединение — JSON сообщения. Frontend автоматически переподключает клиент.

### `NEXT_PUBLIC_WS_AI_URL`
Сообщение AI подсказок.
```json
{
  "time": 1715510400,
  "short_term": {
    "status": "Норма",
    "events": [
      { "type": "late_decel", "severity": 0.3 },
      { "type": "low_variability", "severity": 0.6 }
    ]
  },
  "long_term": {
    "hypoxia_60": 0.2,
    "emergency_30": 0.1
  }
}
```
- `type`: `"late_decel" | "low_variability" | "prolonged_decel" | "tachycardia" | "bradycardia"`.
- `severity`: число 0..1.
- `status`: `"Норма" | "Подозрение" | "Тревога"`.

### `NEXT_PUBLIC_WS_BPM_URL`
Частота сердцебиения.
```json
{
  "time_sec": 1715510400,
  "value": 120
}
```
`value` — уд/мин.

### `NEXT_PUBLIC_WS_UC_URL`
Маточные сокращения.
```json
{
  "time_sec": 1715510400,
  "value": 45
}
```
`value` — произвольная интенсивность (0..100).

## Ошибки

Для REST возвращайте стандартный JSON:
```json
{
  "error": "Message"
}
```

WebSocket ошибки не стандартизированы, но желательно отправлять текстовые уведомления, либо закрывать соединение с кодом и описанием.
