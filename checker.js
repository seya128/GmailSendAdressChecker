(function() {

	//
	// チェックボックスを追加
	//
	function addCheckbox(html)
	{
		return '<input type="checkbox"> ' + html + '</input>';
	}

	//
	// 添付ファイル名取得
	//
	function getAttachedFiles(node)
	{
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
			for (var i = 0; i< el.length; i++) {

				var el_div = el[i].querySelectorAll('div');

				attachedFiles = attachedFiles + addCheckbox(el_div[0].innerText + el_div[1].innerText) + '<br/>';
			}
		} else {
			attachedFiles = addCheckbox(" - 添付ファイルなし - ");
		}

		return attachedFiles;
	}

	//
	// ドメインのみ抽出
	//
	function getDomain(addressValue)
	{
		var domain;

		domain = addressValue.match(/[a-zA-z0-9\.-]+@([a-zA-z0-9\.-]+)/)

		if (domain == null)
			return "";

		return domain[1];
	}

	//アドレスリスト作成
	function makeAddressList(addresses, whiteDomain)
	{
		var list = "";

		for(var i = 0, addressCount = addresses.length; i < addressCount; i++) {
			var addressValue = addresses[i].value;
			if (addressValue) {
				var text = addressValue.replace(/</g,"&lt;").replace(/>/g,"&gt;");
				if (whiteDomain!="")
				{
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



	//確認ボタン追加
	function appendKakuninButton(node)
	{
		//まず「送信」ボタンを探す
		var d = node.querySelectorAll('div[aria-label^="送信"]');
		var dd = d[0];

		//「送信」ボタンの前に「確認」ボタンを追加し、「送信」を非表示
		if (dd != "") {
			dd.style.backgroundImage = '';		//「送信」ボタンを赤色にしたのを取消
			var el = dd.cloneNode();
			el.id = "SAC_kakunin";
			el.setAttribute("aria-label","確認");
			el.setAttribute("data-tooltip","確認");
			el.innerText = "確認";
			// el.style.display = "inline-block";
			el.onclick = function() {
				var _this = this;

				console.log("確認ボタンが押された");

				// fromのドメイン取得
				var from = node.querySelectorAll('input[name=from]')[0].value;
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

				// ------------------------------------------------------------
				// オーバーレイ用エレメント
				// ------------------------------------------------------------
				var _element_overlay = document.getElementById('SAC_overlay');
				if (_element_overlay == null) {
					_element_overlay = document.createElement("div");
					_element_overlay.id = 'SAC_overlay';

					// スタイルを設定する
					var style = _element_overlay.style;
					style.position = "fixed";
					style.width  = "100%";
					style.height = "100%";
					style.top = "0";
					style.left = "0";
					style.backgroundColor = "rgba(0,0,0, 0.15)";
					style.zIndex = "998";

					// BODY のノードリストに登録する
					document.body.appendChild(_element_overlay);

				}

				// ------------------------------------------------------------
				// ポップアップ用エレメント
				// ------------------------------------------------------------
				// ポップアップ用エレメントを作成
				var _element_popup = document.getElementById('SAC_popup');
				if (_element_popup == null) {
					_element_popup = document.createElement("div");
					_element_popup.id = 'SAC_popup';

					// スタイルを設定する
					var _right = 10;
					var _buttom = 0;
					var style = _element_popup.style;
					style.position = "absolute";
					style.width  = "700px";
					style.backgroundColor = "#fee";
					style.border = "5px #866 solid";
					style.borderRadius = "10px";
					style.boxShadow = "5px 5px 10px #444";
					style.right = _right + "px";
					style.bottom = _buttom + "px";
					//style.zIndex = "999";
					style.fontSize = "90%";

					// BODY のノードリストに登録する
					_element_overlay.appendChild(_element_popup);

					// ドラッグ設定
					var dragOldX;
					var dragOldY;
					_element_popup.draggable = 'true';
					_element_popup.addEventListener(
						'dragstart',
						function(e){
							//console.log("dragstart: (" + e.x + "," + e.y + ")" );
							dragOldX = e.x;
							dragOldY = e.y;
						},
						false
					);
					_element_popup.addEventListener(
						'drag',
						function(e){
							//console.log("drag: (" + e.x + "," + e.y + ")");
							if (e.x != 0 && e.y != 0) {
								_right  -= e.x - dragOldX;
								_buttom -= e.y - dragOldY;
								style.right = _right + "px";
								style.bottom = _buttom + "px";
								dragOldX = e.x;
								dragOldY = e.y;
							}
						},
						false
					);
				}

				// ------------------------------------------------------------
				// HTML 文字列を指定して、DOM オブジェクトをまとめて構築する
				// ------------------------------------------------------------
				_element_popup.innerHTML = '' +
					'<div style="font-weight:bold; background:#866; color:#fff; padding:5px 20px; cursor:move">' +
						'すべてチェックしてください' +
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
							makeAddressList(node.querySelectorAll('input[name=to]'),whiteDomain) +
							'</td>' +
						'</tr>' +
						'<tr><td>Cc</td>' +
							'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
							makeAddressList(node.querySelectorAll('input[name=cc]'),whiteDomain) +
							'</td>' +
						'</tr>' +
						'<tr><td>Bcc</td>' +
							'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
							makeAddressList(node.querySelectorAll('input[name=bcc]'),whiteDomain) +
							'</td>' +
						'</tr>' +
						'<tr><td>件名</td>' +
							'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
							makeAddressList(node.querySelectorAll('input[name=subject]'),"") +
							'</td>' +
						'</tr>' +
						'<tr><td>添付</td>' +
							'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
							getAttachedFiles(node) +
							'</td>' +
						'</tr>' +
						'</table>' +
					'</div>' +

					'<div style="margin:10px; text-align:center; color">' +
						'<input type="button" id="SAC_OK" style="width:40%; height:40px; font-weight:bold; color:#444" value="O K">　' +
						'<input type="button" id="SAC_CANCEL" style="width:40%; height:40px; font-weight:bold; color:#444" value="CANCEL">' +
					'</div>';

				// ------------------------------------------------------------
				// クリック時に実行されるイベント
				// ------------------------------------------------------------
				var btnOK = document.getElementById("SAC_OK");
				btnOK.disabled = true;
				btnOK.style.opacity = 0.5;
				btnOK.onclick = function (){
					_element_overlay.parentNode.removeChild(_element_overlay);		//ポップアップ削除(オーバーレイごと削除）
					// _this.nextSibling.style.display = "";							//「送信」表示
					// _this.nextSibling.style.backgroundImage = '-webkit-linear-gradient(top,#F44,#E00)';		//「送信」ボタンを赤色に
					d.forEach(function (elem) {
						elem.style.display = ""; //「送信」表示
						elem.style.backgroundImage = '-webkit-linear-gradient(top,#F44,#E00)'; //「送信」ボタンを赤色に
						elem.style.color = "#FFF";
					});
					_this.parentNode.removeChild(_this);							//「確認」削除
				};

				document.getElementById("SAC_CANCEL").onclick = function (){
					_element_overlay.parentNode.removeChild(_element_overlay);		//ポップアップ削除(オーバーレイごと削除）
				};
				//チェックボックスのイベント
				var chbx = _element_popup.querySelectorAll('input[type=checkbox]');
				var chbxLen = chbx.length;
				for (var i=0; i<chbxLen; i++) {
					chbx[i].onclick = function() {
						if (this.checked) {
							chbxLen --;
						} else {
							chbxLen ++;
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

			d.forEach(function (elem) {
				elem.style.display = "none";
			});
			// d[0].style.display = "none";
			d[0].parentNode.insertBefore(el,dd);
		}




	}





	//
	// メール作成エリアのノードを取得
	//  複数のメール作成がある場合もある
	function getMailEditAreaNode()
	{

		var node_form = document.querySelectorAll('td form[method=POST]');

		var node_div=[];
		for (var i=0, len=node_form.length; i < len; i++) {
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
			if (target.name !== 'to' && target.name !== 'cc' && target.name !== 'bcc' && target.name != 'subjectbox' && target.getAttribute('aria-label') != "メッセージ本文") return;

			var node = getMailEditAreaNode();

			for (var i = 0; i < node.length; i++) {
				if (node[i].querySelectorAll('div[aria-label^="確認"]').length == 0) {
					appendKakuninButton(node[i]);
				}
			}
		}, true); // event listener focus

		// ctrl+Enterをきかなくする

		document.addEventListener('keydown', function (event) {
			if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
				console.log("keydown ctrl+Enter");
				event.stopPropagation();	//イベントの伝搬を止める
			}
		}, true);
	
	}, 100); // setTimeout

})();
