package com.ray.controller.admin;

import com.jfinal.kit.Ret;
import com.ray.common.controller.BaseController;

public class TestController extends BaseController {
	
	
	public void ttt() {
//		YwTest model = getModel(YwTest.class, "",true);
//		model.setName(get("comboValue"));
//		model.update();
		renderJson(Ret.ok("msg", "嘻嘻"));
	}
}
