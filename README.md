# Sprout — rodzinne rutyny

Panel rodzica do zarządzania rutynami dziecka. Frontend korzysta z Vite, dane są przechowywane w Supabase, a aplikacja jest przygotowana do wdrożenia na Vercel.

## Uruchomienie lokalne

1. Utwórz projekt w [Supabase](https://supabase.com/) i uruchom `supabase/schema.sql` w SQL Editor.
2. Skopiuj `.env.example` do `.env.local` i uzupełnij publiczny URL, klucz `anon` oraz identyfikatory aktywnej rodziny i profilu dziecka.
3. Zainstaluj zależności i uruchom aplikację:

```bash
npm install
npm run dev
```

Bez zmiennych środowiskowych aplikacja uruchamia się w trybie demonstracyjnym.

## Wdrożenie na Vercel

1. Zaimportuj repozytorium do Vercel.
2. Dodaj wszystkie zmienne z `.env.example` w **Settings → Environment Variables**.
3. Wdróż projekt. Konfiguracja buildu i fallback SPA znajdują się w `vercel.json`.

Nigdy nie udostępniaj w frontendzie klucza Supabase `service_role`. Dostęp klienta jest ograniczony politykami Row Level Security z `supabase/schema.sql`.
