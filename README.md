# Little Oak learning portal

A Next.js learning portal with **Ontario Grade 1–8 lessons** and all-grades practice, hosted on Azure App Service.

## Included

The public **[Games directory](https://www.little-oak.ca/games)** lists all ten games and can be used without signing in. Guest game progress exists only for the current play session and is not saved. Signing in saves progress privately to the Google account.

- Google login and sign-out using Auth.js (NextAuth v5 beta, pinned).
- Server-side protection for the dashboard, subject pages, and lessons. The public Games directory and individual games can be played without signing in; guest progress is temporary and not saved.
- Any **verified Google account** can sign in; there is no family allowlist.
- Independent Math, Language & Reading, Science, and French modules. Language & Reading includes Spelling Bee vocabulary and spelling support.
- Math has an all-grades **Mental Mathematics** area above grade navigation: single-digit addition, two-digit addition, single-digit multiplication, and single-by-two-digit multiplication. Each new quiz randomly samples 8 distinct side numbers and 5 distinct top numbers (1–9 for single digits, never zero; 10–99 for two digits). The mixed multiplication quiz puts two digits on the left and single digits on top. Its 40 cells use column-by-column Tab/Shift+Tab and Enter navigation. The five-minute browser timer starts on Start, includes time in another tab, and automatically submits at expiry; early submission is allowed and blanks count as incorrect. Submitted answers stay in the same table: green for correct, red for incorrect or empty, with text labels and corrections. This review is temporary, not saved. The server validates the activity, operand ranges, table dimensions, and answer count, recomputes the score, and stores only the final score, total, quiz metadata, and browser-measured elapsed milliseconds in private result JSON. These are practice quizzes, not tamper-proof timed examinations. Unfinished attempts are not stored.
- Math includes **Math Army**, an eight-level Three.js arcade maths game at `/games/math-army`, with restart and fullscreen controls. The original game was imported from the owner's `C:\games\matharmy\index.html`; that source folder is not modified. The portal copy lives in `src/games/math-army/index.html`. Its exact Three.js 0.170.0 runtime and geometry utilities are hosted locally under `public/games/math-army/vendor`, with the MIT license retained, rather than loaded from a CDN. Future game updates must preserve the account-progress adapter and be imported and deployed. Signed-in stars and last level save privately to Azure SQL; guest progress is temporary; graphics preferences stay local. Game progress is separate from quiz history. Cartoon battles and flashing effects warrant adult review. WebGL is required; keyboard and drag controls are provided by the original game.
- Subject → Grade → Unit → Topic lesson navigation. Math, Language & Reading and Science offer Grades 1–8; Core French offers Grades 4–8, and French Immersion language offers Grades 1–8. Ontario Core French has no Grade 1–3 curriculum; shared vocabulary provides optional enrichment.
- Original deeper topic lessons with three teaching sections, unsaved section practice, one saved end-of-lesson quiz on a separate page with new questions covering all sections, guided activities, and a visible expectation-to-section map. The original starter lessons remain in all-grades practice; old lesson URLs redirect there. Existing Grade 4 lessons and their legacy combined quiz banks are unchanged.
- Read/stop controls in every text lesson section narrate its explanation and guided activity using an English browser/device voice, or a French voice for French Immersion.
- Optional **Extend your knowledge** videos on all 104 grade-specific Science lessons and the water-cycle starter. Each includes a short YouTube video, publisher, length, lesson connection, and an unsaved reflection question. Players load only on request, with no autoplay or remote thumbnail.
- French has a Core French / French Immersion radio toggle after entering the subject. Existing Core French routes and Grade 4 history remain unchanged. Immersion Grades 1–8 have French-first lessons, three sections each, optional collapsed English help, adult-led activities, French narration, grade-specific learning maps and separate mixed-format final quizzes. The original 10 Grade 2 lessons keep their five-question finals; new immersion lessons have six-question finals. All-grades vocabulary practice is shared.
- Language & Reading has a **Vocabulary** section above grade navigation with Spelling Bee quizzes. Lessons 1 and 2 each have 15 words; Lesson 3, **Animals, survival, and understanding**, has 17 words, including carnivore/carnivorous, comprehend/comprehension, and survive/survivor. The supplied typo "Obsccure" is corrected to "obscure"; lists use lowercase. Each lesson has definitions, original example sentences and a per-word pronunciation button, followed by spelling and meaning quiz sections. Unsaved matching practice covers every word (15, 15 and 17 pairs), plus spelling-highlight practice. Pronunciation uses the same English browser/device voice and explicit speech error handling as section audio, reads only the word, and stops when another word starts or the page unmounts. Lesson 1 keeps "obedient" and omits "obedience". The Vocabulary catalog offers direct quiz links and custom spelling-only quizzes. Test 1/Test 2 scoring IDs and previous saved history are unchanged; Test 3 scores 17 spelling answers and 17 meaning answers, out of 34.
- Custom spelling-only lists (1–50 words), browser read-aloud, per-answer review, and missed-word practice.
- French all-grades practice: Animals, Food, and Everyday Objects each retain ten illustrated words and a ten-image matching quiz. **Dans ma salle de classe...** adds the requested 24 classroom expressions, in order with standard accents, English meanings, pronunciation notes, French read-aloud, and a 24-word/24-image matching quiz.
- Private per-user Azure SQL history stores final scores for all completed quizzes and spelling attempts, with elapsed time for Mental Mathematics. New saves contain no individual answers or section details. Previous history remains readable and unchanged.
- Answer explanations, results, retries, keyboard controls, and responsive layouts.
- Reusable interactive questions: word search, word-to-picture matching, sorting, sequence ordering, matching pairs, diagram labelling, fill-in-the-blank, and highlighting misspelled words. Published text lessons have a topic-specific unsaved review activity and two independent interactive final questions, interleaved with multiple-choice questions. Formats are distributed according to the topic rather than forcing every type into every lesson. Grade 4 and newly added topic finals have six questions; original Grade 2 Immersion and starter text lessons keep five. All vocabulary lessons and all four French word lists also have added practice; dedicated spelling, French matching and timed mental-math tests retain their formats. A public showcase at `/try/activities` has all eight types.
- Public samples at `/try`, `/try/spelling`, and `/try/french`, which work without credentials and do not save results.
- No first-party analytics, ads, or user-to-user chat. AI Learning Studio has a private learning-content chatbot backed by the owner's local model. Optional YouTube players are third-party services and may show advertising or recommendations. Unfinished quiz attempts last only while the page is open.
- Azure Bicep infrastructure and a GitHub Actions deployment workflow.

## Math Kart

Math also offers **Math Kart** at `/games/math-kart`: eight racing tracks with maths gates, solo racing, and two-player split screen on the same device. Both arcade games share the restart/fullscreen player and non-cacheable HTML-serving helper. Math Kart's portal copy is `src/games/math-kart/index.html`, imported from `C:\games\mathkart\index.html` without changing that original or its backup. It reuses the local Three.js 0.170.0 runtime under `public/games/math-army/vendor`, adding the licensed `geometries/RoundedBoxGeometry.js` utility, with no CDN requests. Signed-in stars save to Azure SQL, including same-device two-player rewards; guest progress is temporary and not saved. Player-count and graphics preferences stay local and shared within that browser profile. Progress is separate from quiz history. Solo touch controls are available; two-player mode requires a keyboard. Preserve the progress adapter when importing and deploying future game updates.

## Code Commander

Math offers **Code Commander** at `/learn/math/code-commander`: 25 missions teaching sequences, turns, loops, nested loops and conditions through a block-programmed tank adventure. It uses the shared protected HTML delivery and restart/fullscreen player. Its initial ready selector is `#play` (the main-menu button), not a mission button, because missions open on a second menu. The portal copy at `src/games/code-commander/index.html` is imported from `C:\games\codecommander\index.html`; the original and its backup are unchanged. Only import-map URLs are changed to reuse the licensed, locally hosted Three.js 0.170.0 runtime and `RoundedBoxGeometry` under `public/games/math-army/vendor`. Import and deploy future updates to refresh the portal copy.

Drag or tap blocks into the program; RUN executes it, STEP advances one command, and RESET resets the mission while keeping the program. Select a Repeat to add blocks inside it, then Add to main to return to the outer program. Account-owned stars unlock later missions and save to Azure SQL; `codeCommanderGfx` retains local graphics settings. Progress is separate from quiz history. Programs are temporary; changing missions or restarting the iframe discards them. WebGL is required. Cartoon tanks, firing/explosion effects and moving graphics warrant adult review.

## Spelling Snake

Language & Reading (the English section) offers **Spelling Snake** at `/learn/reading/spelling-snake`: seven levels with eight words each, covering little words, sight words, four-letter words, sound teams, magic E, growing words and tricky treasures. It shares the authenticated, non-cacheable game delivery and restart/fullscreen player with the maths games. The portal copy at `src/games/spelling-snake/index.html` comes from `C:\games\spellingsnake\index.html`, with only its import-map URLs changed to reuse the local Three.js 0.170.0 runtime and retained MIT license under `public/games/math-army/vendor`; the original is unchanged. Import and deploy future updates to update the portal copy.

Arrow keys/WASD, touch direction buttons and swipes steer the snake; P pauses, and H or Hear again repeats the word. Picture/text clues and a temporary spelling peek support practice. Pronunciation uses a browser/device English voice, which may process words remotely; no microphone is used. Stars and last-played level save privately to Azure SQL; `spellingSnakeGfx` retains local graphics preferences. Progress is separate from quiz history. Restart discards the run but retains saved account stars. WebGL is required, and moving graphics/flashing feedback warrant adult review.

## Ecosystem Island, Fraction Factory, and Typing Ninja

- Science: **Ecosystem Island** at `/learn/science/ecosystem-island`, with ten food-web missions and an open sandbox. Tap to place life, drag to orbit, and use the field journal and population graph. The island is temporary; account-owned mission stars determine unlocks. Sound/graphics settings stay local.
- Math: **Fraction Factory** at `/learn/math/fraction-factory`, with twelve fraction levels and Rush Mode. Choose a slicer, tap portions, and deliver orders. Stars, coins, unlocks and Rush best save to the account; graphics/mute settings stay local.
- Language & Reading (English): **Typing Ninja** at `/learn/reading/typing-ninja`, with twelve typing levels and survival mode. Use a physical keyboard or tap the on-screen keyboard. Stars, unlocks and survival best save to the account; settings stay local.

All three use the shared sign-in-protected, non-cacheable HTML delivery and restart/fullscreen player. Copies in `src/games` are imported from the owner's `C:\games\ecosystemisland`, `C:\games\fractionfactory`, and `C:\games\typingninja`; original folders are unchanged. Their exact Three.js 0.160.0 runtime is self-hosted under `public/games/vendor/three-0.160.0` with its MIT license. Import maps, Ecosystem Island's obsolete CDN error message, and storage access were adapted; gameplay is unchanged. Preserve the progress adapter when importing and deploying source updates. Standalone tracing and CI artifact checks include all three private HTML files and the runtime.

Progress saves privately to Azure SQL, separate from quiz history. Restart discards the current simulation/order/round while retaining saved account progress. Clearing browser data removes device preferences and legacy progress, not account progress. WebGL is required. Moving graphics, flashing feedback, and Typing Ninja's cartoon sword effects warrant adult review. Ecosystem Island is a simplified simulation, not real-world wildlife advice.

## Private account game progress

The nine games with milestones save to `dbo.GameProgress` in the existing Azure SQL database, keyed by the authenticated `google:<providerAccountId>` and game slug. Planet Hopper remains unsaved exploration. Stored data is limited to stars, cumulative coins, best scores, earned passport stamps (place names or chapter/question identifiers), supported last-played levels, and an update timestamp. Graphics, sound and player-count preferences remain browser-local; current scenes, programs, flights and typed answers are not saved. Milestones are client-reported, not verified achievements.

Authenticated HTML loads SQL progress before the game starts and injects an account/game-bound token and the self-hosted `public/games/account-progress.js` adapter. Each imported module scopes its `localStorage` binding to this adapter; only registered progress keys use account memory and SQL, while other settings use native local storage. This is not a global storage monkeypatch. Preserve that binding on future imports. Startup storage errors stop the game visibly instead of quietly creating empty progress. The bounded same-origin API never accepts an owner ID from the client and rejects stale iframe writes after an account change.

Milestone writes are coalesced, with visible saving/saved/error feedback and manual retry. Restart pauses while a save is pending or has failed. Keep the game open until saving finishes: unsaved changes live only in memory; navigation/unload saves are best-effort and forced closing can lose them. SQL transactions merge maximum stars and best scores, union stamps, and keep the greater cumulative coin total. Concurrent devices' coin earnings are **not added together**; reopen on another device to load the latest total before continuing. Retrying a snapshot cannot double rewards or downgrade earlier stars.

Old browser progress is never automatically assigned to the first child signing in. **Import this browser's old progress** is an explicit choice with a shared-browser warning; import only the child's own progress, then reopen the game. Import merges achievements and does not remove legacy browser data. Clearing site data removes local settings/legacy progress and signs out, but does not delete SQL progress. Account progress remains until the owner deletes it; contact the parent hosting the site. No reset/delete permission is granted to the runtime identity.

Apply the additive, rerunnable migration and table-scoped permissions as a database administrator before deploying this feature:

```powershell
$env:SQL_SERVER = "<sql-hostname>"
$env:SQL_DATABASE = "learning-portal"
$env:APP_IDENTITY_NAME = "<app-managed-identity-display-name>"
node .\scripts\initialize-game-progress-sql.mjs
```

The script applies [infra/game-progress.sql](infra/game-progress.sql), grants only `SELECT, INSERT, UPDATE` on this table, verifies runtime read/write and owner-scoped queries with rolled-back synthetic rows, and leaves quiz/AI tables and permissions unchanged. It creates no new paid Azure resources. Keep `AUTH_URL` set to the public portal URL so same-origin protection works behind the App Service proxy.

## Time Traveler

Science offers **Time Traveler** at `/learn/science/time-traveler`: twelve eras from dinosaurs to the Moon landing, combining exploration, part-collection questions, character challenges, and chronological-order puzzles. Walk with WASD/arrows or tap the ground; drag to orbit, R resets the view, and E/Space interacts. Timeline cards support dragging and up/down arrows. The shared protected HTML delivery and restart/fullscreen player use `#play` for initial readiness.

The portal copy in `src/games/time-traveler/index.html` comes from `C:\games\timetraveler\index.html`, leaving the original unchanged. Its import map reuses the self-hosted Three.js 0.160.0 runtime and MIT license under `public/games/vendor/three-0.160.0`; no external CDN is used. Storage access uses the account-progress adapter. Standalone tracing and CI packaging checks include the HTML. Preserve these integrations when importing and deploying future source updates.

Stars and era unlocks save privately to Azure SQL; `timeTraveler_gfx` and `timeTraveler_mute` retain local settings. Progress is separate from quiz history. Current exploration is temporary; restart keeps saved account stars but discards current era progress. Clearing browser data does not remove account progress. WebGL is required. Fictional characters, simplified historical/science material, moving graphics, and flashing warp effects warrant adult review.

## Map Quest

Science offers **Map Quest** at `/learn/science/map-quest`: an interactive geography globe with free exploration, five discovery quiz collections, and the original twelve chapters. Drag to rotate, scroll/pinch to zoom, and select countries, landmarks, nature, world regions, or coordinates. Free exploration does not score or change the passport. Quizzes offer direction/distance hints and locally bundled destination descriptions; correct answers earn coins and stamps.

The protected portal HTML in `src/games/map-quest/index.html` is imported from `C:\games\mapquest\index.html`, with only import-map and asset paths adapted. Original files are unchanged. Assets are copied intact into `public/games/map-quest/assets`, including all photos/flags and per-item attribution. It reuses the self-hosted Three.js 0.160.0 runtime with three licensed line-rendering addons. NASA Earth imagery, public-domain Natural Earth borders, Wikipedia CC BY-SA descriptions, and individual Wikimedia Commons media credits/license links are retained. Source/license links open external websites only when selected; gameplay makes no live Wikipedia, image-service, or CDN requests. Generalized borders follow the source dataset, not authoritative legal boundaries.

Passport stamps, coins, and original chapter stars save privately to Azure SQL; unlocks derive from stars. Graphics settings use local `mapquest-gfx`, preserving the old local graphics preference without importing old progress. Progress is separate from quiz history. Restart discards the current expedition but retains saved rewards. Clearing browser data does not remove account progress. WebGL is required. Preserve the account-progress adapter when importing and deploying future game/assets updates together; standalone tracing includes the private HTML and deployment copies public assets.

## Games directory and Planet Hopper

The signed-in dashboard has a separate **Games** section linking to `/learn/games`. The directory lists every entry in the shared `arcadeGames` registry, with subject labels, descriptions, and links to the existing protected game pages. Subject game sections remain available. When importing a game, add its registry metadata and protected page/route, tracing, and packaging checks so it appears in the directory.

Science offers **Planet Hopper** at `/learn/science/planet-hopper`: unsaved solar-system free flight with planets, moons, dwarf planets, asteroids, and comets. W/S flies forward/back, A/D turns, Q/E moves up/down, and dragging looks around. Touch controls and destination autopilot are included. `#startBtn` is the initial readiness selector.

The original `C:\games\planethopper` is unchanged. Its HTML is copied to `src/games/planet-hopper/index.html`; scripts, CSS, bundled descriptions/image credits, and five surface maps are in `public/games/planet-hopper`. Asset/import paths use the local Three.js 0.160.0 runtime. Reference images are adapted to **Load reference image** rather than loading automatically. Only this game's CSP allows Wikimedia's `thumb.wikimedia.org` and `upload.wikimedia.org` image hosts and local external CSS; other games retain their existing policies. Choosing to load a reference photo sends connection information to Wikimedia Commons; the image uses `no-referrer`. Wikipedia/source/license links leave the portal. All original NASA/Wikimedia credits are retained.

There are no saved scores, flight paths, or browser progress for Planet Hopper. Restart resets the flight. This is an illustrative model with enlarged sizes, accelerated clocks, and fixed reference orbital elements, not live astronomical positions. WebGL and adult review of moving graphics are recommended. Import and deploy future source/assets updates together.

## AI Learning Studio

Signed-in users can open **AI Learning Studio** from the dashboard (`/learn/studio`), request an original lesson and 1–10 multiple-choice questions for Grades 1–8, and reopen their private saved content after signing in again. Follow-up prompts revise the selected saved lesson into a **new** version; they do not overwrite the original. This is a learning-content chatbot, not a general-purpose assistant: only the current instruction, selected grade/count and selected previous lesson are sent to the model. Chat messages are temporary. Valid output is saved automatically; quiz attempts/scores in this module are practice-only and are not saved to result history.

**Connection:** Azure queues requests; a trusted local connector pulls them over HTTPS, calls LM Studio's OpenAI-compatible `/v1/chat/completions` endpoint on loopback, and returns validated JSON. There is no public model endpoint, inbound router port, browser-to-localhost request, or third-party AI provider. LM Link is optional: run LM Studio on the connector machine, link it to a remote model device, and keep calling its local API normally. LM Link is not itself a public Azure API URL. See [LM Studio's LM Link API documentation](https://lmstudio.ai/docs/developer/core/lmlink) and [structured outputs](https://lmstudio.ai/docs/developer/openai-compat/structured-output).

### Setup and operation

1. As the SQL Entra administrator, set `SQL_SERVER`, `SQL_DATABASE`, `APP_IDENTITY_NAME` and run `node scripts/initialize-ai-sql.mjs`. It applies the additive [AI migration](infra/ai-learning.sql) and grants `SELECT, INSERT, UPDATE, DELETE` **only on `dbo.AiLearning`** to the existing app identity. Result-history permissions remain `SELECT, INSERT`. No new Azure paid service is needed.
2. Generate a random shared secret of at least 32 characters. Set `AI_CONNECTOR_TOKEN` in App Service environment variables. Never place it in `NEXT_PUBLIC_*`, send it to the browser, or reuse a Google/OAuth token.
3. On the trusted local computer create `.env.ai-connector.local` (ignored by Git), with:

   ```dotenv
   AI_PORTAL_URL=https://littleoak-portal-2a3210e0.azurewebsites.net
   AI_CONNECTOR_TOKEN=<same-secret-as-App-Service>
   LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
   LM_STUDIO_MODEL=<loaded-model-id-from-LM-Studio>
   # Optional when LM Studio API authentication is enabled:
   # LM_STUDIO_API_KEY=<local-api-token>
   ```

4. Start LM Studio's local server, load an instruction model that supports structured JSON, and run `npm run ai:connector` with Node.js 22.18+ or 24. Keep the computer, LM Studio, and connector running. Use `npm run ai:connector -- --once` to process at most one waiting request. Stop with Ctrl+C. The connector does not install an automatic startup task.
5. In the portal, submit a learning prompt. Queued requests display **Connecting to AI Model...**; once the connector claims the request, the display changes to **Generating Lesson...**. A time-based progress bar fills over 40 seconds from when the page observes generation starting and stays at 100% until the actual result arrives. This is a visual estimate, not model-reported completion; reopening the page restarts the estimate. Early completion removes the bar immediately on the next status refresh. When saved, use **Open lesson & quiz** to open the dedicated `/learn/studio/<id>` reading/quiz page, separate from the prompt and library. **Revise this lesson** returns to the Studio with that lesson selected; the next prompt creates a new saved version. Reopen from **My saved learning** after signing in again. If requests remain waiting, check the connector and local server. Refresh library retries status checks. Cancel/delete removes content; starting a new topic does not cancel an active job.

The connector waits five seconds between checks (after the previous check or generation finishes); active browser pages poll every 10 seconds, pausing when hidden. This consumes F1 CPU/network quotas and SQL capacity; cold starts or exhausted quotas can interrupt generation. Requests wait at most 24 hours. Claimed jobs have five-minute leases and at most two attempts; output from cancelled/expired claims cannot overwrite newer work. Incomplete, malformed, too-brief or structurally invalid output gets one local regeneration attempt with corrective instructions, within a four-minute total generation budget and the existing five-minute job lease. Both attempts must pass the same validators; no fabricated fallback lesson is saved. Provider/network failures are not retried within the job. Persistent output problems fail visibly, and the connector logs safe failure categories (such as `lesson-too-brief`, `incomplete-output`, or `HTTP 503`) without prompts, model output or credentials. The worker requests `reasoning_effort: "none"` so supported reasoning models spend their bounded output budget on the lesson rather than hidden reasoning. This was verified with the loaded `qwen3.5-4b` model. Long revisions may require increasing the model's context size in LM Studio.

### Content contract, ownership and limits

[ai-content.ts](src/modules/ai-content.ts) is the authoritative runtime Zod schema and generates the JSON Schema sent to LM Studio. Version 1 stores a compact JSON document containing:

```json
{
  "schemaVersion": 1,
  "title": "Learning about plants",
  "summary": "How plants get energy.",
  "sections": [{ "heading": "Sunlight", "body": "Plants use energy from sunlight to make food." }],
  "questions": [{
    "type": "multiple-choice", "id": "q1",
    "prompt": "What energy source do plants use to make food?",
    "options": [
      { "id": "a", "text": "Sunlight" }, { "id": "b", "text": "Moonlight alone" },
      { "id": "c", "text": "Sound" }, { "id": "d", "text": "Plastic" }
    ],
    "correctOptionId": "a",
    "explanation": "Plants use sunlight in photosynthesis."
  }]
}
```

Question `type` is a discriminant, and choice/answer references use IDs rather than display indices. Future types must be added explicitly to the union, validator, connector schema and renderer; incompatible `schemaVersion` values are rejected, not guessed. Version 1 adapts to the existing reusable `Quiz`. Strings render as plain text, never executable HTML. Structural validation checks unique IDs/prompts/choices, four choices per question, a real answer reference, exact requested count, string limits and a 48,000-byte document cap. New generations choose a topic-appropriate structure of 1–12 sections, aiming for 600–900 teaching words overall, with definitions, examples, reasoning, everyday applications and misconceptions. Named collections normally get one section per item (for example, seven separate wonder sections); processes and skills are grouped by meaningful stages or concepts. Ambiguous collections state their interpretation, rather than mixing different lists. The connector requires at least 60 words per section and at least 500 teaching words overall, with a 5,000-token output budget; too-brief output fails visibly. Older short version-1 documents remain valid and readable. Each section body allows up to 5,000 characters so a focused single-section lesson can still meet the overall teaching-depth requirement. The full document remains capped at 48,000 UTF-8 bytes. This does **not** certify factual accuracy or child safety; model safety instructions are not a moderation guarantee.

Ownership is always the authenticated stable Google account ID supplied server-side, not a model/client field. Parameterized SQL scopes library/detail/revision/deletion to that account. The connector is a **trusted site-owner service**: its shared credential can read queued prompts/content and complete jobs across accounts, but is never sent Google profile data or user IDs. Protect that credential and computer. Limit: 10 requests/account/rolling 24 hours, one active request, and 100 non-deleted library items. Deletion invalidates any running lease and discards prompts/content; a minimal deleted-row marker remains until at least 24 hours have elapsed to enforce quotas, then is cleaned on connector polling. Completed/failed requests discard their prompt/context payload. Operational hosting logs, SQL backups and LM Studio's own logging/retention have separate retention; review them before use beyond the family.

An adult should review generated content. Do not send personal data. No tools, web browsing, file uploads, or cloud AI API are enabled by this feature. Read-aloud uses the existing device/browser voice service. Existing curated lessons, scores, authentication and private history are unchanged.

## Ontario curriculum learning

### Science video enrichment

`src/modules/videos/` contains a typed, explicitly curated Science lesson-to-video registry. Related lessons may share a video with their own connection and reflection prompt. Recorded metadata includes the YouTube ID, title, channel, duration (at most eight minutes), and verification date. These optional resources are supplementary, not Ministry-endorsed lessons, required assessments, or a guarantee of continuing availability. Metadata checks cannot guarantee every frame of third-party content; an adult should preview it and supervise any demonstrations. Recheck links periodically because publishers can remove videos or restrict embedding.

`ScienceVideos` renders a responsive `youtube-nocookie.com` iframe only after **Load video**; there are no external thumbnails, preconnects, or automatic playback. **Close video** removes the iframe and returns focus to its load button. The direct YouTube link remains available when embedding is blocked. YouTube can show ads, links and recommendations (`rel=0` limits related suggestions to the same channel, not removes them). Privacy-enhanced mode is not anonymous: loading sends connection information to YouTube and playback may use cookies or identifiers. Opening the direct link also connects to YouTube. See Google/YouTube's privacy policy and the site's parent notes. Watching, loading and reflection responses are not saved or included in scores; sign-in, original lessons, practice and final quizzes are unchanged.

### Reusable interactive problem components

`src/modules/problems.ts` defines a discriminated `Problem` union and shared completeness, correctness and solution helpers. Each type has an independent control exported from `src/components/problems/problem-controls.tsx`, behind the `ProblemControl` dispatcher. `ProblemPractice` provides unsaved practice and retry. `Quiz` interleaves interactive and multiple-choice questions for final assessments. Each fully correct question/activity earns one point, regardless of the number of pairs, labels or words it contains. Final quizzes are scored again on the server; only their total score and metadata are saved.

Lesson sections can supply `problems: readonly Problem[]` in addition to their existing multiple-choice `questions`. The original published activity banks are in `src/modules/activities/`; additional grade banks live alongside their researched lessons in `src/modules/curriculum-data/`. Both are resolved by `getLessonActivities` in `src/modules/activities.ts`. Every text lesson has one review practice activity after its last section and two independent final activities. Activities cover the actual topics: number operations, diagrams and ordering in Math; grammar, spelling, text analysis and writing in Language; scientific models, properties, design and investigations in Science; and language, images, communication and respectful cultural inquiry in French. Separate banks add practice to all vocabulary lists and all four French illustrated lists. `src/modules/problem-examples.ts` serves only standalone showcase/test examples.

Mixed final submissions use `quizVersion: 1` and an ordered answer array containing choice indices or bounded string arrays. The server resolves the registered lesson/program, rebuilds the same interleaving, checks answer shapes, item membership and one-to-one assignments, and calculates scores using shared helpers. Missing answers, invalid IDs, inappropriate answer kinds, forged scores and section-save submissions are rejected. Existing submissions without a version still use their original multiple-choice banks; legacy combined unit quiz pages remain unchanged. Stored history is not rewritten and new records still exclude individual answers. These learning activities are not proctored examinations.

Drag controls use Pointer Events for mouse, touch and pen, with select-then-place buttons and keyboard-accessible controls as alternatives. Assigned words leave the bank; replacement returns the displaced word, and Remove restores it. Filled matching and diagram slots hide their placement prompts; a replacement button appears only while another item is selected. Removing a match restores the empty-slot prompt. Sorting permits several items per category, so its placement buttons appear only while an item is selected. Sequences also offer Move up/Move down controls; destination buttons appear only while selecting an item to move to a different position. Diagram labels use numbered targets over a local illustration, plus an equivalent numbered destination list and descriptive alternative text. The original plant illustration uses percentage coordinates that must match its artwork.

Word searches use first-letter/last-letter selection along a straight horizontal, vertical or diagonal line, in either direction; found words have a visible check mark. Highlight activities toggle word tokens independently (including repeated words at different positions). Fill answers normalize Unicode, outer/repeated whitespace and case unless `caseSensitive` is enabled; accents are **not** ignored. Authors can list multiple accepted answers explicitly, such as reduced fractions or appropriate synonyms. Feedback locks controls until retry or the next question; full solutions appear only after checking. English and French control labels are supported. Practice responses and drag movements stay local; completed final answers are sent for scoring but are not persisted.

### Grade 1–8 expansion

The Grade 4 model now extends to every requested grade: Math, Language & Reading and Science Grades 1–8, Core French Grades 4–8, and French Immersion language Grades 1–8. Additional grade data in `src/modules/curriculum-data/` contains separately researched expectation lists, original topic lessons, unit grouping metadata and independent activity banks. `getGradeCourses` and `getGradeCoverage` resolve the grade and French program on both the server and protected pages. Maps show instructional opportunities, not certified mastery. New topic quizzes contain four independently authored multiple-choice questions covering all three sections and two interactive questions.

There are **566 grade-specific lessons** (487 newly added), plus the three original starter text lessons: **569 text lessons and 1,707 review/final interactive activities**. The 1,689 numbered specific expectation mappings are instructional opportunities, not assessments of demonstrated mastery. Math's unnumbered A1/C4 cross-strand processes are mapped separately.

| Grade | Math | Language & Reading | Science | Core French | French Immersion |
|---|---:|---:|---:|---:|---:|
| 1 | 19 | 22 | 12 | — | 10 |
| 2 | 18 | 22 | 12 | — | 10 |
| 3 | 19 | 22 | 12 | — | 10 |
| 4 | 23 | 19 | 15 | 12 | 10 |
| 5 | 20 | 21 | 12 | 10 | 10 |
| 6 | 20 | 21 | 13 | 10 | 10 |
| 7 | 20 | 21 | 13 | 10 | 10 |
| 8 | 22 | 21 | 15 | 10 | 10 |

Additional grades were verified independently against Ministry content records for Mathematics (38/39/46/51/51/52/44 specifics for Grades 1/2/3/5/6/7/8) and Language (63/61/61/59/59/59/59), the official Science and Technology 2022 PDF (44/41/44/42/44/50/52), and the FSL 2013 PDF (Core Grades 5/6: 32 each, 7/8: 33 each; Immersion Grades 1/3: 39 each, 4–8: 40 each). FSL Core Grade 5–8 material is on printed pages 67–120; additional immersion grades use printed pages 201–214 and 229–312, with PDF pagination two pages later. Owned content tests retain independently researched expectation enumerations/ranges rather than deriving the expected lists from lesson mappings.

Browser result previews for French matching, spelling and mental mathematics use lightweight scoring helpers in `src/lib/practice-results.ts`, also reused by the server. They do not import every grade's teaching content into the browser. Server submissions still pass through the strict registered-activity schema and authoritative scoring in `src/lib/results.ts`.

### Preserved Grade 4 release

The original Grade 4 catalog remains unchanged:

| Module | Curriculum edition | Topic lessons (units) | Specific expectations mapped |
|---|---|---:|---:|
| Math | Mathematics 2020 | 23 (7) | 48, plus A1 and C4 cross-strand processes |
| Language & Reading | Language 2023, including spelling support | 19 (6) | 59 |
| Science | Science and Technology 2022 | 15 (5) | 44 |
| French | Core French 2013 | 12 (3) | 32 |

All 69 previously published Grade 4 topics are now separate lessons. Each retains its topic foundation and adds two topic-specific sections with worked examples or case studies, guided application, and unsaved checks. Familiar units group related topics in the catalog. Old Grade 4 course URLs open unit overviews, while old combined quiz URLs and scoring banks remain available for compatibility. Stored history is not rewritten.

Official sources: [Mathematics (2020)](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics), [Language (2023)](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language), [Science and Technology (2022)](https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology), and [French as a Second Language (2013)](https://www.edu.gov.on.ca/eng/curriculum/elementary/fsl18-2013curr.pdf). Identifiers and original summaries use each grade's official expectation lists, not copied Grade 4 counts. Language includes D3 (publishing/presenting/reflecting); mathematics includes grade-specific coding and financial literacy. Math A1 and C4 cross-strand processes are shown separately without inventing numbered specifics.

These are **original, curriculum-aligned supplementary activities, not Ministry-endorsed courses or a certification of mastery**. Mapping every expectation identifies an instructional or guided-practice opportunity, not proof that a child has demonstrated it. Speaking, listening, fluent reading, cursive/touch-typing, original composition, research, cultural understanding, experiments, and design require adult observation and feedback. Activities include review criteria; some require adult-selected library texts, French audio, community-authored resources, or safe materials. Complete longer activities over several sessions. No cultural stories are copied or invented as substitutes for creator-authored resources.

### French Immersion — Grades 1–8

The French subject selector defaults to Core French; `?program=immersion` selects Immersion when returning from its grade catalog. Immersion routes use `/learn/french/immersion-grade-[1-8]/[lesson]` and `/quiz`, so Core Grades 1–3 remain enrichment-only and existing Core URLs are not repurposed. Quiz submissions explicitly identify the program, and the server resolves the corresponding lesson bank before scoring. Saved results identify **French Immersion**, the grade, and the lesson, and retain only the final score and metadata.

The [official Ontario FSL curriculum (2013)](https://www.edu.gov.on.ca/eng/curriculum/elementary/fsl18-2013curr.pdf#page=217), printed pages 215–227, contains 39 Grade 2 Immersion specific expectations: Listening (9), Speaking (9), Reading (10), and Writing (11). Ten original lessons introduce listening strategies and instructions; listening responses and media; oral description and interaction; dialogues and announcements; sounds, vocabulary and fluency; narrative comprehension; questioning messages; purposeful writing; planning, revising and publishing; and local francophone cultures. This is the French-language curriculum, not the other subjects taught in French Immersion.

Teaching and quiz controls are primarily French, with English help collapsed by default. Narration selects `fr-CA`, then another French voice, and explicitly reports missing voices or playback failures without substituting English. Listening quiz passages are not displayed by default; an optional transcript supports adult-assisted or accessible practice (and changes the task from listening-only). Spoken, written, fluency and cultural activities need adult observation and creator/community-authored resources. The original Grade 2 five-question mixed finals remain unchanged; new grade lessons have six-question finals. Each covers every section with prompts different from practice; this is not evidence that all expectations have been mastered.

Section questions are **unsaved practice** and never contribute to the saved score. A **Start end-of-lesson quiz** link at the bottom of each signed-in text lesson opens `/learn/[subject]/[grade-or-practice]/[course]/quiz`. The quiz page includes a return-to-lesson link and requires authentication, even when accessed directly. Public sample pages retain their inline quizzes.

Each Grade 4 topic has a **six-question independent final quiz**: its original four questions cover all three sections, interleaved with two new topic-specific interactive questions. It works independently of whether the child completes the practice questions. Only the completed final quiz is submitted for server-authoritative scoring and private history, with Grade 4 and topic in the title. The server rejects section-practice save submissions; previously saved results remain viewable and unchanged. Activity work, adult assessment, and unfinished progress are not stored. Leaving an unfinished quiz, including returning to the lesson, restarts it. Each French unit's first, listening-focused topic retains its ten-word illustrated vocabulary, pronunciation audio, and separate ten-word/ten-image matching assessment. Other French topics link to that vocabulary lesson for reference. The spelling Test 1/Test 2 word lists are unchanged.

Each text section has compact, icon-only read/stop controls inline beside its heading, for its explanation and guided activity, not its quiz answers. Tooltips and accessible names describe the action; visible loading/errors and keyboard focus are retained. The repeated explanatory audio paragraph is omitted; voice-service details remain in the privacy/parent notes, linked from the learning footer. Regular lessons, including Core French, use English narration (preferring `en-CA`). French Immersion uses French narration (preferring `fr-CA`) and French control labels. French vocabulary cards retain their separate French pronunciation audio. Starting another section stops the previous narration; leaving the lesson stops its audio. Missing support, missing voices, and playback failures are shown explicitly. Browser/device voice services may process the narrated text remotely; no microphone or recording is used.

Section audio and vocabulary pronunciation warm up the browser's voice list on mount. An initially empty list is treated as loading, not immediately as a missing voice: the control shows a loading status and listens for `voiceschanged` for up to three seconds, then rechecks the list. The original click plays automatically as soon as a matching voice is ready. Stop, starting another control, or leaving the page cancels the pending request and removes its listener/timer; genuinely unavailable voices still produce an explicit error without using another language.

The classroom practice list is at `/learn/french/practice/classroom`. French matching supports dragging words onto pictures with a mouse, pen, or touch, with a floating word preview and highlighted drop target. For touch and pen, drag the grip beside a word; swiping elsewhere remains available for scrolling. Hold a drag near the screen's top or bottom to scroll longer lists. Images use three columns, including on mobile, where the scrollable word bank appears above them. Click/tap selection and Tab plus Enter/Space remain available as alternatives.

Matched words disappear from the word bank. With no word selected, click/tap a matched picture (or activate it with Enter/Space) to unmatch it; its word returns in its original order and receives keyboard focus. Dropping another word on an occupied image returns the previous word to the bank. Selecting a word and then clicking an occupied image still replaces the match as an accessible alternative to dragging. The bank shows the remaining count and an all-matched message when empty. Unmatching disables the check button until every word is matched again. Dropping outside the image bank or cancelling a drag changes nothing.

French matching uses each registered lesson's exact word count; all words must be matched one-to-one before checking. The server rejects missing, extra, duplicate, or unrelated image IDs and calculates the score out of the registered count (24 for classroom, 10 for existing sets). Completed signed-in attempts use the same private history and retry behaviour. Existing saved results and Grade 4 vocabulary sets are unchanged.

Core French and Extended French begin in Grade 4; the portal's Grades 1–3 French choices are labelled optional enrichment, not Core curriculum coverage. Grades 1–3 and 5–8 are not yet published. Spelling vocabulary lessons are independent of grade courses: `/learn/reading/vocabulary` lists study pages and direct quiz links. Previous `/learn/spelling` subject, vocabulary, and grade-course URLs redirect to their Language & Reading counterparts; `/learn/spelling/practice` redirects to the Vocabulary catalog. Grade 4 Language & Reading includes the three spelling-support topics. Legacy spelling registry and scoring lookups are retained for earlier submissions and history; saved spelling results retain their Spelling Bee activity label. Custom lists have spelling-only quizzes, not automatically generated definitions.

## Run locally (Windows PowerShell)

Use Node.js 22.12+ or 24. The Azure deployment uses Node.js 22.

```powershell
Set-Location C:\Users\zhuol\Projects\learning-portal
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open <http://localhost:3000>. Without credentials, the login page displays a setup notice and disables sign-in. Public samples still work; protected pages redirect to login. Without SQL configuration, completed signed-in tests show an explicit save failure with a retry button, and history shows a setup notice. There is no fake login or in-memory substitute for persistent history.

### Connect Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/), select or create a project.
2. Configure Google Auth Platform branding, audience, and data access. Choose **External** if using personal Google accounts. Request only basic identity scopes (`openid`, email, profile).
3. Create an OAuth client of type **Web application**.
4. Add this authorized JavaScript origin: `http://localhost:3000`.
5. Add this exact authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
6. While the Google app is in Testing, add the accounts you want to test as test users. To permit any eligible Google account, publish the consent configuration to Production and complete any requirements Google presents.
7. Put the client ID and client secret into `.env.local` as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
8. Generate a strong session secret:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

   Put the result into `AUTH_SECRET`. Keep `AUTH_URL=http://localhost:3000`.
9. Restart the app. Verify login, dashboard navigation, quizzes, sign-out, and that protected URLs redirect after sign-out.

Do not use `NEXT_PUBLIC_` variables for secrets. Do not commit `.env.local` or share credentials. Google sign-in requires a verified email. Supervised children's accounts can be restricted by Google/Family Link: test your actual accounts early. Do not work around age or supervision restrictions.

## Add a subject or lesson

The subject registry is [src/modules/index.ts](src/modules/index.ts).

1. Create a module such as `src/modules/history.ts`, exporting a `SubjectModule` from [the shared types](src/modules/types.ts).
2. Add it to the registry's `subjects` array. All dashboard cards, subject routes, lessons, and quizzes then use the registry automatically.
3. For a new visual theme, extend `SubjectTheme`, add an icon in [subject-icon.tsx](src/components/subject-icon.tsx), and add the matching `.theme-*` CSS variables in [globals.css](src/app/globals.css). A module may reuse an existing theme instead.
4. Give subjects and lessons unique lowercase, hyphenated slugs. Lesson-based subjects must include at least one lesson; quizzes must have questions, unique options and IDs, and a zero-based `answerIndex` within the options array. Spelling is a dedicated activity module, selected through `activity: "spelling"`.
5. Add all-grades practice lessons to a module's `lessons` array. For graded courses, use [src/modules/curriculum.ts](src/modules/curriculum.ts) and the subject content under [src/modules/grade4](src/modules/grade4). Each graded section has instruction, a guided activity, expectation identifiers, and unsaved practice questions. Add a separate assessment entry in [assessments.ts](src/modules/grade4/assessments.ts), keyed by course slug, with two new questions for each section in section order. The `course` helper requires this independent bank and gives final questions unique IDs and section references; it never falls back to practice questions. Keep totals within the server's 100-question limit. Extend grade lookup only when that grade is actually ready.
6. Update registry tests when adding subjects, and run the checks below. Review lesson content for age appropriateness and factual accuracy.

No new page or route is necessary. The starter tests also check content integrity and quiz behavior.

### Add French lessons

Add a vocabulary lesson in [src/modules/french.ts](src/modules/french.ts) with exactly ten unique `FrenchWord` entries: image `id`, `french` (including its article and accents), `english`, and a short `note`. Add any new original SVG drawings to [french-picture.tsx](src/components/french-picture.tsx), keyed by the same IDs. French uses the existing subject/lesson routes; `frenchWords` selects the study and matching UI instead of the standard multiple-choice lesson.

Study cards show pictures, meanings, and pronunciation notes. Read-aloud explicitly chooses an available French voice, preferring `fr-FR`, and reports missing or failing speech support rather than using an English voice. Enable/install a French voice on your browser/device if needed. No external image service or AI service is used.

Matching quizzes shuffle the ten images and require a one-to-one assignment of all ten words. Kids select a word and then an image, using touch, mouse, or keyboard; drag-and-drop is not required. Reusing an image moves it to the newly selected word and unmatches the previous word. No correctness feedback appears until all matches are checked. English SVG descriptions remain available to screen readers, while visible quiz cards omit English meanings until review. This is an accessible practice activity, not a proctored assessment.

The server validates ten unique lesson image IDs and recomputes the score. Saved French results use kind `matching` and the existing JSON SQL table, with no schema migration; history shows the chosen and correct meanings. Public French samples never save results. Regression tests cover all three lessons, exact image/word counts, incorrect matches, one-to-one reassignment, audio errors, retries, route integration, and compatibility with older results.

## Validate

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run typecheck
```

The production build checks application types too. Automated tests cover registry integrity, original practice, spelling/vocabulary, custom lists, French matching/audio, authenticated grade and quiz-page navigation, legacy redirects, every Grade 4 expectation identifier, independent final questions covering every section, unsaved practice, rejection of section saves, section narration controls/errors, isolated radio groups, server-authoritative scoring, save retries, and SQL ownership/parameterization. SQL tests use a mocked driver; live persistence requires a provisioned database and permissions.

Dependency advisories at initial setup: full `npm audit` reports a high-severity `braces` stack-exhaustion advisory through development-only ESLint glob dependencies and a moderate `sprintf-js` precision-format denial-of-service advisory through the runtime SQL driver. Neither package currently has a patched release. Lint patterns and driver format strings are not supplied by portal users; SQL values are bound parameters. Recheck advisories when updating. Avoid `npm audit fix --force`, which proposes incompatible major downgrades of the lint config and SQL driver.

## Deploy to your Azure subscription

Deployment is **not performed automatically by local setup**. The following provisioning defaults to the free Linux F1 App Service plan, where available for your region/subscription. F1 has shared compute, 60 CPU minutes per app per day, 1 GB memory and 1 GB storage, no Always On, and no SLA; Microsoft intends it for experimentation and learning rather than production workloads. Quotas can make the app unavailable, and idle unloading can delay the next visit. Pass `skuName=B1` for a paid plan with Always On; a paid plan incurs charges even when nobody is using the site. Azure SQL remains a separate billed resource. Confirm your subscription and costs first.

### 1. Provision App Service

Install the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), sign in, and choose your subscription. In PowerShell, replace the example values:

```powershell
az login
az account set --subscription "<your-subscription-id>"
az group create --name "learning-portal-rg" --location "eastus"
az deployment group create --resource-group "learning-portal-rg" --template-file .\infra\main.bicep --parameters appName="<globally-unique-app-name>"
```

[infra/main.bicep](infra/main.bicep) configures HTTPS-only hosting, Node.js 22, startup command `node server.js`, and trusted Azure proxy headers. F1 disables Always On and App Service's automatic health checks; the application's `/api/health` endpoint remains available. Paid plans enable Always On and monitor that endpoint. The startup command is for the **standalone deployment artifact**, not the source directory.

Use the `websiteUrl` deployment output as your actual production origin. Azure may assign a hostname with a regional/unique suffix rather than `<app-name>.azurewebsites.net`. Bicep derives `AUTH_URL` from the assigned hostname. This is an initial-provisioning template: rerunning it replaces app settings, so reapply credentials and any custom-domain settings afterward.

### 2. Set production credentials

In Azure Portal, open the App Service's **Settings → Environment variables** and securely add:

| Setting | Value |
| --- | --- |
| `AUTH_SECRET` | A newly generated random secret (different from local development) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | Actual `websiteUrl` deployment output (set by Bicep; update for a custom domain) |
| `AUTH_TRUST_HOST` | `true` (set by Bicep for App Service's trusted reverse proxy) |

App settings are read at runtime; do not put Google credentials into GitHub build jobs. Key Vault references are an option if you want centralized secret management.

In Google Cloud, add the production origin and redirect URI:

```text
https://<actual-azure-hostname>
https://<actual-azure-hostname>/api/auth/callback/google
```

The second URL is the redirect URI. If using a custom domain, update both Google entries and `AUTH_URL`. Save app settings and restart the App Service.

### 3. Provision passwordless Azure SQL

This adds a separately billed Basic Azure SQL database (2 GB). Review regional pricing and storage requirements before provisioning. The app uses `DefaultAzureCredential`: your Azure CLI account locally and the App Service system-assigned managed identity on Azure. Google accounts are portal users, not database login accounts.

1. In Microsoft Entra ID, create or select a security group for database administration. Add your Azure developer account and record the group's **object ID**.
2. Get the App Service's possible outbound addresses. Then deploy [infra/sql.bicep](infra/sql.bicep), replacing placeholders:

   ```powershell
   $outboundIps = az webapp show --resource-group "learning-portal-rg" --name "<app-name>" --query possibleOutboundIpAddresses --output tsv
   az deployment group create --resource-group "learning-portal-rg" --template-file .\infra\sql.bicep --parameters sqlServerName="<globally-unique-sql-name>" adminGroupName="<admin-group-name>" adminGroupObjectId="<group-object-id>" appOutboundIps="$outboundIps" developerIp="<your-public-ipv4>"
   ```

   The template enables Entra-only authentication, TLS 1.2+, and firewall rules for the supplied App Service outbound addresses and optional developer IP. It does **not** broadly enable "Allow Azure services." Omit `developerIp` to block local access. Update firewall rules after changing plans, regions, or outbound addresses. For stronger production network isolation, move to private endpoints/VNet integration.
3. Connect to the `learning-portal` database using Microsoft Entra authentication as a group administrator (Azure Portal query editor or a compatible SQL client). Execute the table/index portion of [infra/schema.sql](infra/schema.sql).
4. Create a contained user for the App Service managed identity and grant only `SELECT, INSERT` on `dbo.TestResults`, using the commented commands in [infra/schema.sql](infra/schema.sql). Use the actual App Service identity display name; the `appIdentityObjectId` provisioning output helps identify it. If Entra principal resolution fails, your Entra administrator may need to grant the SQL server's managed identity directory-read permission; do not grant the application broad database-owner permissions to work around it.
5. Grant the same table permissions to your developer Entra identity for local testing.
6. Add `SQL_SERVER=<sqlHostname-output>` and `SQL_DATABASE=learning-portal` to App Service environment variables and `.env.local`. Leave `SQL_MANAGED_IDENTITY_CLIENT_ID` unset for system-assigned identity. It is only needed if intentionally switching to a user-assigned identity.
7. Locally, run `az login --tenant "<tenant-id>"`, select the correct subscription, and restart the app. Your developer IP must be allowed by the SQL firewall. Do not supply database passwords.

The app never creates tables or principals at startup. `/api/health` checks the web process, not SQL readiness. A missing schema, permission, firewall rule, or SQL connection produces an explicit history/save error instead of success.

For a personal deployment, the SQL template also accepts `adminPrincipalType=User` with your signed-in Entra user's display name and object ID in `adminGroupName` and `adminGroupObjectId`. `appOutboundIps` can be omitted when the App Service has not been deployed yet. Add its exact outbound addresses and grant its managed identity table access when hosting is configured.

After provisioning, you can initialize and verify the schema using the same passwordless driver as the application:

```powershell
$env:SQL_SERVER = "<sql-hostname>"
$env:SQL_DATABASE = "learning-portal"
node .\scripts\initialize-sql.mjs
```

Run as the configured Entra administrator after `az login`. This idempotently creates the table/index and verifies a parameterized insert/read inside a transaction that is rolled back, leaving no test records.

#### Current database deployment

Provisioned on October 9, 2026, in the **Visual Studio Enterprise with MSDN** subscription:

- Resource group: `learning-portal-rg`
- Region: Canada Central
- SQL server: `littleoak-sql-2a3210e0.database.windows.net`
- Database: `learning-portal` (Basic, 5 DTU, 2 GB)
- Entra-only administrator: the deploying Azure user
- Firewall: only the developer's public IPv4 address at deployment time
- Results table/index and passwordless parameterized insert/read verified; verification rows rolled back

The ignored `.env.local` contains the SQL hostname/database, not credentials. Restart local Next.js to load it. Google OAuth still needs configuration. Update the developer firewall rule if your public IP changes. The database is a billed resource.

#### Current website deployment

The website is hosted at <https://www.little-oak.ca>. The original <https://littleoak-portal-2a3210e0.azurewebsites.net> hostname remains available:

- App Service: `littleoak-portal-2a3210e0`, in `learning-portal-rg`, Canada Central.
- Linux Basic B1 plan: `littleoak-portal-2a3210e0-plan`, upgraded by the owner to support custom-domain HTTPS. Always On and automatic health checks are currently disabled. B1 and Azure SQL Basic are separately billed.
- Namecheap DNS: `www` CNAME points to `littleoak-portal-2a3210e0.azurewebsites.net`; `asuid.www` TXT retains Azure's domain-verification ID. Azure's free managed certificate is SNI-bound to `www.little-oak.ca` and automatically renewed. Keep these DNS records in place.
- Node.js 22, HTTPS-only, startup command `node server.js`.
- Standalone application hosted with `WEBSITE_RUN_FROM_PACKAGE=1`.
- Runtime SQL settings and a generated production `AUTH_SECRET` are configured in Azure, not committed to source.
- Exact App Service outbound firewall rules and a contained managed-identity user with only `SELECT, INSERT` permissions are configured.
- Managed-identity database access and transactional result insert/read were verified inside the actual application container. Verification records were rolled back.
- Google OAuth credentials are configured securely in Azure App Service. The production callback was registered in Google Cloud and verified to reach Google's normal sign-in page without a redirect mismatch. Completing account sign-in and verifying authenticated history remain user acceptance checks.

For Google sign-in, the production OAuth origin is
`https://www.little-oak.ca` and redirect URI
`https://www.little-oak.ca/api/auth/callback/google`. Azure `AUTH_URL` uses the custom-domain origin. Keep the old Azure callback registered during transition. Sign in again on the new domain: cookies do not transfer between hostnames, but account-owned SQL progress and history remain the same.
`AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are stored in App Service environment variables, not source code. Update them there if rotating credentials. Restart after changes and verify login, result saving, user isolation, and sign-out with the actual accounts. Changing a downloaded OAuth JSON file does not change the Google Cloud client's allowed callback URLs.

For direct deployment from Windows, ZIP entries must use standard archive separators, and the package must include `.next/static`, `public`, and all standalone dependencies. Environment files must not be included. The production build uses `next build --webpack`: the Windows Turbopack build referenced a hashed `mssql` alias that was absent from its standalone artifact, causing save/history HTTP 500 errors. Webpack preserves the standard `mssql` runtime import; the Next.js configuration explicitly externalizes it so the SQL driver and its dependencies are traced into the standalone artifact. Verify the packaged standalone server's save path, not just the normal local Next server. The GitHub workflow builds and packages on Linux.

[scripts/grant-app-sql.mjs](scripts/grant-app-sql.mjs) supports passwordless administrator provisioning of the contained app user. Set `SQL_SERVER`, `SQL_DATABASE`, `APP_IDENTITY_NAME`, `APP_IDENTITY_CLIENT_ID`, and `APP_IDENTITY_OBJECT_ID`; retrieve the identity IDs with `az ad sp show --id <app-identity-object-id>`. A service principal's SQL SID is its **client/application ID**, not its Entra object ID. The script grants only `SELECT, INSERT` and verifies the grants.

[scripts/verify-app-sql.mjs](scripts/verify-app-sql.mjs) verifies managed-identity read/insert access and absence of update/delete rights, rolling back test inserts. Run it inside the actual App Service container, not the separate Kudu console, which has a different runtime and dependency filesystem.

### 4. Configure deployment from GitHub

The project is tracked in the private [zhu-oliver/learning-portal](https://github.com/zhu-oliver/learning-portal) repository on `main`.

Use [infra/github-deploy.bicep](infra/github-deploy.bicep) to provision a separate user-assigned managed identity, `${appName}-github-deploy`, with GitHub OIDC federation for the repository's **`production` environment**. It receives **Website Contributor** only on the existing App Service, not the resource group or subscription. The template does not change the app's runtime identity, SQL permissions, plan, settings, or Google credentials.

```powershell
az deployment group create --resource-group learning-portal-rg --name github-deployment-access --template-file infra/github-deploy.bicep --parameters appName=littleoak-portal-2a3210e0
```

Create the `production` environment in GitHub, restricting deployment branches to `main` without requiring manual approval for automatic deployments. Add these production-environment **variables** from the template outputs:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_WEBAPP_NAME`
- `AZURE_RESOURCE_GROUP`

Match Azure's federated identity subject to GitHub's exact OIDC `sub` claim. For this repository it is `repo:zhu-oliver@44208600/learning-portal@1468309284:environment:production`, including immutable owner and repository IDs. Do not replace it with the older name-only format or disable that immutable identity binding. For another repository, supply its exact subject through the template's `githubSubject` parameter. No publish-profile secret is needed.

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) validates pull requests; every normal push to `main` validates, builds, and deploys to Azure automatically. The initial repository import used `[skip ci]`; commits with that marker intentionally do not deploy. You can also run the workflow manually on `main` from GitHub Actions. The full test suite uses two workers and a 15-second default per-test timeout to avoid UI-test resource contention on shared runners; longer explicitly timed tests keep their own limits. No tests are skipped.

The workflow packages `.next/standalone`, including `.next/static`, `public`, the SQL driver, and all four private game documents, and rejects artifacts containing environment files. It retains artifacts for seven days, logs into Azure with OIDC without a publish profile or Azure password, deploys, and polls `/api/health` until it returns `{"status":"ok"}`. Production deployments are serialized. Failed validation prevents deployment. Runtime credentials remain exclusively in App Service settings; no application credentials are supplied to GitHub builds.

### 5. Verify the deployed site

- Visit `/api/health` and confirm `{"status":"ok"}`.
- Confirm the login page has styling and a working Google button.
- Log in with your actual Google accounts. Confirm the subject lessons, spelling lists, and custom spelling tests work. Complete each type and confirm its result appears in history after refreshing or signing back in.
- Sign in as a second user. Verify their history is separate and opening the first user's saved result URL returns not-found.
- Retry a failed save before leaving the page. Retries use the same attempt ID and must create only one saved record; starting a fresh attempt creates a new record.
- Sign out, then directly open `/learn`, `/learn/math`, and `/learn/math/fraction-detectives`. Each must redirect to login.
- Confirm `/try` and `/try/spelling` remain public and do not save results. Check phone-sized layouts, speech support and browser/device audio.
- If login fails, check exact callback URLs, Google audience/test-user settings, all three secrets, and Azure application logs.

For local production testing, `npm.cmd run build` followed by `npm.cmd start` uses Next.js's regular local server. Azure instead runs the packaged standalone `server.js`.

## Privacy and next steps

The public [parent notes](src/app/privacy/page.tsx) explain data handling. Google authenticates accounts; an encrypted HTTP-only session cookie lasts up to eight hours. The UI displays a first name and initial. Auth.js may retain basic profile fields in its encrypted session token; access/refresh tokens are not exposed to client code. Azure can record operational requests and IP addresses in hosting logs.

Each saved attempt is keyed by the stable Google subject identifier, not an email or a browser-supplied user ID. The server recomputes scores from registered questions and answer keys, validates custom spelling lists, and uses parameterized SQL. Answers are sent for scoring but are not persisted in new results. Saved JSON contains only the quiz kind, title, subject, final score, total, and (for Mental Mathematics) elapsed milliseconds; the database assigns the UTC completion time. Custom words, per-question answers, explanations, and section scores are not stored in new attempts. Immediate answer review remains available on the completion page; older saved answer-detail records remain readable and are not rewritten. A composite primary key and transaction locks make identical final-score retries idempotent and reject conflicting summary data for the same attempt.

The JWT callback explicitly stores `google:<providerAccountId>` as the history owner. Auth.js's default JWT `sub` is a generated per-login user ID without a database adapter and must not be used for persistent ownership. Sessions created before this fix require signing in again; the landing page does not redirect these legacy sessions back into protected pages.

Previously saved results under random login IDs cannot be automatically mapped back to Google accounts: the old records contain no verified account mapping. [scripts/recover-legacy-results.mjs](scripts/recover-legacy-results.mjs) is an administrator-only recovery tool for the explicitly confirmed single-account case. With `SQL_SERVER` and `SQL_DATABASE`, it first reports counts without changing data. Only after ownership is confirmed, set `RECOVERY_GOOGLE_USER_ID` from that user's newly authenticated session and `RECOVERY_CONFIRMED_COUNT` to the exact inspected count. It transactionally updates only legacy UUID owners while preserving all result content. Never use this to merge multiple users' histories; those require individually verified ownership.

Spelling uses browser/device speech synthesis, which may use a remote voice service. There is no microphone access or AI API credential in the module. Predefined vocabulary questions are curated in [src/modules/spelling.ts](src/modules/spelling.ts); custom lists and missed-word practice are spelling-only. These are practice activities, not tamper-proof examinations: answer keys are available in the learning UI, and there is no proctoring.

Results currently remain until an authorized administrator deletes them. Review retention requirements and delete a user's rows using a **parameterized** `DELETE FROM dbo.TestResults WHERE UserId = @userId` as an administrator (the app identity deliberately has no delete permission). SQL backup retention may retain deleted records temporarily; configure this to match your policy. No parent/admin UI or self-service deletion is included yet.

This is a starter, not a compliance certification. Review applicable children's privacy requirements before opening the site beyond your family. Parent controls, saved in-progress work, and additional modules can be added later with explicit privacy decisions. Live Google OAuth, managed-identity database access, and Azure deployment must be verified with your own credentials and subscription.
