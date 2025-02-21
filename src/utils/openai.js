import OpenAI from 'openai';

let openai = null;

// Initialize OpenAI client if API key is available
const initializeOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not found in environment variables');
    return null;
  }

  try {
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
};

openai = initializeOpenAI();

export const analyzeBrewData = async (brew) => {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please check your .env file and ensure VITE_OPENAI_API_KEY is set.");
  }

  if (!brew?.coffee || !brew?.grinder || !brew?.brewer) {
    throw new Error("Invalid brew data. Missing required relationships.");
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are a coffee expert. Analyze the brew data and provide suggestions in the following format:\n\n" +
                "1. Extraction Analysis:\n" +
                "   - Brief analysis of the ratio and time\n" +
                "2. Grind Adjustment:\n" +
                "   - Specific suggestion about grind size\n" +
                "3. Process Improvement:\n" +
                "   - One specific technique improvement\n" +
                "4. Next Steps:\n" +
                "   - Clear, actionable next step"
      }, {
        role: "user",
        content: `Please analyze this coffee brew:
          Coffee: ${brew.coffee.name} (${brew.coffee.country}, ${brew.coffee.region}, ${brew.coffee.roast} roast)
          Roast Date: ${brew.roast_date ? new Date(brew.roast_date.date).toLocaleDateString() : 'Unknown'}
          Grinder: ${brew.grinder.name} at ${brew.grind_size}
          Brewer: ${brew.brewer.name}
          Dose: ${brew.dose}g
          Yield: ${brew.yield}g
          Time: ${brew.brew_time}s
          Notes: ${brew.notes || 'No notes provided'}`
      }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    }
    throw new Error('Failed to get AI analysis. Please try again later.');
  }
};