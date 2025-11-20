// We use window.pdfjsLib loaded from CDN in index.html

export async function convertPdfToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // @ts-ignore - pdfjsLib is global
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) continue;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert to base64 string (removing the data:image/png;base64, prefix for Gemini)
    const base64 = canvas.toDataURL('image/png').split(',')[1];
    images.push(base64);
  }

  return images;
}

export async function extractTextFromTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}