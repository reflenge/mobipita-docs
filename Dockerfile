# Node 22 系のベースイメージ
FROM node:22.21.1-bookworm

# 開発に必要なツールを追加
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /workspace

# pnpm をグローバルにインストール (packageManager の版に合わせる)
RUN npm install -g pnpm@10.28.0

# ソースをコンテナへコピー
COPY . ./

# Astro のデフォルトポート
EXPOSE 4321

# 開発サーバーを起動
CMD [ "pnpm","run","dev","--","--host","0.0.0.0" ]
