const GMailSendAddressChecker = {

	VERSION : "version 0.20",

	// アトリビュート
	CONFIRM_BUTTON_ATTR : "gmsac-confirm",
	CONFIRM_BUTTON_BACKGROUND_COLOR : '#096910',

	SEND_BUTTON_ATTR : "gmsac-send",
	SEND_BUTTON_BACKGROUND_COLOR : '#e81a1a',
	SEND_BUTTON_COLOR : "#FFF",

	EDIT_NODE_ATTR : "gmsac-edit-node",
	CHECK_WINDOW_ID : "gmsac-check-window",
	CHECK_OK_BUTTON_ID : "gmsac-check-ok",

	// 表示文字
	display_text_tbl : {
		"JP": {
			"confirm": "確認",
			"checkall": "すべてチェックしてください",
			"subject": "件名",
			"attached": "添付",
			"noattach": "添付ファイルなし",
		},
		"EN": {
			"confirm": "Confirm",
			"checkall": "Please check all",
			"subject": "Subject",
			"attached": "Attached",
			"noattach": "No attachment",
		},
	},


	//-------------------------------------------------------
	// 初期化(GMailページがロードされた際に呼び出す）
	//-------------------------------------------------------
	init() {
		// 確認ID 初期化
		this.confirm_id = 0;

		// focusイベント追加
		this.addFocusEventListener();

		// Ctrl+Enter無効化
		this.diasbleCtrlEnter();
	},

	// focusイベント追加
	addFocusEventListener() {
		document.addEventListener('focus', (event) => {
			const target = event.target;
			if (target.name == 'to' 
			|| target.name == 'cc' 
			|| target.name == 'bcc' 
			|| target.name == 'subjectbox' 
			|| target.getAttribute('role') == "textbox") {
				
				// すべてのメール作成フォームの「送信」関連ボタンを「確認」ボタンに変更
				this.changeAllButtonSendToConfirm();

			}
		}, true);
	},

	// Ctrl+Enter無効化
	diasbleCtrlEnter() {
		document.addEventListener('keydown', (event) => {
			if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
				console.log("keydown ctrl+Enter");
				console.log(event.target);
				event.stopPropagation(); //イベントの伝搬を止める
			}
		}, true);
	},

	//-------------------------------------------------------
	// すべてのメール作成フォームの「送信」関連ボタンを「確認」ボタンに変更
	//-------------------------------------------------------
	changeAllButtonSendToConfirm() {
		// すべてのメール作成ノードを取得
		const edit_nodes = this.findEditNodeAll();

		for (const node of edit_nodes) {
			//確認ID取得
			let id = node.getAttribute(this.EDIT_NODE_ATTR);
			if (!id) {
				id = this.confirm_id;
				this.confirm_id ++;
			}
			node.setAttribute(this.EDIT_NODE_ATTR, id);
			
			//すでに確認ボタンがあれば処理しない
			if (!this.findConfirmButton(node)) {

				// 送信ボタンを探す
				const send_button = this.findSendButton(node);
				if (send_button) {
					// 送信ボタンのテキストから言語コード取得
					this.lang = this.judgeLanguage(send_button.innerText);

					// 確認ボタンを追加する
					this.insertConfirmButton(send_button, id);

					// 送信ボタンを非表示にする
					this.hideSendButton(send_button, id);

				}
			}
		}
	},

	// すべてのメール作成ノードを取得
	findEditNodeAll() {
		// formを取得
		const form_nodes = document.querySelectorAll('td form[method=POST]');

		// 見つけたformノードの親階層の下に、メール作成に必要な機能がある
		const edit_nodes = [];
		for (const node of form_nodes) {
			edit_nodes.push(node.parentNode);
		}

		return edit_nodes;
	},

	// 確認ボタンがすでにないか探す
	findConfirmButton(node) {
		const query = 'div[' + this.CONFIRM_BUTTON_ATTR + ']';
		return node.querySelector(query);
	},

	// 送信ボタンを探す
	findSendButton(node) {
		//送信ボタン検索
		// 言語によって(Ctrl + Enter)だったり(Ctrl-Enter)だったりするので
		// Enterが含まれているものを探す
		const d = node.querySelector('div[aria-label*="Enter)"]');
		return d;
	},

	// 送信ボタンを非表示にする
	hideSendButton(send_button, id) {
		//親要素を非表示にする
		const parent_send_button = send_button.parentNode;
		parent_send_button.style.display = "none";
		parent_send_button.setAttribute(this.SEND_BUTTON_ATTR,id);
		
		//送信＆アーカイブ設定になっている場合は、親の兄弟要素も送信ボタンなので、非表示
		const next_element = parent_send_button.nextElementSibling;
		if (next_element) {
			next_element.style.display = "none";
			next_element.setAttribute(this.SEND_BUTTON_ATTR,id);
		}
	},

	// 送信ボタン表示&色を変える
	displaySendButton(id) {
		const send_buttons = document.querySelectorAll(`div[${this.SEND_BUTTON_ATTR}="${id}"]`);
		if (!send_buttons || send_buttons.length==0) {
			alert('送信ボタンを再表示出来ませんでした。\nGMailSendAddressChecker拡張を無効にしてみてください。');
		} else {
			send_buttons.forEach((element) => {
				element.style.display = "";
				element.childNodes.forEach((e) => {
					e.style.backgroundColor = this.SEND_BUTTON_BACKGROUND_COLOR;
					e.style.color = this.SEND_BUTTON_COLOR;
				});
			});
		}
	},

	// 確認ボタンを追加する
	insertConfirmButton(send_button, id) {
		const confirm_button = this.createConfirmButton(send_button, id);

		//送信ボタンの親要素のさらに親要素に挿入
		const parent_send = send_button.parentNode;
		parent_send.parentNode.append(confirm_button);
	},

	// 確認ボタン削除
	removeConfirmButton(id) {
		const element = document.querySelector(`div[${this.CONFIRM_BUTTON_ATTR}="${id}"]`);
		if (element) {
			element.parentNode.removeChild(element); 
		}
	},



	//-------------------------------------------------------
	// 多言語対応
	//-------------------------------------------------------
	  
	//言語を判断する
	//  送信ボタンのテキストを判定し、言語コードを返します。
	//	テキストの最初の２文字が"送信"の場合、JP
	//  それ以外は、EN
	judgeLanguage(send_text) {
		if (send_text.match(/送信/))
			return 'JP';
		else
			return 'EN';
	},

	//表示文字取得
	getDisplayText(type) {
		if (!this.lang)
			this.lang = 'EN';
		if (!this.display_text_tbl[this.lang])
			this,lang = 'EN';
		
		return this.display_text_tbl[this.lang][type];
	},



	//-------------------------------------------------------
	// 確認ボタンの生成
	//-------------------------------------------------------
	createConfirmButton(send_button, id) {
		
		// 送信ボタンのクローンから作成
		let confirm_button = send_button.cloneNode();

		confirm_button.setAttribute(this.CONFIRM_BUTTON_ATTR,id);
		confirm_button.removeAttribute('id');
		confirm_button.setAttribute("aria-label", this.getDisplayText("confirm"));
		confirm_button.setAttribute("data-tooltip", this.getDisplayText("confirm"));
		confirm_button.innerText = this.getDisplayText("confirm");
		confirm_button.style.backgroundColor = this.CONFIRM_BUTTON_BACKGROUND_COLOR;

		confirm_button.onclick = (event) => {
			console.log(`No.${id} の確認ボタンが押されました`);
			// チェック用モーダルウィンドウ
			const check_modal_window = this.createCheckModalWindow(id);
			document.body.appendChild(check_modal_window);
		};

		return confirm_button;
	},




	//-------------------------------------------------------
	// チェック用モーダルウィンドウの生成
	//-------------------------------------------------------
	createCheckModalWindow(id) {

		const window_element = this.createModalWindowsOuter();
		window_element.innerHTML = this.createWindowHtml(id);
		window_element.appendChild(this.crateCheckOkCancelButton(id));		// OK,CANCELボタン
		
		const element = this.createModalBack();
		element.appendChild(window_element);
		element.id = this.CHECK_WINDOW_ID;

		//チェックボックスのイベント
		let btnOK = element.querySelector(`#${this.CHECK_OK_BUTTON_ID}`);
		const chbx = element.querySelectorAll('input[type=checkbox]');
		let chbxLen = chbx.length;
		for (let i = 0; i < chbxLen; i++) {
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
		btnOK.style.backgroundImage = '';
		btnOK.disabled = true;
		btnOK.style.opacity = 0.5;

		return element;
	},

	//チェック用モーダルウィンドウ削除
	removeCheckModalWindow() {
		const element = document.getElementById(this.CHECK_WINDOW_ID);
		if (element) {
			element.parentNode.removeChild(element); 
		}
	},


	//モーダルウィンドウ外の全面背景
	createModalBack() {
		let element = document.createElement("div");
		const style = {
			position : "fixed",
			width : "100%",
			height : "100%",
			top : "0",
			left : "0",
			backgroundColor : "rgba(0,0,0, 0.25)",
			zIndex : "998",
		};
		Object.assign(element.style, style);

		return element;
	},

	//ウィンドウ外形
	createModalWindowsOuter() {
		let _right = 10;
		let _buttom = 0;

		let element = document.createElement("div");
		const style = {
			position : "absolute",
			width : "700px",
			maxHeight : "100%",
			right : `${_right}px`,
			bottom : `${_buttom}px`,
			backgroundColor : "#fee",
			border : "5px #866 solid",
			borderRadius : "10px",
			boxShadow : "5px 5px 10px #444",
			fontSize : "90%",
			display: "flex",
			flexDirection: "column",
		};
		Object.assign(element.style, style);

		// ドラッグ設定
		let dragOldX;
		let dragOldY;
		element.draggable = 'true';
		element.addEventListener(
			'dragstart',
			function (e) {
				// console.log("dragstart: (" + e.x + "," + e.y + ")" );
				dragOldX = e.x;
				dragOldY = e.y;
			},
			false
		);
		element.addEventListener(
			'drag',
			function (e) {
				// console.log("drag: (" + e.x + "," + e.y + ")");
				if (e.x != 0 && e.y != 0) {
					_right -= e.x - dragOldX;
					_buttom -= e.y - dragOldY;
					this.style.right = _right + "px";
					this.style.bottom = _buttom + "px";
					dragOldX = e.x;
					dragOldY = e.y;
				}
			},
			false
		);

		return element;

	},


	// ウィンドウ内HTML
	createWindowHtml(id) {
		let edit_node = document.querySelector(`*[${this.EDIT_NODE_ATTR}="${id}"]`);
		const from = this.getFrom(edit_node);
		const whiteDomain = this.getDomain(from);
		//ヘッダー
		let html = 
		'<div>' +
		'<div style="font-weight:bold; background:#866; color:#fff; padding:5px 20px; cursor:move">' +
		this.getDisplayText("checkall") +
		'<div style="float:right">' + this.VERSION + '  ' + '<a href="http://www.dorasu.com">(C) DORASU</a></div>' +
		'</div>' +
		'</div>';
		
		//チェック領域
		html += 
		'<div style="padding:10px; flex-grow: 1; overflow: auto;">' +
		'<table borde="10" style="border:10; width:100%; cellspacing:10; cellpadding:10">' +
		'<tr><td width="15%">From</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.createCheckbox(from) +
		'</td>' +
		'</tr>' +
		'<tr><td width="15%">To</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.makeAddressList(edit_node.querySelectorAll('input[name=to]'), whiteDomain) +
		'</td>' +
		'</tr>' +
		'<tr><td>Cc</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.makeAddressList(edit_node.querySelectorAll('input[name=cc]'), whiteDomain) +
		'</td>' +
		'</tr>' +
		'<tr><td>Bcc</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.makeAddressList(edit_node.querySelectorAll('input[name=bcc]'), whiteDomain) +
		'</td>' +
		'</tr>' +
		'<tr><td>' + this.getDisplayText("subject") + '</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.makeAddressList(edit_node.querySelectorAll('input[name=subject]'), "") +
		'</td>' +
		'</tr>' +
		'<tr><td>' + this.getDisplayText("attached") + '</td>' +
		'<td style="margin:10px; padding:5px; background:#fff; border:1px solid #888;">' +
		this.getAttachedFiles(edit_node) +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>';

		return html;		
	},


	// OK,CANCELボタン
	crateCheckOkCancelButton(id) {
		const button_style = {
			width:	"40%",
			height:	"40px",
			fontWeight: "bold",
			color:	"#444",
			borderRadius : "10px",
		};
		
		let ok = document.createElement("input");
		ok.id = this.CHECK_OK_BUTTON_ID;
		ok.type="button";
		ok.value="O K";
		Object.assign(ok.style ,button_style);
		ok.onclick = () => {
			this.removeCheckModalWindow();
			this.displaySendButton(id);	  // 送信ボタン表示
			this.removeConfirmButton(id); // 確認ボタン削除
		}

		let cancel = document.createElement("input");
		cancel.type="button";
		cancel.value="CANCEL";
		Object.assign(cancel.style, button_style);
		cancel.onclick = () => {
			this.removeCheckModalWindow();
		}

		let element = document.createElement("div");
		element.style.margin =	"10px";
		element.style.textAlign = "center";
		element.style.display = "flex";
		element.style.justifyContent = "space-around";
		element.appendChild(ok);
		element.appendChild(cancel);

		return element;
	},

	// チェックボックス作成
	createCheckbox(html) {
		return `<input type="checkbox">${html}</input>`;
	},

	// from取得
	getFrom(edit_node) {
		let from = edit_node.querySelectorAll('input[name=from]')[0].value;
		if (from == "") {
			//アカウントが１つしか設定されていないとfromに値がはいらないので、タイトルを使う。これでいいのかは怪しい
			console.log(document.title);
			from = document.title.match(/- ([a-zA-z0-9\.-]+@[a-zA-z0-9\.-]+) -/);
			if (from != null)
				from = from[1];
		}
		return from;
	},

	// ドメインのみ抽出
	getDomain(address) {
		const domain = address.match(/[a-zA-z0-9\.-]+@([a-zA-z0-9\.-]+)/)

		if (domain == null)
			return "";

		return domain[1];
	},

	//アドレスリスト作成
	makeAddressList(addresses, whiteDomain) {
		let list = "";

		for (let i = 0, addressCount = addresses.length; i < addressCount; i++) {
			var addressValue = addresses[i].value;
			if (addressValue) {
				let text = addressValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				if (whiteDomain != "") {
					if (this.getDomain(addressValue) == whiteDomain)
						text = '<font color="#00f">' + text + '</font>';
					else
						text = '<font color="#f00">' + text + '</font>';
				}

				list = list + this.createCheckbox(text) + '<br/>';
			}
		}

		return list;
	},

	// 添付ファイル名取得
	getAttachedFiles(edit_node) {
		//<div class="dL" tabindex="-1" id=":eu" aria-label="添付ファイル GMailSendAdressCheckerSS.png。添付ファイルを表示するには Enter キーを、削除するには Delete キーを押してください">
		// <input id=":em" name="attach" type="hidden" value="14d415a088af6894_14d415a088af6894_0.2_-1" checked="">
		// <a class="dO" id=":en" href="?ui=2&amp;ik=0187644934&amp;view=att&amp;th=14d415a088af6894&amp;attid=0.2&amp;disp=safe&amp;realattid=f_i9jfa7u21&amp;zw" target="_blank">
		//  <div class="vI">GMailSendAdressCheckerSS.png</div>
		//  <div class="vJ">（39 KB）</div>
		// </a>
		// <div id=":ek" role="button" class="vq" tabindex="-1">
		//</div>
		// こんな感じなので、<input name="attach">直後の<a>タグの直下の２つのDIVからファイル名とサイズを取得

		let attachedFiles = "";

		const el = edit_node.querySelectorAll('input[name=attach]+a');

		const el_len = el.length;
		if (el_len > 0) {
			for (let i = 0; i < el.length; i++) {

				const el_div = el[i].querySelectorAll('div');

				attachedFiles = attachedFiles + this.createCheckbox(el_div[0].innerText + el_div[1].innerText) + '<br/>';
			}
		} else {
			attachedFiles = this.createCheckbox(" - " + this.getDisplayText("noattach") + " - ");
		}

		return attachedFiles;
	},




};




// 起動
console.log("GMail SendAddress Checker init");
GMailSendAddressChecker.init();
