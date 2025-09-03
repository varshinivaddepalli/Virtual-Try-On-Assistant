import { GoogleGenAI, Modality, Part } from "@google/genai";

// FIX: Initialize GoogleGenAI with API key from environment variables as per guidelines, and remove hardcoded API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getMimeType = (fileType: string): string => {
    if (fileType.startsWith("image/")) {
        return fileType;
    }
    // Fallback for cases where type might be incorrect
    const extension = fileType.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        default: return 'image/png'; // Default to png
    }
};

export const editImageWithGemini = async (
    baseImage64: string,
    itemImages64: string[],
    prompt: string,
    baseImageType: string
): Promise<string> => {
    try {
        const parts: Part[] = [
            { inlineData: { data: baseImage64, mimeType: getMimeType(baseImageType) } },
            ...itemImages64.map(itemImg64 => ({
                inlineData: { data: itemImg64, mimeType: 'image/png' } // Assume items are png or let API handle it
            })),
            { text: prompt },
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }
        
        // Check for text response if no image is found (could be a safety rejection)
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`API returned a text response instead of an image: ${textResponse}`);
        }

        throw new Error("No image was generated. The model may have refused the request due to safety policies.");
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image. Please try again later.");
    }
};
