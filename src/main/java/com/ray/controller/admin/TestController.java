package com.ray.controller.admin;

import com.jfinal.kit.Ret;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.controller.BaseController;
import com.ray.event.UserSaveEvent;

import net.dreamlu.event.EventKit;

public class TestController extends BaseController {
	public void index(){
		Db.find("select * from menu where id = 1 and 1=2");
		renderJson(Ret.ok("msg", "嘻嘻"));
	}
	
	public void ttt() {
//		YwTest model = getModel(YwTest.class, "",true);
//		model.setName(get("comboValue"));
//		model.update();
		Record user = (Record)getSessionAttr("user");
		EventKit.post(new UserSaveEvent(user));
		renderJson(Ret.ok("msg", "嘻嘻"));
	}
}
