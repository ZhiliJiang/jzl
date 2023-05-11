(function() {
	"use strict";
	// 蠢��郁ｨｭ螳�
	const TRANSFER_PARAMETER = '___smz_tr';
	const COOKIE_KEY = '__smz_ma';
	const SESSION_COOKIE_KEY = '__smz_session';
	const COOKIE_VALUE_LENGTH = 32;
	const EXTERNAL_KEY = '__smz_external';
	const OVERLAY_ID = '___smz_overlay';
	const OVERLAY_BACKGROUND_COLOR = (__smz_ma.bgcolor ? __smz_ma.bgcolor : '#000'); 
	const HAS_SESSION = hasCookieItem(SESSION_COOKIE_KEY);
	const CONTENT_ID = '__smz_content';
	const CONTENT_CLOSE_ID = '__smz_content_close';
	const CONTENT_BACK_DARK_ID = '__smz_fade_layer';
	const SCRIPT_START_DATETIME = new Date();
	
	// 迥ｶ諷句叙蠕�
	let isPreview = false;

	// body縺ｮcss縺ｮoverflow菫晏ｭ倡畑
	let bodyOriginalOverflow = "";
	
	// 繧ｯ繝ｭ繝ｼ繧ｺ迥ｶ諷句叙蠕暦ｼ医ヶ繝ｩ繧ｦ繧ｶ繝舌ャ繧ｯ縺ｧ�貞屓陦ｨ遉ｺ縺輔ｌ繧句ｯｾ遲厄ｼ�
	let isClose = false;
	
	// 繝｡繧､繝ｳ繝｡繧ｽ繝�ラ
	main();
	
	// 繝｡繧､繝ｳ繝｡繧ｽ繝�ラ(譛ｬ菴�)
	function main() {
		
		// 襍ｷ蜍募燕繝√ぉ繝�け
		if (!validateOptions()) return;
		
		// 繧､繝吶Φ繝育匳骭ｲ
        if (document.readyState == 'loading' || document.readyState == 'interactive') {
            document.addEventListener('DOMContentLoaded', initializePageTransition);
            document.addEventListener('DOMContentLoaded', initializeExternalForm);
        } else {
            initializePageTransition();
            initializeExternalForm();
        }

		// 霆｢騾∬ｪｭ縺ｿ霎ｼ縺ｿ陦ｨ遉ｺ
		showOverlay();

		// 繝励Ξ繝薙Η繝ｼ逕ｨ繝代Λ繝｡繝ｼ繧ｿ蜿門ｾ�
		const hashParameters = getHashParameters();
		isPreview = (hashParameters && hashParameters.attend_hash);
		
		// 繧ｯ繝�く繝ｼ蜿門ｾ�/逕滓�
		const cookieValue = getCookieKey(hashParameters);
		
		// 霆｢騾∬ｨｭ螳壹′縺ゅｌ縺ｰ霆｢騾�
		if (transfer(cookieValue)) return;
		
		// 螟夜Κ縺ｪ繧峨�MA繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡
		if (isExternal()) {
			// 繧｢繧ｯ繧ｻ繧ｹ騾∽ｿ｡
			loadAccessImage(cookieValue);
			// 繝ｪ繝ｳ繧ｯ縺ｫ繧ｯ繝�く繝ｼ繝代Λ繝｡繝ｼ繧ｿ莉倅ｸ�
			attachCookieParameter(cookieValue);
		}
		
		// 謗･螳｢繧ｳ繝ｳ繝�Φ繝�ｒ蜿門ｾ�
		loadAttendContent(cookieValue, hashParameters);
		if (isPreview) {
			// 繝励Ξ繝薙Η繝ｼ陦ｨ遉ｺ
			showAttendPreviewToast(cookieValue);
		}
		
	}
	
	function validateOptions() {
		if (typeof __smz_ma === 'undefined' || !__smz_ma) {
			console.warn('SiteMiraiZ險域ｸｬ繧ｿ繧ｰ(__smz_ma)繧貞ｮ夂ｾｩ縺励※縺上□縺輔＞縲�')
			return false;
		}
		if (!__smz_ma.hostname) {
			console.warn('SiteMiraiZ險域ｸｬ繧ｿ繧ｰ縺ｫ繝帙せ繝亥錐(hostname)繧貞ｮ夂ｾｩ縺励※縺上□縺輔＞縲�')
			return false;
		}
		if (!__smz_ma.top_url) {
			console.warn('SiteMiraiZ險域ｸｬ繧ｿ繧ｰ縺ｫ繝医ャ繝励�繝ｼ繧ｸ縺ｮ逶ｸ蟇ｾURL(top_url)繧貞ｮ夂ｾｩ縺励※縺上□縺輔＞縲�')
			return false;
		}
		return true;
	}
	
	function isExternal() {
		if (__smz_ma.is_internal) return false;
		if (document.location.hostname === __smz_ma.hostname) return false;
		if (document.location.hostname.indexOf(__smz_ma.top_url) === 0) return false;
		return true;
	}
	
	// 繝上ャ繧ｷ繝･縺九ｉ繧ｯ繧ｨ繝ｪ繝代Λ繝｡繝ｼ繧ｿ繧貞叙蠕�(繝励Ξ繝薙Η繝ｼ逕ｨ)
	function getHashParameters() {
		const hashParameters = new Object;
		if (!document.location.hash) {
			return hashParameters;
		}
		const pairs = location.hash.substring(1).split('&');
		for(let i = 0; i < pairs.length; i++) {
			const keyValue = pairs[i].split('=');
			if (keyValue.length < 2) {
				hashParameters[keyValue[0]] = true;
			} else {
				hashParameters[keyValue[0]] = keyValue[1];
			}
		}
		return hashParameters;
	}
	
	// 繧ｯ繝�く繝ｼ逕滓�繝ｻ譖ｴ譁ｰ
	function getCookieKey(hashParameters) {
		
		// 譛牙柑譛滄剞
		const expired = new Date();
		expired.setYear(expired.getFullYear() + 2);
		
		let cookieValue;
		if (hashParameters && hashParameters[COOKIE_KEY]) {
			// 繝励Ξ繝薙Η繝ｼCookie
			cookieValue = hashParameters[COOKIE_KEY];
			return cookieValue;
		}
		if (!cookieValue) {
			// Cookie縺九ｉ蛟､繧貞叙蠕�
			cookieValue = getCookieItem(COOKIE_KEY);
		}
		if (!cookieValue) {
			// 蛟､繧堤函謌�
			cookieValue = '';
			while (cookieValue.length < COOKIE_VALUE_LENGTH) {
				cookieValue += Math.random().toString(36).substring(2);
			}
			cookieValue = cookieValue.substring(0, COOKIE_VALUE_LENGTH);
		}
		// Cookie縺ｫ蛟､繧剃ｿ晏ｭ�
		setCookieItem(COOKIE_KEY, cookieValue, expired, '/', document.location.hostname, false);
		
		if (!HAS_SESSION) {
			setCookieItem(SESSION_COOKIE_KEY, 1, null, '/', document.location.hostname, false);
		}
		
		return cookieValue;
	}
	
	// 繧｢繧ｯ繧ｻ繧ｹ騾∽ｿ｡
	function loadAccessImage(cookieValue) {
		let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'ma.png';
		link += '?' + COOKIE_KEY + '=' + cookieValue;
		if (isExternal()) link += "&" + EXTERNAL_KEY + "=1";
		if (!HAS_SESSION) link += "&" + SESSION_COOKIE_KEY + "=1";
		link += '&url=' + encodeURIComponent( document.location.href );
		link += '&referer=' + encodeURIComponent( document.referrer );
		link += '&title=' + encodeURIComponent( document.title );
		const image = new Image();
		image.onerror = hideOverlay;
		image.src = link;
	}
	
	function loadAttendContent(cookieValue, hashParameters) {
		let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'attend.json';
		link += '?' + COOKIE_KEY + '=' + cookieValue;
		if (isExternal()) link += "&" + EXTERNAL_KEY + "=1";
		link += '&url=' + encodeURIComponent(
			document.location.protocol + '//' + document.location.hostname
			 + document.location.pathname + document.location.search
		);
		if (hashParameters && hashParameters.attend_hash) {
			link += '&attend_hash=' + hashParameters.attend_hash;
		}
		link += '&__t=' + (new Date()).getTime().toString();
		
		const request = new XMLHttpRequest();
		request.addEventListener('load', showAttendContent);
		request.open('GET', link);
		request.responseType = 'json';
		request.send();
	}
	
	// 繝�Φ繝励Ξ繝ｼ繝郁ｨｭ螳�
	function showAttendContent() {
		if (!this.response) return;

		let json;
		if (typeof(this.response) == 'object') {
			json = this.response;
		} else {
			json = JSON.parse(this.response);
		}
		if (json.length == 0) return;
		
		const content = json[0];
		if (!content) return;
		if (!content.content_type) return;
		switch(content.content_type) {
			case 'insert' :
				showAttendContentInsert(content);
				break;
			case 'popup' :
				showAttendContentPopup(content);
				break;
		}
	}
	
	function showAttendContentInsert(content) {
		if (!content.target_selector) {
			content.target_selector = 'body';
			content.position = 'child-last';
		}
		const target = document.querySelector(content.target_selector);
		if (!target) return;
		
		const node = document.createElement('div');
		node.id = CONTENT_ID;
		node.innerHTML += content.html;
		if (!isPreview) {
			node.addEventListener('click', clickNode);
			function clickNode() {
				sendAttendReact(getCookieItem(COOKIE_KEY), content.attend_hash, 'click');
				node.removeEventListener('click', clickNode);
			}
		}
		node.insertBefore(getCloseButton(content), node.firstChild);
		
		switch(content.position) {
			case 'before' : // 蝓ｺ貅冶ｦ∫ｴ�縺ｮ蜑�
				target.parentElement.insertBefore(node, target);
				break;
			case 'after' : // 蝓ｺ貅冶ｦ∫ｴ�縺ｮ蠕�
				if (target.nextElementSibling) {
					target.parentElement.insertBefore(node, target.nextElementSibling);
				} else {
					target.parentElement.appendChild(node);
				}
				break;
			case 'child-first' : // 蝓ｺ貅冶ｦ∫ｴ�縺ｮ蟄�(譛蛻�)
				target.insertBefore(node, target.firstChild);
				break;
			case 'child-last' : // 蝓ｺ貅冶ｦ∫ｴ�縺ｮ蟄�(譛蠕�)
				target.appendChild(node);
				break;
		}
		
		let contentWidth;
		if (content.width) {
			if (content.width.match(/^\d+(px|%)$/)) {
				contentWidth = content.width;
			} else if (content.width.match(/^\d+$/)) {
				contentWidth = content.width + 'px';
			}
		}
		
		// 陦ｨ遉ｺ菴咲ｽｮ
		const styles = [];
		styles.push('position: relative;');
		if (contentWidth) {
			styles.push('width: ' + contentWidth + ' !important;');
		}
		const styleText = '#' + CONTENT_ID + ' {' + styles.join('') + '}';
		const styleElement = document.createElement('style');
		styleElement.appendChild(
			document.createTextNode(styleText)
		);
		document.head.appendChild(styleElement);
		
		if (!isPreview) {
			sendAttendReact(getCookieItem(COOKIE_KEY), content.attend_hash, 'view');
		}
	}
	
	function showAttendContentPopup(content) {

		if (bodyOriginalOverflow==""){
			bodyOriginalOverflow = document.body.style.getPropertyValue('overflow');
		}

		const node = document.createElement('div');
		node.id = CONTENT_ID;
		node.innerHTML = content.html;
		node.style.setProperty('display', 'none');
		if (!isPreview) {
			node.addEventListener('click', clickNode);
			function clickNode() {
				sendAttendReact(getCookieItem(COOKIE_KEY), content.attend_hash, 'click');
				node.removeEventListener('click', clickNode);
			}
		}
		document.body.appendChild(node);
		
		// 蠕�ｩ滓凾髢�
		if (content.start || content.start === 0) {
			setShowScroll();
		} else {
			setTimeout(showNode, getWaitMilliseconds(SCRIPT_START_DATETIME));
		}
		
		function setShowScroll() {
			if (!content.target_selector) {
				content.target_selector = 'body';
			}
			const target = document.querySelector(content.target_selector);
			if (!target) return;
			
			if (content.start.indexOf('%') > 0) {
				content.startPercentage = parseFloat(content.start.substring(0, content.start.indexOf('%')));
			} else if (content.start.indexOf('px') > 0) {
				content.startPixel = parseInt(content.start.substring(0, content.start.indexOf('px')));
			} else if (content.start.match(/^\d+$/)) {
				content.startPixel = content.start;
			}
			
			// 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ繧､繝吶Φ繝亥�逅�
			let targetOffsetHeight;
			let targetRectY;
			if (content.target_selector == 'body') {
				targetOffsetHeight = getPageHeight();
				targetRectY = 0;
			} else {
				const targetRect = target.getBoundingClientRect();
				targetRectY = window.pageYOffset + (!targetRect.y ? targetRect.top : targetRect.y); // IE11蟇ｾ蠢�
				targetOffsetHeight = target.offsetHeight;
			}
			pageScroll();
			document.addEventListener('scroll', pageScroll);
			function pageScroll() {
				const scrollPositionY = window.pageYOffset + window.innerHeight;
				if (content.startPercentage || content.startPercentage === 0) {
					const viewPercentage = parseInt((scrollPositionY - targetRectY) / targetOffsetHeight * 100);
					if (viewPercentage < content.startPercentage) return;
				}
				if (content.startPixel || content.startPixel === 0) {
					const viewPixel = (scrollPositionY - targetRectY);
					if (viewPixel < content.startPixel) return;
				}
				document.removeEventListener('scroll', pageScroll);
				setTimeout(showNode, getWaitMilliseconds(new Date()));
			}
            
		}
		
		function showNode() {
			
			// 荳蠎ｦ髢峨§縺ｦ縺�ｋ蝣ｴ蜷医�蜀崎｡ｨ遉ｺ縺励↑縺�ｼ医ヶ繝ｩ繧ｦ繧ｶ繝舌ャ繧ｯ繝ｻ譖ｴ譁ｰ蟇ｾ遲厄ｼ�
			if (isClose) return;

			// 陦ｨ遉ｺ繧ｨ繝輔ぉ繧ｯ繝�
			switch(content.show_effect) {
				case 'immediate':
					break;
				case 'fade-in':
					showEffectFadeIn();
					break;
				case 'back-dark':
					showEffectBackDark();
					break;
			}
			
			// 髢峨§繧九�繧ｿ繝ｳ霑ｽ蜉�
			node.insertBefore(getCloseButton(content), node.firstChild);

			// 陦ｨ遉ｺ菴咲ｽｮ
			const styles = [];
			styles.push('display: block;');
			styles.push('position: fixed;');
			if (content.width) {
				styles.push('width: ' + content.width + ' !important;');
			}
			let paddingPx;
			if (content.width.indexOf('%') == content.width.length - 1) {
				paddingPx = '0px';
			} else {
				paddingPx = '20px';
			}
			styles.push('bottom: ' + paddingPx + ';');
			switch(content.position) {
				case 'center-bottom' : // 荳ｭ螟ｮ荳�
					styles.push('left: 50%;');
					styles.push('transform: translateX(-50%);');
					break;
				case 'right-bottom' : // 蜿ｳ荳�
					styles.push('right: ' + paddingPx + ';');
					break;
				case 'left-bottom' : // 蟾ｦ荳�
					styles.push('left: ' + paddingPx + ';');
					break;
			}
			const styleText = '#' + CONTENT_ID + ' {' + styles.join('') + '}';
			const styleElement = document.createElement('style');
			styleElement.appendChild(
				document.createTextNode(styleText)
			);
			document.head.appendChild(styleElement);

			// 證励￥縺吶ｋ閭梧勹繧定｡ｨ遉ｺ縺吶ｋ
			let backDiv = document.querySelector("#" + CONTENT_BACK_DARK_ID);
			if (backDiv) {
				document.body.style.setProperty('overflow', 'hidden');
				backDiv.style.setProperty('display', 'block');
			}

			// 繧ｳ繝ｳ繝�Φ繝�ｒ陦ｨ遉ｺ縺吶ｋ
			node.style.setProperty('display', 'block');
			if (!isPreview) {
				sendAttendReact(getCookieItem(COOKIE_KEY), content.attend_hash, 'view');
			}
				
			// 陦ｨ遉ｺ邯咏ｶ壽凾髢�
			const showMilliseconds = (content.show_second ? content.show_second * 1000 : 0);
			if (showMilliseconds) {
				setTimeout(hideNode, showMilliseconds);
			}
		}
		
		function showEffectFadeIn() {
			// 隱ｭ縺ｿ霎ｼ縺ｿ繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ
			const keyframes = '@keyframes fade-in {' + [
				'0% { opacity : 0 }',
				'100% { opacity : 2 }'
			].join('') + '}';
			const keyframeStyle = document.createElement('style');
			keyframeStyle.appendChild(
				document.createTextNode(keyframes)
			);
			document.head.appendChild(keyframeStyle);
			node.style.setProperty('animation', 'fade-in 2s');
		}
		
		function showEffectBackDark() {

			let backDiv = document.querySelector("#" + CONTENT_BACK_DARK_ID);
			if (!backDiv) {
				const fadeStyleText = "#" + CONTENT_BACK_DARK_ID + " { position:absolute;  top:0px;  left:0px;  width:100%;  height:" + getPageHeight() + "px;  background-color:#000000;  opacity:0.5;  z-index:100000; }";
				const fadeStyle = document.createElement('style');
				fadeStyle.appendChild(
					document.createTextNode(fadeStyleText)
				);

				const fadeDiv = document.createElement('div');
				fadeDiv.setAttribute("id", CONTENT_BACK_DARK_ID);

				document.body.appendChild(fadeStyle);
				document.body.appendChild(fadeDiv);

				//backDiv = fadeDiv;
			}

			//backDiv.style.setProperty('display', 'block');
			node.style.setProperty('z-index', '100001');
		}
		
		function hideNode() {

			document.body.style.setProperty('overflow', bodyOriginalOverflow);
			const target = document.querySelector("#" + CONTENT_BACK_DARK_ID);
			if (target) {
				target.style.setProperty('display', 'none');
			}

			node.style.setProperty('display', 'none');
		}
		
		function getWaitMilliseconds(startDateTime) {
			// 蠕�ｩ滓凾髢薙�險ｭ螳壹′縺ゅｋ縺�
			const waitMilliseconds = (content.wait_second ? content.wait_second * 1000 : 0);
			if (!waitMilliseconds) return 0;
			
			// 蠕�ｩ滓凾髢薙�邨碁℃譎る俣繧呈ｯ碑ｼ�
			const currentDateTime = new Date();
			const elapsedMiliseconds = currentDateTime - startDateTime;
			if (waitMilliseconds < elapsedMiliseconds) return 0;
			return (waitMilliseconds - elapsedMiliseconds);
		}

		function getPageHeight() {
			return Math.max(
				document.body.scrollHeight, document.documentElement.scrollHeight,
				document.body.offsetHeight, document.documentElement.offsetHeight,
				document.body.clientHeight, document.documentElement.clientHeight
			);
		}

	}
	
	function getCloseButton(content) {
		// CSS
		const styles = [
			'float: right;',
			'position: absolute;',
			'right: 0px;',
			'top: 0px;',
			'width: 30px;',
			'height: 30px;',
			'line-height: 30px;',
			'background-color: black;',
			'color: white;',
			'font-size: 20px;',
			'font-weight: bold;',
			'text-align: center;',
			'cursor: pointer;'
		];
		const styleText = '#' + CONTENT_CLOSE_ID + ' {' + styles.join('') + '}';
		const styleElement = document.createElement('style');
		styleElement.appendChild(
			document.createTextNode(styleText)
		);
		document.head.appendChild(styleElement);
		
		// 繝懊ち繝ｳ
		const button = document.createElement('span');
		button.id = CONTENT_CLOSE_ID;
		button.textContent = 'ﾃ�';
		button.addEventListener('click', function(e) {
			clickCloseHandler(e);
			return;
		});

		const backDarkContent = document.querySelector("#" + CONTENT_BACK_DARK_ID);
		if (backDarkContent) {
			backDarkContent.addEventListener('click', function(e) {
				clickCloseHandler(e);
				return;
			});
		}


		function clickCloseHandler(e) {
			e.preventDefault();
			e.stopPropagation();

			isClose = true;

			if (!isPreview) {
				sendAttendReact(getCookieItem(COOKIE_KEY), content.attend_hash, 'close');
			}
			const attendContent = document.getElementById(CONTENT_ID);
			if (!attendContent) return;
			attendContent.style.setProperty('display', 'none');

			document.body.style.setProperty('overflow', bodyOriginalOverflow);
			const target = document.querySelector("#" + CONTENT_BACK_DARK_ID);
			if (target) {
				target.style.setProperty('display', 'none');
			}

			return;
		}

		return button;
	}		
	
	function sendAttendReact(cookieValue, attendHash, action) {
		
		const url = '//' + __smz_ma.hostname + __smz_ma.top_url + 'attend_react';
		const data = new FormData();
		data.append(COOKIE_KEY, cookieValue);
		if (isExternal()) { data.append(EXTERNAL_KEY, "1"); }
		data.append('attend_hash', attendHash);
		data.append('action', action);
		data.append('__t', (new Date()).getTime().toString());
		
		if (navigator && navigator.sendBeacon) {
			navigator.sendBeacon(url, data);
			return;
		} else {
			const request = new XMLHttpRequest();
			request.open('POST', url);
			request.responseType = 'json';
			request.send(data);
		}
	}	
	
	function showAttendPreviewToast(cookieValue) {
		
		const TOAST_ID = '__smz_ma_preview';
		
		// CSS
		const styles = [
			'position: fixed;',
			'top: 10px;',
			'right: 10px;',
			'line-height: 40px;',
			'padding: 5px 15px;',
			'background-color: #1E96C8;',
			'color: #fff;',
			'opacity: 0.5;',
			'z-index: 100000;'
		];
		const styleText = '#' + TOAST_ID + ' {' + styles.join('') + '}';
		const styleElement = document.createElement('style');
		styleElement.appendChild(document.createTextNode(styleText));
		styleElement.appendChild(document.createTextNode('#' + TOAST_ID + ':hover { opacity : 1; }'));
		document.head.appendChild(styleElement);		
		
		const toast = document.createElement('div');
		toast.id = TOAST_ID
		toast.textContent = '謗･螳｢繝励Ξ繝薙Η繝ｼ荳ｭ';
		document.body.appendChild(toast);
		
		toast.appendChild(getLogoutButton());
		
		function getLogoutButton() {
			
			const TOAST_LOGOUT_ID = '__smz_ma_preview_logout';
			
			// CSS
			const styles = [
				'height: 30px;',
				'line-height: 30px;',
				'background-color: #777;',
				'color: white;',
				'text-align: center;',
				'cursor: pointer;',
				'padding: 3px 10px;',
				'margin-left: 10px;',
				'border-radius: 5px;'
			];
			const styleText = '#' + TOAST_LOGOUT_ID + ' {' + styles.join('') + '}';
			const styleElement = document.createElement('style');
			styleElement.appendChild(
				document.createTextNode(styleText)
			);
			document.head.appendChild(styleElement);
			
			// 繝懊ち繝ｳ
			const button = document.createElement('span');
			button.id = TOAST_LOGOUT_ID;
			button.textContent = '邨ゆｺ�';
			button.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				
				let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'attend_preview_end';
				link += '?' + COOKIE_KEY + '=' + cookieValue;
				if (isExternal()) link += "&" + EXTERNAL_KEY + "=1";
				link += '&__t=' + (new Date()).getTime().toString();
				
				const request = new XMLHttpRequest();
				request.addEventListener('load', function(e) {
					const newUrl = document.location.protocol + '//'
								+ document.location.hostname 
								+ document.location.pathname 
								+ document.location.search;
					const newWindow = window.open(newUrl, window.name + '_logout' + (new Date()).getTime().toString());
					window.close();
					newWindow.focus();
				});
				request.addEventListener('error', function(e) {});
				request.open('GET', link);
				request.responseType = 'json';
				request.send();
				return;
			});
			return button;
		}
	}
	
	// 繝ｪ繝ｳ繧ｯ縺ｫ繧ｯ繝�く繝ｼ繝代Λ繝｡繝ｼ繧ｿ莉倅ｸ�
	function attachCookieParameter(cookieValue) {
		const topDirs = __smz_ma.top_url.split('/');
		const anchors = document.querySelectorAll('a');
		for (let i = 0; i < anchors.length; i++) {
			const anchor = anchors[i];
			const href = anchor.href;
			if (href.indexOf('/') === -1) continue;
			const parts = href.split('/');
			if (__smz_ma.hostname != parts[2]) continue;
			
			let anchorIndex = 3;
			let isMatch = true;
			for (let topDirIndex = 1; topDirIndex < topDirs.length; topDirIndex++) {
				if (!topDirs[topDirIndex] || topDirs[topDirIndex] == parts[anchorIndex]) {
					anchorIndex++;
					continue;
				}
				isMatch = false;
				break;
			}
			if (!isMatch) continue;
			
			anchor.href = anchor.href 
						+ (anchor.href.indexOf('?') === -1 ? '?' : '&')
						+ COOKIE_KEY + '=' + cookieValue;
		}
	}
	
	function transfer(cookieValue) {
		if (document.location.search.indexOf('?' + TRANSFER_PARAMETER + '=') === -1 && 
			document.location.search.indexOf('&' + TRANSFER_PARAMETER + '=') === -1 ) return false;
		const regex = new RegExp('(\\?|&)' + TRANSFER_PARAMETER + '=([^\\?&=]*)(&|$)');
		const match = document.location.search.match(regex);
		if (!match || match.length < 3) {
			hideOverlay();
			return true;
		}
		let transferUrl = decodeURIComponent(match[2]);
		const urlRegex = new RegExp('https?://' + __smz_ma.hostname + __smz_ma.top_url + '.*');
		if (!transferUrl.match(urlRegex)) {
			hideOverlay();
			return false;
		}
		document.location.href = transferUrl
								+ (transferUrl.indexOf('?') === -1 ? '?' : '&')
								+ COOKIE_KEY + '=' + cookieValue;
		return true;
	}

	function showOverlay() {
		
		// URL繝√ぉ繝�け縺ｮ縺ｿ縺ｧ蜊ｳ陦ｨ遉ｺ
		if (document.location.search.indexOf('?' + TRANSFER_PARAMETER + '=') === -1 && 
			document.location.search.indexOf('&' + TRANSFER_PARAMETER + '=') === -1 ) return;

		// 邯ｲ謗帙￠
		const overlay = document.createElement('div');
		overlay.id = OVERLAY_ID;
		overlay.style.position = 'fixed';
		overlay.style.top = 0;
		overlay.style.left = 0;
		overlay.style.zIndex = 1000;
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.backgroundColor = '#fff'; // 逡ｰ蟶ｸ蛟､蟇ｾ遲�
		overlay.style.backgroundColor = OVERLAY_BACKGROUND_COLOR;
		overlay.style.opacity = 0.3;
		overlay.style.visibility = 'visible';
		overlay.style.transition = '.3s linear';

		// 隱ｭ縺ｿ霎ｼ縺ｿ繧､繝｡繝ｼ繧ｸ
		const indicator = document.createElement('div');
		indicator.style.border = '16px solid #f3f3f3'; /* Light grey */
		indicator.style.borderTop = '16px solid #3498db'; /* Blue */
		indicator.style.borderRadius = '50%';
		indicator.style.width = '120px';
		indicator.style.height = '120px';
		indicator.style.animation = 'request-indicator 2s linear infinite';
		indicator.style.position = 'absolute';
		indicator.style.top = 'calc( 50% - 60px )';
		indicator.style.left = 'calc( 50% - 60px )';
		overlay.appendChild(indicator);

		// 隱ｭ縺ｿ霎ｼ縺ｿ繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ
		const keyframes = '@keyframes request-indicator {' + [
			'0% { transform: rotate(0deg); } ',
			'100% { transform: rotate(360deg); }'
		].join('') + '}';
		const keyframeStyle = document.createElement('style');
		keyframeStyle.appendChild(
			document.createTextNode(keyframes)
		);

		const heads = document.getElementsByTagName('head');
		if (heads && heads.length > 0) {
			heads[0].appendChild(keyframeStyle);
			document.body.appendChild(overlay);
		}
	}
	
	function hideOverlay() {
		const overlay = document.getElementById(OVERLAY_ID);
		if (!overlay) return;
		overlay.parentNode.removeChild(overlay);
	}
	
	function findAncestorByClassName(element, className) {
		let e = element;
		while(!e.classList.contains(className)) {
			e = e.parentElement;
			if (e.tagName.toLowerCase() == 'body') {
				e = null;
				break;
			}
		}
		return e;
	}


	//-------------------------------------------
	// 繝壹�繧ｸ驕ｷ遘ｻ蜃ｦ逅�
	//-------------------------------------------
	function initializePageTransition() {
		
		// 貊槫惠髢句ｧ区凾髢�
		let pageViewStartTime = new Date();

		// 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ
		let scrollHeightMax = 0;
		let scrollPercentageMax = 0;
		let pageHeight = getPageHeight();
		let viewHeight = window.innerHeight;

		// 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ繧､繝吶Φ繝亥�逅�
		pageScroll();
		document.addEventListener('scroll', function(ev) {
			pageScroll(); 
		});
		function pageScroll() {
			let scrollHeight = window.pageYOffset;
			
			if (scrollHeight > 0) { scrollHeight += viewHeight; }
			let scrollPercentage = parseInt((scrollHeight / pageHeight) *100);
			if (scrollPercentage > 100) { scrollPercentage = 100; }
			
			if (scrollHeight>scrollHeightMax) { scrollHeightMax = scrollHeight; }
			if (scrollPercentage>scrollPercentageMax) { scrollPercentageMax = scrollPercentage; }
		}


		// 繝壹�繧ｸ驕ｷ遘ｻ蜑阪う繝吶Φ繝亥�逅�
		window.addEventListener('pagehide', sendPageTransition);
		function sendPageTransition() {
			let pageViewEndTime = new Date();
			
			let data = {};
			data.__smz_ma = getCookieItem(COOKIE_KEY);
			if (isExternal()) data._smz_external = "1";
			data.dur      = pageViewEndTime.getTime() - pageViewStartTime.getTime();
			data.scr      = scrollPercentageMax;
			data.url      = document.location.href;
			data.tm       = (new Date()).getTime();

			let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'pt.json';
			sendData(link, data);
		}

		function sendData(url, data) {
			if ('sendBeacon' in navigator && !isSafari()) {
				sendDataByBeacon(url, data);
			}else{
				sendDataByAjax(url, data);
			}
		}

		function sendDataByBeacon(url, data) {

			let dataForm = new FormData();
			Object.keys(data).forEach(function(key) {
				dataForm.append(key, data[key]);
			})

			navigator.sendBeacon(url, dataForm);
		}

		function sendDataByAjax(url, data) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', url, false);
			//xhr.responseType = 'text';
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');   
			xhr.onload = function () {}
			xhr.onerror = function (e) {}
			xhr.send(
				"__smz_ma=" + encodeURIComponent(data.__smz_ma) +
				"&dur=" + encodeURIComponent(data.dur) +
				"&scr=" + encodeURIComponent(data.scr) +
				"&url=" + encodeURIComponent(data.url) +
				"&tm=" + encodeURIComponent(data.tm)
			);
		}

		function getPageHeight() {
			var myScrollHeight = Math.max(
				document.body.scrollHeight, document.documentElement.scrollHeight,
				document.body.offsetHeight, document.documentElement.offsetHeight,
				document.body.clientHeight, document.documentElement.clientHeight
			);
			return myScrollHeight;
		}
		
	}

	//-------------------------------------------
	// 螟夜Κ繝輔か繝ｼ繝�蜃ｦ逅�
	//-------------------------------------------
	function initializeExternalForm() {

		let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'fmd.json?tm=' + (new Date()).getTime();
		getFormDefineByAjax(link);

		function getFormDefineByAjax(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', url);
			xhr.responseType = 'text';
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');   
			xhr.onload = function () {
				var json = JSON.parse(xhr.responseText);
				if (json.url != null) {
					initialize(json);
				}
			};
			xhr.onerror = function (e) {};
			xhr.send(
				"url=" + encodeURIComponent(location.href)
			);
		}

		function initialize(formCapture) {

			// 繧､繝吶Φ繝�(load/submit/unload)縺ｮ繧ｿ繧､繝溘Φ繧ｰ縺ｧ繝輔か繝ｼ繝�繝��繧ｿ繧貞叙蠕励☆繧�
			if (location.pathname==formCapture.url) {
				if (formCapture.event=="load") {
					// load縺ｮ蝣ｴ蜷医�縲．OMContentLoaded貂医↑縺ｮ縺ｧ蜊ｳ譎�
					getFormData();
				}else if (formCapture.event=="unload") {
					// unload縺ｮ蝣ｴ蜷医�縲（OS繧定��縺用agehide
					window.addEventListener('pagehide', getFormData);
				}else{
					// submit縺ｮ蝣ｴ蜷医�縲√う繝吶Φ繝育匱逕滓凾
					window.addEventListener(formCapture.event, getFormData);
				}
			}
			function getFormData() {

				let formData = {};
				const fieldList = formCapture.data;

				fieldList.forEach(function(entity){
					formData[entity.name] = getFormValue(entity);
				});

				formData["__smz_ma"] = getCookieItem(COOKIE_KEY);
				if (isExternal()) formData["__smz_external"] = "1";
				formData["__smz_form_key"] = formCapture.key;
				formData["__smz_tm"] = (new Date()).getTime();

				// 繝｡繝ｼ繝ｫ縺檎ｩｺ縺ｮ蝣ｴ蜷医�蜃ｦ逅�ｒ謚懊￠繧具ｼ�URL縺悟酔荳縺ｮ遒ｺ隱咲判髱｢蟇ｾ遲厄ｼ�
				if (formData["mail"]==null || formData["mail"]=="") {
					return false;
				}

				// 騾∽ｿ｡
				let link = '//' + __smz_ma.hostname + __smz_ma.top_url + 'fmv.json';
				let data = { "form": JSON.stringify(formData) };
				sendData(link, data);

				return true;
			}

			function getFormValue(entity) {
				let value = null;

				if (entity.method=="name") {
					let formElem = document.querySelector("[name='" + entity.param + "']");
					if (formElem!=null) {
						value = formElem.value;
					}
				}
				else if (entity.method=="id") {
					let formElem = document.querySelector("#" + entity.param );
					if (formElem!=null) {
						value = formElem.value;
					}
				}
				else if (entity.method=="class") {
					let formElem = document.querySelector("." + entity.param );
					if (formElem!=null) {
						value = formElem.value;
					}
				}
				else if (entity.method=="selector") {
					let formElem = document.querySelector(entity.param );
					if (formElem!=null) {
						value = formElem.value;
					}
				}

				return value;
			}
			
			function sendData(url, data) {
				if ('sendBeacon' in navigator && !isSafari()) {
					sendDataByBeacon(url, data);
				}else{
					sendDataByAjax(url, data);
				}
			}

			function sendDataByBeacon(url, data) {

				let dataForm = new FormData();
				Object.keys(data).forEach(function(key) {
					dataForm.append(key, data[key]);
				})

				navigator.sendBeacon(url, dataForm);
			}

			function sendDataByAjax(url, data) {
				var xhr = new XMLHttpRequest();
				xhr.open('POST', url, false);
				//xhr.responseType = 'text';
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');   
				xhr.onload = function () {}
				xhr.onerror = function (e) {}
				xhr.send(
					"form=" + encodeURIComponent(data.form)
				);
			}

		}

	}


	 /*\
	 |*|  based on
	 |*|  :: cookies.js ::
	 |*|
	 |*|  A complete cookies reader/writer framework with full unicode support.
	 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
	 \*/
	function getCookieItem(sKey) {
		if (!sKey || !hasCookieItem(sKey)) { return null; }
		return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
	}
	function setCookieItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toGMTString();
					break;
			}
		}
		document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	}
	function removeCookieItem(sKey, sPath) {
		if (!sKey || !hasCookieItem(sKey)) { return; }
		document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
	}
	function hasCookieItem(sKey) {
		return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	}

	 /*\
	 |*|  Common Function
	 \*/
	function isSafari() {
 		var ua = navigator.userAgent.toLowerCase();
		return ( ua.indexOf('safari')!=-1 && ua.indexOf('chrome')==-1 );
	}


})()