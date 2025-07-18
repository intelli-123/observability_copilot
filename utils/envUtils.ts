// file: utils/envUtils.ts

export const getVendorList = () => {
  return [
    { 
      key: 'cloudwatch',
      name: 'AWS CloudWatch',
      logo: '/logos/cloudwatch.png',
      link: '/logs/cloudwatch',
      type: 'log',
    },
    { 
      key: 'gcp',
      name: 'GCP Logs',
      logo: '/logos/gcp_logging.png',
      link: '/logs/gcp',
      type: 'log',
    },
    { 
      key: 'jenkins',
      name: 'Jenkins',
      logo: '/logos/jenkins.png',
      link: '/logs/jenkins',
      badge: 'CI/CD',
      type: 'log',
    },
    {
      key: 'gitlab',
      name: 'GitLab',
      logo: '/logos/gitlab.png', // Make sure you have a gitlab.png logo
      link: '/logs/gitlab',
      type: `log`,
    },
    {
      key: 'mcp-salesforce',
      name: 'MCP for Salesforce',
      logo: '/logos/salesforce.png',
      badge: 'MCP-Client',
      link: '/logs/mcp-salesforce', // This is still used to build the API path
      type: 'mcp', // Interactive MCP query tool
    },
    {
      key: 'mcp-cloudwatch',
      name: 'MCP for CloudWatch',
      logo: '/logos/cloudwatch.png',
      link: '/logs/mcp-cloudwatch',
      badge: 'MCP-Client',
      type: 'mcp',
    },
  ] as const;
};
