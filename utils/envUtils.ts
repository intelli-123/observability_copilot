// file: utils/envUtils.ts

// This is the centralized list of all possible vendors in the application.
// The 'env' property has been removed as it is no longer needed.

export const getVendorList = () => {
  return [
    { 
      key: 'datadog',
      name: 'Datadog',
      logo: '/logos/datadog.png',
      ping: '/api/datadog/ping',
      link: '/logs/datadog' 
    },
    { 
      key: 'dynatrace',
      name: 'Dynatrace',
      logo: '/logos/dynatrace.png',
      ping: '/api/dynatrace/ping',
      link: '/logs/dynatrace' 
    },
    { 
      key: 'sysdig',
      name: 'Sysdig',
      logo: '/logos/sysdig.png',
      ping: '/api/sysdig/ping',
      link: '/logs/sysdig'
    },
    { 
      key: 'cloudwatch',
      name: 'AWS CloudWatch',
      logo: '/logos/cloudwatch.png',
      ping: '/api/cloudwatch/ping',
      link: '/logs/cloudwatch'
    },
    { 
      key: 'gcp',
      name: 'GCP Logs',
      logo: '/logos/gcp_logging.png',
      ping: '/api/gcp/ping',
      link: '/logs/gcp'
    },
    { 
      key: 'jenkins',
      name: 'Jenkins',
      logo: '/logos/jenkins.png',
      ping: '/api/jenkins/ping',
      link: '/logs/jenkins',
      badge: 'CI/CD'
    },
  ] as const;
};
