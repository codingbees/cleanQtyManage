dd.config({
    agentId: '233362990', // 必填，微应用ID
    corpId: _config.corpId,//必填，企业ID
    timeStamp: _config.timeStamp, // 必填，生成签名的时间戳
    nonceStr: _config.nonceStr, // 必填，生成签名的随机串
    signature: _config.signature, // 必填，签名
    jsApiList : [
		'runtime.info',
		'biz.contact.choose',
		'device.notification.confirm',
		'device.notification.alert',
		'device.notification.prompt',
		'biz.ding.post',
		'biz.util.openLink',
	] // 必填，需要使用的jsapi列表，注意：不要带dd。
});

dd.ready(function() {
	/*dd.biz.contact.choose({
	    multiple: false, //是否多选：true多选 false单选； 默认true
	    //users: ['10001', '10002', ...], //默认选中的用户列表，员工userid；成功回调中应包含该信息
	    corpId: _config.corpId, //企业id
	    max: 10, //人数限制，当multiple为true才生效，可选范围1-1500
	    onSuccess: function(data) {
	     data结构
	      [{
	        "name": "张三", //姓名
	        "avatar": "
	http://g.alicdn.com/avatar/zhangsan.png
	" //头像图片url，可能为空
	        "emplId": '0573', //员工userid
	       },
	       ...
	      ]
	    
	    },
	    onFail : function(err) {}
	});*/
	
	alert(1);
});

dd.error(function(err) {
    alert('dd error: ' + JSON.stringify(err));
});