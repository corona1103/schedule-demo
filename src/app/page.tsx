'use client';

import React, { useState } from 'react';
import { Button, message, Card, Typography, Space } from 'antd';
import { PlusOutlined, CalendarOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import ScheduleTable from '@/components/ScheduleTable';
import ScheduleForm from '@/components/ScheduleForm';
import ExpertRegisterModal from '@/components/ExpertRegisterModal';
import { schedules as initialSchedules, externalExperts as initialExperts, type Schedule, type ExternalExpert } from '@/data/mock';

const { Title } = Typography;

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [experts, setExperts] = useState<ExternalExpert[]>(initialExperts);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [expertModalOpen, setExpertModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddClick = (dayOfWeek: number) => {
    setEditingSchedule(null);
    setFormOpen(true);
  };

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
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{schedules.length}</div>
            <div className="text-gray-500 text-sm">本周讲座</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {new Set(schedules.map(s => s.teacherId)).size}
            </div>
            <div className="text-gray-500 text-sm">授课教师</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {new Set(schedules.map(s => s.subjectId)).size}
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
