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
    key: 'gitlab',
    name: 'GitLab',
    description: 'Configure your GitLab integration.',
    logo: '/logos/gitlab.png', // Make sure you have a gitlab.png logo
    fields: [
      {
      key: 'url',
      label: 'GitLab Instance URL',
      placeholder: 'https://gitlab.com or your self-hosted domain'
      },
      { 
        key: 'GITLAB_API_TOKEN', 
        label: 'GitLab Personal Access Token', 
        placeholder: 'Enter your GitLab API token',
        type: 'password',
        isSecret: true
      },
      {
        key: 'GITLAB_PROJECT_IDS',
        label: 'Project IDs (comma-separated)',
        placeholder: '12345,67890',
        type: 'text',
      }
    ],
  },
  {
    key: 'mcp-salesforce',
    name: 'MCP for Salesforce',
    description: 'Provide your Salesforce credentials to enable the MCP server.',
    logo: '/logos/salesforce.png',
    fields: [
      { key: 'SALESFORCE_INSTANCE_URL', label: 'Salesforce Instance URL', placeholder: 'https://your-instance.my.salesforce.com' },
      { key: 'SALESFORCE_CONNECTION_TYPE', label: 'salesforce Connection Type', placeholder: 'User_Password use this only' },
      { key: 'SALESFORCE_USERNAME', label: 'Salesforce Username', placeholder: 'your.email@example.com' },
      { key: 'SALESFORCE_PASSWORD', label: 'Salesforce Password', placeholder: 'Enter your password', type: 'password' , isSecret: true},
      { key: 'SALESFORCE_TOKEN', label: 'Salesforce Security Token', placeholder: 'Enter your security token', type: 'password' , isSecret : true},
    ],
  },
  {
    key: 'mcp-cloudwatch',
    name: 'MCP for CloudWatch',
    description: 'Provide AWS credentials to enable the CloudWatch MCP server.',
    logo: '/logos/cloudwatch.png', // Using the existing AWS logo
    fields: [
      { key: 'AWS_ACCESS_KEY_ID', label: 'AWS Access Key ID', placeholder: 'Your AWS Access Key' },
      { key: 'AWS_SECRET_ACCESS_KEY', label: 'AWS Secret Access Key', placeholder: 'Your AWS Secret Key', type: 'password' , isSecret:true},
      { key: 'AWS_REGION', label: 'AWS Region', placeholder: 'e.g., us-east-1' },
    ],
  },
];

