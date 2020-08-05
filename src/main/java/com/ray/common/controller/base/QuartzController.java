package com.ray.common.controller.base;

import org.quartz.JobKey;

import com.jfinal.kit.Ret;
import com.ray.common.controller.BaseController;
import com.ray.common.model.DataTask;
import com.ray.common.quartz.QuartzPlugin;

public class QuartzController extends BaseController {
	// 启动任务
		public void start() {
			DataTask task = getModel(DataTask.class, "",true);
			try {
				String className = task.getStr("clazz");

				// 恢复任务
				JobKey jobKey = JobKey.jobKey(className, className);
				QuartzPlugin.scheduler.resumeJob(jobKey);

				DataTask.dao.updateState(task.getId(), DataTask.STATE_START);
			} catch (Exception e) {
				e.printStackTrace();
				renderJson(Ret.fail("msg", "任务启动失败："+e.getMessage()));
			}
			renderJson(Ret.ok("msg", "任务启动成功"));
		}

		// 暂停任务
		public void stop() {
			DataTask task = getModel(DataTask.class, "",true);

			try {
				String className = task.getStr("clazz");

				// 暂停任务
				JobKey jobKey = JobKey.jobKey(className, className);
				QuartzPlugin.scheduler.pauseJob(jobKey);

				DataTask.dao.updateState(task.getId(), DataTask.STATE_STOP);
			} catch (Exception e) {
				e.printStackTrace();
				renderJson(Ret.fail("msg", "任务关闭失败："+e.getMessage()));
			}

			renderJson(Ret.ok("msg", "任务关闭成功"));
		}
		
		public void trigger() {
			DataTask task = getModel(DataTask.class, "",true);

			try {
				String className = task.getStr("clazz");

				// 立即触发
				JobKey jobKey = JobKey.jobKey(className, className);
				QuartzPlugin.scheduler.triggerJob(jobKey);

			} catch (Exception e) {
				e.printStackTrace();
				renderJson(Ret.fail("msg", "任务停止失败："+e.getMessage()));
			}
			renderJson(Ret.ok("msg", "执行成功！"));
		}
}
