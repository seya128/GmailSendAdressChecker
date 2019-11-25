(function () {
	//追加するエレメントのID
	var ID_OVERLAY = 'SAC_overlay';		//オーバーレイエレメントID
	var ID_POPUP = 'SAC_popup';			//ポップアップウィンドウID
	var ID_CONFIRM = 'SAC_confirm';
	var ID_OK = 'SAC_OK';
	var ID_CANCEL = 'SAC_CANCEL';


	//言語ごとのデータ
	var langSendText = "";		//送信ボタンのテキスト
	var langData = {
		"送信": {
			"confirm": "確認",
			"checkall": "すべてチェックしてください",
			"subject": "件名",
			"attached": "添付",
			"noattach": "添付ファイルなし",
		},
		"Send": {
			"confirm": "Confirm",
			"checkall": "Please check all",
			"subject": "Subject",
			"attached": "Attached",
			"noattach": "No attachment",
		},

	};
	function getLangData(attr) {
		var lng = langSendText;
		if (!langData[lng])		//データがなければ英語
			lng = "Send";
		
		if (langData[lng][attr])
			return langData[lng][attr];
		else
			return langData["Send"][attr];
	}



	//
	// ******* 確認用ポップアップウィンドウ関連 *******
	//

	//
	// チェックボックスを追加
	//
	function addCheckbox(html) {
		return '<input type="checkbox"> ' + html + '</input>';
	}

	//
	// 添付ファイル名取得
	//
	function getAttachedFiles(node) {
		//<div class="dL" tabindex="-1" id=":eu" aria-label="添付ファイル GMailSendAdressCheckerSS.png。添付ファイルを表示するには Enter キーを、削除するには Delete キーを押してください">
		// <input id=":em" name="attach" type="hidden" value="14d415a088af6894_14d415a088af6894_0.2_-1" checked="">
		// <a class="dO" id=":en" href="?ui=2&amp;ik=0187644934&amp;view=att&amp;th=14d415a088af6894&amp;attid=0.2&amp;disp=safe&amp;realattid=f_i9jfa7u21&amp;zw" target="_blank">
		//  <div class="vI">GMailSendAdressCheckerSS.png</div>
		//  <div class="vJ">（39 KB）</div>
		// </a>
		// <div id=":ek" role="button" class="vq" tabindex="-1">
		//</div>
		// こんな感じなので、<input name="attach">直後の<a>タグの直下の２つのDIVからファイル名とサイズを取得

		var attachedFiles = "";

		var el = node.querySelectorAll('input[name=attach]+a');

		var el_len = el.length;
		if (el_len > 0) {
			for (var i = 0; i < el.length; i++) {

				var el_div = el[i].querySelectorAll('div');

				attachedFiles = attachedFiles + addCheckbox(el_div[0].innerText + el_div[1].innerText) + '<br/>';
			}
		} else {
			attachedFiles = addCheckbox(" - " + getLangData("noattach") + " - ");
		}

		return attachedFiles;
	}

	//
	// ドメインのみ抽出
	//
	function getDomain(addressValue) {
		var domain;

		domain = addressValue.match(/[a-zA-z0-9\.-]+@([a-zA-z0-9\.-]+)/)

		if (domain == null)
			return "";

		return domain[1];
	}

	//アドレスリスト作成
	function makeAddressList(addresses, whiteDomain) {
		var list = "";

		for (var i = 0, addressCount = addresses.length; i < addressCount; i++) {
			var addressValue = addresses[i].value;
			if (addressValue) {
				var text = addressValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				if (whiteDomain != "") {
					if (getDomain(addressValue) == whiteDomain)
						text = '<font color="#00f">' + text + '</font>';
					else
						text = '<font color="#f00">' + text + '</font>';
				}

				list = list + addCheckbox(text) + '<br/>';
			}
		}

		return list;
	}


	// オーバーレイ用エレメント作成
	//   ポップアップウィンドウ以外を暗くするためにウィンドウ全体に載せるエレメント
	function createOverlayElement() {
		var _element_overlay = document.createElement("div");

		_element_overlay.id = ID_OVERLAY;

		// スタイルを設定する
		var style = _element_overlay.style;
		style.position = "fixed";
		style.width = "100%";
		style.height = "100%";
		style.top = "0";
		style.left = "0";
		style.backgroundColor = "rgba(0,0,0, 0.15)";
		style.zIndex = "998";

		return _element_overlay;
	}

	// オーバーレイ用エレメント追加
	function appendOverlayElement() {
		var _element_overlay = document.getElementById(ID_OVERLAY);
		if (!_element_overlay) {	//すでにエレメントが存在している場合は作成しない
			_element_overlay = createOverlayElement();
			// BODY のノードリストに登録する
			document.body.appendChild(_element_overlay);
		}
		return _element_overlay;
	}



	// ポップアップ用エレメントを作成
	function createPopupElement(_editFormNode) {
		var	_element_popup = document.createElement("div");
		_element_popup.id = ID_POPUP;

		// スタイルを設定する
		var _right = 10;
		var _buttom = 0;
		var style = _element_popup.style;
		style.position = "absolute";
		style.width = "700px";
		style.backgroundColor = "#fee";
		style.border = "5px #866 solid";
		style.borderRadius = "10px";
		style.boxShadow = "5px 5px 10px #444";
		style.right = _right + "px";
		style.bottom = _buttom + "px";
		//style.zIndex = "999";
		style.fontSize = "90%";

		// ドラッグ設定
		var dragOldX;
		var dragOldY;
		_element_popup.draggable = 'true';
		_element_popup.addEventListener(
			'dragstart',
			function (e) {
				//console.log("dragstart: (" + e.x + "," + e.y + ")" );
				dragOldX = e.x;
				dragOldY = e.y;
			},
			false
		);
		_element_popup.addEventListener(
			'drag',
			function (e) {
				//console.log("drag: (" + e.x + "," + e.y + ")");
				if (e.x != 0 && e.y != 0) {
					_right -= e.x - dragOldX;
					_buttom -= e.y - dragOldY;
					style.right = _right + "px";
					style.bottom = _buttom + "px";
					dragOldX = e.x;
					dragOldY = e.y;
				}
			},
			false
		);

		// fromのドメイン取得
		var from = _editFormNode.querySelectorAll('input[name=from]')[0].value;
		if (from == "") {
			//アカウントが１つしか設定されていないとfromに値がはいらないので、タイトルを使う。これでいいのかは怪しい
			console.log(document.title);
			from = document.title.match(/- ([a-zA-z0-9\.-]+@[a-zA-z0-9\.-]+) -/);
			if (from != null)
				from = from[1];
		}
		var whiteDomain = getDomain(from);
		//チェックボックスを追加
		from = addCheckbox(from);

		// ポップアップウィンドウHTML
		_element_popup.innerHTML = '' +
			'<div style="font-weight:bold; background:#866; color:#fff; padding:5px 20px; cursor:move">' +
			getLangData("checkall") +
			'<div style="float:right"><a href="http://www.dorasu.com">(C) DORASU</a></div>' +
			'</div>' +
			'<div style="margin:10px">' +
			'<table borde="10" style="border:10; width:100%; cellspacing:10; cellpadding:10">' +
			'<tr><td width="15%">From</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			from +
			'</td>' +
			'</tr>' +
			'<tr><td width="15%">To</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			makeAddressList(_editFormNode.querySelectorAll('input[name=to]'), whiteDomain) +
			'</td>' +
			'</tr>' +
			'<tr><td>Cc</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			makeAddressList(_editFormNode.querySelectorAll('input[name=cc]'), whiteDomain) +
			'</td>' +
			'</tr>' +
			'<tr><td>Bcc</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			makeAddressList(_editFormNode.querySelectorAll('input[name=bcc]'), whiteDomain) +
			'</td>' +
			'</tr>' +
			'<tr><td>' + getLangData("subject") + '</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			makeAddressList(_editFormNode.querySelectorAll('input[name=subject]'), "") +
			'</td>' +
			'</tr>' +
			'<tr><td>' + getLangData("attached") + '</td>' +
			'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
			getAttachedFiles(_editFormNode) +
			'</td>' +
			'</tr>' +
			'</table>' +
			'</div>' +

			'<div style="margin:10px; text-align:center; color">' +
			'<input type="button" id="' + ID_OK + '" style="width:40%; height:40px; font-weight:bold; color:#444" value="O K">　' +
			'<input type="button" id="' + ID_CANCEL + '" style="width:40%; height:40px; font-weight:bold; color:#444" value="CANCEL">' +
			'</div>';


		return _element_popup;
	}

	// ポップアップ用エレメント追加
	function appendPopupElement(_parentNode, _editFormNode) {
		var _element_popup = document.getElementById(ID_POPUP);
		if (!_element_popup) {	//すでにエレメントが存在している場合は作成しない
			_element_popup = createPopupElement(_editFormNode);
			// ノードリストに登録する
			_parentNode.appendChild(_element_popup);

			//チェックボックスのイベント
			var btnOK = document.getElementById(ID_OK);
			var chbx = _element_popup.querySelectorAll('input[type=checkbox]');
			var chbxLen = chbx.length;
			for (var i = 0; i < chbxLen; i++) {
				chbx[i].onclick = function () {
					if (this.checked) {
						chbxLen--;
					} else {
						chbxLen++;
					}
					if (chbxLen <= 0) {
						btnOK.style.backgroundImage = '-webkit-linear-gradient(top,#f44,#ecc)';
						btnOK.disabled = false;
						btnOK.style.opacity = 1.0;
					} else {
						btnOK.style.backgroundImage = '';
						btnOK.disabled = true;
						btnOK.style.opacity = 0.5;
					}
				}
			}
		}

		return _element_popup;
	}





	
	//
	// ******* ボタン検索関連 *******
	//


	// 送信ボタンを探す
	function getSendButton(node) {
		//送信ボタン検索
		// 言語によって(Ctrl + Enter)だったり(Ctrl-Enter)だったり・・・
		var d = node.querySelectorAll('div[aria-label*="Enter)"]');
		if (!d || d.length<=0) return null;

		//ここの文字の先頭２文字で言語を判断
		var text = d[0].innerText.substr(0,2);
		langSendText = text;
		// console.log(text);

		return d;
	}


	//確認ボタン追加
	function appendKakuninButton(node) {
		//まず「送信」ボタンを探す
		var d = getSendButton(node);
		// console.log(d);
		if (!d) {
			// console.log("送信ボタンが見つかりませんでした。");
			return;
		}
		var dd = d[0];

		//「送信」ボタンの前に「確認」ボタンを追加し、「送信」を非表示
		if (dd != "") {
			// 送信ボタン一連をOFFするための親ノード
			var pd = dd.parentNode;

			// 送信ボタンのコピーを作成し、確認ボタンにする
			dd.style.backgroundImage = ''; //「送信」ボタンを赤色にしたのを取消
			var el = dd.cloneNode();
			el.id = ID_CONFIRM;
			el.setAttribute("aria-label", getLangData("confirm"));
			el.setAttribute("data-tooltip", getLangData("confirm"));
			el.innerText = getLangData("confirm");
			el.style.backgroundColor = '#096910';	//「確認」ボタンを緑に
			el.onclick = function () {
				var _this = this;

				// console.log("確認ボタンが押された");

				//ポップアップウィンドウ以外を暗くするためにウィンドウ全体を暗くする
				var _element_overlay = appendOverlayElement();

				// ポップアップ用エレメントを作成
				var _element_popup = appendPopupElement(_element_overlay, node);


				// ------------------------------------------------------------
				// クリック時に実行されるイベント
				// ------------------------------------------------------------
				var btnOK = document.getElementById(ID_OK);
				btnOK.disabled = true;
				btnOK.style.opacity = 0.5;
				btnOK.onclick = function () {
					//ポップアップ削除
					_element_overlay.parentNode.removeChild(_element_overlay); //ポップアップ削除(オーバーレイごと削除）
					//「送信」系ボタン表示
					var tmp_node = el;
					while (tmp_node.nextElementSibling) {
						tmp_node = tmp_node.nextElementSibling;
						tmp_node.style.display = "";
						tmp_node.childNodes.forEach(function (elem) {
							elem.style.display = ""; //「送信」表示
							elem.style.backgroundColor = '#e81a1a'; //「送信」ボタンを赤色に
							elem.style.color = "#FFF";
						});				
					}
					_this.parentNode.removeChild(_this); //「確認」削除
				};

				document.getElementById(ID_CANCEL).onclick = function () {
					_element_overlay.parentNode.removeChild(_element_overlay); //ポップアップ削除(オーバーレイごと削除）
				};

			}

			// 「確認」ボタン追加
			pd.parentNode.insertBefore(el, pd);
			// console.log(d[0].parentNode.parentNode);

			// 「送信」系ボタン非表示
			var tmp_node = el;
			while (tmp_node.nextElementSibling) {
				// console.log(tmp_node.nextElementSibling);
				tmp_node = tmp_node.nextElementSibling;
				tmp_node.style.display = "none";
			}
		}




	}





	//
	// メール作成フォームエリアのノードを取得
	//  複数のメール作成がある場合もある
	function getMailEditFormNode() {

		var node_form = document.querySelectorAll('td form[method=POST]');

		var node_div = [];
		for (var i = 0, len = node_form.length; i < len; i++) {
			node_div[i] = node_form[i].parentNode;
		}

		return node_div;
	}


	//----------------------------
	//起動時にイベントセット
	//----------------------------
	window.setTimeout(function () {

		//to,cc,subjectなどを変更しようとしたときに、「送信」ボタンを書き換える

		document.addEventListener('focus', function (event) {
			var target = event.target;
			if (target.name !== 'to' && target.name !== 'cc' && target.name !== 'bcc' && target.name != 'subjectbox' && target.getAttribute('role') != "textbox") return;

			var editFormNode = getMailEditFormNode();

			for (var i = 0; i < editFormNode.length; i++) {
				//確認ボタンを追加していない箇所に、確認ボタンを追加
				if (editFormNode[i].querySelectorAll('div#'+ID_CONFIRM).length == 0) {
					appendKakuninButton(editFormNode[i]);
				}
			}
		}, true); // event listener focus

		// ctrl+Enterをきかなくする

		document.addEventListener('keydown', function (event) {
			if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
				console.log("keydown ctrl+Enter");
				event.stopPropagation(); //イベントの伝搬を止める
			}
		}, true);

	}, 100); // setTimeout

})();