# 讲座管理系统 - 技术文档

## 1. 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.x |
| 语言 | TypeScript | 5.x |
| UI组件库 | Ant Design | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 日期处理 | Day.js | - |
| 包管理 | npm | - |

---

## 2. 项目结构

```
schedule-demo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页（讲座管理）
│   │   ├── globals.css         # 全局样式
│   │   └── experts/
│   │       └── page.tsx        # 专家管理页面
│   ├── components/             # React组件
│   │   ├── ScheduleTable.tsx   # 讲座时间表组件
│   │   ├── ScheduleForm.tsx    # 讲座表单组件
│   │   ├── StudentSelector.tsx # 学生选择器组件
│   │   └── ExpertRegisterModal.tsx # 专家入驻弹窗
│   └── data/
│       └── mock.ts             # 模拟数据和类型定义
├── docs/                       # 文档目录
│   ├── requirements.md         # 需求文档
│   └── technical.md            # 技术文档
├── package.json
└── tsconfig.json
```

---

## 3. 核心数据结构

### 3.1 类型定义 (`src/data/mock.ts`)

```typescript
// 内部老师
interface Teacher {
  id: string;
  name: string;
  employeeNo: string;    // 员工工号
  subjects: string[];    // 擅长学科ID列表
}

// 外部专家
interface ExternalExpert {
  id: string;
  name: string;
  phone: string;
  subjects: string[];    // 擅长学科ID列表
  status: 'active' | 'disabled';
  createdAt: string;
}

// 讲座
interface Schedule {
  id: string;
  subjectId: string;     // 学科ID
  teacherId: string;     // 讲师ID（内部或外部）
  date: string;          // YYYY-MM-DD 格式，讲座日期
  dayOfWeek: number;     // 1-7 对应周一到周日（根据date自动计算）
  startTime: string;     // HH:mm 格式
  endTime: string;       // HH:mm 格式
  studentIds: string[];  // 选中的学生ID列表
  classIds: string[];    // 选中的班级ID列表
  orgIds: string[];      // 选中的机构ID列表
}

// 学生选择结果
interface SelectionResult {
  orgIds: string[];
  classIds: string[];
  studentIds: string[];
}
```

---

## 4. 核心组件说明

### 4.1 ScheduleTable（讲座时间表）

**功能**：以周视图时间轴形式展示讲座

**Props**：
```typescript
interface ScheduleTableProps {
  schedules: Schedule[];
  currentWeekStart: Date;  // 当前周的周一日期
  onAddClick: (dayOfWeek: number, date: string) => void;
  onEditClick: (schedule: Schedule) => void;
  onDeleteClick: (scheduleId: string) => void;
}
```

**关键实现**：
- 时间轴布局：8:00-20:00，每小时60px高度
- 重叠讲座处理：自动计算重叠并并排显示
- 动态定位：根据时间计算讲座卡片的 top/height/width/left
- **根据 date 字段筛选当前周的讲座**
- **表头显示星期和具体日期**

**重叠算法**：
```typescript
// 检测重叠
const overlapping = positioned.filter(p => {
  const pStart = timeToMinutes(p.startTime);
  const pEnd = timeToMinutes(p.endTime);
  return !(endMin <= pStart || startMin >= pEnd);
});

// 分配列位置
let column = 0;
while (usedColumns.has(column)) column++;
```

### 4.2 ScheduleForm（讲座表单）

**功能**：新建/编辑讲座

**Props**：
```typescript
interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  initialData?: Schedule | null;
  externalExperts?: ExternalExpert[];
  presetDate?: string | null;  // 预设日期 (YYYY-MM-DD)
}
```

**日期处理**：
- 使用 DatePicker 选择讲座日期
- 提交时自动计算 dayOfWeek（周日为 0 转换为 7）
- 支持预设日期（从周视图点击添加时传入）

**讲师选择逻辑**：
1. 根据选择的学科过滤内部老师
2. 合并显示：内部老师 + 外部专家（带标签）
3. 支持通过工号手动添加老师

### 4.3 StudentSelector（学生选择器）

**功能**：多维度选择目标学生

**实现方式**：
- 树形结构：机构 > 班级 > 学生
- 支持勾选任意层级
- 搜索模式：按姓名搜索单个学生

### 4.4 ExpertRegisterModal（专家入驻）

**功能**：添加外部专家

**表单验证**：
- 姓名：必填
- 手机号：必填，正则验证 `/^1[3-9]\d{9}$/`
- 学科：可选多选

---

## 5. 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 讲座管理主页面 |
| `/experts` | 专家管理 | 外部专家列表和管理 |

---

## 6. 状态管理

当前采用 React useState 进行本地状态管理：

```typescript
// 首页状态
const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
const [experts, setExperts] = useState<ExternalExpert[]>(initialExperts);
const [formOpen, setFormOpen] = useState(false);
const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

// 周切换相关状态
const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
const [presetDate, setPresetDate] = useState<string | null>(null);
```

**周切换相关函数**：
```typescript
// 获取某个日期所在周的周一
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 计算当前周的讲座
const weekSchedules = useMemo(() => {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  const startStr = currentWeekStart.toISOString().split('T')[0];
  const endStr = weekEnd.toISOString().split('T')[0];
  return schedules.filter(s => s.date >= startStr && s.date <= endStr);
}, [schedules, currentWeekStart]);
```

**注意**：当前为静态Demo，数据不持久化，刷新后重置。

---

## 7. 样式方案

### 7.1 Tailwind CSS
- 用于布局和基础样式
- 响应式类名
- 自定义颜色通过 CSS 变量

### 7.2 Ant Design
- 表单组件：Form、Input、Select、TimePicker
- 反馈组件：Modal、message、Popconfirm
- 数据展示：Table、Tag、Card

---

## 8. 开发和部署

### 8.1 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 8.2 构建生产版本

```bash
npm run build
npm run start
```

### 8.3 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

---

## 9. 后续扩展建议

### 9.1 数据持久化
- 接入后端 API
- 使用数据库存储（PostgreSQL/MySQL）

### 9.2 功能扩展
- 用户认证和权限管理
- 讲座冲突检测
- 导出讲座表（Excel/PDF）
- 讲座通知推送

### 9.3 性能优化
- 虚拟滚动（大量讲座时）
- 数据缓存（React Query/SWR）
