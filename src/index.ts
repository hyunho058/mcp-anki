import { MCPSession, Tool } from '@mcp-sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';

// AnkiConnect API endpoint
const ANKI_CONNECT_URL = 'http://localhost:8765';

// AnkiConnect 요청 함수
async function ankiRequest(action: string, params: any = {}) {
  const body = {
    action,
    version: 6,
    params,
  };
  const { data } = await axios.post<any>(ANKI_CONNECT_URL, body);
  if (data.error) throw new Error(data.error);
  return data.result;
}

const list_decks: Tool<undefined> = {
  name: 'list_decks',
  description: 'Get a list of all Anki decks.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const decks = await ankiRequest('deckNames');
      return { content: [{ type: 'text', text: JSON.stringify(decks) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const add_note: Tool<undefined> = {
  name: 'add_note',
  description: 'Add a note to a specific deck.',
  parameters: z.object({
    deckName: z.string().describe('The name of the deck.'),
    modelName: z.string().describe('The note type/model name.'),
    fields: z.record(z.string()).describe('The fields for the note.'),
    tags: z.array(z.string()).optional().describe('Tags for the note.'),
  }),
  execute: async ({ deckName, modelName, fields, tags }) => {
    try {
      const note = {
        deckName,
        modelName,
        fields,
        tags: tags || [],
        options: { allowDuplicate: false },
      };
      const result = await ankiRequest('addNote', { note });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const find_cards: Tool<undefined> = {
  name: 'find_cards',
  description: 'Find cards by query.',
  parameters: z.object({
    query: z.string().describe('The search query (e.g., "deck:Default").'),
  }),
  execute: async ({ query }) => {
    try {
      const cardIds = await ankiRequest('findCards', { query });
      return { content: [{ type: 'text', text: JSON.stringify(cardIds) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const get_card_info: Tool<undefined> = {
  name: 'get_card_info',
  description: 'Get info for specific card IDs.',
  parameters: z.object({
    cardIds: z.array(z.number()).describe('Array of card IDs.'),
  }),
  execute: async ({ cardIds }) => {
    try {
      const info = await ankiRequest('cardsInfo', { cards: cardIds });
      return { content: [{ type: 'text', text: JSON.stringify(info) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const create_deck: Tool<undefined> = {
  name: 'create_deck',
  description: 'Create a new deck in Anki.',
  parameters: z.object({
    deckName: z.string().describe('The name of the new deck.'),
  }),
  execute: async ({ deckName }) => {
    try {
      const result = await ankiRequest('createDeck', { deck: deckName });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const add_card: Tool<undefined> = {
  name: 'add_card',
  description: 'Add a card (note) to a specific deck.',
  parameters: z.object({
    deckName: z.string().describe('The name of the deck.'),
    modelName: z.string().describe('The note type/model name.'),
    fields: z.record(z.string()).describe('The fields for the note.'),
    tags: z.array(z.string()).optional().describe('Tags for the note.'),
  }),
  execute: async ({ deckName, modelName, fields, tags }) => {
    try {
      const note = {
        deckName,
        modelName,
        fields,
        tags: tags || [],
        options: { allowDuplicate: false },
      };
      const result = await ankiRequest('addNote', { note });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const get_today_cards: Tool<undefined> = {
  name: 'get_today_cards',
  description: 'Get today\'s cards to study from a specific deck.',
  parameters: z.object({
    deckName: z.string().describe('The name of the deck to check for today\'s cards.'),
  }),
  execute: async ({ deckName }) => {
    try {
      // Get today's cards for the specific deck
      const todayCards = await ankiRequest('getDueCards', { deck: deckName });
      
      if (todayCards.length === 0) {
        return { content: [{ type: 'text', text: `No cards due today in deck "${deckName}"` }] };
      }
      
      // Get detailed info for today's cards
      const cardInfo = await ankiRequest('cardsInfo', { cards: todayCards });
      
      const result = {
        deckName,
        totalDueToday: todayCards.length,
        cards: cardInfo.map((card: any) => ({
          cardId: card.cardId,
          noteId: card.noteId,
          fields: card.fields,
          due: card.due,
          interval: card.interval,
          ease: card.ease
        }))
      };
      
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const answer_card: Tool<undefined> = {
  name: 'answer_card',
  description: 'Answer a card (mark as reviewed) with a specific ease level.',
  parameters: z.object({
    cardId: z.number().describe('The ID of the card to answer.'),
    ease: z.number().describe('Ease level: 1=Again, 2=Hard, 3=Good, 4=Easy'),
  }),
  execute: async ({ cardId, ease }) => {
    try {
      const result = await ankiRequest('answerCards', {
        answers: [{ cardId, ease }]
      });
      
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const update_card_interval: Tool<undefined> = {
  name: 'update_card_interval',
  description: 'Directly modify a card\'s interval and ease factor.',
  parameters: z.object({
    cardId: z.number().describe('The ID of the card to update.'),
    interval: z.number().describe('New interval in days.'),
    easeFactor: z.number().optional().describe('New ease factor (optional).'),
  }),
  execute: async ({ cardId, interval, easeFactor }) => {
    try {
      const params: any = {
        cards: [cardId],
        intervals: [interval]
      };
      
      if (easeFactor !== undefined) {
        params.easeFactors = [easeFactor];
      }
      
      const result = await ankiRequest('setSpecificValueOfCard', params);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const get_study_progress: Tool<undefined> = {
  name: 'get_study_progress',
  description: 'Get study progress and statistics for a specific deck.',
  parameters: z.object({
    deckName: z.string().describe('The name of the deck to get progress for.'),
  }),
  execute: async ({ deckName }) => {
    try {
      // Get deck statistics
      const deckStats = await ankiRequest('getDeckStats', { decks: [deckName] });
      
      // Get today's study data
      const todayStats = await ankiRequest('getCollectionStatsHtml');
      
      // Get cards due today
      const dueCards = await ankiRequest('getDueCards', { deck: deckName });
      
      // Get cards due in the future
      const futureDueCards = await ankiRequest('getDueCards', { deck: deckName, days: 7 });
      
      const result = {
        deckName,
        statistics: deckStats[deckName] || {},
        totalDueToday: dueCards.length,
        totalDueThisWeek: futureDueCards.length,
        todayStats: todayStats
      };
      
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const suspend_card: Tool<undefined> = {
  name: 'suspend_card',
  description: 'Suspend or unsuspend a card (temporarily disable from reviews).',
  parameters: z.object({
    cardId: z.number().describe('The ID of the card to suspend/unsuspend.'),
    suspend: z.boolean().describe('True to suspend, false to unsuspend.'),
  }),
  execute: async ({ cardId, suspend }) => {
    try {
      const action = suspend ? 'suspend' : 'unsuspend';
      const result = await ankiRequest(action, { cards: [cardId] });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const create_study_session: Tool<undefined> = {
  name: 'create_study_session',
  description: 'Create a study session with variation questions for today\'s cards.',
  parameters: z.object({
    deckName: z.string().describe('The name of the deck to study.'),
    maxCards: z.number().optional().describe('Maximum number of cards to include in session (default: 20).'),
  }),
  execute: async ({ deckName, maxCards = 20 }) => {
    try {
      // Get today's cards
      const todayCards = await ankiRequest('getDueCards', { deck: deckName });
      
      if (todayCards.length === 0) {
        return { content: [{ type: 'text', text: `No cards due today in deck "${deckName}"` }] };
      }
      
      // Limit cards for session
      const sessionCards = todayCards.slice(0, maxCards);
      
      // Get detailed card info
      const cardInfo = await ankiRequest('cardsInfo', { cards: sessionCards });
      
      // Create variation questions for each card
      const studySession = cardInfo.map((card: any) => {
        const fields = card.fields;
        const front = fields.Front?.value || fields.Question?.value || '';
        const back = fields.Back?.value || fields.Answer?.value || '';
        
        // Generate variation questions
        const variations = generateVariationQuestions(front, back);
        
        return {
          cardId: card.cardId,
          noteId: card.noteId,
          originalFront: front,
          originalBack: back,
          variations: variations,
          isCompleted: false,
          correctAnswers: 0,
          totalAttempts: 0
        };
      });
      
      const result = {
        deckName,
        sessionId: Date.now().toString(),
        totalCards: studySession.length,
        cards: studySession,
        createdAt: new Date().toISOString()
      };
      
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const submit_answer: Tool<undefined> = {
  name: 'submit_answer',
  description: 'Submit an answer for a variation question and get feedback.',
  parameters: z.object({
    cardId: z.number().describe('The ID of the card being answered.'),
    questionIndex: z.number().describe('Index of the variation question (0-3).'),
    userAnswer: z.string().describe('The user\'s answer to the question.'),
    sessionId: z.string().describe('The study session ID.'),
  }),
  execute: async ({ cardId, questionIndex, userAnswer, sessionId }) => {
    try {
      // Get card info
      const cardInfo = await ankiRequest('cardsInfo', { cards: [cardId] });
      const card = cardInfo[0];
      const fields = card.fields;
      const originalBack = fields.Back?.value || fields.Answer?.value || '';
      
      // Get the variation question
      const variations = generateVariationQuestions(
        fields.Front?.value || fields.Question?.value || '',
        originalBack
      );
      
      const question = variations[questionIndex];
      const isCorrect = evaluateAnswer(userAnswer, question.correctAnswer, originalBack);
      
      // Determine ease level based on performance
      let ease = 3; // Default: Good
      if (isCorrect) {
        ease = 4; // Easy
      } else {
        ease = 1; // Again
      }
      
      const result = {
        cardId,
        questionIndex,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        feedback: isCorrect ? "정답입니다! 🎉" : `틀렸습니다. 정답: ${question.correctAnswer}`,
        ease,
        sessionId
      };
      
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

const complete_card_study: Tool<undefined> = {
  name: 'complete_card_study',
  description: 'Complete studying a card and update its review status.',
  parameters: z.object({
    cardId: z.number().describe('The ID of the card to complete.'),
    ease: z.number().describe('Ease level: 1=Again, 2=Hard, 3=Good, 4=Easy'),
    sessionId: z.string().describe('The study session ID.'),
  }),
  execute: async ({ cardId, ease, sessionId }) => {
    try {
      // Answer the card in Anki
      const result = await ankiRequest('answerCards', {
        answers: [{ cardId, ease }]
      });
      
      const completionResult = {
        cardId,
        ease,
        sessionId,
        completedAt: new Date().toISOString(),
        ankiResult: result,
        message: `Card ${cardId} completed with ease level ${ease}`
      };
      
      return { content: [{ type: 'text', text: JSON.stringify(completionResult, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  },
};

// Helper function to generate variation questions
function generateVariationQuestions(front: string, back: string): any[] {
  const variations = [];
  
  // Variation 1: Fill in the blank
  if (back.length > 10) {
    const words = back.split(' ');
    if (words.length > 2) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const blankedAnswer = words.map((word, index) => 
        index === randomIndex ? '_____' : word
      ).join(' ');
      variations.push({
        type: 'fill_blank',
        question: `${front}\n\n빈칸을 채우세요: ${blankedAnswer}`,
        correctAnswer: words[randomIndex]
      });
    }
  }
  
  // Variation 2: Multiple choice (simplified)
  variations.push({
    type: 'multiple_choice',
    question: `${front}\n\n다음 중 올바른 답은?\nA) ${back}\nB) ${generateWrongAnswer(back)}\nC) ${generateWrongAnswer(back)}`,
    correctAnswer: back
  });
  
  // Variation 3: Paraphrase
  variations.push({
    type: 'paraphrase',
    question: `${front}\n\n다른 표현으로 답해보세요:`,
    correctAnswer: back
  });
  
  // Variation 4: Context question
  variations.push({
    type: 'context',
    question: `${front}\n\n이 개념을 한 문장으로 설명해보세요:`,
    correctAnswer: back
  });
  
  return variations;
}

// Helper function to generate wrong answers
function generateWrongAnswer(correctAnswer: string): string {
  const wrongAnswers = [
    correctAnswer + ' (아님)',
    correctAnswer.split('').reverse().join(''),
    correctAnswer.substring(0, Math.floor(correctAnswer.length / 2)),
    '틀린 답'
  ];
  return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
}

// Helper function to evaluate answers
function evaluateAnswer(userAnswer: string, expectedAnswer: string, originalAnswer: string): boolean {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const userNormalized = normalize(userAnswer);
  const expectedNormalized = normalize(expectedAnswer);
  const originalNormalized = normalize(originalAnswer);
  
  // Check if user answer matches expected answer or original answer
  return userNormalized.includes(expectedNormalized) || 
         expectedNormalized.includes(userNormalized) ||
         userNormalized.includes(originalNormalized) ||
         originalNormalized.includes(userNormalized);
}

async function main() {
  const session = new MCPSession({
    name: 'anki',
    version: '0.1.0',
    tools: [
      list_decks, 
      create_deck, 
      add_note, 
      add_card, 
      find_cards, 
      get_card_info, 
      get_today_cards,
      answer_card,
      update_card_interval,
      get_study_progress,
      suspend_card,
      create_study_session,
      submit_answer,
      complete_card_study
    ],
    resources: [],
    resourcesTemplates: [],
    prompts: [],
  });

  const transport = new StdioServerTransport();
  await session.connect(transport);
  await transport.start();

  console.log('Anki MCP server running over stdio.');
}

main().catch(console.error);
