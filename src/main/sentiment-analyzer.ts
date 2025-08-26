export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export class SentimentAnalyzer {
  private positiveWords = [
    'love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful',
    'perfect', 'best', 'good', 'nice', 'helpful', 'useful', 'brilliant', 'outstanding',
    'impressive', 'incredible', 'superb', 'terrific', 'fabulous', 'marvelous',
    'thank', 'thanks', 'appreciate', 'grateful', 'happy', 'excited', 'thrilled',
    'satisfied', 'pleased', 'delighted', 'joy', 'wonderful', 'beautiful', 'stunning'
  ];

  private negativeWords = [
    'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing',
    'frustrated', 'angry', 'upset', 'sad', 'disappointed', 'annoyed', 'irritated',
    'disgusting', 'ridiculous', 'stupid', 'useless', 'waste', 'problem', 'issue',
    'broken', 'failed', 'wrong', 'error', 'mistake', 'poor', 'cheap', 'expensive',
    'difficult', 'hard', 'complicated', 'confusing', 'disagree', 'dislike'
  ];

  private neutralWords = [
    'okay', 'fine', 'alright', 'maybe', 'perhaps', 'possibly', 'might', 'could',
    'would', 'should', 'think', 'believe', 'feel', 'seem', 'appear', 'look',
    'sound', 'taste', 'smell', 'touch', 'see', 'hear', 'know', 'understand'
  ];

  analyzeSentiment(text: string): SentimentResult {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.positiveWords.includes(cleanWord)) {
        positiveCount++;
      } else if (this.negativeWords.includes(cleanWord)) {
        negativeCount++;
      } else if (this.neutralWords.includes(cleanWord)) {
        neutralCount++;
      }
    });

    const total = words.length;
    const positiveScore = positiveCount / total;
    const negativeScore = negativeCount / total;
    const neutralScore = neutralCount / total;

    let sentiment: 'positive' | 'negative' | 'neutral';
    let score: number;
    let confidence: number;

    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      sentiment = 'positive';
      score = positiveScore;
      confidence = positiveScore;
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      sentiment = 'negative';
      score = -negativeScore;
      confidence = negativeScore;
    } else {
      sentiment = 'neutral';
      score = 0;
      confidence = neutralScore;
    }

    return {
      sentiment,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  async analyzeSentimentWithAI(text: string): Promise<SentimentResult> {
    // This would integrate with Ollama for more sophisticated analysis
    // For now, return the basic analysis
    return this.analyzeSentiment(text);
  }
} 