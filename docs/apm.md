# Local Application Performance Monitoring Stack for Observability

This project supports local tracing, metrics, and logging using the ELK stack (Elasticsearch, Logstash, Kibana) and Elastic APM, powered by OpenTelemetry.

## Getting Started

### 2. Start the ELK + APM Stack

Create a `.env` file under [`apm/`](../apm/). Use `[`apm/example.env`](../apm/example.env) as a reference, making sure to supply passwords.

```sh
cp apm/example.env apm/.env
```

Run the following command from the project root:

```sh
make elk-apm-up
```

This will start Elasticsearch, Kibana, and APM Server using the configuration in [`apm/docker-compose-elk.yml`](../apm/docker-compose-elk.yml).

### 3. Configure the Application

- Set the environment variable `ENABLE_LOCAL_OTEL=true` in your [`gascd_app/.env`](../gascd_app/.env) file to enable OpenTelemetry instrumentation for local development.

### 4. Access Kibana

- Open [http://localhost:5601](http://localhost:5601) in your browser.
- Login with the credentials set in [`apm/.env`](../apm/.env) (username: `elastic` / password: from env file).
- Navigate to the **APM** section to view traces and metrics.
- Use **Discover** to search logs.

### 5. Stopping the Stack

To stop and remove the ELK + APM containers:

```sh
make elk-apm-down
```

## Configuration Files

- [`apm/docker-compose-elk.yml`](../apm/docker-compose-elk.yml): Docker Compose setup for ELK and APM.
- [`apm/.env`](../apm/example.env): Environment variables for the stack.
- [`apm/otel.yaml`](../apm/otel.yaml): OpenTelemetry Collector configuration.
- [`apm/kibana.yml`](../apm/kibana.yml): Kibana configuration.

## Troubleshooting

- If you cannot see traces, ensure `ENABLE_LOCAL_OTEL=true` is set and your app is restarted.
- Check container logs.
- The ELK stack can consume a lot of memory and storage. Try Increasing your docker desktop resources and adjusting the [`MEM_LIMIT`](../apm/example.env) environment variable
- Make sure ports `9200`, `5601`, and `8200` are not already in use.

## References

- [Elastic APM Docs](https://www.elastic.co/guide/en/apm/get-started/current/index.html)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)