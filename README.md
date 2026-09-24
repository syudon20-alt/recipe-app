# レシピ管理アプリ

ログイン不要・URLを知っていれば誰でも閲覧・追加・編集・削除できるレシピ管理Webアプリ。

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (PostgreSQL) — `@supabase/supabase-js` でクライアントから直接アクセス
- Vercel でホスティング

## 画面

- `/` : レシピ一覧（タイトル検索・カテゴリ絞り込み）
- `/recipes/new` : 新規作成
- `/recipes/[id]` : 詳細
- `/recipes/[id]/edit` : 編集

## セットアップ

1. Supabaseプロジェクトを作成し、[supabase/schema.sql](./supabase/schema.sql) をSQL Editorで実行
2. `.env.local` を作成し、以下を設定

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. 依存関係をインストールして起動

```bash
npm install
npm run dev
```

## デプロイ

Vercelにこのリポジトリをインポートし、上記と同じ環境変数を設定してデプロイする。
