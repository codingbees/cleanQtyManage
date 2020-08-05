package com.ray.common.controller;

import com.dingtalk.api.response.OapiUserGetResponse;
import com.jfinal.core.Controller;
import com.jfinal.core.NotAction;

public class BaseController extends Controller{

	@NotAction
	protected String getSessionUserId() {
		OapiUserGetResponse user = (OapiUserGetResponse) getSessionAttr("user");
		return user.getUserid();
	}
	
	@NotAction
	protected String getSessionUserName() {
		OapiUserGetResponse user = (OapiUserGetResponse) getSessionAttr("user");
		return user.getName();
	}
}