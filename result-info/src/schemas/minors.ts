import type { MinorInfoT } from "shared";
import type { Prettier } from "~/types/tools";

export const MinorsLabels = {
  guardianName: '监护人姓名',
  guardianBirthday: '监护人出生年月',
  guardianAge: '监护人年龄',
  guardianGender: '监护人性别',
  guardianContact: '监护人联系方式',
  relationship: '监护人与儿童关系',
  serveCount: '服务次数统计',
  registratedWuhou: '是否武侯户籍',
  name: '姓名',
  street: '街道',
  community: '社区',
  warningStatus: '预警状态',
  age: '年龄',
  birthday: '出生年月',
  gender: '性别',
  school: '就读学校',
  grade: '年级',
  contact: '联系方式',
  tempProtect: '临时庇护',
  detail: '详细信息',
  psyTest: '心理测试结果',
  psyCounsel: '心理咨询服务记录',
  lifeEvent: '重大生活事件',
  focus: '重点关注的领域',
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
  editor: 'input' | 'select' | 'date' | 'radio' | 'textarea' | 'textareas' | 'file' | 'complex';
}
export const minorsEditorItems: Prettier<MinorItemT>[] = [
  {
    key: 'name',
    editor: 'input',
  },
  {
    key: 'registratedWuhou',
    editor: 'radio',
  },
  {
    key: 'street',
    editor: 'select',
  },
  {
    key: 'community',
    editor: 'select',
  },
  {
    key: 'warningStatus',
    editor: 'radio',
  },
  {
    key: 'birthday',
    editor: 'date',
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
    key: 'guardianName',
    editor: 'input',
  },
  {
    key: 'guardianBirthday',
    editor: 'date',
  },
  {
    key: 'guardianAge',
    editor: 'input',
  },
  {
    key: 'guardianGender',
    editor: 'radio',
  },
  {
    key: 'guardianContact',
    editor: 'input',
  },
  {
    key: 'relationship',
    editor: 'input',
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
  },
  {
    key: 'serveCount',
    editor: 'textarea'
  }
];

export const minorsInfoKey = [
  'name',
  'street',
  'community',
  'warningStatus',
  'age',
  'birthday',
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

export function transformFileServe(minorInfo: MinorInfoT) {
  const input = { ...minorInfo };
  for (const key of ['psyCounsel', 'familyGuard', 'otherServer'] as const) {
    if (Array.isArray(input[key])) {
      input[key] = input[key].map((item) => ({
        filename: item.filename,
        name: item.name,
      }))
    }
  }
  return input;
}