
# Observability Copilot

**Observability Copilot** is a modern, AI-powered web application designed to centralize and simplify the monitoring of various development and cloud services. It provides a unified dashboard to view logs from multiple sources such as **Jenkins**, **AWS CloudWatch**, and **Google Cloud Logging**, and integrates with **Google's Gemini AI** to deliver intelligent insights and log analysis.

The application is built with a focus on user experience, dynamic configuration, and a scalable architecture using cutting-edge web technologies.

---

MCP Servers Uisng:
npx install @hyorimitsu/amazon-cloudwatch-logs-mcp-server
[text](https://github.com/hyorimitsu/mcp-amazon-cloudwatch-logs)

## 🔑 Key Features

- **Unified Dashboard**: A central dashboard that displays all configured observability tools and their real-time status.
- **Dynamic Configuration**: Easily add, edit, and store credentials for various tools like Jenkins, AWS, and GCP through a secure settings interface.
- **Live Log Viewing**: Access real-time logs fetched directly from each configured service.
- **Multi-Source Support**: Supports multiple configurations per tool, such as multiple GCP projects or Jenkins jobs.
- **AI-Powered Analysis**: Ask natural language questions about your logs via an embedded Gemini chatbot to detect anomalies or summarize data.
- **Professional UI**: Clean, dark-themed interface built with **Tailwind CSS** for a modern and responsive experience.

---

## 🧰 Tech Stack

| Component     | Technology                    |
|---------------|-------------------------------|
| **Framework** | Next.js (App Router)          |
| **Language**  | TypeScript                    |
| **Styling**   | Tailwind CSS                  |
| **Database**  | Vercel KV (Serverless Redis)  |
| **AI**        | Google Gemini API             |
| **Hosting**   | Local, Docker                       |

---

## 🚀 Getting Started

Follow the steps below to get the project running locally for development and testing.

---

### 📦 2. Install Dependencies, Set Up Database, Configure Environment

1. **Install all required project dependencies:**

   ```bash
   npm install
   ```

2. **Set Up the Vercel KV Database:**

   This project uses **Vercel KV** for storing configuration data securely.

   ```bash
   npx vercel link
   ```

   Follow the prompts to link your local project to your Vercel account and select the `observability_copilot` project.

   Then, create a KV store:

   ```bash
   npx vercel kv create
   ```

   Follow the prompts to name the store (e.g., `observability-kv`) and select a region.

3. **Configure Environment Variables:**

   After the KV store is created, Vercel will automatically add the necessary environment variables to a `.env.local` file.

   You need to manually add your **Gemini API key**.

   ```env
   # .env.local

   REDIS_URL=""
   VERCEL_OIDC_TOKEN=""

   # Add your Gemini API Key
   GEMINI_API_KEY="AIza..."  # Replace with your actual API key
   ```

---

### 🖥️ 3. Run the Development Server

Start the development server locally:

```bash
npm run dev
```

This will start the app at [http://localhost:3000](http://localhost:3000)

---

### 🧪 4. Using the Application

1. Open [http://localhost:3000](http://localhost:3000)

2. Log in using:

   ```
   Username: admin
   Password: admin
   ```

3. Go to the **Settings** page in the sidebar.

4. Click on a tool (e.g., Jenkins, GCP) to configure.

5. Enter credentials and click **Save Changes**.

6. Return to the dashboard — your tool card should appear.

7. Click the tool card to view logs.

8. 💬 Click the **Chat Robot Icon** to ask Gemini questions about the logs.

---
## Dockerfile:
Running with Docker
Alternatively, you can build and run the application using Docker. This is a great way to ensure a consistent environment.

1. Build the Docker Image
From the root of the project, run the docker build command. This will create a production-ready image named observability-copilot.

docker build -t observability-copilot .

2. Run the Docker Container
After the image is built, run it using the docker run command. You must pass in your environment variables from your .env.local or .env file using the -e flag.



The application will be available at http://localhost:3000.