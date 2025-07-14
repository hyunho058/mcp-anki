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

async function main() {
  const session = new MCPSession({
    name: 'anki',
    version: '0.1.0',
    tools: [list_decks, create_deck, add_note, add_card, find_cards, get_card_info],
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
