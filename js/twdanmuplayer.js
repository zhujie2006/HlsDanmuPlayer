$(document).ready(function(){
	
	var that = this;
	
	// 初始化
	var video = $('#my_video_1');
	
	//播放器状态
	this.current = 0;  //当前播放时间
	this.duration = video[0].duration;  //总时间
	this.danmuPlayerFullScreen = false;
	this.danmuShowed = true;
	this.isLoop = false;
	var danmuSize = 0;
	var danmuColor = "#ffffff";
	this.danmuPosition = 0;
	var danmuFromSql = "";
	var options = {
        left: 0,
        top: 0,
        height: 360,
        width: 640,
        zindex: 100,
        speed: 8000,
        sumTime: 65535,
        defaultColor: "#ffffff",
        fontSizeSmall: 16,
        FontSizeBig: 24,
        opacity: "1",
        topBottonDanmuTime: 6000,
        urlToGetDanmu: "http://192.168.113.121:8002/ClientApi/getdanmu",
        urlToPostDanmu: "http://192.168.113.121:8002/ClientApi/postdanmu"
    };
	
	// js加载后，去除缺省的视频播放控制条
	video[0].removeAttribute("controls");
	$('.ctrl-main').show().css({'bottom':-45});
	$(".danmu-player-load").css("display","block");
 		
	//等待层
	$(".danmu-player-load").shCircleLoader({
		keyframes: "0%   {background:black}\
		40%  {background:transparent}\
		60%  {background:transparent}\
		100% {background:black}"
	});
		
	// 最开始
	video.on('loadedmetadata', function() {			
		// 1. 设置视频属性
		$('.current-time').text(timeFormat(0));
		
		console.log(video[0].duration);
		
		$('.duration').text(timeFormat(video[0].duration));
		
		$('.danmu-div').danmu({
			width: "100%",
			height: "100%",
			speed: 8000,
			opacity: "1",
			fontSizeSmall: 16,
			FontSizeBig: 24,
			topBottonDanmuTime: 6000,
			SubtitleProtection: true,
			positionOptimize: true
		});
				
		// 2. 定时获取缓冲数据进度，刷新进度条 
		setTimeout(startBuffer, 150);
		
		// 3. 定时更新弹幕
		setTimeout(startDanmu, 50);
	});
	
	// 显示缓冲进度
	var startBuffer = function() {
		var currentBuffer = video[0].buffered.end(0);
		var maxduration = video[0].duration;
		var perc = 100 * currentBuffer / maxduration;
		$('.danmu-player .ctrl-progress .buffered').css('width',perc+'%');
		
		$('.duration').text(timeFormat(maxduration));
		if(currentBuffer < maxduration) {
			setTimeout(startBuffer, 500);
		}
	};
	
	// 显示弹幕
	var startDanmu = function() {
		$(".danmu-div").data("nowTime", parseInt(video[0].currentTime) * 10);
	};
	
	// 显示当前播放进度
	video.on('timeupdate', function() {
		var currentPos = video[0].currentTime;
		var maxduration = video[0].duration;
		var perc = 100 * currentPos / maxduration;
		$('.danmu-player .ctrl-progress .current').css('width', perc+'%');	
		$('.current-time').text(timeFormat(currentPos));
	});
	
	// 播放、暂停
	var playpause = function() {
		if(video[0].paused || video[0].ended) {
			video[0].play();
			
			$(".danmu-div").danmu('danmuResume');
			$(".play-btn span").removeClass("glyphicon-play").addClass("glyphicon-pause");			
		}
		else {
			video[0].pause();
			
			$(".danmu-div").danmu('danmuPause');
			$(".play-btn span").removeClass("glyphicon-pause").addClass("glyphicon-play");			
		}
	};
	
	// 控件事件
	// 视频或播放按钮点击事件
	video.on('click', function() { 
		playpause(); 
	});
	
	$('.play-btn').on('click', function() {
		 playpause(); 
	});
	
	$(".danmu-div").on("click", function () {
		playpause();
	});
	
	// 全屏按钮点击
	$('.full-screen').on('click', {that: that}, function(e) {
		if (!e.data.that.danmuPlayerFullScreen) {
			e.data.that.addClass("danmu-player-full-screen");
			e.data.that.danmuPlayerFullScreen = true;
			$(".full-screen span").removeClass("glyphicon-resize-full").addClass("glyphicon-resize-small");
		}
		else {
			e.data.that.removeClass("danmu-player-full-screen");
			e.data.that.danmuPlayerFullScreen = false;
			$(".full-screen span").removeClass("glyphicon-resize-small").addClass("glyphicon-resize-full");
		}
	});
	
	// 视频事件
	
	// 视频canplay事件
	video.on('canplay', function() {
		$(".danmu-player-load").css("display","none");
	});
	
	// 视频canplaythrough事件
	// 解决Chrome缓存问题
	var completeloaded = false;
	video.on('canplaythrough', function() {
		completeloaded = true;
	});
	
	// 视频ended事件
	video.on('ended', function() {
		$('.play-btn').removeClass('paused');
		video[0].pause();
	});
	
	//playing事件
	video.on('play playing', function () {
		if (video[0].currentTime === 0) {
			$(".danmu-div").data("nowTime", 0);
			$(".danmu-div").data("danmuResume");
		} else {
			$(".danmu-div").data("nowTime", parseInt(video[0].currentTime) * 10);
			$(".danmu-div").data("danmuResume");
		}
		$(".danmu-player-load").css("display","none");
	});

	// 视频seeking事件
	video.on('seeking', function() {
		// 如果完全加载过，不需要显示加载界面
		if(!completeloaded) { 
			$(".danmu-player-load").css("display","block");
		}	
	});
	
	// 视频seeked事件
	video.on('seeked', function() {		
		$(".danmu-div").danmu("danmuHideAll");
	 });
	
	// 视频等待更多数据事件
	video.on('waiting', function() {
		if (video[0].currentTime === 0) {
			$(".danmu-div").data("nowTime", 0);
			$(".danmu-div").data("danmuPause");
		} else {
			$(".danmu-div").data("nowTime", parseInt(video[0].currentTime)*10);
			$(".danmu-div").data("danmuPause");
		}
			
		$(".danmu-player-load").css("display","block");
	});
	
	// 视频进度条相关事件
	// 视频时间进度点击时
	var timeDrag = false;	/* 拖动事件检查 */
	$('.ctrl-progress').on('mousedown', function(e) {
		timeDrag = true;
		updatebar(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(timeDrag) {
			timeDrag = false;
			updatebar(e.pageX);
			
			$(".danmaku").remove();
		}
	});
	$(document).on('mousemove', function(e) {
		if(timeDrag) {
			updatebar(e.pageX);
		}
	});
	
	// 更新当前播放进度
	var updatebar = function(x) {
		var progress = $('.ctrl-progress');
		var maxduration = video[0].duration;
		var position = x - progress.offset().left;
		var percentage = 100 * position / progress.width();
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}
		$('.danmu-player .ctrl-progress .current').css('width',percentage+'%');	
		video[0].currentTime = maxduration * percentage / 100;
	};
	
	//循环播放按钮事件
	$(".loop-btn").on("click", function () {
		if (!this.isLoop) {
			video.loop = true;
			this.isLoop = true;
			
			$(".loop-btn").addClass("ctrl-btn-right-active");
		}
		else {
			video.loop = true;
			this.isLoop = false;

			$(".loop-btn").removeClass("ctrl-btn-right-active");
		}
	});
	
	//发送弹幕事件
	$(".send-btn").on("click", function () {
		sendDanmu();
	});
	
	//显示和隐藏弹幕按钮事件
	$(".show-danmu").on("click", function () {
		if (this.danmuShowed) {
			$(".danmu-div").css("visibility", "hidden");
			this.danmuShowed = false;
			$(".show-danmu").removeClass("ctrl-btn-right-active");
		}
		else {
			this.danmuShowed = true;
			$(".danmu-div").css("visibility", "visible");
			$(".show-danmu").addClass("ctrl-btn-right-active");
		}
	});
	
	// 调整透明度事件
	$(".danmu-op").on('mouseup touchend', function (e) {
		$(".danmu-div").data("opacity", (e.target.value / 100));
		$(".danmaku").css("opacity", (e.target.value / 100));
	});

	// 时间格式化 - 00:00
	var timeFormat = function(seconds) {		
		var m = Math.floor(seconds/60)<10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60);
		var s = Math.floor(seconds-(m*60))<10 ? "0"+Math.floor(seconds-(m*60)) : Math.floor(seconds-(m*60));		
		return m+":"+s;
	};
		
	// tip声明
	var temFontTipID = "#fontTip";
	$(".opt-btn").scojs_tooltip({
		appendTo: this.id,
		contentElem: temFontTipID,
		position: "n"
	});
	$(".opacity").scojs_tooltip({
		appendTo: this.id,
		content: '弹幕透明度'
	});
	$(".show-danmu").scojs_tooltip({
		appendTo: this.id,
		content: '开启/关闭 弹幕'
	});
	$(".loop-btn").scojs_tooltip({
		appendTo: this.id,
		content: '循环播放'
	});
	$(".full-screen").scojs_tooltip({
		appendTo: this.id,
		content: '全屏'
	});
	$('.colpicker').colpick({
		flat: true,
		layout: 'hex',
		submit: 0,
		color: "ffffff",
		onChange: function (hsb, hex, rgb, el, bySetColor) {
			danmuColor = "#" + hex
		}
	});

	//从后端获取弹幕
	this.getDanmu = function () {
		$.get(options.urlToGetDanmu, function (data, status) {
			danmuFromSql = eval(data);
			for (var i = 0; i < danmuFromSql.length; i++) {
				try {
					var danmuLs = eval('(' + danmuFromSql[i] + ')');
				} catch (e) {
					continue;
				}
				$('.danmu-div').danmu("addDanmu", danmuLs);
			}
		});
	};

	//发送弹幕
	var sendDanmu = function () {
		var text = $(".danmu-input").get(0).value;
		if (text.length == 0) {
			return;
		}
		if (text.length > 255){
			alert("弹幕过长！");
			return;
		}
		text = text.replace(/&/g, "&gt;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\n/g, "<br>");
		var color = danmuColor;
		var position = $("input[name=danmu_position]:checked").val();
		var size = $("input[name=danmu_size]:checked").val();
		var time = $(".danmu-div").data("nowTime") + 3;
		var textObj = '{ "text":"' + text + '","color":"' + color + '","size":"' + size + '","position":"' + position + '","time":' + time + '}';
		if (options.urlToPostDanmu)
			$.post(options.urlToPostDanmu, {
				danmu: textObj
			});
		textObj = '{ "text":"' + text + '","color":"' + color + '","size":"' + size + '","position":"' + position + '","time":' + time + ',"isnew":""}';
		var newObj = eval('(' + textObj + ')');
		$(".danmu-div").danmu("addDanmu", newObj);
		$(".danmu-input").get(0).value = '';
		//触发事件
		// trigger("senddanmu");
	};
});