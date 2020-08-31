package com.ray.controller.admin;

import java.util.List;

import com.jfinal.kit.Ret;
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
}
