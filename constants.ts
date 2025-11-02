
export interface StyleOption {
    id: string;
    name: string;
    prompt: string;
}

export const styleOptions: StyleOption[] = [
    {
        id: 'business-professional',
        name: 'Business Professional',
        prompt: 'Transform the person in the image to be wearing professional business attire, suitable for an office or corporate setting. Keep the original face and background mostly intact.'
    },
    {
        id: 'evening-gown',
        name: 'Evening Gown / Formal Wear',
        prompt: 'Redress the person in the image in an elegant evening gown or a formal suit. The setting should look like a gala or a formal event. Preserve the original facial features.'
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        prompt: 'Reimagine the person in the image as a cyberpunk character. Add futuristic clothing, neon lighting effects, and subtle cybernetic enhancements, but keep the person recognizable.'
    },
    {
        id: 'fantasy-adventurer',
        name: 'Fantasy Adventurer',
        prompt: 'Change the person\'s clothing into that of a fantasy adventurer (like a ranger or a mage). Add a fitting, magical, or natural background while maintaining the person\'s face.'
    }
];
