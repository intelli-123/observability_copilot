export async function GET() {
  const tools = [
    { name: "Datadog", isActive: !!process.env.NEXT_PUBLIC_DATADOG_API_KEY },
    { name: "Dynatrace", isActive: !!process.env.DYNATRACE_API_KEY },
    { name: "Sysdig", isActive: !!process.env.SYSDIG_API_KEY },
    { name: "AWS CloudWatch", isActive: !!process.env.AWS_ACCESS_KEY_ID },
    { name: "GCP Logs", isActive: !!process.env.GCP_CREDENTIALS_JSON },
  ];

  return Response.json(tools);
}
