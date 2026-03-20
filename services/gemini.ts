import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FileData, GradingResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "Name of the student if found on the paper, otherwise 'Inconnu'" },
    globalComment: { type: Type.STRING, description: "A brief overall summary of the performance." },
    totalScore: { type: Type.NUMBER, description: "Sum of points earned." },
    maxTotalScore: { type: Type.NUMBER, description: "Sum of possible points." },
    finalGrade20: { type: Type.NUMBER, description: "The grade normalized to a scale of 0 to 20." },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Question identifier (e.g., '1a', '2', 'Exercise 1')" },
          extractedAnswer: { type: Type.STRING, description: "The text or value read from the student's paper." },
          score: { type: Type.NUMBER, description: "Points awarded for this question." },
          maxScore: { type: Type.NUMBER, description: "Maximum points possible for this question according to rubric." },
          feedback: { type: Type.STRING, description: "Specific feedback explaining the score." },
          flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING, enum: ["ILLEGIBLE", "AMBIGUOUS", "MISSING", "NONE"] },
            description: "Tags indicating issues with the answer."
          }
        },
        required: ["id", "extractedAnswer", "score", "maxScore", "feedback", "flags"]
      }
    }
  },
  required: ["studentName", "totalScore", "maxTotalScore", "finalGrade20", "questions", "globalComment"]
};

export const gradeStudentPaper = async (
  answerKey: FileData,
  studentPages: FileData[]
): Promise<GradingResult> => {
  
  const model = "gemini-3-pro-preview"; // Using Pro for complex reasoning and reading handwriting

  // Prepare the prompt content
  // 1. System/Task instructions
  const systemInstruction = `
    Vous êtes un correcteur académique expert, strict et précis.
    Votre tâche est de corriger une copie d'étudiant en vous basant sur le corrigé et le barème fournis.
    
    Instructions:
    1. Analysez le document "Corrigé / Barème" pour comprendre les réponses attendues et les points par question.
    2. Analysez les images/PDF de la "Copie Étudiant". Lisez l'écriture manuscrite avec attention.
    3. Associez chaque réponse de l'étudiant à la question correspondante du corrigé.
    4. Attribuez les points strictement selon le barème. Ne soyez pas généreux si la réponse est incomplète.
    5. Si une réponse est illisible, marquez le flag "ILLEGIBLE" et mettez 0 point si vous ne pouvez rien déchiffrer.
    6. Si une réponse est ambiguë, marquez "AMBIGUOUS".
    7. Calculez le total et convertissez la note sur 20.
    8. Répondez UNIQUEMENT au format JSON strict défini.
    9. Ne rien inventer. Si une réponse est absente, notez 0 et flag "MISSING".
  `;

  // 2. Build parts
  const parts = [];

  // Add Answer Key
  if (answerKey.base64) {
    parts.push({
      inlineData: {
        mimeType: answerKey.mimeType,
        data: answerKey.base64
      }
    });
    parts.push({ text: "\n^^^ Ceci est le Corrigé Officiel et Barème ^^^\n" });
  }

  // Add Student Pages
  studentPages.forEach((page, index) => {
    if (page.base64) {
      parts.push({
        inlineData: {
          mimeType: page.mimeType,
          data: page.base64
        }
      });
      parts.push({ text: `\n^^^ Copie Étudiant - Page ${index + 1} ^^^\n` });
    }
  });

  parts.push({ text: "Veuillez procéder à la correction complète maintenant." });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        temperature: 0, // Strict
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstruction
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GradingResult;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Grading failed:", error);
    throw error;
  }
};
