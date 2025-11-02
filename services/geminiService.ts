import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateImageFromImage = async (
    base64ImageData: string, 
    mimeType: string, 
    basePrompt: string, 
    influence: number,
    characterDescription: string,
    sceneDescription: string,
    outputQuality: string
): Promise<string> => {
    try {
        let fullPrompt = basePrompt;

        if (characterDescription.trim()) {
            fullPrompt += ` The character should also be described as: "${characterDescription}".`;
        }

        if (sceneDescription.trim()) {
            fullPrompt += ` The scene and action should be: "${sceneDescription}".`;
        }
        
        // The influence prompt now focuses on the overall composition, assuming the face is always preserved.
        let influencePrompt = '';
        if (influence > 70) {
            influencePrompt = ' The overall style, clothing, and background should adhere closely to the descriptions provided.';
        } else if (influence > 30) {
            influencePrompt = ' Use the descriptions as a strong reference, but allow for some artistic stylization in the clothing and background.';
        } else {
            influencePrompt = ' Use the descriptions as a loose inspiration for the style, clothing, and background, allowing for significant creative interpretation.';
        }

        // Add quality instruction.
        let qualityPrompt = '';
        if (outputQuality === 'high') {
            qualityPrompt = ' Generate the final image in high definition (HD) with photorealistic details, aiming for a resolution between 2K and 4K.';
        } else {
            qualityPrompt = ' Generate the final image in a standard definition, suitable for web display, around 720p resolution.';
        }

        // Add the hard constraint for face preservation.
        const facePreservationInstruction = " It is absolutely critical to preserve the person's face from the original image perfectly. Do not alter the facial features, structure, or identity in any way.";

        const finalPrompt = fullPrompt + influencePrompt + facePreservationInstruction + qualityPrompt;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: finalPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error('No image data found in the Gemini API response.');

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to generate image. Please check the console for more details.');
    }
};

export const removeImageBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Remove the background from the image, making it transparent. The main subject should be perfectly preserved. Output a PNG with a transparent background.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error('No image data found in the Gemini API response for background removal.');

    } catch (error) {
        console.error('Error calling Gemini API for background removal:', error);
        throw new Error('Failed to remove background. Please check the console for more details.');
    }
};