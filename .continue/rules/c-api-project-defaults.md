---
globs: USAGlobalLogistics.Api/**/*.cs
description: Apply to USAGlobalLogistics.Api project for consistent setup across files.
---

Use .NET 10 Web API, EF Core 10, and SQLite provider. Keep Program.cs minimal and register DbContext via Sqlite with connection string from appsettings. Scaffold minimal API endpoints per entity during startup until controllers are added.