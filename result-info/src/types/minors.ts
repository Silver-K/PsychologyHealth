import type { FileInfoT } from "./file";

export type FileServe = FileInfoT;
export interface TextTimeline {
  key: string;
  text: string;
}
export interface StaticFile {
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
  street: string;
  community: string;
  warningStatus: string;
  age: number;
  /**
   * 0 - 男 1 - 女 2 - 未知
   */
  gender: 0 | 1 | 2;
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
}