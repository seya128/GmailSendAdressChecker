# GmailSendAdressChecker
GMailのメール送信時に宛先を確認後、送信するChrome拡張

[![Image from Gyazo](https://i.gyazo.com/61d7758ed4c08ff71ee58192ea23a96c.png)](https://gyazo.com/61d7758ed4c08ff71ee58192ea23a96c)

## chrome ウェブストア
 https://chrome.google.com/webstore/detail/gmailsend-address-checker/gdckkpniogfhndklmlgbnolnkbceeofp

## 概要
GMailのメール送信時に宛先を確認後、送信する。 (C)DORASU  
メール誤送信を防止するための確認ダイアログを表示します。  
  
1. Gmailの「送信」ボタンを、「確認」ボタンに変更
2. 「確認」ボタンを押すと確認ダイアログが開く
3. From,To,Cc,Bcc,件名,添付、すべての項目にチェックを入れる
4. 「OK」でダイアログを閉じる
5. 「確認」が「送信」になるので、「送信」を押して送信
  
送り主(From)のドメインと一致しないアドレスは、赤色で表示されるので、よく確認してください。

バージョン:0.9  
・Gmailの言語設定が「日本語」以外では動作しない不具合を修正しました。  
　日本語以外の言語設定では、「確認」ボタンは「Confirm」ボタンになります。
  
バージョン:0.8  
・新Gmailでボタン内の文字の位置がずれるのを修正しました。  
・Gmailの設定で「送信＆アーカイブ」ボタンを有効にした場合、「送信」のみのボタンも「確認」が終わるまで表示されなくしました。  
・Ctrl+Enterで確認前でも、送信できてしまっていた不具合を修正しました。（Ctrl+Enterは使えなくなります）  
  
バージョン:0.7  
・メールアドレスに2～9の数字が含まれていると、ドメイン判別がおかしくなる不具合を修正しました。  
  
バージョン:0.6  
・複数メール同時作成時の不具合を修正しました。  
  
バージョン:0.5  
・ダイアログの位置をドラッグで変更できるようにしました。  
・ダイアログが開いているときは、その他のメール操作をできなくしました。  
　（確認中に、メール編集が出来ないようにしました）  
・添付ファイルがない場合にも、添付の確認をするようにしました。  
　（添付忘れ防止）  
・株式会社ドラスへのリンクをタイトルバーに追加しました。  
  
バージョン:0.4  
・すべての項目をチェックをいれないと、「OK」ボタンを押せないようにしました。  
・「送信」ボタンが目立つように、色を変更しました。  
  
バージョン:0.3  
・添付ファイルも表示するようにした  
・各項目の先頭にチェックボックスを加えたので、チェックに利用ください。  
　（チェックしないと、何かできないという制限はありません）  
