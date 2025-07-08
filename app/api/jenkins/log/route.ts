// File: app/api/jenkins/log/route.ts
import { NextResponse } from 'next/server';

/** Change this to pull more/less history */
const MAX_BUILDS = 50;

export async function GET() {
  const base  = process.env.JENKINS_BASE_URL!;
  const job   = process.env.JENKINS_JOB_NAME!;
  const user  = process.env.JENKINS_USER!;
  const token = process.env.JENKINS_API_TOKEN!;

  if (!base || !job || !user || !token) {
    return NextResponse.json(
      { error: 'Missing Jenkins environment variables' },
      { status: 500 },
    );
  }

  try {
    const auth = 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64');

    /* 1️⃣  get last N build numbers */
    const metaURL =
      `${base}/job/${encodeURIComponent(job)}/api/json` +
      `?tree=builds[number]{0,${MAX_BUILDS}}`;

    const metaRes = await fetch(metaURL, { headers: { Authorization: auth } });
    if (!metaRes.ok) throw new Error(`meta → ${metaRes.status}`);
    const { builds = [] } = await metaRes.json() as { builds: { number: number }[] };

    /* 2️⃣ pull logs in parallel */
    const logs = await Promise.all(
      builds.map(async ({ number }) => {
        const logURL = `${base}/job/${encodeURIComponent(job)}/${number}/consoleText`;
        const r = await fetch(logURL, { headers: { Authorization: auth } });
        const txt = r.ok ? await r.text() : '<log fetch failed>';
        return { build: number, log: txt };
      }),
    );

    /* 3️⃣ newest → oldest */
    logs.sort((a, b) => b.build - a.build);

    return NextResponse.json({ logs });
  } catch (e: any) {
    console.error('Jenkins log error', e);
    return NextResponse.json({ error: 'Failed to load Jenkins logs' }, { status: 500 });
  }
}