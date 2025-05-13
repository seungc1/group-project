export const processAudio = async (audioUrl) => {
  try {
    const response = await fetch('http://localhost:5000/api/process-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to process audio');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}; 