package com.ray.common.config;

import com.jfinal.config.Routes;
import com.ray.controller.app.CustomerQrcodeController;
import com.ray.controller.app.SystemController;

public class AppRoutes extends Routes {

	@Override
	public void config() {
		this.add("/app/CustomerQrcode",CustomerQrcodeController.class);
		this.add("/app/sys",SystemController.class);
	}
	
}