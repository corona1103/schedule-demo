'use client';

import React, { useState, useMemo } from 'react';
import { Button, message, Card, Typography, Space } from 'antd';
import { PlusOutlined, CalendarOutlined, UserOutlined, TeamOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import ScheduleTable from '@/components/ScheduleTable';
import ScheduleForm from '@/components/ScheduleForm';
import ExpertRegisterModal from '@/components/ExpertRegisterModal';
import { schedules as initialSchedules, externalExperts as initialExperts, type Schedule, type ExternalExpert } from '@/data/mock';

const { Title } = Typography;

// 获取某个日期所在周的周一
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay() || 7; // 周日为 0，转为 7
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 格式化周显示
const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // 周五
  const startStr = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日`;
  const endStr = `${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
  return `${startStr} - ${endStr}`;
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [experts, setExperts] = useState<ExternalExpert[]>(initialExperts);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [expertModalOpen, setExpertModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // 当前选中周的周一
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  // 新建讲座时的预设日期
  const [presetDate, setPresetDate] = useState<string | null>(null);

  const handleAddClick = (dayOfWeek: number, date: string) => {
    setEditingSchedule(null);
    setPresetDate(date);
    setFormOpen(true);
  };

  // 切换到上一周
  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  // 切换到下一周
  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  // 回到本周
  const handleToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  // 判断是否是本周
  const isCurrentWeek = useMemo(() => {
    const today = getWeekStart(new Date());
    return currentWeekStart.getTime() === today.getTime();
  }, [currentWeekStart]);

  // 计算当前周的讲座统计
  const weekSchedules = useMemo(() => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    return schedules.filter(s => s.date >= startStr && s.date <= endStr);
  }, [schedules, currentWeekStart]);

  const handleEditClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormOpen(true);
  };

  const handleDeleteClick = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    messageApi.success('讲座已删除');
  };

  const handleFormSubmit = (data: Omit<Schedule, 'id'>) => {
    if (editingSchedule) {
      setSchedules(prev =>
        prev.map(s =>
          s.id === editingSchedule.id ? { ...data, id: editingSchedule.id } : s
        )
      );
      messageApi.success('讲座已更新');
    } else {
      const newSchedule: Schedule = {
        ...data,
        id: Date.now().toString(),
      };
      setSchedules(prev => [...prev, newSchedule]);
      messageApi.success('讲座已添加');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingSchedule(null);
    setPresetDate(null);
  };

  // 添加外部专家
  const handleAddExpert = (data: Omit<ExternalExpert, 'id' | 'status' | 'createdAt'>) => {
    const newExpert: ExternalExpert = {
      ...data,
      id: `ext-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExperts(prev => [...prev, newExpert]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {contextHolder}

      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-2xl text-blue-500" />
            <Title level={4} className="!mb-0">讲座管理系统</Title>
          </div>
          <Space>
            <Button
              icon={<UserOutlined />}
              onClick={() => setExpertModalOpen(true)}
            >
              外部专家入驻
            </Button>
            <Link href="/experts">
              <Button icon={<TeamOutlined />}>
                专家管理
              </Button>
            </Link>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingSchedule(null);
                setFormOpen(true);
              }}
            >
              新建讲座
            </Button>
          </Space>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 周切换器 */}
        <div className="bg-white rounded-lg shadow mb-4 p-4 flex items-center justify-between">
          <Button icon={<LeftOutlined />} onClick={handlePrevWeek}>
            上一周
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">{formatWeekRange(currentWeekStart)}</span>
            {!isCurrentWeek && (
              <Button size="small" onClick={handleToday}>
                回到本周
              </Button>
            )}
          </div>
          <Button onClick={handleNextWeek}>
            下一周 <RightOutlined />
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{weekSchedules.length}</div>
            <div className="text-gray-500 text-sm">本周讲座</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {new Set(weekSchedules.map(s => s.teacherId)).size}
            </div>
            <div className="text-gray-500 text-sm">授课教师</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {new Set(weekSchedules.map(s => s.subjectId)).size}
            </div>
            <div className="text-gray-500 text-sm">学科数量</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {experts.filter(e => e.status === 'active').length}
            </div>
            <div className="text-gray-500 text-sm">外部专家</div>
          </Card>
        </div>

        {/* 课表 */}
        <ScheduleTable
          schedules={schedules}
          currentWeekStart={currentWeekStart}
          onAddClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />

        {/* 提示说明 */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          点击空白区域可添加讲座，点击已有讲座可编辑，同一时间段可安排多场讲座
        </div>
      </main>

      {/* 课程表单 */}
      <ScheduleForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingSchedule}
        externalExperts={experts}
        presetDate={presetDate}
      />

      {/* 外部专家入驻弹窗 */}
      <ExpertRegisterModal
        open={expertModalOpen}
        onClose={() => setExpertModalOpen(false)}
        onSubmit={handleAddExpert}
      />
    </div>
  );
}
