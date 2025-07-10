// file: utils/envUtils.ts

// This is the centralized list of all possible vendors in the application.
// We've added the 'key' property to each object.

export const getVendorList = () => {
  return [
    { 
      key: 'datadog',
      name: 'Datadog',
      logo: '/logos/datadog.png',
      env: process.env.NEXT_PUBLIC_VENDOR_DATADOG,
      ping: '/api/datadog/ping',
      link: '/logs/datadog' 
    },
    { 
      key: 'dynatrace',
      name: 'Dynatrace',
      logo: '/logos/dynatrace.png',
      env: process.env.NEXT_PUBLIC_VENDOR_DYNATRACE,
      ping: '/api/dynatrace/ping',
      link: '/logs/dynatrace' 
    },
    { 
      key: 'sysdig',
      name: 'Sysdig',
      logo: '/logos/sysdig.png',
      env: process.env.NEXT_PUBLIC_VENDOR_SYSDIG,
      ping: '/api/sysdig/ping',
      link: '/logs/sysdig'
    },
    { 
      key: 'cloudwatch',
      name: 'AWS CloudWatch',
      logo: '/logos/cloudwatch.png',
      env: process.env.NEXT_PUBLIC_VENDOR_AWS,
      ping: '/api/cloudwatch/ping',
      link: '/logs/cloudwatch'
    },
    { 
      key: 'gcp',
      name: 'GCP Logs',
      logo: '/logos/gcp_logging.png',
      env: process.env.NEXT_PUBLIC_VENDOR_GCP,
      ping: '/api/gcp/ping',
      link: '/logs/gcp'
    },
    { 
      key: 'jenkins',
      name: 'Jenkins',
      logo: '/logos/jenkins.png',
      env: process.env.NEXT_PUBLIC_VENDOR_JENKINS,
      ping: '/api/jenkins/ping',
      link: '/logs/jenkins',
      badge: 'CI/CD'
    },
  ] as const;
};
