'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Tree, Input, Tag, Space, Tabs, List, Checkbox, Empty } from 'antd';
import { SearchOutlined, TeamOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { organizations, classes, students } from '@/data/mock';

interface StudentSelectorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selection: SelectionResult) => void;
  initialSelection?: SelectionResult;
}

export interface SelectionResult {
  orgIds: string[];
  classIds: string[];
  studentIds: string[];
}

export default function StudentSelector({
  open,
  onClose,
  onConfirm,
  initialSelection,
}: StudentSelectorProps) {
  const [activeTab, setActiveTab] = useState('tree');
  const [searchText, setSearchText] = useState('');
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>(initialSelection?.orgIds || []);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(initialSelection?.classIds || []);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(initialSelection?.studentIds || []);

  // 构建树形数据
  const treeData: DataNode[] = useMemo(() => {
    return organizations.map(org => ({
      key: `org-${org.id}`,
      title: org.name,
      icon: <BankOutlined />,
      children: classes
        .filter(cls => cls.orgId === org.id)
        .map(cls => ({
          key: `class-${cls.id}`,
          title: cls.name,
          icon: <TeamOutlined />,
          children: students
            .filter(stu => stu.classId === cls.id)
            .map(stu => ({
              key: `student-${stu.id}`,
              title: stu.name,
              icon: <UserOutlined />,
              isLeaf: true,
            })),
        })),
    }));
  }, []);

  // 搜索过滤的学生列表
  const filteredStudents = useMemo(() => {
    if (!searchText) return students;
    return students.filter(s => s.name.includes(searchText));
  }, [searchText]);

  // 处理树选择
  const handleTreeCheck = (checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    const orgIds: string[] = [];
    const classIds: string[] = [];
    const studentIds: string[] = [];

    keys.forEach(key => {
      const keyStr = String(key);
      if (keyStr.startsWith('org-')) {
        orgIds.push(keyStr.replace('org-', ''));
      } else if (keyStr.startsWith('class-')) {
        classIds.push(keyStr.replace('class-', ''));
      } else if (keyStr.startsWith('student-')) {
        studentIds.push(keyStr.replace('student-', ''));
      }
    });

    setSelectedOrgIds(orgIds);
    setSelectedClassIds(classIds);
    setSelectedStudentIds(studentIds);
  };

  // 获取选中的key列表
  const checkedKeys = useMemo(() => {
    return [
      ...selectedOrgIds.map(id => `org-${id}`),
      ...selectedClassIds.map(id => `class-${id}`),
      ...selectedStudentIds.map(id => `student-${id}`),
    ];
  }, [selectedOrgIds, selectedClassIds, selectedStudentIds]);

  // 获取选中学生的名称用于显示
  const getSelectedDisplay = () => {
    const items: { type: string; name: string; id: string }[] = [];

    selectedOrgIds.forEach(id => {
      const org = organizations.find(o => o.id === id);
      if (org) items.push({ type: 'org', name: org.name, id });
    });

    selectedClassIds.forEach(id => {
      const cls = classes.find(c => c.id === id);
      if (cls) items.push({ type: 'class', name: cls.name, id });
    });

    selectedStudentIds.forEach(id => {
      const stu = students.find(s => s.id === id);
      if (stu) items.push({ type: 'student', name: stu.name, id });
    });

    return items;
  };

  // 删除选中项
  const handleRemove = (type: string, id: string) => {
    if (type === 'org') {
      setSelectedOrgIds(prev => prev.filter(i => i !== id));
    } else if (type === 'class') {
      setSelectedClassIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedStudentIds(prev => prev.filter(i => i !== id));
    }
  };

  // 搜索列表中切换学生选择
  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      orgIds: selectedOrgIds,
      classIds: selectedClassIds,
      studentIds: selectedStudentIds,
    });
    onClose();
  };

  const selectedItems = getSelectedDisplay();

  return (
    <Modal
      title="选择学生"
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      width={700}
      okText="确认"
      cancelText="取消"
    >
      <div className="mb-4">
        <div className="text-gray-500 text-sm mb-2">已选择：</div>
        <div className="min-h-[40px] p-2 bg-gray-50 rounded border">
          {selectedItems.length === 0 ? (
            <span className="text-gray-400">未选择</span>
          ) : (
            <Space size={[0, 8]} wrap>
              {selectedItems.map(item => (
                <Tag
                  key={`${item.type}-${item.id}`}
                  closable
                  onClose={() => handleRemove(item.type, item.id)}
                  color={item.type === 'org' ? 'blue' : item.type === 'class' ? 'green' : 'default'}
                >
                  {item.type === 'org' && <BankOutlined className="mr-1" />}
                  {item.type === 'class' && <TeamOutlined className="mr-1" />}
                  {item.type === 'student' && <UserOutlined className="mr-1" />}
                  {item.name}
                </Tag>
              ))}
            </Space>
          )}
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'tree',
            label: '按组织结构',
            children: (
              <div className="h-[300px] overflow-auto border rounded p-2">
                <Tree
                  checkable
                  showIcon
                  defaultExpandAll
                  treeData={treeData}
                  checkedKeys={checkedKeys}
                  onCheck={handleTreeCheck}
                />
              </div>
            ),
          },
          {
            key: 'search',
            label: '搜索学生',
            children: (
              <div>
                <Input
                  placeholder="输入学生姓名搜索"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="mb-2"
                />
                <div className="h-[260px] overflow-auto border rounded">
                  {filteredStudents.length === 0 ? (
                    <Empty description="没有找到学生" className="mt-10" />
                  ) : (
                    <List
                      dataSource={filteredStudents}
                      renderItem={item => {
                        const cls = classes.find(c => c.id === item.classId);
                        const org = organizations.find(o => o.id === item.orgId);
                        return (
                          <List.Item className="px-3 cursor-pointer hover:bg-gray-50">
                            <Checkbox
                              checked={selectedStudentIds.includes(item.id)}
                              onChange={() => toggleStudent(item.id)}
                            >
                              <span className="ml-2">
                                {item.name}
                                <span className="text-gray-400 text-xs ml-2">
                                  {org?.name} - {cls?.name}
                                </span>
                              </span>
                            </Checkbox>
                          </List.Item>
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
