// file: constants/tools.ts

export interface ToolConfig {
  key: string;
  name: string;
  description: string;
  logo: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'password' | 'textarea' | 'json' | 'file';
    isJson?: boolean;
    isSecret?: boolean;
  }[];
}

export const TOOL_CONFIGS: ToolConfig[] = [
      {
    key: 'jenkins',
    name: 'Jenkins',
    description: 'Configure your Jenkins CI/CD integration.',
    logo: '/logos/jenkins.png',
    fields: [
      { key: 'JENKINS_BASE_URL', label: 'Jenkins URL', placeholder: 'https://jenkins.example.com', type: 'text' },
      { key: 'JENKINS_USER', label: 'Username', placeholder: 'Your Jenkins username', type: 'text' },
      { key: 'JENKINS_API_TOKEN', label: 'API Token', placeholder: 'Your Jenkins API token', type: 'password', isSecret: true },
      { key: 'JENKINS_JOB_NAMES', label: 'Job Names (comma-separated)', placeholder: 'job-one,job-two,Create GCP Vms', type: 'text' },
    ],
  },
    {
    key: 'cloudwatch',
    name: 'AWS CloudWatch',
    description: 'Configure your AWS CloudWatch integration.',
    logo: '/logos/cloudwatch.png',
    fields: [
      { key: 'AWS_ACCESS_KEY_ID', label: 'Access Key ID', placeholder: 'Your AWS Access Key', type: 'text' },
      { key: 'AWS_SECRET_ACCESS_KEY', label: 'Secret Access Key', placeholder: 'Your AWS Secret Key', type: 'password', isSecret: true },
      {
        key: 'AWS_REGIONS_LOG_GROUPS',
        label: 'Regions and Log Groups (JSON format)',
        placeholder: '[{"region": "us-east-1", "logGroups": ["group-a", "group-b"]}]',
        type: 'textarea',
        isJson: true,
      },
    ],
  },
  {
    key: 'gcp',
    name: 'GCP Logs',
    description: 'Configure your GCP Cloud Logging integration.',
    logo: '/logos/gcp_logging.png',
    fields: [],
  },
  {
    key: 'datadog',
    name: 'Datadog',
    description: 'Configure your Datadog integration.',
    logo: '/logos/datadog.png',
    fields: [
      { key: 'DATADOG_API_KEY', label: 'API Key', placeholder: 'Enter your Datadog API key' },
      { key: 'DATADOG_APP_KEY', label: 'Application Key', placeholder: 'Enter your Datadog Application key' },
    ],
  },
  {
    key: 'dynatrace',
    name: 'Dynatrace',
    description: 'Configure your Dynatrace integration.',
    logo: '/logos/dynatrace.png',
    fields: [
      { key: 'DYNATRACE_API_TOKEN', label: 'API Token', placeholder: 'Enter your Dynatrace API token' },
      { key: 'DYNATRACE_ENVIRONMENT_ID', label: 'Environment ID', placeholder: 'Enter your Dynatrace Environment ID' },
    ],
  },
  {
    key: 'sysdig',
    name: 'Sysdig',
    description: 'Configure your Sysdig integration.',
    logo: '/logos/sysdig.png',
    fields: [
      { key: 'SYSDIG_API_TOKEN', label: 'API Token', placeholder: 'Enter your Sysdig API token' },
    ],
  },
];

