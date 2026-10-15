---
title: "Product Brief: AI CV & Job Application Assistant"
status: draft
created: 2026-09-26
updated: 2026-09-26
---

# Product Brief: AI CV & Job Application Assistant

**Fag:** IBE160 Programmering med KI — Høgskolen i Molde, høsten 2026
**Gruppe:** G05 — David Chen, Hatem M Eldebsy, Mahad H Jama, Emelie Klingstrøm Johansen

## Executive Summary

Jobbsøknader er en høyinnsats-prosess med lite tilbakemelding: en student skriver om samme CV og søknadsbrev for hver utlysning, får ikke noe signal på om det faktisk matcher det arbeidsgiveren ser etter, og finner det bare ut gjennom stillhet eller avslag. AI CV- og jobbsøknadsassistenten bryter dette mønsteret. En student logger inn, laster opp sin CV og en konkret stillingsannonse; verktøyet lager et skreddersydd søknadsbrev, konkrete forbedringsforslag til CV-en, en gap-analyse mot kvalifikasjonene i annonsen, og ATS-tilbakemelding — én CV blir til en tilpasset søknad på minutter i stedet for timer, samtidig som det synliggjør nøyaktig hvordan KI-drevet rekrutteringsscreening faktisk vurderer en kandidat.

Utover den umiddelbare nytteverdien rammer oppgaveteksten dette eksplisitt som et læringsverktøy: det skal gi studenter "en realistisk opplevelse av hvordan AI brukes i rekruttering." Denne rammingen er et førsteklasses designmål her, ikke en bieffekt — verktøyet bør vise sin resonnering (hvorfor en kvalifikasjon flagges som mangelfull, hvorfor en formulering er mer ATS-relevant enn en annen), ikke bare levere en svart-boks-omskriving.

## The Problem

Studenter som søker på internships og jobber møter samme friksjon gjentatte ganger:

- **Hver søknad bør skreddersys, men skreddersøm er tidkrevende.** Å matche CV og søknadsbrev til en spesifikk annonses språk og krav krever reell innsats, så de fleste studenter gjenbruker en generisk versjon i stedet — som også leses som generisk av arbeidsgiveren.
- **Det finnes ingen tilbakemeldingsloop.** En student lærer sjelden *hvorfor* de ikke gikk videre i prosessen. De kan ikke se gapet mellom det de hevder og det annonsen krever, eller om dokumentet en gang overlever automatisk screening.
- **ATS-screening er en svart boks.** De fleste arbeidsgivere filtrerer nå søknader gjennom et Applicant Tracking System før et menneske leser dem, men studenter har ingen innsikt i hvordan denne filtreringen fungerer eller om formatering/formuleringer jobber mot dem.
- **Innsatsen er personlig.** En CV inneholder reelle personopplysninger (identitet, adresse, full arbeidshistorikk, noen ganger bilde/personnummer) — studenter overlater dette til et verktøy ofte uten å vite hvordan det lagres.

## The Solution

Et verktøy som tar en students eksisterende materiale og en spesifikk stillingsannonse, og produserer en skreddersydd søknadspakke pluss resonneringen bak den — bak en innlogging, med hvert opplastet dokument kryptert i ro (eksplisitt påkrevd i oppgaveteksten gitt de personopplysningene som er involvert; se `addendum.md` for den GDPR-tilpassede håndteringen dette innebærer).

**Data inn:**
- CV (PDF / DOC / TXT)
- Stillingsannonse (tekst/lenke)
- Nøkkelord studenten vil fremheve
- Ønsket tone/stil
- Tidligere søknader (valgfritt, for konsistens/læring basert på studentens egen historikk)

**Data ut:**
- Skreddersydd søknadsbrev tilpasset annonsen
- Forbedringsforslag til CV
- Gap-analyse: kvalifikasjoner annonsen krever som CV-en ikke for øyeblikket dokumenterer
- ATS-tilbakemelding

**Om ATS-tilbakemeldingen spesifikt:** moderne ATS-plattformer matcher i økende grad på semantisk relevans, ikke rå nøkkelord, og straffer nøkkelord-spamming (se `addendum.md` for kildebelagt detalj). `[ASSUMPTION]` ATS-tilbakemeldingen i dette verktøyet bør rammes som *evidensbasert formulering mot annonsens faktiske krav*, ikke nøkkelord-injeksjon — bekreft dette som gruppe siden det former hvordan gap-analyse- og ATS-modulene bygges.

## What Makes This Different

Gap-analyse og tone-tilpasset generering av søknadsbrev er ikke det det eksisterende markedet har standardisert — ATS-nøkkelordscoring er nå hygienefaktor (JobScan, Rezi, Teal, Kickresume og andre gjør det alle). Der dette prosjektet kan differensiere, innenfor et prosjektomfang for et fag:

- **"Hva du bør gjøre med gapet," ikke bare "her er gapet."** Eksisterende verktøy flagger manglende kvalifikasjoner; få kobler det med et konkret neste steg (en ferdighet å nevne, et prosjekt/en erfaring å synliggjøre som studenten allerede har). `[ASSUMPTION]` — verdt å avgjøre som gruppe om dette er innenfor omfanget for den vurderte versjonen eller et definert strekkmål.
- **Transparens som en funksjon, ikke en begrensning.** Fordi oppgavens reelle mål inkluderer å lære bort hvordan KI-rekrutteringsscreening fungerer, er det å vise *resonneringen* bak hvert forslag (ikke bare den omskrevne teksten) både det pedagogiske poenget og en reell differensiator mot kommersielle verktøy som gjemmer sin scoringslogikk.
- **Bygget for studentens egen dokumenthistorikk.** Å akseptere tidligere søknader som valgfri input lar verktøyet lære studentens egen stemme/merittliste i stedet for å generere generisk KI-klingende tekst — de fleste kommersielle verktøy gjør ikke dette.

## Who This Serves

**Primærbruker:** studenter som forbereder jobb- eller praksissøknader, som har en CV men søker på en konkret annonse og vil ha den skreddersydd — ikke skrevet fra bunnen. `[ASSUMPTION]` Rammet her som studentpopulasjonen generelt (uansett fagfelt), ikke spesifikt dette fagets studenter; smal dette ned hvis faget mener en spesifikk målgruppe (f.eks. bare IBE160/HiMolde-studenter, eller et spesifikt studieprogram) som pilotmålgruppe.

**Hvordan suksess ser ut for dem:** de forstår *hvorfor* materialet deres matcher eller ikke matcher en annonse, de får et brukbart skreddersydd utkast de fortsatt kjenner igjen som sin egen skriving, og de går fra verktøyet med en klarere forståelse av hva en reell ATS faktisk gjør med søknaden deres.

## Success Criteria

`[ASSUMPTION]` — dette brevet har ikke fagets vurderingskriterier, så disse er forslag og bør sjekkes direkte mot dem:

- Verktøyet tar inn en reell CV (PDF/DOC/TXT) og en reell stillingsannonse og produserer alle fire data-ut-elementene (søknadsbrev, CV-forslag, gap-analyse, ATS-tilbakemelding) uten manuell inngripen.
- Innlogging og kryptert lagring av opplastede dokumenter er implementert og demonstrerbart.
- En testbruker (f.eks. et gruppemedlem som bruker sin egen CV) kan peke på minst ett forslag eller gap-analyseresultat de faktisk ville handlet på — resultatet er ikke bare tilforlatelig fyllstoff.
- Resonneringen bak minst gap-analyse og ATS-tilbakemelding er synlig for brukeren, ikke bare en endelig score.

## Scope

**Innenfor (for den vurderte leveransen):** opplasting og parsing av CV (PDF/DOC/TXT), input av stillingsannonse, generering av skreddersydd søknadsbrev, forbedringsforslag til CV, kvalifikasjons-gap-analyse, ATS-tilbakemelding, innlogging, kryptert dokumentlagring.

**Eksplisitt utenfor:** enhver betalings-/e-handelsflyt (per oppgaveteksten); `[ASSUMPTION]` faktisk innsending av søknader på studentens vegne (verktøyet forbereder materiale, det sender ikke søknader); `[ASSUMPTION]` multi-tenant-/rekrutterer-vendte funksjoner (dette er et rent studentvendt verktøy, ikke et rekruttererdashbord).

Oppgaveteksten etterlater også tre beslutninger åpne; i stedet for å avgjøre dem stilltiende, følger her hver med en anbefalt standard (full resonnering i `addendum.md`) så gruppen kan jobbe raskt og revurdere kun hvis noen er uenig:

- **Omskriving vs. forslag** — standard er forslagsmodus (lavere risiko for at resultatet oppleves uautentisk), med en fullstendig omskrivingsopsjon på forespørsel.
- **Filformat for eksport** — standard er PDF for søknadsbrevet, Markdown/ren tekst for forslag og gap-analyse.
- **Språk/stilnivå** — standard er brukervalgbar tone, med norsk og engelsk støttet som minimum.

Gruppen valgte å beholde hele oppgavens funksjonsomfang i stedet for å kutte noe nå; hvis tiden blir knapp før innleveringen, er disse tre standardvalgene der omfanget faktisk strammes inn i praksis.

## Vision

Hvis dette verktøyet fungerer som tiltenkt for faget, er det naturlige neste steget at det blir noe studenter faktisk tar i bruk før hver reelle søknad, ikke bare en engangsdemo for vurdering — de to funksjonene som ville bære det (å koble hvert gap med et konkret neste steg, og å lære en students egen stemme fra søknadshistorikken) er nøyaktig de delene det nåværende kommersielle landskapet (JobScan, Rezi, Teal, Kickresume) ikke gjør godt, så det er der en langsiktig versjon henter sin differensiering, i stedet for å konkurrere på ATS-scoring, som allerede er standardisert.

Ved Høgskolen i Molde spesifikt er et verktøy som er ærlig om hva KI-screening faktisk gjør — i stedet for å love et magisk nøkkelordtrick — også et lite, konkret motsvar til kynismen studenter ofte har til "AI i rekruttering": det kunne plausibelt leve videre etter dette faget som noe skolens karriereveiledning peker studenter til, hvis gruppen ønsket å ta det så langt.
