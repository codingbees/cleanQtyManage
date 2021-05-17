package com.ray.common.config;

import com.jfinal.config.Routes;
import com.ray.controller.admin.TestController;
import com.ray.controller.clean_binding.CleanBindingController;
import com.ray.controller.clean_binding.EquipFeedingController;
import com.ray.controller.clean_binding.ProductAssembleController;
import com.ray.controller.customerQrcode.CustomerQrcodeController;

public class PCRoutes extends Routes {

	@Override
	public void config() {
		this.setBaseViewPath("/page");
		this.add("/test",TestController.class);
		this.add("/cleanBinding",CleanBindingController.class);
		this.add("/equipFeeding",EquipFeedingController.class);
		this.add("/productAssemble",ProductAssembleController.class);
		this.add("/CustomerQrcode",CustomerQrcodeController.class);
	}

}