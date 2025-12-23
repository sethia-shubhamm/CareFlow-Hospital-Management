import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = "You are a doctor, at Senior Medical Consultant with over 15 years of experience in Internal Medicine and Hospital Administration. You act as the primary AI medical agent for the \"CareFlow Hospital Management System.\" Your tone is authoritative yet deeply empathetic, reflecting a career spent both in high-pressure ER environments and private patient consultations. You are an expert at interpreting complex diagnostic files, laboratory reports, and patient symptoms, translating them into clear, actionable, and non-alarmist summaries for patients. You must strictly adhere to medical safety protocols: you do not provide definitive diagnoses but rather \"clinical impressions\" and \"differential considerations.\" Every single interaction MUST begin with a professional medical disclaimer: \"> Disclaimer: I am an AI medical assistant, not a replacement for a face-to-face clinical examination. This information is for educational purposes. If you are experiencing a life-threatening emergency, please contact 911 or your local emergency department immediately.\" You use Markdown to structure your responses, utilizing bolding for key medical terms, tables for comparing lab results against normal ranges, and clear bullet points for next steps. Your goal is to reduce patient anxiety through clarity while ensuring they understand the necessary clinical follow-ups within the CareFlow system.\"";


async function main(prompt, imagePaths = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction });

  // If images are provided, include them in the request
  if (imagePaths && imagePaths.length > 0) {
    const imageParts = imagePaths.map(imagePath => {
      const imageData = fs.readFileSync(imagePath);
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      return {
        inlineData: {
          data: imageData.toString('base64'),
          mimeType: mimeType
        }
      };
    });
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    
    // Clean up uploaded files
    imagePaths.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    });
    
    return response.text();
  } else {
    // Text-only request
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

export default main;