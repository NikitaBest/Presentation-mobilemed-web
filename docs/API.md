{
  "x-generator": "NSwag v14.2.0.0 (NJsonSchema v11.1.0.0 (Newtonsoft.Json v13.0.0.0))",
  "openapi": "3.0.0",
  "info": {
    "title": "MobileMed Retail API",
    "description": "Локализация ru/en: login locale → JWT; анонимные GET — Accept-Language. docs/localization_locale_contract.md",
    "version": "v1"
  },
  "servers": [
    {
      "url": "https://demo-backend.mobilemed.ai"
    }
  ],
  "paths": {
    "/scan/rppg-scan/{scanId}/report-text": {
      "get": {
        "tags": [
          "Scan"
        ],
        "summary": "Тест: текстовый отчёт по скану RPPG",
        "description": "Возвращает JSON с culture из скана и plain text отчёта на языке скана (переводы биомаркеров). Для plain text: GET .../report-text/plain",
        "operationId": "ApiEndpointsScanGetRppgScanReportTextGetRppgScanReportTextEndpoint",
        "parameters": [
          {
            "name": "scanId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "guid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfRppgScanReportResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/scan/rppg-scan/{scanId}/report-text/plain": {
      "get": {
        "tags": [
          "Scan"
        ],
        "summary": "Тест: plain text отчёт по скану RPPG",
        "operationId": "ApiEndpointsScanGetRppgScanReportTextGetRppgScanReportTextPlainEndpoint",
        "parameters": [
          {
            "name": "scanId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "guid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/scan/get": {
      "get": {
        "tags": [
          "Scan"
        ],
        "summary": "Получение истории сканов пользователя",
        "description": "Список сканов с Transcripts и HealthScore. В Scan — culture скана (фиксируется при сохранении). См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsScanGetLastScanGetScansEndpoint",
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfPagedListOfSaveRppgSсanResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/user/update": {
      "put": {
        "tags": [
          "User"
        ],
        "summary": "Редактирование пользователя",
        "description": "",
        "operationId": "ApiEndpointsUserUpdateUserUpdateUserEntpoint",
        "requestBody": {
          "x-name": "UpdateUserRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicationModelsUserUpdateUserRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfUserEntity"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/user/get": {
      "post": {
        "tags": [
          "User"
        ],
        "summary": "Получение данных пользователя",
        "description": "",
        "operationId": "ApiEndpointsUserGetUserGetUserEndpoint",
        "requestBody": {
          "x-name": "GetUserRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicationModelsUserGetUserRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfPagedListOfUserEntity"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/user/me": {
      "get": {
        "tags": [
          "User"
        ],
        "summary": "Получение данных текущего пользователя",
        "description": "Возвращает данные пользователя на основе JWT токена",
        "operationId": "ApiEndpointsUserGetMeGetMeEndpoint",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfUserEntity"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/exclude-products/save-for-user": {
      "post": {
        "tags": [
          "Exclude-Products"
        ],
        "summary": "Сохранение продуктов в исключения",
        "description": "Полностью перезаписывает список исключений текущего пользователя; пустой список очищает исключения",
        "operationId": "ApiEndpointsUserAddUserExcludeProductsSaveUserExcludeProductsEndpoint",
        "requestBody": {
          "x-name": "AddUserExcludeProductsRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicationModelsUserExcludeProductsAddUserExcludeProductsRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfAddUserExcludeProductsResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/exclude-products/get-for-user": {
      "get": {
        "tags": [
          "Exclude-Products"
        ],
        "summary": "Получение продуктов-исключений пользователя",
        "description": "Возвращает список всех продуктов, добавленных пользователем в исключения",
        "operationId": "ApiEndpointsUserGetUserExcludeProductsGetUserExcludeProductsEndpoint",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfIReadOnlyListOfString"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/exclude-products/get": {
      "get": {
        "tags": [
          "Exclude-Products"
        ],
        "summary": "Получение списка продуктов-исключений",
        "description": "Справочник с поиском по названию. Язык — JWT claim Locale. См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsUserGetExcludeProductsGetExcludeProductsEndpoint",
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string",
              "nullable": true
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfPagedListOfExcludeProductDto"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Регистрация по email и паролю",
        "description": "Создаёт пользователя через ASP.NET Identity (UserManager). В ответе — JWT, как при login. Опционально locale (ru/en) для claim Locale.",
        "operationId": "ApiEndpointsAuthenticationRegisterRegisterEndpoint",
        "requestBody": {
          "x-name": "EmailRegisterRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicationModelsAuthEmailRegisterRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApplicationModelsAuthLoginResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/auth/refresh-token": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Обновление JWT токена",
        "description": "Обновляет JWT; claim Locale берётся из текущего токена. Чтобы сменить язык, выполните login с новым locale. См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsAuthenticationRefreshRefreshTokenEndpoint",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApplicationModelsAuthLoginResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Авторизация по email и паролю",
        "description": "В теле запроса: email, password; опционально locale (ru/en) — попадает в JWT (claim Locale). Подробнее: docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsAuthenticationLoginLoginEndpoint",
        "requestBody": {
          "x-name": "LoginRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicationModelsAuthLoginRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApplicationModelsAuthLoginResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/assortment/products/{id}/active": {
      "patch": {
        "tags": [
          "Assortment"
        ],
        "summary": "Изменение активности товара",
        "description": "Включает или отключает активность товара (IsActive)",
        "operationId": "ApiEndpointsAssortmentSetProductActiveSetProductActiveEndpoint",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "x-name": "SetProductActiveRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAssortmentSetProductActiveSetProductActiveRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfBoolean"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/assortment/products": {
      "get": {
        "tags": [
          "Assortment"
        ],
        "summary": "Получение товаров с фильтрацией",
        "description": "Анонимный endpoint: язык ответа задаётся заголовком Accept-Language (ru/en), при отсутствии — ru. Авторизованные клиенты могут передавать Bearer JWT (claim Locale). См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsAssortmentGetProductsGetProductsEndpoint",
        "parameters": [
          {
            "name": "categoryIds",
            "in": "query",
            "style": "form",
            "explode": true,
            "schema": {
              "type": "array",
              "nullable": true,
              "items": {
                "type": "integer",
                "format": "int32"
              }
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 50
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfPagedListOfProductDto"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/assortment/categories": {
      "get": {
        "tags": [
          "Assortment"
        ],
        "summary": "Получение категорий с товарами",
        "description": "Анонимный endpoint: язык — Accept-Language (ru/en), иначе ru. См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsAssortmentGetCategoriesGetCategoriesEndpoint",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfListOfCategoryDto"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/user/feedback": {
      "post": {
        "tags": [
          "User"
        ],
        "summary": "Сохранение фидбека пользователя",
        "description": "Сохраняет JSON-фидбек текущего пользователя в базу данных.",
        "operationId": "ApiEndpointsAppSaveUserFeedbackSaveUserFeedbackEndpoint",
        "requestBody": {
          "x-name": "SaveUserFeedbackRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppSaveUserFeedbackSaveUserFeedbackRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfUserFeedbackEntity"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/scan/save-rppg": {
      "post": {
        "tags": [
          "Scan"
        ],
        "summary": "Сохранение результата сканирования Rppg",
        "description": "Сохраняет результат Binah SDK; culture скана — из JWT (claim Locale). См. docs/localization_locale_contract.md",
        "operationId": "ApiEndpointsAppSaveRppgScanSaveRppgScanEndpoint",
        "requestBody": {
          "x-name": "SaveRppgScanRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppSaveRppgScanSaveRppgScanRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfSaveRppgSсanResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/app/stat-event": {
      "post": {
        "tags": [
          "App"
        ],
        "summary": "Сохранение события статистики",
        "description": "Сохраняет событие использования приложения для аналитики",
        "operationId": "ApiEndpointsAppSaveStatEventSaveStatEventEndpoint",
        "requestBody": {
          "x-name": "SaveStatEventRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppSaveStatEventSaveStatEventRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfStatEventEntity"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/app/send-error": {
      "post": {
        "tags": [
          "App"
        ],
        "summary": "Отправка ошибки",
        "description": "Отправка ошибки",
        "operationId": "ApiEndpointsAppSaveStatEventSendErrorEndpoint",
        "requestBody": {
          "x-name": "SendErrorRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppSaveStatEventSendErrorRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "204": {
            "description": "No Content"
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWTBearerAuth": []
          },
          {
            "Bearer": []
          }
        ]
      }
    },
    "/app/save-log": {
      "post": {
        "tags": [
          "App"
        ],
        "summary": "Сохранение лога фронтенда",
        "description": "Публичный метод. При передаче валидного Bearer-токена в запись добавляется UserId. LogSource всегда frontend.",
        "operationId": "ApiEndpointsAppSaveFrontendLogSaveFrontendLogEndpoint",
        "requestBody": {
          "x-name": "SaveFrontendLogRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppSaveFrontendLogSaveFrontendLogRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SharedContractsResultOfLogEntity"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/app/openrouter/texts": {
      "post": {
        "tags": [
          "App"
        ],
        "summary": "OpenRouter: обработка списка текстов",
        "description": "Тело запроса содержит массив строк; они передаются модели как отдельные фрагменты. В ответе — один текст от модели.",
        "operationId": "ApiEndpointsAppOpenRouterTextsOpenRouterTextsEndpoint",
        "requestBody": {
          "x-name": "OpenRouterTextsRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppOpenRouterTextsOpenRouterTextsRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiEndpointsAppOpenRouterTextsOpenRouterTextsResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    },
    "/app/health-check": {
      "post": {
        "tags": [
          "App"
        ],
        "summary": "Проверка состояния приложения",
        "description": "Если вернула 200, значит приложение в рабочем состоянии. Иначе - ошибка работы приложения или недоступность приложения",
        "operationId": "ApiEndpointsAppHealthCheckHealthCheckEndpoint",
        "requestBody": {
          "x-name": "HealthCheckRequest",
          "description": "",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApiEndpointsAppHealthCheckHealthCheckRequest"
              }
            }
          },
          "required": true,
          "x-position": 1
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApiEndpointsAppHealthCheckHealthCheckResponse"
                }
              }
            }
          }
        },
        "security": [
          {
            "Bearer": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "SharedContractsResultOfRppgScanReportResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/ApplicationModelsRppgScanRppgScanReportResponse"
                  }
                ]
              }
            }
          }
        ]
      },
      "ApplicationModelsRppgScanRppgScanReportResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "scanId": {
            "type": "string",
            "format": "guid"
          },
          "culture": {
            "type": "string"
          },
          "reportText": {
            "type": "string"
          }
        }
      },
      "SharedContractsResult": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "isSuccess": {
            "type": "boolean"
          },
          "error": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "ApiEndpointsScanGetRppgScanReportTextGetRppgScanReportTextRequest": {
        "type": "object",
        "additionalProperties": false
      },
      "SharedContractsResultOfPagedListOfSaveRppgSсanResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureModelsPagedListOfSaveRppgSсanResponse"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureModelsPagedListOfSaveRppgSсanResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32"
          },
          "totalPages": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32"
          },
          "hasPrevious": {
            "type": "boolean"
          },
          "hasNext": {
            "type": "boolean"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ApplicationModelsRppgScanSaveRppgSсanResponse"
            }
          }
        }
      },
      "ApplicationModelsRppgScanSaveRppgSсanResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "healthScore": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "scan": {
            "nullable": true,
            "oneOf": [
              {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserRppgScanEntity"
              }
            ]
          },
          "transcripts": {
            "type": "array",
            "nullable": true,
            "items": {
              "$ref": "#/components/schemas/ApplicationModelsRppgScanScanTranscriptItem"
            }
          }
        }
      },
      "InfrastructureDbAppEntitiesUserRppgScanEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "userId": {
                "type": "string",
                "format": "guid"
              },
              "name": {
                "type": "string",
                "nullable": true
              },
              "age": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "height": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "weight": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "gender": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesGender"
                  }
                ]
              },
              "smokeStatus": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesSmokeStatus"
                  }
                ]
              },
              "sdkResult": {
                "type": "string",
                "nullable": true
              },
              "status": {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesRppgScanStatus"
              },
              "resultItems": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserRppgScanResultItemEntity"
                }
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesGender": {
        "type": "integer",
        "description": "",
        "x-enumNames": [
          "Male",
          "Female"
        ],
        "enum": [
          0,
          1
        ]
      },
      "InfrastructureDbAppEntitiesSmokeStatus": {
        "type": "integer",
        "description": "",
        "x-enumNames": [
          "NotSmoking",
          "Smoking"
        ],
        "enum": [
          0,
          1
        ]
      },
      "InfrastructureDbAppEntitiesRppgScanStatus": {
        "type": "integer",
        "description": "",
        "x-enumNames": [
          "New",
          "InProgress",
          "Failed",
          "Completed"
        ],
        "enum": [
          0,
          1,
          2,
          3
        ]
      },
      "InfrastructureDbAppEntitiesUserRppgScanResultItemEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "scanId": {
                "type": "string",
                "format": "guid"
              },
              "key": {
                "type": "string",
                "maxLength": 30
              },
              "value": {
                "type": "number",
                "format": "decimal"
              },
              "confidenceLevel": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "unit": {
                "type": "string",
                "maxLength": 30,
                "nullable": true
              }
            }
          }
        ]
      },
      "InfrastructureDbBaseEntity": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
            "format": "guid"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApplicationModelsRppgScanScanTranscriptItem": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "key": {
            "type": "string"
          },
          "value": {
            "type": "number",
            "format": "decimal"
          },
          "valueAlias": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "string",
            "nullable": true
          },
          "color": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "unit": {
            "type": "string"
          },
          "descriptionUser": {
            "type": "string"
          },
          "commentUser": {
            "type": "string"
          },
          "confidenceLevel": {
            "type": "integer",
            "format": "int32"
          },
          "scaleMetadata": {
            "$ref": "#/components/schemas/ApplicationModelsRppgScanScanResultScaleData"
          }
        }
      },
      "ApplicationModelsRppgScanScanResultScaleData": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "valuePercentLabel": {
            "type": "integer",
            "format": "int32"
          },
          "biomarkerScore": {
            "type": "integer",
            "format": "int32"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ApplicationModelsRppgScanScanResultScaleDataItem"
            }
          }
        }
      },
      "ApplicationModelsRppgScanScanResultScaleDataItem": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "from": {
            "type": "number",
            "format": "double"
          },
          "to": {
            "type": "number",
            "format": "double"
          },
          "percentFrom": {
            "type": "integer",
            "format": "int32"
          },
          "percentTo": {
            "type": "integer",
            "format": "int32"
          },
          "color": {
            "type": "string"
          },
          "fromToAlias": {
            "type": "string",
            "nullable": true
          },
          "valueAlias": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "ApplicationModelsRppgScanGetScansHistoryRequest": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedModelsPagination"
          },
          {
            "type": "object",
            "additionalProperties": false
          }
        ]
      },
      "SharedModelsPagination": {
        "type": "object",
        "x-abstract": true,
        "additionalProperties": false
      },
      "SharedContractsResultOfUserEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesUserEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/MicrosoftAspNetCoreIdentityIdentityUserOfGuid"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "id": {
                "type": "string",
                "format": "guid"
              },
              "profile": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserProfileEntity"
                  }
                ]
              },
              "createdAt": {
                "type": "string",
                "format": "date-time"
              },
              "createdById": {
                "type": "string",
                "format": "guid",
                "nullable": true
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "updatedById": {
                "type": "string",
                "format": "guid",
                "nullable": true
              },
              "deletedAt": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "deletedById": {
                "type": "string",
                "format": "guid",
                "nullable": true
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesUserProfileEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "userId": {
                "type": "string",
                "format": "guid"
              },
              "availableRppgScans": {
                "type": "integer",
                "format": "int32"
              },
              "availableSkinScans": {
                "type": "integer",
                "format": "int32"
              },
              "age": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "height": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "weight": {
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "gender": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesGender"
                  }
                ]
              },
              "smokeStatus": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesSmokeStatus"
                  }
                ]
              },
              "confirmedPolicyAndDocuments": {
                "type": "boolean",
                "nullable": true
              },
              "utmSource": {
                "type": "string",
                "nullable": true
              }
            }
          }
        ]
      },
      "MicrosoftAspNetCoreIdentityIdentityUserOfGuid": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
            "format": "guid"
          },
          "userName": {
            "type": "string",
            "nullable": true
          },
          "normalizedUserName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "normalizedEmail": {
            "type": "string",
            "nullable": true
          },
          "emailConfirmed": {
            "type": "boolean"
          },
          "passwordHash": {
            "type": "string",
            "nullable": true
          },
          "securityStamp": {
            "type": "string",
            "nullable": true
          },
          "concurrencyStamp": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "phoneNumberConfirmed": {
            "type": "boolean"
          },
          "twoFactorEnabled": {
            "type": "boolean"
          },
          "lockoutEnd": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "lockoutEnabled": {
            "type": "boolean"
          },
          "accessFailedCount": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "ApplicationModelsUserUpdateUserRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "age": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "height": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "weight": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "gender": {
            "nullable": true,
            "oneOf": [
              {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesGender"
              }
            ]
          },
          "smokeStatus": {
            "nullable": true,
            "oneOf": [
              {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesSmokeStatus"
              }
            ]
          },
          "confirmedPolicyAndDocuments": {
            "type": "boolean",
            "nullable": true
          }
        }
      },
      "SharedContractsResultOfPagedListOfUserEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureModelsPagedListOfUserEntity"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureModelsPagedListOfUserEntity": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32"
          },
          "totalPages": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32"
          },
          "hasPrevious": {
            "type": "boolean"
          },
          "hasNext": {
            "type": "boolean"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
            }
          }
        }
      },
      "ApplicationModelsUserGetUserRequest": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedModelsPagination"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "ids": {
                "type": "array",
                "nullable": true,
                "items": {
                  "type": "string",
                  "format": "guid"
                }
              },
              "search": {
                "type": "string",
                "nullable": true
              },
              "order": {
                "type": "string",
                "nullable": true
              }
            }
          }
        ]
      },
      "SharedContractsResultOfAddUserExcludeProductsResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/ApplicationModelsUserExcludeProductsAddUserExcludeProductsResponse"
                  }
                ]
              }
            }
          }
        ]
      },
      "ApplicationModelsUserExcludeProductsAddUserExcludeProductsResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "addedCount": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "ApplicationModelsUserExcludeProductsAddUserExcludeProductsRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "products"
        ],
        "properties": {
          "products": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "SharedContractsResultOfIReadOnlyListOfString": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "type": "array",
                "nullable": true,
                "items": {
                  "type": "string"
                }
              }
            }
          }
        ]
      },
      "SharedContractsResultOfPagedListOfExcludeProductDto": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureModelsPagedListOfExcludeProductDto"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureModelsPagedListOfExcludeProductDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32"
          },
          "totalPages": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32"
          },
          "hasPrevious": {
            "type": "boolean"
          },
          "hasNext": {
            "type": "boolean"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ApplicationModelsUserExcludeProductsExcludeProductDto"
            }
          }
        }
      },
      "ApplicationModelsUserExcludeProductsExcludeProductDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
            "format": "guid"
          },
          "productName": {
            "type": "string"
          }
        }
      },
      "ApplicationModelsUserExcludeProductsGetExcludeProductsRequest": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedModelsPagination"
          },
          {
            "type": "object",
            "additionalProperties": false
          }
        ]
      },
      "ApplicationModelsAuthLoginResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "user": {
            "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
          },
          "token": {
            "type": "string"
          }
        }
      },
      "ApplicationModelsAuthEmailRegisterRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "utm": {
            "type": "string",
            "nullable": true
          },
          "locale": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "ApplicationModelsAuthLoginRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "utm": {
            "type": "string",
            "nullable": true
          },
          "locale": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "SharedContractsResultOfBoolean": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "type": "boolean"
              }
            }
          }
        ]
      },
      "ApiEndpointsAssortmentSetProductActiveSetProductActiveRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "isActive": {
            "type": "boolean"
          }
        }
      },
      "SharedContractsResultOfPagedListOfProductDto": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureModelsPagedListOfProductDto"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureModelsPagedListOfProductDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32"
          },
          "totalPages": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32"
          },
          "hasPrevious": {
            "type": "boolean"
          },
          "hasNext": {
            "type": "boolean"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ApplicationModelsAssortmentProductDto"
            }
          }
        }
      },
      "ApplicationModelsAssortmentProductDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64"
          },
          "categoryId": {
            "type": "integer",
            "format": "int32"
          },
          "category": {
            "$ref": "#/components/schemas/ApplicationModelsAssortmentCategoryDto"
          },
          "plu": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "labels": {
            "type": "string",
            "nullable": true
          },
          "rating": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "kcalPer100G": {
            "type": "number",
            "format": "decimal",
            "nullable": true
          },
          "proteinsGPer100G": {
            "type": "number",
            "format": "decimal",
            "nullable": true
          },
          "fatsGPer100G": {
            "type": "number",
            "format": "decimal",
            "nullable": true
          },
          "carbsGPer100G": {
            "type": "number",
            "format": "decimal",
            "nullable": true
          },
          "allergens": {
            "type": "string",
            "nullable": true
          },
          "mainIngrediants": {
            "type": "string",
            "nullable": true
          },
          "fullIngrediants": {
            "type": "string",
            "nullable": true
          },
          "features": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/InfrastructureDbAppEntitiesProductFeatureDto"
            }
          },
          "price": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "productType": {
            "type": "string",
            "nullable": true
          },
          "manufacturer": {
            "type": "string",
            "nullable": true
          },
          "brand": {
            "type": "string",
            "nullable": true
          },
          "country": {
            "type": "string",
            "nullable": true
          },
          "shelfLifeDays": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "weightG": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "unitName": {
            "type": "string",
            "nullable": true
          },
          "volumeMl": {
            "type": "number",
            "format": "decimal",
            "nullable": true
          },
          "isAlcohol": {
            "type": "boolean",
            "nullable": true
          },
          "isTobacco": {
            "type": "boolean",
            "nullable": true
          },
          "isAdultContent": {
            "type": "boolean",
            "nullable": true
          },
          "priority": {
            "type": "integer",
            "format": "int32"
          },
          "isActive": {
            "type": "boolean"
          }
        }
      },
      "ApplicationModelsAssortmentCategoryDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "parentId": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "title": {
            "type": "string"
          },
          "imageUrl": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "InfrastructureDbAppEntitiesProductFeatureDto": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "key": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "displayValues": {
            "type": "string"
          }
        }
      },
      "ApiEndpointsAssortmentGetProductsGetProductsRequest": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedModelsPagination"
          },
          {
            "type": "object",
            "additionalProperties": false
          }
        ]
      },
      "SharedContractsResultOfListOfCategoryDto": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "type": "array",
                "nullable": true,
                "items": {
                  "$ref": "#/components/schemas/ApplicationModelsAssortmentCategoryDto"
                }
              }
            }
          }
        ]
      },
      "SharedContractsResultOfUserFeedbackEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserFeedbackEntity"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesUserFeedbackEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "userId": {
                "type": "string",
                "format": "guid"
              },
              "user": {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
              },
              "feedback": {
                "type": "string",
                "nullable": true
              }
            }
          }
        ]
      },
      "ApiEndpointsAppSaveUserFeedbackSaveUserFeedbackRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "feedback": {
            "default": "{}"
          }
        }
      },
      "SharedContractsResultOfSaveRppgSсanResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/ApplicationModelsRppgScanSaveRppgSсanResponse"
                  }
                ]
              }
            }
          }
        ]
      },
      "ApiEndpointsAppSaveRppgScanSaveRppgScanRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "scanResult": {},
          "name": {
            "type": "string",
            "nullable": true
          },
          "age": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "height": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "weight": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "gender": {
            "nullable": true,
            "oneOf": [
              {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesGender"
              }
            ]
          },
          "smokeStatus": {
            "nullable": true,
            "oneOf": [
              {
                "$ref": "#/components/schemas/InfrastructureDbAppEntitiesSmokeStatus"
              }
            ]
          }
        }
      },
      "SharedContractsResultOfStatEventEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesStatEventEntity"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesStatEventEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "userId": {
                "type": "string",
                "format": "guid",
                "nullable": true
              },
              "user": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
                  }
                ]
              },
              "sessionId": {
                "type": "integer",
                "format": "int64",
                "nullable": true
              },
              "type": {
                "type": "string",
                "nullable": true
              },
              "data": {
                "type": "string",
                "nullable": true
              },
              "durationSeconds": {
                "type": "number",
                "format": "double",
                "nullable": true
              }
            }
          }
        ]
      },
      "ApiEndpointsAppSaveStatEventSaveStatEventRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "type": "string",
            "nullable": true
          },
          "data": {
            "type": "string",
            "nullable": true
          },
          "durationSeconds": {
            "type": "number",
            "format": "double",
            "nullable": true
          }
        }
      },
      "ApiEndpointsAppSaveStatEventSendErrorRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "errorMessage": {
            "type": "string",
            "nullable": true
          },
          "data": {
            "type": "string",
            "nullable": true
          },
          "stackTrace": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "SharedContractsResultOfLogEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SharedContractsResult"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "value": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesLogEntity"
                  }
                ]
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesLogEntity": {
        "allOf": [
          {
            "$ref": "#/components/schemas/InfrastructureDbBaseEntity"
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "userId": {
                "type": "string",
                "format": "guid",
                "nullable": true
              },
              "user": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesUserEntity"
                  }
                ]
              },
              "logSource": {
                "nullable": true,
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/InfrastructureDbAppEntitiesLogSource"
                  }
                ]
              },
              "logType": {
                "type": "string",
                "nullable": true
              },
              "log": {
                "type": "string",
                "nullable": true
              },
              "logMessage": {
                "type": "string",
                "nullable": true
              }
            }
          }
        ]
      },
      "InfrastructureDbAppEntitiesLogSource": {
        "type": "integer",
        "description": "",
        "x-enumNames": [
          "Backend",
          "Frontend"
        ],
        "enum": [
          0,
          1
        ]
      },
      "ApiEndpointsAppSaveFrontendLogSaveFrontendLogRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "logType": {
            "type": "string",
            "nullable": true
          },
          "log": {
            "default": "{}"
          },
          "logMessage": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "ApiEndpointsAppOpenRouterTextsOpenRouterTextsResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "text": {
            "type": "string"
          },
          "error": {
            "type": "string",
            "nullable": true
          }
        }
      },
      "ApiEndpointsAppOpenRouterTextsOpenRouterTextsRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "texts": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "systemPrompt": {
            "type": "string",
            "default": "Ты ИИ помощник",
            "nullable": true
          },
          "model": {
            "type": "string",
            "default": "google/gemini-2.5-flash",
            "nullable": true
          }
        }
      },
      "ApiEndpointsAppHealthCheckHealthCheckResponse": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "result": {
            "type": "string"
          }
        }
      },
      "ApiEndpointsAppHealthCheckHealthCheckRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "mockMessage": {
            "type": "string",
            "nullable": true
          }
        }
      }
    },
    "securitySchemes": {
      "JWTBearerAuth": {
        "type": "http",
        "description": "Enter a JWT token to authorize the requests...",
        "scheme": "Bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}