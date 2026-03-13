'use client';

import React, { useMemo } from 'react';
import { Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { weekDays, subjects, teachers, organizations, classes, students } from '@/data/mock';
import type { Schedule } from '@/data/mock';

interface ScheduleTableProps {
  schedules: Schedule[];
  onAddClick: (dayOfWeek: number) => void;
  onEditClick: (schedule: Schedule) => void;
  onDeleteClick: (scheduleId: string) => void;
}

// 时间转分钟数（用于计算位置）
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 时间轴配置
const START_HOUR = 8; // 8:00 开始
const END_HOUR = 20;  // 20:00 结束
const HOUR_HEIGHT = 60; // 每小时高度（像素）
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

export default function ScheduleTable({
  schedules,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: ScheduleTableProps) {
  const getSubject = (id: string) => subjects.find(s => s.id === id);
  const getTeacher = (id: string) => teachers.find(t => t.id === id);

  const getStudentCount = (schedule: Schedule) => {
    let count = 0;
    schedule.orgIds.forEach(orgId => {
      count += students.filter(s => s.orgId === orgId).length;
    });
    schedule.classIds.forEach(classId => {
      const cls = classes.find(c => c.id === classId);
      if (cls && !schedule.orgIds.includes(cls.orgId)) {
        count += students.filter(s => s.classId === classId).length;
      }
    });
    schedule.studentIds.forEach(studentId => {
      const stu = students.find(s => s.id === studentId);
      if (stu && !schedule.orgIds.includes(stu.orgId) && !schedule.classIds.includes(stu.classId)) {
        count += 1;
      }
    });
    return count;
  };

  // 获取某天的所有课程，并计算重叠分组
  const getSchedulesForDay = (dayOfWeek: number) => {
    const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

    // 按开始时间排序
    daySchedules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // 计算重叠分组
    const positioned: Array<Schedule & { column: number; totalColumns: number }> = [];

    daySchedules.forEach(schedule => {
      const startMin = timeToMinutes(schedule.startTime);
      const endMin = timeToMinutes(schedule.endTime);

      // 找出所有重叠的已定位课程
      const overlapping = positioned.filter(p => {
        const pStart = timeToMinutes(p.startTime);
        const pEnd = timeToMinutes(p.endTime);
        return !(endMin <= pStart || startMin >= pEnd);
      });

      // 找到可用的列
      const usedColumns = new Set(overlapping.map(o => o.column));
      let column = 0;
      while (usedColumns.has(column)) column++;

      // 计算这个时间段需要的总列数
      const totalColumns = Math.max(column + 1, ...overlapping.map(o => o.totalColumns));

      // 更新重叠课程的totalColumns
      overlapping.forEach(o => {
        o.totalColumns = totalColumns;
      });

      positioned.push({ ...schedule, column, totalColumns });
    });

    // 最终更新所有重叠组的totalColumns
    positioned.forEach(schedule => {
      const startMin = timeToMinutes(schedule.startTime);
      const endMin = timeToMinutes(schedule.endTime);

      const overlapping = positioned.filter(p => {
        const pStart = timeToMinutes(p.startTime);
        const pEnd = timeToMinutes(p.endTime);
        return !(endMin <= pStart || startMin >= pEnd);
      });

      const maxCols = Math.max(...overlapping.map(o => o.column)) + 1;
      overlapping.forEach(o => {
        o.totalColumns = maxCols;
      });
    });

    return positioned;
  };

  // 计算课程块的样式
  const getScheduleStyle = (schedule: Schedule & { column: number; totalColumns: number }) => {
    const startMin = timeToMinutes(schedule.startTime) - START_HOUR * 60;
    const endMin = timeToMinutes(schedule.endTime) - START_HOUR * 60;
    const duration = endMin - startMin;

    const top = (startMin / TOTAL_MINUTES) * 100;
    const height = (duration / TOTAL_MINUTES) * 100;
    const width = 100 / schedule.totalColumns;
    const left = schedule.column * width;

    return {
      top: `${top}%`,
      height: `${height}%`,
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  // 生成小时标记
  const hourMarks = useMemo(() => {
    const marks = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      marks.push(h);
    }
    return marks;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 表头 */}
      <div className="flex border-b bg-gray-50">
        <div className="w-16 flex-shrink-0 p-3 text-center text-gray-500 font-medium border-r">
          时间
        </div>
        {weekDays.slice(0, 5).map(day => (
          <div key={day.id} className="flex-1 p-3 text-center text-gray-700 font-medium border-r last:border-r-0">
            {day.name}
          </div>
        ))}
      </div>

      {/* 时间轴主体 */}
      <div className="flex">
        {/* 时间刻度列 */}
        <div className="w-16 flex-shrink-0 border-r bg-gray-50">
          {hourMarks.map(hour => (
            <div
              key={hour}
              className="border-b text-xs text-gray-400 text-right pr-2"
              style={{ height: HOUR_HEIGHT }}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* 每天的列 */}
        {weekDays.slice(0, 5).map(day => {
          const daySchedules = getSchedulesForDay(day.id);

          return (
            <div
              key={day.id}
              className="flex-1 border-r last:border-r-0 relative"
              style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
            >
              {/* 小时分隔线 */}
              {hourMarks.map(hour => (
                <div
                  key={hour}
                  className="border-b border-gray-100"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}

              {/* 添加按钮 */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-0"
                onClick={() => onAddClick(day.id)}
              >
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4">
                  <PlusOutlined className="text-blue-400 text-xl" />
                </div>
              </div>

              {/* 课程块 */}
              {daySchedules.map(schedule => {
                const subject = getSubject(schedule.subjectId);
                const teacher = getTeacher(schedule.teacherId);
                const studentCount = getStudentCount(schedule);
                const style = getScheduleStyle(schedule);

                return (
                  <div
                    key={schedule.id}
                    className="absolute p-1 z-10"
                    style={style}
                  >
                    <div
                      className="h-full rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg group overflow-hidden"
                      style={{
                        backgroundColor: `${subject?.color}20`,
                        borderLeft: `3px solid ${subject?.color}`,
                      }}
                      onClick={() => onEditClick(schedule)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm truncate" style={{ color: subject?.color }}>
                          {subject?.name}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Tooltip title="编辑">
                            <EditOutlined
                              className="text-gray-400 hover:text-blue-500 cursor-pointer text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(schedule);
                              }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="确定删除这场讲座吗？"
                            onConfirm={() => onDeleteClick(schedule.id)}
                            okText="删除"
                            cancelText="取消"
                          >
                            <DeleteOutlined
                              className="text-gray-400 hover:text-red-500 cursor-pointer text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {teacher?.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {schedule.startTime}-{schedule.endTime}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {studentCount}人
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
