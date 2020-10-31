package com.ray.common.config;

import com.jfinal.config.Routes;
import com.ray.common.ding.controller.AppLoginController;
import com.ray.common.ding.controller.PCLoginController;

public class DDRoutes extends Routes {

	@Override
	public void config() {
		this.add("/dl",PCLoginController.class);
		this.add("/dd",AppLoginController.class);
	}

}