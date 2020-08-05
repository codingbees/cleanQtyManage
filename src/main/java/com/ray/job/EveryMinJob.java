package com.ray.job;

import com.ray.common.quartz.AbsJob;

public class EveryMinJob extends AbsJob{
	
	protected void process(org.quartz.JobExecutionContext context) {
		System.out.println("每秒钟来一发");
	};
}
