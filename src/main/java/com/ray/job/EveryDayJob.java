package com.ray.job;

import org.quartz.JobExecutionContext;

import com.ray.common.model.SerialNumber;
import com.ray.common.quartz.AbsJob;

/**
 * 每天执行
 *
 * @author Ray
 * @date 2010-08-03
 */
public class EveryDayJob extends AbsJob {

	@Override
	protected void process(JobExecutionContext context) {
		System.out.println("每日任务,自增编号归零");
		SerialNumber sn = SerialNumber.dao.findById(1);
		sn.delete();
		sn = new SerialNumber();
		sn.setId(1);
		sn.save();
	}

}
