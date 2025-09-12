export interface FileInfoT {
  name: string;
  filename: string;
}
export type FileServe = FileInfoT;
export interface TextTimeline {
  key: string;
  text: string;
}
export interface StaticFile {
  /**
   * ID
   */
  id: string;
  /**
   * 创建时间
   */
  createAt: string;
  /**
   * 索引
   */
  tag: string;
  /**
   * 指标
   */
  value: number;
  /**
   * 多个文件
   */
  files: FileServe[];
}
export interface ComposePsyData {
  /** 
   *  心理健康（综合）
   */
  synthesisPsyHealth: StaticFile[];
  /**
   * 焦虑
   */
  anxiety: StaticFile[];
  /**
   * 抑郁
   */
  depression: StaticFile[];
  /**
   * 创伤反应
   */
  traumaReaction: StaticFile[];
  /**
   * 社交焦虑
   */
  socialAnxiety: StaticFile[];
  /**
   * 智力
   */
  intellect: StaticFile[];
  /**
   * 人格
   */
  personality: StaticFile[];
  /**
   * 失眠
   */
  insomnia: StaticFile[];
  /**
   * 其他
   */
  other: StaticFile[];
}
export interface MinorInfoT {
  id: string;
  name: string;
  /**
   * 0 - 是 1 - 否
   */
  registratedWuhou: 0 | 1;
  street: string;
  community: string;
  warningStatus: 0 | 1 | 2 | 3;
  age: number;
  birthday: string;
  /**
   * 0 - 男 1 - 女
   */
  gender: 0 | 1 | 2;
  /**
   * 监护人姓名
   */
  guardianName: string;
  guardianBirthday: string;
  guardianAge: number;
  /**
   * 0 - 男 1 - 女
   */
  guardianGender: 0 | 1 | 2;
  guardianContact: string;
  relationship: string;
  tempProtect: boolean;
  school: string;
  grade: string;
  contact: string;
  detail: string;
  psyTest: ComposePsyData;
  psyCounsel: FileServe[];
  lifeEvent: string;
  focus: TextTimeline[];
  familyGuard: FileServe[];
  otherServer: FileServe[];
  serveCount: string;
}

export function calculateAge(birth: Date | string, curDate?: Date | string): number;
export function formatBirthday(birth: string): string;
export const radioLookupMap: {
  'warningStatus': ['绿', '黄', '橙', '红'],
  'gender': ['男', '女'],
  'guardianGender': ['男', '女'],
  'registratedWuhou': ['是', '否'],
};
export const StaticsLabels: {
  warningStatus: '预警状态',
  street: '街道',
  community: '社区',
  age: '年龄',
  gender: '性别',
  tempProtect: '临时庇护',
};
export function textifyData(data: Partial<MinorInfoT>, streetMap?: Record<string, string>, communityMap?: Record<string, string>): Partial<Record<keyof MinorInfoT, any>>;
export function calcAge(data: Partial<MinorInfoT>): Partial<Record<keyof MinorInfoT, any>>;