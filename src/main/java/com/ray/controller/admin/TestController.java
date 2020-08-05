package com.ray.controller.admin;

import java.util.List;

import com.jfinal.kit.Ret;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.controller.BaseController;
import com.ray.common.model.DataTask;

public class TestController extends BaseController {
	
	
	public void ttt() {
//		YwTest model = getModel(YwTest.class, "",true);
//		model.setName(get("comboValue"));
//		model.update();
		List<DataTask> tasks = DataTask.dao.findAll();
		System.out.println(tasks);
		renderJson(Ret.ok("msg", "嘻嘻"));
	}
	
	public void login() {
		getResponse().addHeader("Access-Control-Allow-Origin", "*");
		renderJson(Ret.ok("msg", "登录成功").set("token", "sdfkjeoifjwoeifjiowejfi"));
	}
	
	public void getUserinfo() {
		getResponse().addHeader("Access-Control-Allow-Origin", "*");
		Record user = new Record();
		user.set("roles", "admin");
		user.set("name", "ray");
		user.set("avatar", "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2141623099,2896788564&fm=26&gp=0.jpg");
		user.set("introduction", "HAHAHA");
		renderJson(Ret.ok("msg", "登录成功").set("data",user));
	}
}
