import type { Prettier } from "~/types/tools";

export const MinorsLabels = {
  name: '姓名',
  street: '街道',
  community: '社区',
  warningStatus: '预警状态',
  age: '年龄',
  gender: '性别',
  school: '就读学校',
  grade: '年级',
  contact: '联系方式',
  tempProtect: '临时庇护',
  detail: '详细信息',
  psyTest: '心理测试结果',
  psyCounsel: '心理咨询服务记录',
  lifeEvent: '重大生活事件',
  focus: '重点关注内容',
  familyGuard: '家庭监护能力',
  otherServer: '其他服务记录',
} as const;

export const minorsTableKey = [
  'name',
  'street',
  'community',
  'warningStatus',
  'age',
  'tempProtect',
] as const;

export interface MinorItemT {
  key: keyof typeof MinorsLabels;
  editor: 'input' | 'radio' | 'textarea' | 'textareas' | 'file' | 'complex';
}
export const minorsEditorItems: Prettier<MinorItemT>[] = [
  {
    key: 'name',
    editor: 'input',
  },
  {
    key: 'street',
    editor: 'input',
  },
  {
    key: 'community',
    editor: 'input',
  },
  {
    key: 'warningStatus',
    editor: 'radio',
  },
  {
    key: 'age',
    editor: 'input',
  },
  {
    key: 'gender',
    editor: 'radio',
  },
  {
    key: 'school',
    editor: 'input',
  },
  {
    key: 'grade',
    editor: 'input',
  },
  {
    key: 'contact',
    editor: 'textarea',
  },
  {
    key: 'detail',
    editor: 'textarea',
  },
  {
    key: 'psyTest',
    editor: 'complex',
  },
  {
    key: 'psyCounsel',
    editor: 'file',
  },
  {
    key: 'lifeEvent',
    editor: 'textarea',
  },
  {
    key: 'focus',
    editor: 'textareas',
  },
  {
    key: 'familyGuard',
    editor: 'file',
  },
  {
    key: 'otherServer',
    editor: 'file',
  }
];
export const radioLookupMap = {
  'warningStatus': ['低', '中', '高'],
  'gender': ['男', '女', '未知'],
}
export const minorsInfoKey = [
  'name',
  'street',
  'community',
  'warningStatus',
  'age',
  'gender',
  'school',
  'grade',
  'contact',
  'detail',
  'psyTest',
  'psyCounsel',
  'lifeEvent',
  'focus',
  'familyGuard',
  'otherServer'
] as const;

export const PsyTestLabels = {
  synthesisPsyHealth: '心理健康（综合）',
  anxiety: '焦虑',
  depression: '抑郁',
  traumaReaction: '创伤反应',
  socialAnxiety: '社交焦虑',
  intellect: '智力',
  personality: '人格',
  insomnia: '失眠',
  other: '其他',
} as const;