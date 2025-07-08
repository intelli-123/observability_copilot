export const toolStates = [
  {
    name: "Datadog",
    active: !!process.env.NEXT_PUBLIC_DATADOG_API_KEY,
  },
  {
    name: "Dynatrace",
    active: !!process.env.NEXT_PUBLIC_DYNATRACE_API_KEY,
  },
  
];
