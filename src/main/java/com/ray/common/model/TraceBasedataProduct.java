package com.ray.common.model;

import com.ray.common.model.base.BaseTraceBasedataProduct;

/**
 * 
 * Generated by JBolt.
 */
@SuppressWarnings("serial")
public class TraceBasedataProduct extends BaseTraceBasedataProduct<TraceBasedataProduct> {
	//建议将dao放在Service中只用作查询 
	public static final TraceBasedataProduct dao = new TraceBasedataProduct().dao();
	//在Service中声明 可直接复制过去使用
	//private TraceBasedataProduct dao = new TraceBasedataProduct().dao();  
}
