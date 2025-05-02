import axios from "axios";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Интерфейс для параметров функции getRealEstateList
 */
interface RealEstateListParams {
  /** UUID города из списка городов */
  cityUUID?: string;
  /** Массив UUID классов недвижимости */
  propertyClasses?: string[];
  /** Массив UUID типов недвижимости */
  propertyTypes?: string[];
  /** Массив UUID объектов недвижимости */
  realEstates?: string[];
  /** Массив ID ипотечных программ */
  mortgagePrograms?: number[];
  /** Массив UUID типов планировок */
  placementLayoutTypes?: string[];
  /** Массив количества комнат */
  roomCounts?: number[];
  /** Минимальная цена в миллионах */
  priceInMillionMin?: number;
  /** Максимальная цена в миллионах */
  priceInMillionMax?: number;
  /** Минимальный этаж */
  floorMin?: number;
  /** Максимальный этаж */
  floorMax?: number;
  /** Минимальная площадь */
  squareMin?: number;
  /** Максимальная площадь */
  squareMax?: number;
  /** Фильтр для не первых этажей */
  isNotFirstFloors?: boolean[];
  /** Фильтр для не последних этажей */
  isNotLastFloors?: boolean[];
  /** Фильтр для ремонтов */
  repairs?: boolean[];
  /** Фильтр для готовых объектов */
  readies?: boolean[];
  /** Фильтр по годам готовности */
  readyYears?: number[];
  /** Фильтр по кварталам готовности */
  readyQuarters?: number[];
  /** Массив UUID комплексов */
  bigvilleUUIDs?: string[];
  /** Дополнительные теги фильтров */
  filterTags?: {
    placementStock?: boolean;
    terrace?: boolean;
    stock?: boolean;
  };
  /** Номер страницы для пагинации */
  pageNo?: number;
  /** Размер страницы для пагинации */
  pageSize?: number;
  /** Массив ID компаний */
  companyIds?: string[];
}

/**
 * Получает список объектов недвижимости на основе предоставленных фильтров
 */
function getRealEstateList({
  cityUUID,
  propertyClasses,
  propertyTypes,
  realEstates,
  mortgagePrograms,
  placementLayoutTypes,
  roomCounts,
  priceInMillionMin,
  priceInMillionMax,
  floorMin,
  floorMax,
  squareMin,
  squareMax,
  isNotFirstFloors,
  isNotLastFloors,
  repairs,
  readies,
  readyYears,
  readyQuarters,
  bigvilleUUIDs,
  filterTags,
  pageNo = 1,
  pageSize = 20,
  companyIds = ["4a9425ed-8abd-11ee-ab79-001dd8b7289a"]
}: RealEstateListParams = {}) {
  return axios.post("https://apigw.bi.group/sales-picker/microfe-v2/realEstateList", {
    cityUUID,
    propertyClasses,
    propertyTypes,
    realEstates,
    mortgagePrograms,
    placementLayoutTypes,
    roomCounts,
    priceInMillionMin,
    priceInMillionMax,
    floorMin,
    floorMax,
    squareMin,
    squareMax,
    isNotFirstFloors,
    isNotLastFloors,
    repairs,
    readies,
    readyYears,
    readyQuarters,
    bigvilleUUIDs,
    filterTags,
    pageNo,
    pageSize,
    companyIds
  }, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  })
  .then(res => res.data)
  .catch(error => {
    console.error("Ошибка при получении списка недвижимости:", error);
    throw error;
  });
}

/**
 * Пример функции, демонстрирующей использование getRealEstateList с функциональным вызовом OpenAI
 */
async function searchRealEstateWithAI(userQuery: string) {
  // Определить функцию для OpenAI
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

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "Вы - полезный ассистент, который помогает пользователям находить объекты недвижимости. Извлекайте параметры поиска из запроса пользователя."
    },
    { role: "user", content: userQuery }
  ]

  // Вызов OpenAI для получения параметров функции на основе запроса пользователя
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    tools,
    tool_choice: { type: "function", function: { name: "getRealEstateList" } }
  });
  const message = response.choices[0].message

  messages.push(message)

  if (message.tool_calls) {
    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    const results = await getRealEstateList(args);
    messages.push({
      role: "tool",
      content: JSON.stringify(results),
      tool_call_id: toolCall.id
    })
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
        throw new Error('Пустой ответ от OpenAI');
    }
    return responseContent;
  }
  
  return message
}

// Пример использования
searchRealEstateWithAI("Найди мне 2-комнатные квартиры в Астане с ценой между 20 и 40 миллионами, готовые в 2025 году")
  .then(results => console.log(results))
  .catch(error => console.error("Ошибка:", error));

export { getRealEstateList, searchRealEstateWithAI };