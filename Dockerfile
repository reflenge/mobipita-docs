# Node 22 系のベースイメージ
FROM node:22.21.1

# 開発に必要なツールを追加
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /workspace

# ソースをコンテナへコピー
COPY . ./

# pnpm をグローバルにインストール
RUN npm install -g pnpm

# 依存関係をインストール
RUN pnpm install

# 開発サーバーを起動
CMD [ "pnpm","run", "dev" ]
