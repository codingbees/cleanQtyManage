package com.ray.common.model;

import com.ray.common.model.base.BaseWashingPlanDate;

/**
 * 
 * Generated by JBolt.
 */
@SuppressWarnings("serial")
public class WashingPlanDate extends BaseWashingPlanDate<WashingPlanDate> {
	//建议将dao放在Service中只用作查询 
	public static final WashingPlanDate dao = new WashingPlanDate().dao();
	//在Service中声明 可直接复制过去使用
	//private WashingPlanDate dao = new WashingPlanDate().dao();  
}
