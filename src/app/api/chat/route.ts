import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { getRealEstateList } from '../../../get-real-estate';

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define tool for real estate search
const tools = [
  {
    type: "function" as const, 
    function: {
      name: "getRealEstateList",
      description: "Получить список объектов недвижимости на основе фильтров",
      parameters: {
        type: "object",
        properties: {
          cityUUID: {
            type: "string",
            description: "UUID города для поиска (Астана: 4c0fe725-4b6f-11e8-80cf-bb580b2abfef, Алматы: 6ba77338-4db7-11e8-80cf-bb580b2abfef, Актау: ed9bc955-8e26-11e8-80d0-00155da78938, Атырау: ed9bc954-8e26-11e8-80d0-00155da78938, Караганда: 7efa680c-5423-11e8-80d6-00155da7893d, Шымкент: cf5ad35a-9bc1-11e8-80d7-00155da7893d)"
          },
          propertyClasses: {
            type: "array",
            items: { type: "string" },
            description: "UUID классов недвижимости (Комфорт: 747ed03f-825f-11e3-a09c-0025906b4dd5, Бизнес: 8ca06bfc-6eed-11e3-a09c-0025906b4dd5, Премиум: 8ca06bfd-6eed-11e3-a09c-0025906b4dd5, Стандарт: 747ed03e-825f-11e3-a09c-0025906b4dd5, Комфорт+: 54f3b5b8-e393-11eb-a829-001dd8b726aa, Бизнес+: 5c1ac995-e393-11eb-a829-001dd8b726aa, Комфорт Р: a50b31e6-8e1d-4bc0-b3ed-d2ea4eedc7ec)"
          },
          propertyTypes: {
            type: "array", 
            items: { type: "string" },
            description: "UUID типов недвижимости (Квартира: 5990a172-812a-4fee-b4f5-c860cca824d7, Boxrooms: b1784137-5e10-405c-b95d-aca1c3803bd4, Коттеджи: eb845125-c2b7-4d8a-93d7-015080355f78, Офисы: f25589d6-e6f4-43b9-beac-d6698f86b0a3, Паркинги: fe0c5cbb-1dd7-4070-a62f-5e4871be2fa3)"
          },
          realEstates: {
            type: "array",
            items: { type: "string" },
            description: "UUID конкретных объектов недвижимости"
          },
          roomCounts: {
            type: "array",
            items: { type: "integer" },
            description: "Количество комнат (1, 2, 3, 4, 5)"
          },
          priceInMillionMin: {
            type: "number",
            description: "Минимальная цена в миллионах (от 12 до 439)"
          },
          priceInMillionMax: {
            type: "number", 
            description: "Максимальная цена в миллионах (от 12 до 439)"
          },
          floorMin: {
            type: "integer",
            description: "Минимальный этаж (от 1 до 25)"
          },
          floorMax: {
            type: "integer",
            description: "Максимальный этаж (от 1 до 25)"
          },
          squareMin: {
            type: "number",
            description: "Минимальная площадь в квадратных метрах (от 28.04 до 276.22)"
          },
          squareMax: {
            type: "number",
            description: "Максимальная площадь в квадратных метрах (от 28.04 до 276.22)"
          },
          isNotFirstFloors: {
            type: "array",
            items: { type: "boolean" },
            description: "Фильтр для не первых этажей (true/false)"
          },
          isNotLastFloors: {
            type: "array",
            items: { type: "boolean" },
            description: "Фильтр для не последних этажей (true/false)"
          },
          repairs: {
            type: "array",
            items: { type: "boolean" },
            description: "Фильтр для ремонтов (true/false)"
          },
          readies: {
            type: "array",
            items: { type: "boolean" },
            description: "Фильтр для готовых объектов (true/false)"
          },
          readyYears: {
            type: "array",
            items: { type: "integer" },
            description: "Годы, когда объекты будут готовы (2022, 2023, 2024, 2025, 2026)"
          },
          readyQuarters: {
            type: "array",
            items: { type: "integer" },
            description: "Кварталы готовности (1, 2, 3, 4)"
          },
          bigvilleUUIDs: {
            type: "array",
            items: { type: "string" },
            description: "UUID комплексов (например, Greenline: 94dec67e-6857-11ec-a81f-001dd8b72708, Capital Park: 0a5251e7-6858-11ec-a81f-001dd8b72708, Arena: cb80c07d-b6b8-11ee-a82d-001dd8b72708, Dream City: 05f24405-0392-11ef-a82d-001dd8b72708)"
          },
          placementLayoutTypes: {
            type: "array",
            items: { type: "string" },
            description: "UUID типов планировок (Линейка: 72009f59-c36a-11eb-a829-001dd8b726aa, Пистолет: 92674f6c-c36a-11eb-a829-001dd8b726aa, Бабочка: 9acde022-c36a-11eb-a829-001dd8b726aa, Уголок: a66afdd5-c36a-11eb-a829-001dd8b726aa, Косой уголок: b0942c0a-c36a-11eb-a829-001dd8b726aa)"
          },
          filterTags: {
            type: "object",
            properties: {
              placementStock: { type: "boolean" },
              terrace: { type: "boolean" },
              stock: { type: "boolean" }
            },
            description: "Дополнительные теги фильтров"
          },
          pageNo: {
            type: "integer",
            description: "Номер страницы для пагинации (по умолчанию: 1)"
          },
          pageSize: {
            type: "integer",
            description: "Количество элементов на странице (по умолчанию: 20)"
          }
        },
        required: []
      }
    }
  }
];

// Store conversation history
interface SessionData {
  messages: ChatCompletionMessageParam[];
}

const sessions = new Map<string, SessionData>();

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie or create a new one
    const sessionId = request.cookies.get('sessionId')?.value || crypto.randomUUID();
    
    // Get or create session data
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        messages: [
          {
            role: "system",
            content: "Вы - полезный ассистент, который помогает пользователям находить объекты недвижимости. Извлекайте параметры поиска из запроса пользователя и предоставляйте подробную информацию о найденных объектах недвижимости. Отвечайте на вопросы пользователя ясно и информативно. Всегда используйте Markdown для форматирования ответов. Используйте жирный шрифт для важных деталей, заголовки для разделов, и маркированные списки для перечисления объектов недвижимости или характеристик. Отвечайте только на русском языке."
          }
        ]
      });
    }
    const sessionData = sessions.get(sessionId)!;
    
    // Get message from request
    const { message } = await request.json();
    
    // Add user message to history
    sessionData.messages.push({ role: "user", content: message });
    
    // Call OpenAI to get function parameters
    const openaiResponse = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: sessionData.messages,
      tools,
      tool_choice: { type: "function", function: { name: "getRealEstateList" } }
    });
    
    const aiMessage = openaiResponse.choices[0].message;
    sessionData.messages.push(aiMessage);
    
    // Process tool calls if present
    if (aiMessage.tool_calls) {
      const toolCall = aiMessage.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      // Get real estate data
      const realEstateResults = await getRealEstateList(args);
      
      // Add function result to conversation
      sessionData.messages.push({
        role: "tool",
        content: JSON.stringify(realEstateResults),
        tool_call_id: toolCall.id
      });
      
      // Get final response
      const finalOpenaiResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: sessionData.messages,
      });
      
      const responseContent = finalOpenaiResponse.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Пустой ответ от OpenAI');
      }
      
      // Add assistant's response to history
      sessionData.messages.push({ role: "assistant", content: responseContent });
      
      // Create response with cookie
      const apiResponse = NextResponse.json({ message: responseContent });
      apiResponse.cookies.set('sessionId', sessionId, { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return apiResponse;
    }
    
    // If no tool calls, return the message directly
    const responseContent = aiMessage.content || "Извините, я не смог понять ваш запрос.";
    
    // Add assistant's response to history
    sessionData.messages.push({ role: "assistant", content: responseContent });
    
    // Create response with cookie
    const apiResponse = NextResponse.json({ message: responseContent });
    apiResponse.cookies.set('sessionId', sessionId, { 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    return apiResponse;
    
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 