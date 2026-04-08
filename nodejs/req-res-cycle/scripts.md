# curl scripts

## GET

```sh
curl -s http://localhost:3099/slow | jq .
```

## POST

```sh
curl -s -X POST http://localhost:3099/data -H "Content-Type: application/json" -d '{"hello":"world"}' | jq .
```

## PUT

```sh
curl -s -X PUT http://localhost:3099/data -H "Content-Type: application/json" -d '{"update":"value"}' | jq .
```

## GET — client disconnect (abort before server responds)

```sh
curl -s --max-time 0.5 http://localhost:3099/slow
```
