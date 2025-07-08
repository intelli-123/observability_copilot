//observability_cig\app\api\jenkins\ping\route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const base = process.env.JENKINS_BASE_URL!;
    const user = process.env.JENKINS_USER;
    const token = process.env.JENKINS_API_TOKEN;

    const res = await fetch(`${base}/api/json`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64'),
      },
    });

    if (!res.ok) {
      return NextResponse.json({ connected: false, status: res.status }, { status: 500 });
    }

    return NextResponse.json({ connected: true });
  } catch (err) {
    return NextResponse.json({ connected: false, error: err }, { status: 500 });
  }
}
