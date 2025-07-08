// constants/tools.ts
export const TOOL_CONFIGS = [
  {
    key: 'jenkins',
    name: 'Jenkins',
    fields: ['URL', 'Username', 'API Token/Password'],
    description: 'Connect your Jenkins instance to monitor job logs and CI/CD activities.',
  },
  {
    key: 'datadog',
    name: 'Datadog',
    fields: ['API Key', 'App Key'],
    description: 'Integration with Datadog logs and metrics.',
  },
  {
    key: 'dynatrace',
    name: 'Dynatrace',
    fields: ['Tenant URL', 'API Token'],
    description: 'Enable observability using Dynatrace’s intelligent monitoring.',
  },
  {
    key: 'cloudwatch',
    name: 'AWS CloudWatch',
    fields: ['Access Key ID', 'Secret Access Key', 'Region'],
    description: 'Ingest logs and metrics from your AWS CloudWatch setup.',
  },
  {
    key: 'gcp',
    name: 'GCP Logs',
    fields: ['Project ID', 'Service Account JSON'],
    description: 'Stream logs from Google Cloud Platform to gain infrastructure visibility.',
  },
  {
    key: 'sysdig',
    name: 'Sysdig',
    fields: ['API Token'],
    description: 'Integrate Sysdig for deep visibility into containers and services.',
  },
];
