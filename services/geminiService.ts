import { GoogleGenAI, Type } from "@google/genai";
import { GradingResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema definition for structured output - Translated to German to ensure German output
const gradingSchema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Aufgabennummer, z.B. '1.1'" },
          points: { type: Type.NUMBER, description: "Erreichte Punkte" },
          maxPoints: { type: Type.NUMBER, description: "Maximal mögliche Punkte" },
          analysis: { type: Type.STRING, description: "Detaillierte Analyse der Antwort auf Deutsch" },
          errors: { type: Type.STRING, description: "Konkrete gefundene Fehler auf Deutsch" },
          suggestion: { type: Type.STRING, description: "Verbesserungsvorschläge auf Deutsch" }
        },
        required: ["id", "points", "maxPoints", "analysis"]
      }
    },
    totalPoints: { type: Type.NUMBER, description: "Erreichte Gesamtpunktzahl" },
    maxPoints: { type: Type.NUMBER, description: "Mögliche Gesamtpunktzahl" },
    grade: { type: Type.STRING, description: "Note (Deutsches Format 1-6)" },
    summary: { type: Type.STRING, description: "Zusammenfassendes Feedback auf Deutsch (3-5 Sätze)" }
  },
  required: ["tasks", "totalPoints", "maxPoints", "grade", "summary"]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function performOCR(base64Images: string[], mode: 'handwritten' | 'document' = 'handwritten'): Promise<string> {
  const CHUNK_SIZE = 4; 
  let fullText = "";

  // Process images in chunks to avoid hitting payload limits or timeouts
  for (let i = 0; i < base64Images.length; i += CHUNK_SIZE) {
    const chunkImages = base64Images.slice(i, i + CHUNK_SIZE);
    
    const parts = chunkImages.map(img => ({
      inlineData: {
        mimeType: 'image/png',
        data: img
      }
    }));

    let promptText = "";
    if (mode === 'handwritten') {
      promptText = `Dies ist Teil ${Math.floor(i/CHUNK_SIZE) + 1} des Dokuments. Transkribiere den gesamten handgeschriebenen Text auf diesen Seiten. Behalte die Struktur bei (Aufgabennummern, Absätze). Gib nur den reinen Text zurück. Antworte auf Deutsch.`;
    } else {
      promptText = `Dies ist Teil ${Math.floor(i/CHUNK_SIZE) + 1} des Dokuments. Du bist ein Multimodaler Dokumenten-Analyst. Extrahiere den gesamten Inhalt. Behalte die Formatierung, Struktur und logischen Abschnitte exakt bei. Antworte auf Deutsch.`;
    }

    parts.push({
      text: promptText
    } as any);

    let retries = 3;
    let success = false;
    let lastError;

    while (retries > 0 && !success) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: parts
          }
        });

        if (response.text) {
          fullText += response.text + "\n\n";
        }
        success = true;
      } catch (error: any) {
        console.warn(`OCR Chunk ${Math.floor(i/CHUNK_SIZE) + 1} failed, retries left: ${retries - 1}`, error);
        lastError = error;
        retries--;
        // Exponential backoff: 2s, 4s, 8s
        if (retries > 0) await delay(2000 * Math.pow(2, 3 - retries));
      }
    }

    if (!success) {
      console.error("OCR completely failed for a chunk:", lastError);
      throw new Error("Dokumenteninhalt konnte auch nach mehreren Versuchen nicht verarbeitet werden.");
    }
  }

  return fullText;
}

export async function gradeExam(
  expectationHorizon: string,
  examText: string,
  studentAnswers: string
): Promise<GradingResult> {
  
  const prompt = `
  ERWARTUNGSHORIZONT (Rolle des Agenten): Du bist ein Multimodaler Dokumenten-Analyst. Deine Hauptaufgabe ist es, alle hochgeladenen Dokumente, insbesondere PDF-Dateien, umfassend zu analysieren.

  AUFGABENSTELLUNG (Verarbeitung der PDFs):

  Priorität: PDF-Inhalte: Beantworte alle Fragen basierend auf dem Inhalt der hochgeladenen PDF-Dateien (die hier extrahiert vorliegen). Ignoriere externe oder allgemeine Wissensquellen.

  Multimodale Verarbeitung: Nimm zur Kenntnis, dass die Eingabe sowohl Text als auch Bild- und Layoutinformationen aus den PDFs enthalten kann (diese wurden für dich in Textstruktur umgewandelt). Nutze diese Informationen zur präzisen und kontextuellen Beantwortung der Nutzeranfragen.

  Beweisführung: Bei jeder Bewertung musst du die Quelle (z.B. Referenz auf den Erwartungshorizont oder die Aufgabenstellung) zitieren, aus der die Information stammt.

  ---

  Hier sind die extrahierten Inhalte der Dokumente:

  ### 1. ERWARTUNGSHORIZONT / LÖSUNGSSCHLÜSSEL
  ${expectationHorizon}

  ### 2. AUFGABENSTELLUNG
  ${examText}

  ### 3. SCHÜLERANTWORTEN (Transkription der Handschrift)
  ${studentAnswers}

  ---

  **KONKRETER BEWERTUNGSAUFTRAG:**
  Bewerte die Schülerantworten exakt nach dem Erwartungshorizont und den Bewertungskriterien.
  
  **SPRACHANWEISUNG:**
  ANTWORTE AUSSCHLIESSLICH AUF DEUTSCH. Alle Analysen, Fehlerbeschreibungen und Vorschläge müssen in deutscher Sprache verfasst sein.

  **WICHTIG:**
  - Gib für JEDE Teilaufgabe Punkte, Analyse, Fehler und Verbesserungsvorschläge an.
  - Sei fair, aber präzise.
  - Berechne die Gesamtpunktzahl korrekt.
  - Vergib eine Note nach deutschem Schulnotensystem (1-6, mit +/-).
  
  **NOTENSKALA (Standard):**
  - 1 (sehr gut): >90%
  - 2 (gut): >75%
  - 3 (befriedigend): >60%
  - 4 (ausreichend): >50%
  - 5 (mangelhaft): >30%
  - 6 (ungenügend): <30%
  `;

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: gradingSchema,
          temperature: 0.3,
        }
      });

      const text = response.text;
      if (!text) throw new Error("Keine Antwort von der KI erhalten.");
      
      return JSON.parse(text) as GradingResult;
    } catch (error) {
      console.error(`Grading attempt failed, retries left: ${retries - 1}`, error);
      retries--;
      if (retries === 0) throw new Error("Die Bewertung der Klausur ist fehlgeschlagen.");
      await delay(2000);
    }
  }
  throw new Error("Unbekannter Fehler bei der Bewertung.");
}