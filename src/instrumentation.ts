import { BatchSpanProcessor, ConsoleSpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeSDK } from '@opentelemetry/sdk-node'
import * as process from 'process'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { GlobalConfig } from './config/global.config'

/*
  https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
  https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-pino
  https://github.com/pinojs/pino-opentelemetry-transport
*/

export const otelSDK = new NodeSDK({
  spanProcessors: getProcessors(),
  instrumentations: [new HttpInstrumentation(), new NestInstrumentation()],
})

function getProcessors(): SpanProcessor[] {
  const processors: SpanProcessor[] = [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: GlobalConfig.otlp.url,
        headers: {},
      })
    ),
  ]

  if (GlobalConfig.otlp.debugTracesInConsole) {
    processors.push(new BatchSpanProcessor(new ConsoleSpanExporter()))
  }

  return processors
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
