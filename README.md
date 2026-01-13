# HoardBoard - Frontend
Detta repository innehåller **frontend** för ett kursplaneringssystem. Applikationen bygger på **React 19** och och använder **FullCalendar** för kalender-/schema-vy samt **Tailwind CSS** för styling. Frontenden kommunicerar med ett separat backend-API via ett tunt API-lager och React-hooks. **Vite**
Den här README:n beskriver systemet på en teknisk nivå (arkitektur, flöden, katalogstruktur, integrationer, drift). Den utgår från projektstrukturen och namngivning i koden men undviker onödiga kodutdrag.
## Innehåll
- [Översikt](#%C3%B6versikt)
- [Teknisk stack](#teknisk-stack)
- [Kom igång lokalt](#kom-ig%C3%A5ng-lokalt)
- [Körscripts](#k%C3%B6rscripts)
- [Arkitektur och dataflöde](#arkitektur-och-datafl%C3%B6de)
- [Domän: objekt och begrepp](#dom%C3%A4n-objekt-och-begrepp)
- [API-integration](#api-integration)
- [Kalender (FullCalendar)](#kalender-fullcalendar)
- [UI-struktur (sidopaneler, modaler)](#ui-struktur-sidopaneler-modaler)
- [State, hooks och refetch-mönster](#state-hooks-och-refetch-m%C3%B6nster)
- [Styling](#styling)
- [Felhantering](#felhantering)
- [Utvecklingsrutiner och konventioner](#utvecklingsrutiner-och-konventioner)
- [Felsökning](#fels%C3%B6kning)

## Översikt
Frontenden visualiserar och hanterar planering i en kalender, typiskt:
- **Kurser** och **övriga kategorier** (“miscs”)
- **Händelser** kopplade till kurser respektive övriga kategorier
- **Lärare/personer** som kan kopplas till händelser
- **Helgdagar** och **semester/ledighet** som påverkar kalenderns markeringar

Applikationen har en central “DemoApp”-sida som:
1. Hämtar grunddata (kurser, miscs, events, personer, helgdagar, vacation)
2. Normaliserar/mapper data till FullCalendars event-format
3. Renderar kalendern och sidopaneler/modaler
4. Skriver ändringar tillbaka via API (skapa/uppdatera/ta bort, drag&drop, resize, koppla lärare osv.)

## Teknisk stack
**Kärna**
- React `19.2.x`
- react-dom `19.2.x`
- Vite `7.x`

**Kalender**
- `@fullcalendar/react`
- `@fullcalendar/core`
- , `daygrid`, `interaction`, `multimonth` `@fullcalendar/timegrid`

**UI & hjälpbibliotek**
- Tailwind CSS ( + ) `tailwindcss``@tailwindcss/vite`
- (select/dropdowns) `react-select`
- (färgväljare) `react-colorful`
- (ikoner) `@heroicons/react`
- (datumhantering) `date-fns`

## Kom igång lokalt
### Förutsättningar
- Node.js (LTS rekommenderas)
- npm (projektet använder ) `package-lock.json`

### Installera
``` bash
npm install
```
### Starta dev-server
``` bash
npm run dev
```
Vite skriver normalt ut en lokal URL (t.ex. `http://localhost:5173`).
## Körscripts
I finns: `package.json`
- `npm run dev` – startar Vite i utvecklingsläge
- `npm run build` – bygger produktion (Vite build)
- `npm run preview` – kör built output lokalt

## Arkitektur och dataflöde
### Huvudkomponenter
- **Entry**: mountar React-appen och renderar huvudsidan. `src/index.jsx`
- **Sida**: är “orkestratorn”:
    - håller UI-state (sidopaneler, filter, valda kategorier, datumintervall)
    - binder FullCalendar callbacks (drag/drop, resize, click, hover)
    - koordinerar API-hooks och “refetch”

`src/features/pages/DemoApp.jsx`

### Lagerindelning (förenklat)
1. **UI-komponenter** (`src/features/components/`)
2. **Hooks** för dataåtkomst och mutationer () `src/features/hooks.js`
3. **API-klient** () som mappar frontend-anrop till backend-endpoints `src/features/api.jsx`
4. **Fetcher/transport** (`src/lib/...`) – gemensam fetch-wrapper (bas-URL, headers, parsing, ev. auth)

## Domän: objekt och begrepp
Begreppen som förekommer i frontendens API-lager:
- **Course (kurs)**
    - egenskaper som namn, färg, antal studenter, start-/slutdatum

- **Misc (övrigt/kategori)**
    - liknande kurs, men för andra typer av planeringsobjekt

- **CourseEvent (kurshändelse)**
    - kopplad till kurs () `courseId`
    - har start-/sluttid samt beskrivning
    - kan ha kopplade **teachers/persons**

- **MiscEvent (övrig händelse)**
    - kopplad till misc () `miscId`
    - har tider, namn och beskrivning

- **Person/Teacher**
    - personer som kan kopplas till kurshändelser (add/remove)

- **Holiday**
    - helgdagar (hämtas från API och renderas/markeras)

- **Vacation**
    - ledighetsdagar (CRUD) som markeras i kalendern

Notera: exakt modell (fält/typer) styrs av backend. Frontenden skickar/consumar de fält som API-lagret förväntar sig.## API-integration
### Var API-anrop definieras
- innehåller en -export med metoder per resurs. `src/features/api.jsx``API`
- Underliggande HTTP-hantering sker via en gemensam `api(...)`-funktion i `src/lib/` (fetch-wrapper).

### Exempel på resurser/endpoints som används
Frontenden pratar med endpoints i stil med:
**Kategorier**
- `GET /courses`
- `POST /courses`
- `PUT /courses/:id`
- `DELETE /courses/:id`
- `GET /miscs`
- `POST /miscs`
- `PUT /miscs/:id`
- `DELETE /miscs/:id`

**Händelser**
- `GET /course-events`
- `POST /course-events`
- `PUT /course-events`
- `DELETE /course-events/:id`
- `GET /misc-events`
- `POST /misc-events`
- `PUT /misc-events`
- `DELETE /misc-events/:id`

**Tider (snabba uppdateringar vid drag/resize)**
- `PUT /course-events/:id/course-update-time`
- `PUT /course-events/:id/course-end-time`
- `PUT /misc-events/:id/misc-update-time`
- `PUT /misc-events/:id/misc-end-time`

**Lärare/personer**
- `GET /persons`
- `POST /persons`
- `DELETE /persons/:id`
- `PUT /course-events/:eventId/teachers/:personId`
- `DELETE /course-events/:eventId/teachers/:personId`

**Helgdagar & ledighet**
- `GET /holidays`
- `GET /vacation`
- `POST /vacation`
- `DELETE /vacation/:id`

### Konfiguration (base URL, CORS, auth)
Det är normalt att fetch-wrappern i `src/lib/` ansvarar för:
- base URL till backend (t.ex. via environment-variabel)
- default headers (`Content-Type: application/json`)
- felhantering och JSON-parsning

## Kalender (FullCalendar)
Applikationen använder FullCalendar med flera vyer:
- **timeGridWeek / timeGridDay** (veckovy/dagvy)
- **customTwoWeeks** (egen 2-veckors vy)
- **customInterval** (styrt intervall via datuminputs)
- **multiMonthYear** via (månadsvy i staplat läge) `@fullcalendar/multimonth`

### Centrala interaktioner
- **Drag & drop** (flytta event i tid)
- **Resize** (ändra sluttid/längd)
- **Click** (öppna edit-modal)
- **Hover** (visa hover-modal med mer info)
- **Droppable** (ta emot externa “draggables” om UI erbjuder det)

### Markering av dagar
Kalenderdagar kan få CSS-klasser baserat på:
- helg (lör/sön)
- helgdag (holiday set)
- semester (vacation set)

Det gör att UI kan färgkoda bakgrunder för olika typer av dagar.
## UI-struktur (sidopaneler, modaler)
I `src/features/components/` finns komponenter för:
- **LeftSidebar / RightSideBar**: navigering, filter, listor, sammanställningar
- **Create/Edit-modaler**: skapa/uppdatera kurser, miscs och events
- **TeacherPicker**: koppla personer till event
- **VacationPicker**: hantera ledighetsdagar
- **AlertModal**: bekräftelser/varningar
- **HoverModal**: visning av eventdetaljer vid hover
- **ColorPicker**: väljer färg (troligen via ) `react-colorful`

Mönster:
- “Page”-komponenten (DemoApp) äger state och skickar callbacks ner.
- Modaler öppnas/stängs via stateflaggor och får “current selection” som props.

## State, hooks och refetch-mönster
### Var hooks finns
- `src/features/hooks.js`

Typiskt upplägg per resurs:
- `useGetX()` hämtar lista/data och exponerar `{ data, loading, err, refetch }`
- `useSaveX()`, `useUpdateX()`, `useDeleteX()` gör mutationer och returnerar status

Ett vanligt mönster är att `refetch()` triggar en omkörning av via en intern (enkelt och robust i React). `useEffect``refreshIndex`
Efter en mutation (t.ex. skapa event) anropas ofta refetch...() för att synka UI med backend i stället för att lita på optimistisk uppdatering.## Styling
- Tailwind används via Vite-plugin () och global styling finns i:
    - `src/index.css`
    - kalender-specifik CSS i (om den används av DemoApp/komponenter) `src/features/Calendar.css`

`@tailwindcss/vite`

FullCalendar kräver ofta extra CSS-justeringar för spacing, overflow och event-rendering—det brukar ligga i Calendar.css och/eller Tailwind-klasser runt kalendern.