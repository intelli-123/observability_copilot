// file: utils/envUtils.ts

// A single, centralized list for all vendors
export const getVendorList = () => {
  return [
    {
      name: 'Datadog',
      logo: '/logos/datadog.png',
      env: process.env.NEXT_PUBLIC_VENDOR_DATADOG,
      ping: '/api/datadog/ping',
      link: '/logs/datadog',
    },
    {
      name: 'Dynatrace',
      logo: '/logos/dynatrace.png',
      env: process.env.NEXT_PUBLIC_VENDOR_DYNATRACE,
      ping: '/api/dynatrace/ping',
      link: '/logs/dynatrace',
    },
    {
      name: 'Sysdig',
      logo: '/logos/sysdig.png',
      env: process.env.NEXT_PUBLIC_VENDOR_SYSDIG,
      ping: '/api/sysdig/ping',
      link: '/logs/sysdig',
    },
    {
      name: 'AWS CloudWatch',
      logo: '/logos/cloudwatch.png',
      env: process.env.NEXT_PUBLIC_VENDOR_AWS,
      ping: '/api/cloudwatch/ping',
      link: '/logs/cloudwatch',
    },
    {
      name: 'GCP Logs',
      logo: '/logos/gcp_logging.png',
      env: process.env.NEXT_PUBLIC_VENDOR_GCP,
      ping: '/api/gcp/ping',
      link: '/logs/gcp',
    },
    {
      name: 'Jenkins',
      logo: '/logos/jenkins.png',
      env: process.env.NEXT_PUBLIC_VENDOR_JENKINS,
      ping: '/api/jenkins/ping',
      link: '/logs/jenkins',
      badge: 'CI/CD',
    },
  ] as const;
};