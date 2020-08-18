# JIRA Ticket creator

## 準備する
- `.env.sample` を `.env` という名前でコピーする
- `.env` ファイルの中身に適切な値を設定する
- `/csv` ディレクトリに `list.tsv` という名前のtsvファイルを用意する
    - チケットには、tsvの内容を以下のような形で登録する動きになっている
        - チケットタイトル: [種別] summary
        - チケット詳細: description
        - (未対応)storypoint: customfield_10022

## 実行する
- `yarn start`
