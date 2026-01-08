## ブランチの超初歩（まずここだけ）

ブランチは「作業の分岐」です。`main`（本線）を汚さずに、別の線で安心して変更できます。

### 1) いま自分がいるブランチを確認する

ターミナルで:
```bash
git status
```

例えばこう出ます（上2行が重要）:
```bash
On branch main
Your branch is up to date with 'origin/main'.
```

- `On branch main` = 今いるブランチは `main`
- `origin/main` = リモート（GitHubなど）側の `main` を追跡している、という意味

### 2) 新しいブランチを作って、そのブランチに移動する

例（ブランチ名は好きに変えてOK）:
```bash
git switch -c feature/my-change
```

※ 古い書き方だと `git checkout -b feature/my-change` でも同じです。

### 3) ちゃんと切り替わったか確認する
```bash
git status
```

`On branch feature/my-change` になっていればOKです。

### 4) 変更して、コミットする（最低限）
```bash
git add .
git commit -m "説明を短く書く"
```

### 5) そのブランチをリモートにプッシュする
```bash
git push -u origin feature/my-change
```

これでGitHub側に同名のブランチができ、Pull Request（PR）を作れるようになります。

---

## よく使う確認コマンド
```bash
git status
git branch
git log --oneline --graph --decorate
```
---

上記の説明を参照しながら、「ブランチ」について調べて実際に操作してみてください。

詳しい操作方法や仕組みについては、以下のチュートリアルもおすすめです：

[Backlog Gitチュートリアル](https://backlog.com/ja/git-tutorial/)
（入門編～発展編・チュートリアル1）

---


```bash
git config --local core.ignorecase false
```
> このコマンドは「このリポジトリ内でファイル名の大文字・小文字の違いを区別するように設定する」ものです。
> `core.ignorecase` は通常Windows/Macだと `true` ですが、`false` にすると `Readme.md` と `README.md` を別ファイルとして扱えるようになります。
>
> また自分おすすめ設定は `--global` ですべてのリポジトリで設定することをおすすめします。
> 既存のリポジトリではキャッシュの削除をする必要が出る場合があります。
