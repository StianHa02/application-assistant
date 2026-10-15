---
title: "Product Brief: AI CV & Job Application Assistant"
status: revised
version: 2
created: 2026-09-26
updated: 2026-10-15
replaces: docs/brief.md (version 1, 2026-09-26)
---

# Product Brief: AI CV & Job Application Assistant

**Fag:** IBE160 Programmering med KI — Høgskolen i Molde, høsten 2026
**Gruppe:** G05 — David Chen, Hatem M Eldebsy, Mahad H Jama, Emelie Klingstrøm Johansen

> Versjon 2. Revidert etter faglærers tilbakemelding (`docs/tilbakemelding-product-brief.md`, 2026-10-06). Hva som er endret og hvorfor, står i [Endringer fra versjon 1](#endringer-fra-versjon-1) nederst. Versjon 1 ligger uendret i `docs/brief.md`.

## Executive Summary

Jobbsøknader gir lite tilbakemelding. En student skriver om den samme CV-en og det samme søknadsbrevet for hver utlysning, vet ikke om det matcher det arbeidsgiveren ser etter, og finner det bare ut gjennom stillhet eller avslag. **Søknadsassistenten** bryter dette mønsteret. Studenten logger inn, laster opp CV-en sin og limer inn en konkret stillingsannonse. Verktøyet gir tilbake:

- en **gap-analyse** der hvert krav i annonsen får status, et sitat fra CV-en som bevis, en begrunnelse og et konkret neste steg;
- **ATS-tilbakemelding** som en del av gap-analysen;
- **forslag til søknadsbrev**, avsnitt for avsnitt.

Oppgaveteksten sier at verktøyet skal gi «en realistisk opplevelse av hvordan AI brukes i rekruttering». Dette er et førsteklasses designmål, ikke en bieffekt. Verktøyet viser derfor resonneringen bak hvert resultat i stedet for bare å levere en poengsum eller en ferdig omskrevet tekst.

## The Problem

Studenter som søker på praksisplasser og jobber, møter den samme friksjonen gang på gang:

- **Hver søknad bør skreddersys, men det tar tid.** De fleste gjenbruker derfor en generisk versjon, og den leses som generisk av arbeidsgiveren.
- **Det finnes ingen tilbakemeldingsloop.** Studenten ser ikke gapet mellom det CV-en dokumenterer og det annonsen krever.
- **ATS-screening er en svart boks.** De fleste arbeidsgivere sorterer søknader i et Applicant Tracking System før et menneske leser dem, men studenter vet ikke hvordan det fungerer.
- **Innsatsen er personlig.** En CV inneholder personopplysninger, og studenter overlater dem ofte til verktøy uten å vite hvordan de lagres.

## The Solution

### Kjerneflyten (v1)

1. **Logg inn.** Studenten oppretter en konto (lagres bare lokalt) eller bruker demobrukeren.
2. **Last opp CV og lim inn annonsen.** CV-en lastes opp som PDF eller TXT, og annonsen limes inn som tekst. Studenten velger språk (norsk/engelsk) og tone (formell / personlig og profesjonell), og kan legge til nøkkelord hun vil fremheve.
3. **Se gap-analysen.** Skjermen viser tre kolonner: CV-en til venstre, kravene i midten og annonsen til høyre. Hvert krav har:
   - status: dekket, delvis eller mangler;
   - type: må-krav eller fint å ha;
   - et ordrett sitat fra CV-en;
   - en begrunnelse og et neste steg.

   Klikker studenten på et krav, markeres sitatet i CV-en og kravet i annonsen. Under kolonnene forklares hvordan et ATS vil lese CV-en, med konkrete forslag til bedre formuleringer.
4. **Få forslag til søknadsbrev.** Forslagene kommer avsnitt for avsnitt, hvert med en begrunnelse og hvilke krav det treffer. Studenten velger «Ta med» på avsnittene hun vil bruke, og kopierer utkastet.
5. **Behold kontrollen over dataene.** Tidligere analyser ligger under «Mine analyser». Studenten kan slette én analyse, alle analysene eller hele kontoen.

### Data inn og ut

| | v1 | Senere trinn |
|---|---|---|
| **Inn** | CV (PDF/TXT), stillingsannonse (innlimt tekst), nøkkelord, tone, språk | CV som DOC/DOCX, annonse som lenke, tidligere søknader |
| **Ut** | Gap-analyse med begrunnelse, sitat og neste steg; ATS-tilbakemelding og formuleringsforslag (del av gap-analysen); søknadsbrev i forslagsmodus | Fullstendig omskriving, PDF-eksport av søknadsbrevet |

**CV-forbedringsforslag** fra oppgaveteksten leveres som «neste steg» per krav og som formuleringsforslag i ATS-delen, ikke som en egen modul.

### Hvordan KI-en brukes

- **To kall per analyse.**
  1. Gap-analyse med ATS-tilbakemelding.
  2. Søknadsbrevforslag. Dette kallet bruker gap-analysen som input.
- **Strukturert JSON-svar.** Begge kallene svarer i et fast format som appen validerer.
- **Krav til bevis.** KI-en må sitere CV-en ordrett for alt den sier er dekket. Appen sjekker selv at hvert sitat finnes i CV-en, og markerer sitater den ikke finner, slik at oppdiktet bevis blir synlig.
- **Dekningsgraden regnes ut av appen, ikke av KI-en.** Må-krav teller dobbelt, og delvis dekket teller halvt. Tallet er derfor det samme hver gang og kan testes.
- **ATS rammes som relevans, ikke nøkkelordfylling.** Moderne ATS-er vurderer semantisk relevans og straffer nøkkelordfylling (se `addendum.md`). Formuleringsforslagene bruker derfor bare annonsens språk om erfaring studenten faktisk har.
- **Sporbare prompter.** Promptene ligger som lesbare, versjonerte filer i `src/lib/ai/prompts/`. Hver analyse lagrer hvilken modell og promptversjon som laget den.

### Språkmodell, kostnad og demo-modus

*Målt 2026-10-15: gap-analysen tok 15–25 sekunder per testsett med `claude-haiku-5-5`.*

| | Valg |
|---|---|
| **Modell** | Claude Haiku 5.5 (`claude-haiku-5-5`) fra Anthropic, den billigste aktuelle Claude-modellen. Modellen kan byttes med én innstilling (`CLAUDE_MODEL`), for eksempel til Claude Sonnet 5.5 hvis kvaliteten ikke holder. |
| **Kostnad** | $0,10 per million input-tokens og $0,50 per million output-tokens. En hel analyse (begge kallene) koster omtrent $0,002–0,004. $5 i kreditt rekker til over 1 000 analyser, mer enn nok til hele semesteret. |
| **Nøkkel** | Gruppen bruker én nøkkel i en lokal `.env`-fil som aldri committes. Sensor trenger ikke nøkkel, men kan legge inn sin egen etter oppskriften i `SETUP.md`. |
| **Demo-modus** | Uten nøkkel bytter appen automatisk til demo-modus. De fiktive testcasene får forhåndsskrevne svar. Andre CV-er får en enkel nøkkelordmatching, tydelig merket som demo, som også viser hvordan eldre ATS-systemer sammenligner ord uten å forstå dem. Automatiske tester kjører alltid i demo-modus. |

### Personvern og sikkerhet

- **Innlogging:** e-post og passord. Passordet lagres som bcrypt-hash, og økten i en signert informasjonskapsel. Alt kjører lokalt, uten eksterne kontoer.
- **Kryptering i ro:** CV-tekst, annonse og KI-resultater lagres kryptert i databasen (AES-256-GCM). Nøkkelen ligger i `.env`.
- **Dataminimering:** originalfilen lagres ikke, bare den uttrukne teksten.
- **Rett til sletting:** brukeren kan slette én analyse, alle analysene eller hele kontoen.
- **Tilgangskontroll:** en bruker kan bare se egne analyser. Andres analyser oppfører seg som om de ikke finnes.
- **Ekstern språkmodell:** i live-modus sendes CV-teksten til Anthropic for analyse. Dette står i appen og i dokumentasjonen. I demo-modus sendes ingenting ut.
- **Testdata:** repoet inneholder bare fiktive CV-er, aldri gruppemedlemmenes egne.

## What Makes This Different

ATS-nøkkelordscoring er i dag en hygienefaktor (JobScan, Rezi, Teal, Kickresume). Dette prosjektet skiller seg ut på tre punkter:

- **«Hva du bør gjøre med gapet», ikke bare «her er gapet».** Hvert krav får et konkret, ærlig neste steg. Ofte er det å synliggjøre noe studenten allerede har. Det er aldri å påstå erfaring hun ikke har. *(Avklart: dette er med i v1.)*
- **Transparens som funksjon.** Sitat, begrunnelse og sjekk av at sitatet finnes gjør at studenten ser *hvorfor* et krav er dekket eller ikke. Det er både det pedagogiske poenget og forskjellen fra kommersielle verktøy som skjuler scoringslogikken.
- **Ærlig om ATS.** Appen forklarer at moderne systemer vurderer relevans. Demo-modusen viser forskjellen på nøkkelordmatching og en ekte analyse.

Å lære studentens egen stemme fra tidligere søknader er fortsatt en mulig differensiator, men hører til et senere trinn (se Vision).

## Who This Serves

**Primærbruker:** en bachelorstudent ved Høgskolen i Molde som søker sommerjobb eller praksisplass. Hun har en CV og en konkret annonse, og vil ha hjelp til å tilpasse søknaden, ikke en søknad skrevet fra bunnen av. Testcasene i repoet er bygget rundt denne brukeren:

- en IT-student som søker IT-support;
- en logistikkstudent som søker praksis som dataanalytiker (på engelsk);
- en økonomistudent som søker praksis i markedsføring.

**Suksess for brukeren:**
- Hun forstår *hvorfor* materialet hennes matcher eller ikke matcher annonsen.
- Hun får et utkast hun kjenner igjen som sitt eget.
- Hun går derfra med en klarere forståelse av hva et ATS gjør med søknaden.

## Success Criteria

Alle kriteriene kan sjekkes eller testes. Kolonnen «Verifisering» viser hvordan.

| # | Kriterium | Verifisering |
|---|---|---|
| 1 | For hvert av de tre testsettene (A, B, C) finner gap-analysen nøyaktig de manglende kvalifikasjonene som er bestemt på forhånd i `expected.json`. For testsett A er det Intune/Azure, ITIL og førerkort. | `npm run eval` mot ekte modell. **Bestått 2026-10-15 med `claude-haiku-5-5`: 18/18 sjekker.** Alle forventede mangler og styrker ble funnet i alle tre testsettene, og alle 18 sitater fantes i CV-ene. Strukturen sjekkes automatisk i demo-modus. |
| 2 | Hvert krav i gap-analysen har status, type, begrunnelse og neste steg, og hvert krav med status dekket eller delvis har et sitat fra CV-en. | Skjemavalidering (Zod) og enhetstester |
| 3 | Hvert sitat sjekkes mot CV-teksten, og sitater som ikke finnes, markeres i grensesnittet. | Enhetstester |
| 4 | Dekningsgraden regnes ut av appen og er lik for samme analyse hver gang. | Enhetstester |
| 5 | En ugyldig fil (feil filtype, over 5 MB, skannet PDF uten tekst eller ødelagt PDF) gir en forståelig feilmelding på valgt språk. | Enhetstester og ende-til-ende-test |
| 6 | CV-er som PDF (også med to kolonner) og TXT leses riktig. | Enhetstester på fiktive CV-er |
| 7 | En bruker kan slette alle analysene sine og hele kontoen. Etterpå finnes ingen data igjen. | Integrasjonstest og ende-til-ende-test |
| 8 | CV-tekst er ikke lesbar i databasen. | Integrasjonstest som leser rå databaserad |
| 9 | Bruker A får ikke åpnet bruker Bs analyse. | Integrasjonstest og ende-til-ende-test |
| 10 | Uten API-nøkkel fungerer hele kjerneflyten i demo-modus. | Ende-til-ende-test (Playwright) |
| 11 | Sensor kan klone repoet og kjøre appen etter `SETUP.md` uten gruppens kontoer eller nøkler. | Verifisert ved å følge `SETUP.md` i en fersk kopi |

## Scope

**v1 (vurdert leveranse):**
- innlogging og kryptert lagring;
- CV som PDF/TXT og annonse som innlimt tekst;
- gap-analyse med begrunnelse, sitat, neste steg og ATS-tilbakemelding;
- søknadsbrev i forslagsmodus;
- norsk og engelsk (grensesnitt og KI-svar) og valg av tone;
- demo-modus;
- sletting av data.

**Senere trinn (i prioritert rekkefølge):**
1. PDF-eksport av søknadsbrevet
2. CV som DOC/DOCX
3. Fullstendig omskriving på forespørsel
4. Annonse som lenke
5. Tidligere søknader som input

**Eksplisitt utenfor:**
- betaling og netthandel (per oppgaveteksten);
- å sende søknader på vegne av studenten (verktøyet forbereder materiale, det sender ingenting);
- funksjoner for rekrutterere eller flere roller (bare én rolle: student).

**Beslutningspunktene fra oppgaveteksten:**

| Beslutningspunkt | Valg i v1 |
|---|---|
| Omskriving vs. forslag | Forslagsmodus. Studenten velger avsnitt selv. Fullstendig omskriving kommer i et senere trinn. |
| Filformat | Inn: PDF og TXT. Ut: visning i appen og kopiering. PDF-eksport kommer i et senere trinn. |
| Språk og stilnivå | Norsk og engelsk. Tonen kan være formell eller personlig og profesjonell. |

## Vision

Hvis verktøyet fungerer, er det naturlige neste steget at studenter bruker det før hver reelle søknad, ikke bare som en engangsdemo. To funksjoner vil bære det videre: å koble hvert gap med et konkret neste steg (med i v1), og å lære studentens egen stemme fra tidligere søknader (senere trinn). Det er nettopp de delene de kommersielle verktøyene ikke gjør godt.

Ved Høgskolen i Molde er et verktøy som er ærlig om hva KI-screening faktisk gjør, også et lite motsvar til kynismen mange studenter har til «KI i rekruttering». Det kan leve videre etter faget som noe karriereveiledningen viser studenter til.

## Åpne punkter

1. **Samtykke før sending til ekstern modell.** I dag er det informert om i appen og dokumentasjonen. Gruppen bør vurdere en tydelig samtykkeboks før en CV sendes til Anthropic i live-modus, og sjekke Anthropics vilkår for databehandling.

## Endringer fra versjon 1

| Tilbakemelding (2026-10-06) | Endring i denne versjonen |
|---|---|
| Velg én kjerneflyt for v1 og flytt resten til senere trinn | Ny kjerneflyt i fem steg. Scope er delt i v1, senere trinn (prioritert) og utenfor. |
| Plan for språkmodell, kostnad og hvordan sensor kjører appen uten nøkkel | Ny seksjon «Språkmodell, kostnad og demo-modus» |
| Testbare suksesskriterier, og fjern `[ASSUMPTION]` | 11 testbare kriterier med verifisering. Alle `[ASSUMPTION]`-merker er avklart og fjernet. |
| Beskriv hva studenten gjør steg for steg og ser på skjermen | Kjerneflyten beskriver skjermbildet med tre kolonner. |
| Velg en konkret primærbruker | Bachelorstudent ved HiMolde som søker sommerjobb eller praksisplass |
| ATS som del av gap-analysen, ikke egen modul med egen poengsum | ATS-tilbakemelding og formuleringsforslag er en del av gap-analysen. Dekningsgraden regnes ut av appen. |
| Annonse som lenke, DOC, tidligere søknader, omskriving og PDF-eksport flyttes ut av v1 | Flyttet til senere trinn |
| Demo-modus med mock-svar og fiktive eksempel-CV-er i repoet | Demo-modus og tre fiktive testsett med fasit (`fixtures/cases/`) |
| Samle alle LLM-kall i én modul som kan byttes med mock | Alle KI-kall går gjennom `src/lib/ai/` |
| Ta stilling til at CV-teksten sendes til ekstern språkmodell | Beskrevet under personvern. Samtykkeboks står under åpne punkter. |
| `.env.example`, demo-modus og testbruker | På plass. Demobruker `demo@example.com` / `demo1234`. |
| Bare fiktive CV-er i repoet, og nøkler i `.env` som ikke committes | Gjennomført |

**Avvik fra tilbakemeldingen:** faglærer foreslo ett språk i v1. Gruppen har valgt både norsk og engelsk fordi målgruppen søker stillinger på begge språk, og fordi språkvalget bare påvirker grensesnittekstene og én linje i promptene.
