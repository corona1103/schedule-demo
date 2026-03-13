// 模拟数据

// 机构数据
export const organizations = [
  { id: '1', name: '北京总校' },
  { id: '2', name: '上海分校' },
  { id: '3', name: '广州分校' },
];

// 班级数据
export const classes = [
  { id: '1', name: '高三1班', orgId: '1' },
  { id: '2', name: '高三2班', orgId: '1' },
  { id: '3', name: '高二1班', orgId: '1' },
  { id: '4', name: '高三1班', orgId: '2' },
  { id: '5', name: '高三2班', orgId: '2' },
  { id: '6', name: '高三1班', orgId: '3' },
];

// 学生数据
export const students = [
  { id: '1', name: '张三', classId: '1', orgId: '1' },
  { id: '2', name: '李四', classId: '1', orgId: '1' },
  { id: '3', name: '王五', classId: '1', orgId: '1' },
  { id: '4', name: '赵六', classId: '2', orgId: '1' },
  { id: '5', name: '钱七', classId: '2', orgId: '1' },
  { id: '6', name: '孙八', classId: '3', orgId: '1' },
  { id: '7', name: '周九', classId: '4', orgId: '2' },
  { id: '8', name: '吴十', classId: '4', orgId: '2' },
  { id: '9', name: '郑一', classId: '5', orgId: '2' },
  { id: '10', name: '王二', classId: '6', orgId: '3' },
  { id: '11', name: '冯三', classId: '6', orgId: '3' },
];

// 老师数据
export interface Teacher {
  id: string;
  name: string;
  employeeNo: string; // 员工工号
  subjects: string[];
}

export const teachers: Teacher[] = [
  { id: '1', name: '张老师', employeeNo: 'T001', subjects: ['1', '2'] },
  { id: '2', name: '李老师', employeeNo: 'T002', subjects: ['1'] },
  { id: '3', name: '王老师', employeeNo: 'T003', subjects: ['2', '3'] },
  { id: '4', name: '赵老师', employeeNo: 'T004', subjects: ['3'] },
  { id: '5', name: '刘老师', employeeNo: 'T005', subjects: ['4'] },
];

// 根据工号查找老师（模拟API调用）
export const findTeacherByEmployeeNo = (employeeNo: string): Teacher | null => {
  return teachers.find(t => t.employeeNo === employeeNo) || null;
};

// 外部专家类型
export interface ExternalExpert {
  id: string;
  name: string;
  phone: string;
  subjects: string[]; // 擅长学科
  status: 'active' | 'disabled'; // 状态：启用/禁用
  createdAt: string; // 入驻时间
}

// 外部专家数据（初始为空，后续通过页面添加）
export const externalExperts: ExternalExpert[] = [
  {
    id: 'ext-1',
    name: '陈教授',
    phone: '13800138001',
    subjects: ['1', '4'],
    status: 'active',
    createdAt: '2024-03-01',
  },
  {
    id: 'ext-2',
    name: '林博士',
    phone: '13800138002',
    subjects: ['2', '3'],
    status: 'active',
    createdAt: '2024-03-05',
  },
];

// 学科数据
export const subjects = [
  { id: '1', name: '数学', color: '#1890ff' },
  { id: '2', name: '语文', color: '#52c41a' },
  { id: '3', name: '英语', color: '#faad14' },
  { id: '4', name: '物理', color: '#722ed1' },
  { id: '5', name: '化学', color: '#eb2f96' },
];

// 星期
export const weekDays = [
  { id: 1, name: '周一' },
  { id: 2, name: '周二' },
  { id: 3, name: '周三' },
  { id: 4, name: '周四' },
  { id: 5, name: '周五' },
  { id: 6, name: '周六' },
  { id: 7, name: '周日' },
];

// 课程安排类型
export interface Schedule {
  id: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 1-7
  startTime: string; // HH:mm 格式
  endTime: string;   // HH:mm 格式
  studentIds: string[];
  classIds: string[];
  orgIds: string[];
}

// 示例课程安排
export const schedules: Schedule[] = [
  {
    id: '1',
    subjectId: '1',
    teacherId: '1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '08:45',
    studentIds: ['1', '2', '3'],
    classIds: ['1'],
    orgIds: ['1'],
  },
  {
    id: '2',
    subjectId: '2',
    teacherId: '3',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '08:45',
    studentIds: ['4', '5'],
    classIds: ['2'],
    orgIds: [],
  },
  {
    id: '3',
    subjectId: '3',
    teacherId: '4',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '09:45',
    studentIds: ['1', '2', '3'],
    classIds: ['1'],
    orgIds: [],
  },
  {
    id: '4',
    subjectId: '4',
    teacherId: '5',
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '15:30',
    studentIds: [],
    classIds: [],
    orgIds: ['2'],
  },
];
