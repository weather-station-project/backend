import { BatchSpanProcessor, ConsoleSpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeSDK } from '@opentelemetry/sdk-node'
import * as process from 'process'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { GlobalConfig } from './config/global.config'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { ConsoleMetricExporter, IMetricReader, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { resourceFromAttributes } from '@opentelemetry/resources'

/*
Useful links:
  https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
  https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-pino
  https://github.com/pinojs/pino-opentelemetry-transport
  https://opentelemetry.io/docs/concepts/semantic-conventions/
*/

export const otelSDK = new NodeSDK({
  spanProcessors: getProcessors(),
  metricReader: getMetricReader(),
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'wsp-backend',
    [ATTR_SERVICE_VERSION]: '0.0.1',
  }),
  instrumentations: [new HttpInstrumentation(), new NestInstrumentation()],
})

function getProcessors(): SpanProcessor[] {
  const processors: SpanProcessor[] = [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${GlobalConfig.otlp.rootUrl}/v1/traces`,
        headers: {},
      })
    ),
  ]

  if (GlobalConfig.otlp.debugInConsole) {
    processors.push(new BatchSpanProcessor(new ConsoleSpanExporter()))
  }

  return processors
}

function getMetricReader(): IMetricReader {
  return new PeriodicExportingMetricReader({
    exporter: GlobalConfig.otlp.debugInConsole
      ? new ConsoleMetricExporter()
      : new OTLPMetricExporter({
          url: `${GlobalConfig.otlp.rootUrl}/v1/metrics`,
        }),
  })
}

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err)
    )
    .finally(() => process.exit(0))
})
