# Description
A chrome browser extension that helps a user to read scholary articles, exclusivley on pubmed. This tool will allow a reader to examine information on one page, rather than opening a new tab to search for definitions. Two of the main issues that comes from reading scholarly articles are speacialized language and complex methodology. Option of two active learning questions per definition.

Methodology:
- Accessing text fields 
  - Content Scripts 


# MVP 
Problem: 
Scholarly articles readability is low due to specalized language and complex methodology. When reading through an article and stumbling across unknown verbage, one usually has to open a new tab to search for a definition in order to accuratly comprehend the reading. Sometimes a reader will unknowingly pass by a word thats definition is dependant on the respective field of discipline, a reader will often make the assumption that they know that word since they have used it in other contexts before, and thus will not fully understand the content.

Main Value: 
Heightens readablity of scholarly articles by identifying terms and methodology that need specification, while keeping all the details on one page. 

Market: 
Multiple chrome extensions offering similar tools are available and wanted, Scholarcy for example has over 600,000 users.

Core Features:
- AI prompts to identify and define all specalized language
- AI prompts to explain methodology 

Other Features:
- AI prompts for active reading questions
- A user can place words or phrases in 2 categories: know, learning. The ones that are known are omitted from the output

User Journey:
1. Opens chrome extension on a PubMed journal 
2. Login or Continue As Guest
3. Choose if you want only one feature activated or all three (language, methodology, questions)
4. User reads through journal 

Tech Stack:
- HTML CSS Python Django ManifestV3 Postgresql
- ChatGPT API







# Sprint (agile)

*Week 1: Extension + Basic Backend*

Day 1–2: Chrome Extension Setup 6/24
- Set up manifest.json and content scripts ✅ 
- Target PubMed pages and inject scripts correctly ✅ 
- Extract article content (abstract, body) ✅ 

Day 3–4: Backend Setup (Django)
- Create db
- Update Django settings.py to connect postgresql database
- Confirm connection
- Create a model
- Create an endpoint
- Accept plain text input (article section)
- run migrations

Day 5: Connect Extension ↔ Django
- From the extension, send article content to Django via fetch (CORS setup)
- Receive and log a placeholder response
- Confirm browser → extension → Django pipeline works

Day 6–7: Add ChatGPT API Integration
- In Django 
  - send terms/text to ChatGPT API using OpenAI’s SDK
- Prompt it to extract & define:
  - Specialized terms
  - Complex methodologies
-  Return structured response to extension




*Week 2: Frontend UI, UX, Testing & Polish*

Day 8–9: Render Definitions in Chrome Extension
- From API response, inject highlights into DOM for each term
- On hover/click, display definitions in a tooltip or popup
- Style tooltips with CSS (optionally use Popper.js or custom CSS)
- Create a collapsable right side page with all terms and toggle for definitions  

Day 10: Improve Caching & Reliability
- Handle no-definition or API error gracefully in Django & Chrome Extension
- Add fallback “no definition found” UI

Day 11–12: Extension UI Enhancements
- Add loading spinner or "processing" state
- Style tooltips for clarity, accessibility
- Update pubmed-content.js to get all available content data 

Day 13: Testing & Debugging
- Test on:
  - Abstract-only articles
  - Full-text articles
  - Articles with images, PDFs, or special formatting
  - Fix common DOM bugs or mis-parses

Day 14: Demo & Feedback
- Show to academics, friends, or peers -> Gather UX feedback
- Document edge cases or v2 features 



# Notes
Common DOM Structure for PMC Article Pages (pmc.ncbi.nlm.nih.gov)

Title <br>
`h1.content-title`<br>
This is the main article title. <br>

Authors <br>
`div.contrib.contrib-author`<br>
Contains author names, affiliations, etc.<br>

Abstract <br>
`div.abstract-content.selected`<br>
Note: use abstract-content.selected class, indicates active display <br>

Section Headers & Body<br>
`section.sec`<br>
All major sections are wrapped in `<section class="sec">`.<br>

Figures, Tables, References, Supplementary Material<br>
`<div class="fig-wrap"> / <figure>` <br>
`<div class="table-wrap">`<br>
`<div class="ref-list">`<br>
`<div class="supplemental-materials">`<br>