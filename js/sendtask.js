var urlip = '116.85.19.102';
localStorage.setItem('urlip',urlip)
	
var sendTaskTimer = null;

//show next task
showNextTask();

var urlip = localStorage.getItem('urlip');
var url = 'http://'+ urlip +':8080/platform-web/';
var userid = localStorage.getItem('userid');

//after five minutes send task start
function setTimeSendTaskStart(){
	var gettasklocalTime = parseInt(localStorage.getItem('gettasklocalTime'));//发送请求成功后获取本地时间

	sendTaskTimer = setInterval(function(){
			
			var curlocaltime = Date.parse(new Date());
			var calcSendLocalTime = curlocaltime-gettasklocalTime;
			// console.log(calcSendLocalTime);
			
			if( calcSendLocalTime === ((4*60*1000)+3000) ){
				sendTask(url,userid);
				clearInterval(sendTaskTimer);
			}
			
			if( calcSendLocalTime > ((4*60*1000)+3000) ){ 
				sendTask(url,userid);
				clearInterval(sendTaskTimer);
			}
			
		},1000);
}

//after five minutes send task end
function setTimeSendTaskEnd(){
	clearInterval(sendTaskTimer);
}

//send task
function sendTask(url,userid){
	var privateState = localStorage.getItem('privatestate');
	var protocolState = localStorage.getItem('protocolstate');
	var version = localStorage.getItem('versioncode');
	if(userid){
		// console.log((typeof privateState),protocolState)
		if(privateState === 'true' && protocolState === 'true'){
			$.ajax({
				type:'POST',
				url:url+'user/getTask',
				dataType:'json',
				data:{
					id:userid,
					ver:version
				},
				success:function(data){
					var gettasklocalTime = Date.parse(new Date());
					localStorage.setItem('gettasklocalTime',gettasklocalTime);
					if(data.code === 403){
						location.href = './login.html';
					}else if(data.code === 404){
						alert('设备被锁');
						location.href = './login.html';
					}else if(data.code === 5000 ){
						localStorage.setItem('gettaskdata',JSON.stringify(data));
						
						var serviceTime = Date.parse(data.nowDate);
						var getTime = Date.parse(data.getTime);
						var calcTime = getTime-serviceTime;
						
						localStorage.setItem('getcalctime',calcTime);
						
						var execute = localStorage.getItem('execute');//version update,prevent execute
						if(execute === 'true'){  // equal to "true" continue execute next task ,show task alert
							//show next task
							showNextTask();
							
							//after five minutes send task start
							setTimeSendTaskStart();
						
							//set commission task record the first item
							localStorage.setItem('showrecordone',false);
						}else{
							localStorage.setItem('taskstate',false);
							//after five minutes send task end
							setTimeSendTaskEnd();
							$('#enginBtn').children('img').attr('src','./img/icons/start.png');
							
							//set private and protocol
							localStorage.setItem('ppkey',true);
							location.href = "./setup.html?tips=1";
						}
					}else{
						setTimeout(function(){
							//after five minutes send task start
							setTimeSendTaskStart();
						},5*60*1000);
					}
				},
				error:function(err){
					setTimeout(function(){
						sendTask(url,userid);
					},5000);
				}
			})
		}else{
			
			localStorage.setItem('taskstate',false);
			//after five minutes send task end
			setTimeSendTaskEnd();
			$('#enginBtn').children('img').attr('src','./img/icons/start.png');
			
			//set private and protocol
			localStorage.setItem('ppkey',true);
			location.href = "./setup.html?tips=1";
			
		}
	}else{
		setTimeout(function(){
			location.href = './login.html'
		},1500)
	}
}

function closeModal(){
	setTimeout(function(){
		$('#inforModal').hide();
	},2000); 
}

//show next task
function showNextTask(){
	
	var gettasklocalTime = parseInt(localStorage.getItem('gettasklocalTime'));
	var calcTime = parseInt(localStorage.getItem('getcalctime'));

	var showTaskTimer = setInterval(function(){
			var curlocaltime = Date.parse(new Date());
			var calcLocalTime = curlocaltime-gettasklocalTime;
			
			if( calcLocalTime === calcTime){
				var execute = localStorage.getItem('execute');
				
				if(execute === 'true'){
					setStyle();
				}
				clearInterval(showTaskTimer);
				localStorage.removeItem('getcalctime');
			}

			if( calcLocalTime > calcTime){
				localStorage.removeItem('getcalctime');
				clearInterval(showTaskTimer);
			}
			
		},1000);
}

//set task style
function setStyle(){
	
	var data = JSON.parse(localStorage.getItem('gettaskdata'));
	var taskType = data.taskType;
	// var taskType = 1;

	var ringstate = localStorage.getItem('ringstate');
	if(ringstate === 'true'){
		setTimeout(function(){
			$('body').append('<div id="musicDiv"><embed src="./img/sting.wav" autostart=true align="center" border="0" width="1" height="1" loop="false"/></div>');
		},300);
	}else{
		$('#musicDiv').remove();
	}
	
	if(taskType === 1){
		//register task
		registerTask(data);
		//create advertisement 
		createAdertisementHtml();
	}else if(taskType === 2){
		//download task
		downloadTask(data);
		//create advertisement 
		createAdertisementHtml();
	}else if(taskType === 3){
		//advertisement task
		advertisementTask(data);
		//create advertisement 
		createAdertisementHtml();
	}

}

//register task 1
function registerTask(data){
	
	var rdelaytime = 0;
	var registertimer = setInterval(function(){
			rdelaytime++;
			if(rdelaytime === 1){
				registerAlertHtml(1);
				$('#divmodalHead').addClass('divmodal-headbg');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(rdelaytime === 4){
				registerAlertHtml(2);
				$('#divmodalBodybg > div.divmodal-content-title').addClass('mt-05');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(rdelaytime === 7){
				//show register app img
				showRegisterImg(data);
				var getMoney = data.commission;
				//task style write
				registerAlertHtml(3,getMoney);
				
				$('#divmodal').css('background','none');
				$('#divmodalTitleColor').addClass('divmodal-title-color');
				$('#divmodalBodybg').addClass('divmodal-body-bg');
				
			// }else if(rdelaytime === 8){
				rdelaytime = 0;
				clearInterval(registertimer);
			}
		},1000);

}

//download task  2
function downloadTask(data){
	
	var ddelaytime = 0;
	var downloadtimer = setInterval(function(){
			ddelaytime++;
			if(ddelaytime === 1){
				//task style write
				downLoadAlertHtml(1);
				$('#divmodalHead').addClass('divmodal-headbg');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(ddelaytime === 4){
				//task style write
				downLoadAlertHtml(2);
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(ddelaytime === 8){
				//task style write
				downLoadAlertHtml(3);
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(ddelaytime === 10){
				//show app img
				showAppImg(data);
				var getMoney = data.commission;
				//task style write
				downLoadAlertHtml(4,getMoney);
				
				$('#divmodal').css('background','none');
				$('#divmodalTitleColor').addClass('divmodal-title-color');
				$('#divmodalBodybg').addClass('divmodal-body-bg');
				
			// }else if(ddelaytime === 11){
				ddelaytime = 0;
				clearInterval(downloadtimer);
			}
		},1000);
	
}

//advertisement task  3
function advertisementTask(data){
	
	var adelaytime = 0;
	var advertisementtimer = setInterval(function(){
			adelaytime++;
			if(adelaytime === 1){
				adAlertHtml(1);
				$('#divmodalHead').addClass('divmodal-headbg');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(adelaytime === 4){
				adAlertHtml(2);
				$('#divmodalBodybg > div.divmodal-content-title').addClass('mt-05');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(adelaytime === 6){
				var getMoney = data.commission;
				//task style write
				adAlertHtml(3,getMoney);
				$('#divmodal').css('background','none');
				$('#divmodalTitleColor').addClass('divmodal-title-color');
				$('#divmodalBodybg').addClass('divmodal-body-bg');
				$('#taskdiv').fadeIn(600);
				closeTaskdivmodal();
			}else if(adelaytime === 8){
				//insert map
				insertMap(data);
			}else if(adelaytime === 9){
				adelaytime = 0;
				clearInterval(advertisementtimer);
			}
		},1000);
	
}

//close task divmodal
function closeTaskdivmodal(){
	setTimeout(function(){
		$('#taskdiv').fadeOut(500);
	},1500);
}

//task style write register 1
function registerAlertHtml(style,getMoney){
	var registerHtml = '';
	var getMoney = getMoney||'0.00';
	if(style === 1){
		registerHtml = createNoticeHtml('<span>恭喜你</span>','抢到订单！','服务器正在注册中...');
	}else if(style === 2){
		registerHtml = createNoticeHtml('<span>试玩助手</span>','注册完毕！','');
	}else if(style === 3){
		registerHtml = createNoticeHtml('<div class="divmodal-headimg"><span>恭喜您获得</span><img src="./img/award-head.png" /></div>',getMoney + '元','等待抢单任务...');
	}
	
	$('#taskdiv').html(registerHtml);
}

//task style write download 2
function downLoadAlertHtml(style,getMoney){
	var downloadHtml = '';
	var getMoney = getMoney||'0.00';
	if(style === 1){
		downloadHtml = createNoticeHtml('<span>恭喜你</span>','抢到任务！','准备加载应用软件...');
	}else if(style === 2){
		downloadHtml = createNoticeHtml('<span>试玩助手</span>','安装等待中！','服务器下载成功，安装中...');
	}else if(style === 3){
		downloadHtml = createNoticeHtml('<span>试玩助手</span>','应用安装完毕！','服务器安装完毕，试玩等待中，官方已验证');
	}else if(style === 4){
		downloadHtml = createNoticeHtml('<div class="divmodal-headimg"><span>恭喜您获得</span><img src="./img/award-head.png" /></div>',getMoney + '元','等待抢单任务...');
	}else if(style === 5){
		downloadHtml = createNoticeHtml('<span>试玩助手</span>','抢到任务','服务器注册中...');
	}else if(style === 6){
		downloadHtml = createNoticeHtml('<span>试玩助手</span>','任务分配','正在分配任务，请耐心等待...');
	}
	
	$('#taskdiv').html(downloadHtml);
}

//task style write advertisement 3
function adAlertHtml(style,getMoney){
	var advertisementHtml = '';
	var getMoney = getMoney||'0.00';
	if(style === 1){
		advertisementHtml = createNoticeHtml('<span>恭喜你</span>','抢到订单！','服务器正在浏览广告中...');
	}else if(style === 2){
		advertisementHtml = createNoticeHtml('<span>试玩助手</span>','广告浏览完毕！','');
	}else if(style === 3){
		advertisementHtml = createNoticeHtml('<div class="divmodal-headimg"><span>恭喜您获得</span><img src="./img/award-head.png" /></div>',getMoney + '元','等待抢单任务...');
	}
	
	$('#taskdiv').html(advertisementHtml);
}

// create task notice
function createNoticeHtml(headtext,title,context){
	return '<div class="divmodal" id="divmodal"><div class="divmodal-inner"><div class="divmodal-contain"><div class="divmodal-head" id="divmodalHead">'+
		headtext + '</div><div class="divmodal-body" id="divmodalBodybg"><div class="divmodal-content-title">'+
		'<span id="divmodalTitleColor">'+ title +'</span>'+
		'</div><div class="divmodal-content-text">'+
		'<span>'+ context +'</span>'+
		'</div></div></div></div></div>';
}

//create advertisement 
function createAdertisementHtml(){
	var apkHrefHtml = '<div class="apkHref" id="apkHrefModal"><div class="slide-button">'+
	'<div class="slide-button-contain"><div class="slide-button-img">'+
	'<img src="./img/icons/down.png" alt=""></div></div></div>'+
	'<div class="apkHref-title"><span>正在全屏模式下查看</span></div>'+
	'<div class="apkHref-content"><span>要退出，请从顶部向下滑动</span></div>'+
	'<div class="apkHref-btn"><button type="button" id="closeApkHrefModal">我知道了</button></div></div>'
	
	$('body').append(apkHrefHtml);
}

//show register app img
function showRegisterImg(data){
	
	// show App image html 
	showAppImgHtml(data);
	
	$('#preimg').animate({right:"0"},800);

	var rimgtime = 0;
	var registerimgtimer = setInterval(function(){
			rimgtime++;
			
			if(rimgtime === 1){
				$('#apkHrefModal').slideDown(500);
				var getMoney = data.commission;
				//task style write
				registerAlertHtml(3,getMoney);
				$('#divmodal').css('background','none');
				$('#divmodalTitleColor').addClass('divmodal-title-color');
				$('#divmodalBodybg').addClass('divmodal-body-bg');
				
				//set commission task record the first item
				localStorage.setItem('showrecordone',true);
			}else if(rimgtime === 2){
				$('#apkHrefModal').slideUp(500);
			}else if(rimgtime === 3){
				$('#preimg').animate({right:'-100%'},800);
			}else if(rimgtime === 4){
				$('#taskdiv').fadeIn(600);
			}else if(rimgtime === 5){
				closeTaskdivmodal();
			}else if(rimgtime === 6){
				//insert map
				insertMap(data);
			// }else if(rimgtime === 7){
				rimgtime = 0;
				clearInterval(registerimgtimer);
			}
		},1000);
	
}

// show App image html 
function showAppImgHtml(data){
	
	var apkImage = 'https://pp.myapp.com/ma_pic2/0/shot_12170842_1_1552577294/550';
		
	var apkImagesArr = '';
	var imghtml = '';
	if( data.apkImages && data.apkImages != '' ){
		apkImagesArr = JSON.parse(data.apkImages);
		imghtml = '<div class="divimg" id="preimg"><img src="'+ apkImagesArr[0] +'" alt=""></div>';
	}else{
		imghtml = '<div class="divimg" id="preimg"><img src="'+ apkImage +'" alt=""></div>' 
	}
	
	$('body').append(imghtml);
	
}

//show pic
function showAppImg(data){
	
	// show App image html 
	showAppImgHtml(data);
	
	$('#preimg').animate({right:"0"},800);

	var imgtime = 0;
	var changeimgtimer = setInterval(function(){
			imgtime++;
			
			if(imgtime === 1){
				$('#apkHrefModal').slideDown(500);
				
				var getMoney = data.commission;
				//task style write
				downLoadAlertHtml(4,getMoney);
				$('#divmodal').css('background','none');
				$('#divmodalTitleColor').addClass('divmodal-title-color');
				$('#divmodalBodybg').addClass('divmodal-body-bg');
				
				//set commission task record the first item
				localStorage.setItem('showrecordone',true);
			}else if(imgtime === 2){
				$('#apkHrefModal').slideUp(500);
			}else if(imgtime === 3){
				$('#preimg').animate({right:'-100%'},800);
			}else if(imgtime === 4){
				$('#taskdiv').fadeIn(600);
			}else if(imgtime === 5){
				closeTaskdivmodal();
			}else if(imgtime === 6){
				//insert map
				insertMap(data);
			// }else if(imgtime === 7){
				imgtime = 0;
				clearInterval(changeimgtimer);
			}
		},1000);
	
}

//insert map
function insertMap(data){
	var poshtml = '<div class="divpos" id="mapContain"><div id="container" class="divmap"></div></div>'; 
	$('body').append(poshtml);
	
	var posNoticeHtml = function(ctx){
			return '<div class="divsmallmodal" id="divsmall"><div class="divsmallmodal-contain"><div class="divsmallmodal-content">'+
						'<span id="posContext">'+ ctx +'</span>'+
						'</div></div></div>';
		}
	
	$('body').append(posNoticeHtml('正在重新虚拟定位'));
	showPosition(posNoticeHtml);
	$('#divsmall').fadeIn(500);
	
	setTimeout(function(){
		$('#mapContain').animate({right:"0"},900);
		
		//set commission
		if( location.href.indexOf('index.html') >= 0 ){
			var getCommission = data.commission != '' ? parseFloat(data.commission).toFixed(2) : 0.00;
			var totalMoney = parseFloat( $('#totalMoney').text() ).toFixed(2);//total money
			var taskMoney = parseFloat( $('#taskMoney').text() ).toFixed(2);//commission money
			var usableMoney = parseFloat( $('#usableMoney').text() ).toFixed(2);//usable money 
		
			totalMoney = ( parseFloat(getCommission) + parseFloat(totalMoney) ).toFixed(2);
			taskMoney = ( parseFloat(getCommission) + parseFloat(taskMoney) ).toFixed(2);
			usableMoney = ( parseFloat(getCommission) + parseFloat(usableMoney) ).toFixed(2);
			
			$('#totalMoney').text(totalMoney);
			$('#taskMoney').text(taskMoney);
			$('#usableMoney').text(usableMoney);
		}
	},1800);
}

//show positon
function showPosition(posNoticeHtml){
	
	setTimeout(function(){
		$('#mapContain').animate({right:"-100%"},800);
		$('#posContext').text('重新虚拟定位成功');
		$('#preimg').remove();
		localStorage.removeItem('gettaskdata');
		$('#musicDiv').remove();
		closePosTips();
	},5500);
	
	//初始化
	mui.init();
	
	//show map
	showMap();
}

//close pos tips
function closePosTips(){
	setTimeout(function(){
		$('#divsmall').fadeOut(500);
		$('#divsmall').remove();
		$('#mapContain').remove();
	},1000);
}

//show map
function showMap(){
	
	//第一步通过mui.plusReady
	mui.plusReady(function(){
		plus.geolocation.getCurrentPosition( geoInf, function ( e ) {},{geocode:true,provider:'amap'});
	})
	
	//第二步通过geolnf 方法来获取具体的定位信息
	function geoInf( position ) {
		var codns = position.coords;//获取地理坐标信息；
		var longt = codns.longitude;//获取到当前位置的经度
		var lat = codns.latitude;//获取到当前位置的纬度；
		
		localStorage.setItem('longt',longt)
		localStorage.setItem('lat',lat)
	}
	
	//初始化地图
	var jdXmin = 84.022152;
	var jdXmax = 120.626226;
	var wdYmax = 41.356937;
	var wdYmin = 30.624202;
	var longt = Math.random()*(jdXmax-jdXmin+1)+jdXmin;
	var lat = Math.random()*(wdYmax-wdYmin+1)+wdYmin;
	setTimeout(function(){
		addMarker(longt,lat);
	},4500)
	
	var marker,map = new AMap.Map('container', {
	  resizeEnable: false, //是否监控地图容器尺寸变化
	  zoom: 5, //初始地图级别
	  center: [longt, lat], //初始地图中心点
	});
	
	
	// 实例化点标记
	function addMarker(x,y) {
		marker = new AMap.Marker({
			icon: "./img/icons/poi-marker-default.png",
			position: [x,y],
			offset: new AMap.Pixel(-13, -30)
		});
		marker.setMap(map);
	}
}
	
	
