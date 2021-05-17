package com.ray.controller.app;

import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.kit.HttpKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class SystemController extends Controller {
	public void testServer(){
		renderJson();
	}
	public void checkVersion(){
		String request = HttpKit.readData(getRequest());
		JSONObject jb = JSONObject.parseObject(request);
		Record version = Db.findFirst("select * from data_app_version order by id desc");
		if(version.getStr("version").equals(jb.get("version"))){
			renderJson(new Record().set("status",1));
		}else{
			renderJson(new Record().set("status",0).set("data", version));
		}
	}
}
