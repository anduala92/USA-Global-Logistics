# Какво е .NET и как работи проектът USA Global Logistics API

## Какво е .NET?
- **.NET** е мултиплатформен фреймуърк (работи на Windows, Linux, macOS), който позволява създаване на съвременни уеб приложения, десктоп apps, мобилни приложения, сервизни backend-и и др.
- Създаден и поддържан от Microsoft (основен език е C#).
- Предлага богата стандартна библиотека, управление на паметта (GC), runtime сигурност, бързина и възможности за dependency injection.

## Как работи ASP.NET Core проект (API-та)?
- **ASP.NET Core** е модерният компонент за уеб приложения и APIs.
- Използва минимален „Startup“ клас (тук – Program.cs), където се регистрират всички dependency injection (услуги), routing и middlewares (middleware = обработка като auth, permissии, logging, CORS и др.).
- В този проект endpoints са декларативно регистрирани чрез `app.MapGet/MapPost/...` (т.нар. Minimal APIs).
- Започва се с `dotnet run`, който компилира C# кода, създава web server (Kestrel) и инстанцира endpoints.

## Основни библиотеки и NuGet пакети в проекта

### Microsoft:
- **Microsoft.EntityFrameworkCore & Microsoft.EntityFrameworkCore.Sqlite** – ORM слой, картотекира C# класовете към SQL таблици, позволява LINQ заявки и миграции. Sqlite е лек файл-базиран SQL engine, подходящ за демо/dev.
- **Microsoft.AspNetCore.Authentication.JwtBearer** – middleware за автентикация (JWT tokens) – така се държат сигурни endpoints.
- **Microsoft.IdentityModel.Tokens** – обработка на токени – валидиране, криптиране, подписи.
- **Microsoft.OpenApi** – автоматична генерация на OpenAPI (Swagger) документация.

### Допълнителни:
- **BCrypt.Net-Next** – за сигурно хеширане на пароли.
- **System.Text.Json** – сериализация и десериализация на JSON (работи най-тясно с API).

### Основни концепции в кода:
- **Dependency Injection** – всички Services (напр. Orchestrator, DbContext и пр.) се инжектират автоматично.
- **Middleware** – всеки HTTP request минава през pipeline за CORS, Auth, Authorization, Logging, HTTPS redirect и др.
- **Minimal APIs** – много endpoints се регистрират директно, без да е необходим отделен контролер.
- **ORM/EFCore** – пишеш LINQ вместо SQL за CRUD на таблиците.

### Типова структура на проекта (.NET API):
- Program.cs – entry + endpoints
- Services/ – инжектирани бизнес-класове
- Models/ – ентити модели (съответстващи на таблици)
- Data/ – AppDbContext (координира ORM и миграции)
- Dto/ – вход/изход за потребителско API

## Ако не си работил с .NET:
- Кодът се пише на C#.
- Използвай `dotnet run`, `dotnet restore` за стартиране и обновление.
- Всички зависимости са посочени в .csproj файла (виж USAGlobalLogistics.Api.csproj).
- Пакетите се менажират през NuGet (като pip/npm, но за .NET).

## Къде да научиш повече:
- [Официално: https://learn.microsoft.com/en-us/dotnet/](https://learn.microsoft.com/en-us/dotnet/)
- ASP.NET Core: [https://learn.microsoft.com/en-us/aspnet/core/](https://learn.microsoft.com/en-us/aspnet/core/)
- Entity Framework Core: [https://learn.microsoft.com/en-us/ef/core/](https://learn.microsoft.com/en-us/ef/core/)

---
Този файл е базово въведение за начинаещи с .NET + преглед на ключовите части и библиотеки използвани в проекта.