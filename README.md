# maemob-v2-ddd-backend 🚀⚽

## 概要 📚

**maemob-v2-ddd-backend** は、ドメイン駆動設計 (DDD)を実践してみたいと思った弱弱エンジニアがバックエンド開発にDDDを用いてチャレンジしてみたリポジトリです。このプロジェクトは、サッカーゲーム管理システムのバックエンドとして機能し、試合結果やプレイヤーデータを管理します。

## チャレンジしたこと・特徴

- **ドメイン駆動設計 (DDD)**: 完全手探りでChatGPTと相談しながら設計・実装を進めています
- **TypeScript & Express.js**: Web API開発の言語・フレームワークに使用
- **Docker 開発環境**: docker composeを用いて、DBの構築・アプリの起動を簡略化
- **CI/CD パイプライン**: GitHub Actions を使用して自動テストを実行
- **API仕様ファースト開発**: 機能の追加・改修時にはAPI仕様書を最初に修正
- **テスト駆動開発**: API仕様書の修正後、実装の前にテストコードの記述を行う

## 技術スタック 🛠️

- **言語**: TypeScript
- **フレームワーク**: Express.js
- **データベース**: PostgreSQL
- **テストフレームワーク**: jest / supertest
- **コンテナ化**: Docker
- **CI/CD**: GitHub Actions

## ディレクトリ構成 🗂️

```
.
└── maemob-v2-ddd-backend/
    ├── .github/
    │   └── workflows/
    │       └── develop-test.yaml - 自動テストの定義
    ├── db
    ├── src/ 
    │   ├── application/          - アプリケーション層。ユースケースやアプリケーションサービスを定義。
    │   │   ├── dto
    │   │   └── use-cases
    │   ├── config
    │   ├── domain/               - ドメイン層。エンティティやリポジトリインターフェース、ドメインサービスを定義
    │   │   ├── entities
    │   │   ├── repositories
    │   │   └── value-objects
    │   ├── infrastructure/       - インフラ層。データベース接続や外部との通信に関する実装
    │   │   └── repositories
    │   ├── interfaces/           - コントローラーやルート定義などアプリケーションと外部のインターフェースを格納
    │   │   └── http/
    │   │       ├── controllers
    │   │       └── routes
    │   ├── shared/
    │   │   ├── common
    │   │   └── errors
    │   ├── index.ts
    │   └── openapi.json
    ├── test
    ├── .env.example
    ├── .gitignore
    ├── docker-compose.yml
    ├── Dockerfile
    ├── jest.config.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── tsconfig.json
```

## セットアップ方法 🛠️

### 前提条件 ✅

- [Node.js](https://nodejs.org/) (v23.1.0)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

### ローカル環境での実行 🖥️

1. リポジトリをクローンします。
   ```bash
   git clone https://github.com/uhablog/maemob-v2-ddd-backend.git
   cd maemob-v2-ddd-backend
   ```

2. .env.exampleを参考に.env, .env.testファイルを作成します。

- .env: アプリ起動時に使用
- .env.test: 自動テスト時に使用

特にこだわりがない場合は一旦以下のように設定してください

```.env
DB_HOST=postgres
DB_USER=user
DB_PASSWORD=password
DB_NAME=maemob
DB_PORT=5432
```

```.env.test
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=maemob_test
DB_PORT=5432
```

3. db/postgre-variables-example.envファイルを参考にして、db/postgre-variables.envファイルを作成します。

4. Docker Compose を使用してコンテナを立ち上げます。これにより、Express サーバーも自動で起動します。

```zsh
docker compose up -d
```

5. http://localhost:3000/api-docs/ にアクセスするとOpenAPIの仕様書が表示されます

### 自動テストの実行 🧪

ローカル環境でテストを実行する際には、以下のコマンドを使用します。

```zsh
npm run test
```

## CI/CDパイプライン ⚙️

GitHub Actionsを使用して、mainブランチに対してプルリクエストが作成された際に自動テストが実行されます。
詳細は.github/workflows/develop-test.ymlファイルを参照してください。
