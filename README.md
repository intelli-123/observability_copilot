# Observability Copilot
 Observability Copilot is a modern, AI-powered web application designed to centralize and simplify the monitoring of various development and cloud services. It provides a unified dashboard to view logs from multiple sources like Jenkins, AWS CloudWatch, and GCP Logs, and leverages Google's Gemini AI to offer intelligent insights and analysis of that log data.

The application is built with a focus on a clean user experience, dynamic configuration, and a scalable architecture using modern web technologies.

# Key Features
Unified Dashboard: A central dashboard that displays all configured observability tools, showing their status at a glance.

Dynamic Configuration: A user-friendly settings interface to dynamically add, configure, and save credentials for various tools (Jenkins, AWS, GCP, etc.). All settings are securely stored in a cloud database.

Live Log Viewing: Dedicated pages to view real-time logs fetched directly from configured services.

Multi-Source Support: The architecture is designed to handle multiple configurations for a single tool, such as fetching logs from multiple GCP projects or Jenkins jobs simultaneously.

AI-Powered Analysis: An integrated Gemini chatbot on each log page allows users to ask natural language questions about the log data to quickly identify issues or summarize events.

Professional UI: A clean, dark-themed interface built with Tailwind CSS for a modern and intuitive user experience.

# Tech Stack
Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

Database: Vercel KV (Serverless Redis)

AI: Google Gemini API

Deployment: Vercel

# Getting Started
Follow these steps to get the project running on your local machine for development and testing.

Prerequisites
Node.js (v18 or later recommended)

npm or yarn

A Vercel account (for Vercel KV database)

A Google Cloud account (for Gemini API key)

1. Clone the Repository
First, clone the project to your local machine:

git clone <your-repository-url>
cd observability-cig

2. Install Dependencies
Install all the necessary project dependencies using npm:

npm install

3. Set Up the Database (Vercel KV)
This project uses Vercel KV for storing tool configurations. You need to link your local project to a Vercel KV store.

First, link your project to your Vercel account:

npx vercel link

Follow the prompts to connect to your observability-copilot project on Vercel.

Next, create the KV database. Vercel will automatically create the database and add the required environment variables to a new .env.local file.

npx vercel kv create

Follow the prompts to name your database (e.g., observability-kv) and choose a region.

4. Configure Environment Variables
Open the .env.local file that was created in the previous step. It will already contain your Vercel KV credentials. You need to add your Gemini API key.

# .env.local

REDIS_URL=""
VERCEL_OIDC_TOKEN=""

# Add your Gemini API Key
GEMINI_API_KEY="AIza..."

5. Run the Development Server
Now you are ready to start the application.

npm run dev

The application should now be running, typically at http://localhost:3000.

6. Using the Application
Navigate to the homepage (http://localhost:3000).

Log in using the static credentials:

Username: admin

Password: admin

You will be redirected to the main dashboard.

Navigate to the Settings page from the sidebar.

Click on a tool (e.g., Jenkins, GCP) to open its configuration page.

Enter the required credentials and click "Save Changes".

Go back to the main dashboard. The card for the tool you just configured should now appear.

Click on the card to view its logs.

# Click on the Chat Robot ICON to ask Query about the logs