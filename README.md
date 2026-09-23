# Sprout — rodzinne rutyny

Panel rodzica do zarządzania rutynami dziecka. Frontend korzysta z Vite, dane są przechowywane w Supabase, a aplikacja jest przygotowana do wdrożenia na Vercel.

## Uruchomienie lokalne

1. Projekt jest powiązany z Supabase `ymkoskymhxrwwwhgtsqj`; jego lokalna konfiguracja znajduje się w `supabase/config.toml`. Uruchom `supabase/schema.sql` w SQL Editor projektu, jeśli migracja nie została jeszcze zastosowana.
2. Skopiuj `.env.example` do `.env.local` i uzupełnij publiczny klucz `anon` oraz identyfikatory aktywnej rodziny i profilu dziecka. URL projektu jest już skonfigurowany.
3. Zainstaluj zależności i uruchom aplikację:

```bash
npm install
npm run dev
```

Bez zmiennych środowiskowych aplikacja uruchamia się w trybie demonstracyjnym.

## Wdrożenie na Vercel

1. Repozytorium `tomdominiak/kids-routine` jest połączone z Vercel, więc push do głównej gałęzi automatycznie uruchamia deployment.
2. Dodaj wszystkie zmienne z `.env.example` w **Settings → Environment Variables**.
3. Wdróż projekt. Konfiguracja buildu i fallback SPA znajdują się w `vercel.json`.

Nigdy nie udostępniaj w frontendzie klucza Supabase `service_role`. Dostęp klienta jest ograniczony politykami Row Level Security z `supabase/schema.sql`.

## Powiązane usługi

- Supabase: `https://ymkoskymhxrwwwhgtsqj.supabase.co`
- GitHub: `https://github.com/tomdominiak/kids-routine`
- Vercel: deployment wyzwalany przez integrację GitHub
