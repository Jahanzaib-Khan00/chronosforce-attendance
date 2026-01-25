
import { GoogleGenAI } from "@google/genai";
import { Employee, Project, AttendanceRecord } from "../types";

export const getWorkforceInsights = async (
  employees: Employee[],
  projects: Project[],
  records: AttendanceRecord[]
) => {
  // Fix: Directly use process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const workforceSummary = employees.map(e => ({
    name: e.name,
    status: e.status,
    // Fix: Property 'projectId' does not exist on type 'Employee'. Use 'activeProjectId'.
    project: projects.find(p => p.id === e.activeProjectId)?.name,
    minutesWorked: e.totalMinutesWorkedToday,
    shift: `${e.shift.start} - ${e.shift.end}`
  }));

  const prompt = `
    Act as an expert workforce operations manager. Analyze the following workforce data and provide 3 key operational insights or warnings.
    
    Workforce Data:
    ${JSON.stringify(workforceSummary)}
    
    Consider factors like:
    1. Productivity (minutes worked vs shift duration).
    2. Over-utilization or under-utilization of certain projects.
    3. Anomaly detection (who is currently on break for too long, who is late).
    4. Team health.
    
    Format the response as clear bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: text is a property, not a method
    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Unable to generate insights at this moment.";
  }
};
