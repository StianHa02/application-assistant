# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G05 – G05-chen-eldebsy-jama-johansen |
| **Product brief** | `.docs/planning-artifacts/briefs/brief-IBE160-2026-09-26/brief.md` (commit f316824), lest sammen med `addendum.md` i samme mappe |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. Problemet er godt forklart med konkrete situasjoner: generiske søknader, manglende tilbakemelding og ATS som «svart boks». Ideen om å vise *resonneringen* bak gap-analysen og ATS-tilbakemeldingen gir appen et tydelig læringsformål og skiller den fra å være en ren tekstgenerator.
2. Dere har tatt stilling til de tre beslutningspunktene fra oppgaveteksten (forslag vs. omskriving, filformat, språk) med begrunnede standardvalg, og addendumet viser at dere har tenkt på personvern (kryptering, sletting, GDPR) og på at ATS i dag handler om relevans, ikke nøkkelordfylling.

**De viktigste endringene:**

1. Omfanget er hele oppgaveteksten pluss litt til. Velg én kjerneflyt for v1 (last opp CV + lim inn annonse → gap-analyse med begrunnelse → søknadsbrev i forslagsmodus), og flytt resten til senere trinn.
2. Appen er helt avhengig av en språkmodell, men briefen sier ingenting om hvilken, hva den koster, eller hvordan sensor kan kjøre appen uten deres nøkkel. Legg inn en plan for dette.
3. Suksesskriteriene er delvis subjektive («et forslag de faktisk ville handlet på»). Legg til kriterier som kan sjekkes og testes, og fjern `[ASSUMPTION]`-merkene når dere har bestemt dere.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Middels**

**Sammenlignbart med:** 2) AI CV- og søknadsassistent (middels) – briefen er i praksis dette forslaget.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Middels | Lite klassisk regellogikk, men gap-analyse og «ATS-tilbakemelding» må defineres presist: hva er en kvalifikasjon, når regnes den som dekket, og hva betyr en score? |
| Datamodell – antall entiteter og relasjoner mellom dem | Middels | Bruker, CV, stillingsannonse, generert søknad/analyse og eventuelt tidligere søknader. Overkommelig, men versjonering av CV-er og resultater bør holdes enkelt. |
| Brukere, roller og innlogging | Middels | Én rolle (student) med innlogging. Det er greit, men innlogging må virke lokalt for sensor uten eksterne kontoer. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Høy | Fire ulike KI-utdata (søknadsbrev, CV-forslag, gap-analyse, ATS-tilbakemelding), tone/språkvalg og læring fra tidligere søknader. KI-svarene er kjernen i appen, og kvaliteten er vanskelig å måle. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Språkmodell-API. Annonse «som lenke» betyr i tillegg henting og tolking av nettsider – det bør dere droppe i v1. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Brukerne påvirker ikke hverandre. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Høy | Lesing av PDF, DOC og TXT, pluss PDF-eksport av søknadsbrev. Pålitelig tekstuttrekk fra CV-er med kolonner og tabeller er krevende, og gammelt .doc-format er ekstra vanskelig. |
| Sikkerhet og personvern | Høy | CV-er er personopplysninger, og dere lover kryptering i ro og sletting. I tillegg sendes CV-teksten til en ekstern språkmodell – det må dere ta stilling til. |

**Hva vanskelighetsgraden betyr for dere:**

- _Middels:_ Et godt balansert valg. Pass på at kjerneflyten blir ferdig og stabil før dere legger til mer. For dere betyr det: få gap-analysen med begrunnelse til å fungere godt på noen få testsett før dere bygger ATS-delen, tidligere søknader og flere eksportformater.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | Risiko | «Gruppen valgte å beholde hele oppgavens funksjonsomfang». Fire utdata, tre filformater inn, PDF ut, to språk, innlogging og kryptering er mye. Kjerneflyten er realistisk; alt samtidig er det neppe. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | Risiko | Data inn/ut er tydelig, men flere sentrale valg står som `[ASSUMPTION]` (ATS-tilnærming, «hva du bør gjøre med gapet», målgruppe). Avklar dem, ellers må PRD-en gjette. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | En vanlig webapp med skjema, opplasting og LLM-kall passer Claude Code godt. Velg ett godt dokumentert bibliotek for PDF-lesing og hold dere til det. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | Risiko | Dere kan selv vurdere om et søknadsbrev er godt, men det er vanskelig å vite om en «ATS-score» er riktig. Lag noen faste testsett (CV + annonse) der dere på forhånd har bestemt hvilke kvalifikasjoner som mangler. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | Risiko | Filopplasting, innlogging, sletting og lagring kan testes godt. KI-utdata må testes med faste eksempler og sjekk av struktur (f.eks. at gap-analysen alltid har krav, status og begrunnelse), og med mock-svar i automatiske tester. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Risiko | Ikke beskrevet. Sensor trenger enten egen nøkkel med tydelig oppskrift i README, eller en demomodus med lagrede eksempelsvar. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Stor risiko | Ingen plan for modellvalg, kostnad eller mock-data. Uten en slik plan kan verken tester eller sensor kjøre kjerneflyten. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart med justert omfang.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. V1: innlogging, opplasting av CV som PDF eller TXT, annonse som innlimt tekst, gap-analyse med synlig begrunnelse og søknadsbrev i forslagsmodus, på ett språk. Flytt DOC-format, annonse som lenke, «tidligere søknader», fullstendig omskriving og PDF-eksport til trinn 2.
2. Behandle ATS-tilbakemeldingen som en del av gap-analysen (relevans mot annonsens krav) i stedet for en egen modul med egen score. Det gjør v1 mindre og er i tråd med det dere selv skriver om moderne ATS.
3. Legg inn en demomodus med mock-svar fra språkmodellen og noen fiktive eksempel-CV-er og annonser i repoet. Det gir både stabile tester og en app sensor kan prøve uten nøkkel.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Tydelig: én CV blir til en tilpasset søknad, og verktøyet viser hvordan KI-screening vurderer kandidaten. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Fire konkrete friksjonspunkter, inkludert personvern. Godt gjort. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | Juster | Data inn/ut er godt listet, men det mangler en beskrivelse av hva studenten faktisk gjør steg for steg og ser på skjermen. Beskriv kjerneflyten i 3–5 steg. |
| What Makes This Different – er vurderingen ærlig og realistisk? | OK | Ærlig om at ATS-scoring er hygienefaktor, og gode differensiatorer (transparens, «hva du bør gjøre med gapet»). Avklar om sistnevnte er med i v1. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | Juster | «Studenter generelt» er bredt. Velg en konkret primærbruker, f.eks. en bachelorstudent ved HiMolde som søker sommerjobb eller praksisplass. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Endre | Første kriterium er bra, men «et forslag de faktisk ville handlet på» er subjektivt. Legg til testbare kriterier, f.eks. «gap-analysen for testsett A finner de tre manglende kvalifikasjonene vi har definert», «en bruker kan slette alle sine dokumenter», «en ugyldig fil gir en forståelig feilmelding». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | Endre | «In» er hele oppgaveteksten. Del i en tydelig v1 og senere trinn (se forslagene over), og flytt språkmodell-oppsett og demomodus inn i scope. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Realistisk og knyttet til differensiatorene. Pass på at «lære studentens stemme» ikke sniker seg inn i v1. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Godt grunnlag, og det er bra at briefen er versjonert i git. Avklar `[ASSUMPTION]`-punktene og lagre gjerne promptene dere bruker til gap-analysen, så sensor ser hvordan dere har styrt KI-en. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Endre | Omfanget er for stort til å bli stabilt. En smalere v1 med god gap-analyse gir nok reell funksjonalitet for et middels prosjekt. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Planlegg faste testsett med fasit og mock av språkmodellen. Test også filparsing på noen ulike CV-oppsett. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | Juster | Visning av begrunnelser er en fin designutfordring. Skisser hvordan gap-analysen og forslagene vises side om side med CV-en og annonsen. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | Juster | Ingen teknologivalg ennå, og det er greit i en brief. I arkitekturen bør dere velge en enkel stakk og samle alle LLM-kall i én modul som kan byttes ut med mock. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Endre | Avhenger av språkmodell og innlogging. Planlegg `.env.example`, demomodus og en testbruker allerede nå. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Bruk bare fiktive CV-er som testdata i repoet, aldri gruppemedlemmenes egne. API-nøkler og krypteringsnøkler må ligge i `.env`, som ikke committes. |

## 3. Neste steg for gruppen

1. Skriv en kort v1-definisjon i Scope (kjerneflyten over), og flytt resten til en tydelig liste over senere trinn.
2. Bestem språkmodell, og beskriv i briefen hvordan dere håndterer nøkkel, kostnad og en demomodus med mock-svar.
3. Erstatt de subjektive suksesskriteriene med testbare kriterier, og lag 3–5 fiktive testsett (CV + annonse) med forventet gap-analyse.
4. Avklar `[ASSUMPTION]`-punktene og primærbrukeren, og gå deretter videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
