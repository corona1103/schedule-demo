'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, TimePicker, Tag, Button, Space, Input, message, Divider } from 'antd';
import { UserAddOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { subjects, teachers, weekDays, organizations, classes, students, findTeacherByEmployeeNo } from '@/data/mock';
import StudentSelector, { SelectionResult } from './StudentSelector';
import type { Schedule, Teacher, ExternalExpert } from '@/data/mock';

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  initialData?: Schedule | null;
  externalExperts?: ExternalExpert[];
}

export default function ScheduleForm({
  open,
  onClose,
  onSubmit,
  initialData,
  externalExperts = [],
}: ScheduleFormProps) {
  const [form] = Form.useForm();
  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false);
  const [selection, setSelection] = useState<SelectionResult>({
    orgIds: [],
    classIds: [],
    studentIds: [],
  });

  // 根据选中学科过滤老师
  const [filteredTeachers, setFilteredTeachers] = useState(teachers);
  const [filteredExperts, setFilteredExperts] = useState<ExternalExpert[]>([]);

  // 手动添加的老师（通过工号查找）
  const [manualTeacher, setManualTeacher] = useState<Teacher | null>(null);
  const [employeeNoInput, setEmployeeNoInput] = useState('');

  useEffect(() => {
    if (open) {
      // 获取启用状态的外部专家
      const activeExperts = externalExperts.filter(e => e.status === 'active');

      if (initialData) {
        form.setFieldsValue({
          subjectId: initialData.subjectId,
          teacherId: initialData.teacherId,
          dayOfWeek: initialData.dayOfWeek,
          timeRange: [
            dayjs(initialData.startTime, 'HH:mm'),
            dayjs(initialData.endTime, 'HH:mm'),
          ],
        });
        setSelection({
          orgIds: initialData.orgIds,
          classIds: initialData.classIds,
          studentIds: initialData.studentIds,
        });
        // 设置过滤后的老师列表
        const filtered = teachers.filter(t => t.subjects.includes(initialData.subjectId));
        setFilteredTeachers(filtered);

        // 设置过滤后的外部专家列表
        const filteredExp = activeExperts.filter(
          e => e.subjects.length === 0 || e.subjects.includes(initialData.subjectId)
        );
        setFilteredExperts(filteredExp);

        // 检查是否是手动添加的老师
        const teacher = teachers.find(t => t.id === initialData.teacherId);
        if (teacher && !filtered.find(t => t.id === teacher.id)) {
          setManualTeacher(teacher);
        } else {
          setManualTeacher(null);
        }
      } else {
        form.resetFields();
        setSelection({ orgIds: [], classIds: [], studentIds: [] });
        setFilteredTeachers(teachers);
        setFilteredExperts(activeExperts);
        setManualTeacher(null);
      }
      setEmployeeNoInput('');
    }
  }, [open, initialData, form, externalExperts]);

  const handleSubjectChange = (subjectId: string) => {
    const filtered = teachers.filter(t => t.subjects.includes(subjectId));
    setFilteredTeachers(filtered);

    // 过滤外部专家（没有设置学科的专家显示所有学科）
    const activeExperts = externalExperts.filter(e => e.status === 'active');
    const filteredExp = activeExperts.filter(
      e => e.subjects.length === 0 || e.subjects.includes(subjectId)
    );
    setFilteredExperts(filteredExp);

    // 清空已选老师如果不在列表中（除非是手动添加的或外部专家）
    const currentTeacher = form.getFieldValue('teacherId');
    if (currentTeacher) {
      const isInFiltered = filtered.find(t => t.id === currentTeacher);
      const isManual = manualTeacher?.id === currentTeacher;
      const isExpert = filteredExp.find(e => e.id === currentTeacher);
      if (!isInFiltered && !isManual && !isExpert) {
        form.setFieldValue('teacherId', undefined);
      }
    }
  };

  // 通过工号搜索老师
  const handleSearchByEmployeeNo = () => {
    if (!employeeNoInput.trim()) {
      message.warning('请输入员工工号');
      return;
    }

    const found = findTeacherByEmployeeNo(employeeNoInput.trim());
    if (found) {
      setManualTeacher(found);
      form.setFieldValue('teacherId', found.id);
      setEmployeeNoInput('');
      message.success(`已添加老师：${found.name}`);
    } else {
      message.error('未找到该工号对应的员工');
    }
  };

  // 清除手动添加的老师
  const handleClearManualTeacher = () => {
    if (manualTeacher && form.getFieldValue('teacherId') === manualTeacher.id) {
      form.setFieldValue('teacherId', undefined);
    }
    setManualTeacher(null);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const [startTime, endTime] = values.timeRange;
      onSubmit({
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        dayOfWeek: values.dayOfWeek,
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        ...selection,
      });
      onClose();
    });
  };

  // 获取选中学生的展示
  const getSelectionDisplay = () => {
    const items: { type: string; name: string; id: string }[] = [];

    selection.orgIds.forEach(id => {
      const org = organizations.find(o => o.id === id);
      if (org) items.push({ type: 'org', name: org.name, id });
    });

    selection.classIds.forEach(id => {
      const cls = classes.find(c => c.id === id);
      if (cls) items.push({ type: 'class', name: cls.name, id });
    });

    selection.studentIds.forEach(id => {
      const stu = students.find(s => s.id === id);
      if (stu) items.push({ type: 'student', name: stu.name, id });
    });

    return items;
  };

  // 合并下拉选项：内部老师 + 外部专家 + 手动添加的老师
  const teacherOptions = React.useMemo(() => {
    const options: { value: string; label: string }[] = [];

    // 内部老师
    if (filteredTeachers.length > 0) {
      filteredTeachers.forEach(t => {
        options.push({
          value: t.id,
          label: `${t.name} (${t.employeeNo})`,
        });
      });
    }

    // 手动添加的老师（如果不在过滤列表中）
    if (manualTeacher && !filteredTeachers.find(t => t.id === manualTeacher.id)) {
      options.unshift({
        value: manualTeacher.id,
        label: `${manualTeacher.name} (${manualTeacher.employeeNo}) - 手动添加`,
      });
    }

    return options;
  }, [filteredTeachers, manualTeacher]);

  // 外部专家选项
  const expertOptions = React.useMemo(() => {
    return filteredExperts.map(e => ({
      value: e.id,
      label: `${e.name} (${e.phone})`,
    }));
  }, [filteredExperts]);

  const selectionItems = getSelectionDisplay();

  return (
    <>
      <Modal
        title={initialData ? '编辑讲座' : '新建讲座'}
        open={open}
        onCancel={onClose}
        onOk={handleSubmit}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="subjectId"
            label="学科"
            rules={[{ required: true, message: '请选择学科' }]}
          >
            <Select
              placeholder="选择学科"
              onChange={handleSubjectChange}
              options={subjects.map(s => ({
                value: s.id,
                label: (
                  <span>
                    <span
                      className="inline-block w-3 h-3 rounded mr-2"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            label="授课老师"
            required
          >
            <div className="space-y-2">
              <Form.Item
                name="teacherId"
                noStyle
                rules={[{ required: true, message: '请选择老师' }]}
              >
                <Select
                  placeholder="从列表选择老师"
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  dropdownRender={(menu) => (
                    <>
                      {teacherOptions.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs text-gray-400 bg-gray-50">内部老师</div>
                          {menu}
                        </>
                      )}
                      {expertOptions.length > 0 && (
                        <>
                          <Divider style={{ margin: '4px 0' }} />
                          <div className="px-2 py-1 text-xs text-gray-400 bg-orange-50">外部专家</div>
                        </>
                      )}
                    </>
                  )}
                  options={[
                    ...teacherOptions,
                    ...expertOptions.map(e => ({
                      ...e,
                      label: (
                        <span>
                          <Tag color="orange" className="mr-1" style={{ fontSize: 10, padding: '0 4px' }}>外部</Tag>
                          {e.label}
                        </span>
                      ),
                    })),
                  ]}
                />
              </Form.Item>

              {/* 手动添加的老师标签 */}
              {manualTeacher && !filteredTeachers.find(t => t.id === manualTeacher.id) && (
                <div className="flex items-center gap-2">
                  <Tag
                    color="blue"
                    closable
                    onClose={handleClearManualTeacher}
                    className="m-0"
                  >
                    手动添加: {manualTeacher.name} ({manualTeacher.employeeNo})
                  </Tag>
                </div>
              )}

              {/* 工号输入区域 */}
              <div className="flex gap-2 items-center pt-1">
                <span className="text-gray-400 text-xs">或通过工号添加：</span>
                <Input
                  placeholder="输入员工工号"
                  value={employeeNoInput}
                  onChange={e => setEmployeeNoInput(e.target.value)}
                  onPressEnter={handleSearchByEmployeeNo}
                  style={{ width: 140 }}
                  size="small"
                />
                <Button
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={handleSearchByEmployeeNo}
                >
                  查找
                </Button>
              </div>
              <div className="text-gray-400 text-xs">
                提示：内部工号 T001-T005 | 外部专家会自动显示在列表中
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="dayOfWeek"
            label="星期"
            rules={[{ required: true, message: '请选择星期' }]}
          >
            <Select
              placeholder="选择星期"
              options={weekDays.map(d => ({
                value: d.id,
                label: d.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="上课时间"
            rules={[{ required: true, message: '请选择上课时间' }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              placeholder={['开始时间', '结束时间']}
              minuteStep={5}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="目标学生"
            required
          >
            <div className="border rounded p-3 bg-gray-50">
              {selectionItems.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  <p className="mb-2">未选择学生</p>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setStudentSelectorOpen(true)}
                  >
                    选择学生
                  </Button>
                </div>
              ) : (
                <>
                  <Space size={[0, 8]} wrap className="mb-2">
                    {selectionItems.map(item => (
                      <Tag
                        key={`${item.type}-${item.id}`}
                        color={item.type === 'org' ? 'blue' : item.type === 'class' ? 'green' : 'default'}
                      >
                        {item.name}
                      </Tag>
                    ))}
                  </Space>
                  <div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setStudentSelectorOpen(true)}
                      className="p-0"
                    >
                      修改选择
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <StudentSelector
        open={studentSelectorOpen}
        onClose={() => setStudentSelectorOpen(false)}
        onConfirm={setSelection}
        initialSelection={selection}
      />
    </>
  );
}
