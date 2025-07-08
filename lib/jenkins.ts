export async function fetchJenkinsLog() {
  const base = process.env.JENKINS_BASE_URL!;
  const token = process.env.JENKINS_API_TOKEN;
  const user = process.env.JENKINS_USER;
  const job = process.env.JENKINS_JOB_NAME!;

  const headers: HeadersInit = token
  ? {
      Authorization:
        "Basic " + Buffer.from(`${user ?? ""}:${token}`).toString("base64"),
    }
  : {};

// Step 1: Get the last 50 builds
const buildsRes = await fetch(
  `${base}/job/${encodeURIComponent(job)}/api/json?tree=builds[number,result,url]{50}`,
  { headers }
);


  if (!buildsRes.ok) {
    throw new Error(`Failed to fetch builds: ${buildsRes.status}`);
  }

  const data = await buildsRes.json();
  const builds = data.builds as { number: number; result: string | null }[];

  // Step 2: Find the most recent successful build
  const target = builds.find(b => b.result === "SUCCESS");

  if (!target) {
    throw new Error("No successful build found in the last 50.");
  }

  // Step 3: Fetch the console log of that build
  const logRes = await fetch(
    `${base}/job/${encodeURIComponent(job)}/${target.number}/consoleText`,
    { headers }
  );

  if (!logRes.ok) {
    throw new Error(`Failed to fetch consoleText: ${logRes.status}`);
  }

  return logRes.text();
}
