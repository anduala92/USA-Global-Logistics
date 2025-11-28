@echo off
setlocal
cd /d "%~dp0"

REM Prerequisites: Node.js 20.19+ or 22.12+
node -v || (echo Node.js not found. Please install Node 20.19+ or 22.12+ from https://nodejs.org & exit /b 1)

echo.
echo [1/5] Rendering ERD PNG with mermaid-cli...
npx --yes @mermaid-js/mermaid-cli -i diagrams/erd.mmd -o diagrams/erd.png || goto :error

echo.
echo [2/5] Building slides (PDF) with Marp...
npx --yes @marp-team/marp-cli OverviewSlides.md --pdf --allow-local-files --no-stdin --output OverviewSlides.pdf || goto :error

echo.
echo [3/5] Building slides (PPTX) with Marp...
npx --yes @marp-team/marp-cli OverviewSlides.md --pptx --allow-local-files --no-stdin --output OverviewSlides.pptx || goto :error

echo.
echo [4/5] Exporting Markdown to PDF (ProjectOverview)...
npx --yes md-to-pdf ProjectOverview.md || goto :error

echo.
echo [5/5] Exporting Markdown to PDF (ERD and API_Endpoints)...
npx --yes md-to-pdf ERD.md || goto :error
npx --yes md-to-pdf API_Endpoints.md || goto :error

echo.
echo Done. Outputs:
echo   - diagrams\erd.png

echo   - OverviewSlides.pdf

echo   - OverviewSlides.pptx

echo   - ProjectOverview.pdf

echo   - ERD.pdf

echo   - API_Endpoints.pdf
exit /b 0

:error
echo.
echo Build failed. Please review the error above.
exit /b 1
