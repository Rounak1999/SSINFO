# Sample API Requests

## Create Contact
`POST http://localhost:3000/api/contacts`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15550123456",
  "company": "Northwind",
  "address": "21 Sunset Boulevard",
  "notes": "Priority client"
}
```

## List Contacts
`GET http://localhost:3000/api/contacts?page=1&limit=10&search=jane&filter=northwind&sortBy=name&sortOrder=ASC`

## Update Contact
`PUT http://localhost:3000/api/contacts/1`

Headers:
`x-editor-id: editor-demo-user`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+15550123456",
  "company": "Northwind Updated",
  "address": "21 Sunset Boulevard",
  "notes": "Updated note"
}
```

## Lock Contact
`POST http://localhost:3000/api/contacts/1/lock`

```json
{
  "editorId": "editor-demo-user"
}
```

## Batch Delete
`POST http://localhost:3000/api/contacts/batch-delete`

```json
{
  "ids": [1, 2, 3]
}
```

## Upload Excel
`POST http://localhost:3000/api/contacts/upload`

Body type: `form-data`

`file`: attach `.xlsx` or `.xls`
