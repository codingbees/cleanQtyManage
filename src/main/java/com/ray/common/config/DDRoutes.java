package com.ray.common.config;

import com.jfinal.config.Routes;
import com.ray.common.ding.controller.AppLoginController;
import com.ray.common.ding.controller.PCLoginController;
import com.ray.controller.dingding.material_scrap.MaterialScrapController;

public class DDRoutes extends Routes {

	@Override
	public void config() {
		this.add("/dl",PCLoginController.class);
		this.add("/dd",AppLoginController.class);
		this.add("/dd/materialScrap",MaterialScrapController.class);
	}

}