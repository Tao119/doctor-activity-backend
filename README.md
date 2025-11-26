# Doctor Activity Backend API

医師の活動記録アプリケーションのバックエンドAPI

## 機能

- ユーザー認証（JWT）
- 患者記録の管理（個人情報マスキング・暗号化）
- AI生成クイズ機能（OpenAI GPT-4）
- 統計情報とダッシュボード
- セキュアなデータ管理

## 技術スタック

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- OpenAI API
- Docker + Docker Compose

## セットアップ

### 前提条件

- Node.js 20+
- Docker & Docker Compose
- MongoDB（ローカルまたはDocker）

### インストール

```bash
# 依存関係のインストール
make install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# Dockerで起動
make docker-up

# または開発モードで起動
make dev
```

## API エンドポイント

### 認証

- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/profile` - プロフィール取得

### 患者記録

- `POST /api/records` - 記録作成
- `GET /api/records` - 記録一覧取得
- `GET /api/records/:id` - 記録詳細取得
- `PUT /api/records/:id` - 記録更新
- `DELETE /api/records/:id` - 記録削除
- `GET /api/records/statistics` - 統計情報取得

### クイズ

- `POST /api/quizzes/generate` - AIクイズ生成
- `GET /api/quizzes` - クイズ一覧取得
- `GET /api/quizzes/:id` - クイズ詳細取得
- `POST /api/quizzes/:id/submit` - クイズ回答提出
- `GET /api/quizzes/results` - 結果一覧取得
- `GET /api/quizzes/statistics` - クイズ統計取得

## 開発コマンド

```bash
make dev          # 開発サーバー起動
make build        # ビルド
make test         # テスト実行
make docker-up    # Docker起動
make docker-down  # Docker停止
make docker-logs  # ログ確認
```

## セキュリティ機能

- JWT認証
- パスワードハッシュ化（bcrypt）
- 個人情報の自動マスキング
- 機密データの暗号化（AES）
- レート制限
- Helmet.jsによるセキュリティヘッダー

## ライセンス

MIT
