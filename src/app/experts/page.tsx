'use client';

import React, { useState } from 'react';
import { Button, Table, Tag, Space, Modal, message, Typography, Input, Popconfirm } from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { externalExperts as initialExperts, subjects } from '@/data/mock';
import type { ExternalExpert } from '@/data/mock';
import ExpertRegisterModal from '@/components/ExpertRegisterModal';

const { Title } = Typography;

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExternalExpert[]>(initialExperts);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

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

  // 切换专家状态
  const handleToggleStatus = (expertId: string) => {
    setExperts(prev =>
      prev.map(e =>
        e.id === expertId
          ? { ...e, status: e.status === 'active' ? 'disabled' : 'active' }
          : e
      )
    );
    const expert = experts.find(e => e.id === expertId);
    if (expert) {
      messageApi.success(
        expert.status === 'active' ? '已禁用该专家账号' : '已启用该专家账号'
      );
    }
  };

  // 删除专家
  const handleDelete = (expertId: string) => {
    setExperts(prev => prev.filter(e => e.id !== expertId));
    messageApi.success('已删除该专家');
  };

  // 过滤数据
  const filteredExperts = experts.filter(e =>
    e.name.includes(searchText) || e.phone.includes(searchText)
  );

  // 获取学科名称
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#999';
  };

  const columns = [
    {
      title: '专家姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ExternalExpert) => (
        <span className={record.status === 'disabled' ? 'text-gray-400' : ''}>
          {name}
        </span>
      ),
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string, record: ExternalExpert) => (
        <span className={record.status === 'disabled' ? 'text-gray-400' : ''}>
          {phone}
        </span>
      ),
    },
    {
      title: '擅长学科',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjectIds: string[], record: ExternalExpert) => (
        <Space size={[0, 4]} wrap>
          {subjectIds.length > 0 ? (
            subjectIds.map(id => (
              <Tag
                key={id}
                color={record.status === 'disabled' ? 'default' : getSubjectColor(id)}
                style={record.status === 'disabled' ? { opacity: 0.5 } : {}}
              >
                {getSubjectName(id)}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">未设置</span>
          )}
        </Space>
      ),
    },
    {
      title: '入驻时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string, record: ExternalExpert) => (
        <span className={record.status === 'disabled' ? 'text-gray-400' : ''}>
          {date}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '正常' : '已禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ExternalExpert) => (
        <Space size="small">
          {record.status === 'active' ? (
            <Popconfirm
              title="确定禁用该专家账号吗？"
              description="禁用后该专家将无法被选择讲座"
              onConfirm={() => handleToggleStatus(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<StopOutlined />}
              >
                禁用
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record.id)}
              className="text-green-600 hover:text-green-700"
            >
              启用
            </Button>
          )}
          <Popconfirm
            title="确定删除该专家吗？"
            description="删除后数据无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="text" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {contextHolder}

      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button type="text" icon={<ArrowLeftOutlined />}>
                返回讲座
              </Button>
            </Link>
            <Title level={4} className="!mb-0">外部专家管理</Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setRegisterModalOpen(true)}
          >
            添加专家
          </Button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{experts.length}</div>
            <div className="text-gray-500 text-sm">专家总数</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {experts.filter(e => e.status === 'active').length}
            </div>
            <div className="text-gray-500 text-sm">正常状态</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {experts.filter(e => e.status === 'disabled').length}
            </div>
            <div className="text-gray-500 text-sm">已禁用</div>
          </div>
        </div>

        {/* 搜索和表格 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <Input
              placeholder="搜索专家姓名或手机号"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
          <Table
            columns={columns}
            dataSource={filteredExperts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: total => `共 ${total} 位专家`,
            }}
          />
        </div>
      </main>

      {/* 添加专家弹窗 */}
      <ExpertRegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSubmit={handleAddExpert}
      />
    </div>
  );
}
