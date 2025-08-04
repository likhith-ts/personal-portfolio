import { IconType } from "react-icons";

import {
  HiChevronUp,
  HiChevronDown,
  HiChevronRight,
  HiChevronLeft,
  HiArrowUpRight,
  HiOutlineArrowPath,
  HiCheck,
  HiMiniQuestionMarkCircle,
  HiMiniXMark,
  HiOutlineLink,
  HiExclamationTriangle,
  HiInformationCircle,
  HiExclamationCircle,
  HiCheckCircle,
  HiMiniGlobeAsiaAustralia,
  HiArrowTopRightOnSquare,
  HiEnvelope,
  HiCalendarDays,
  HiClipboard,
  HiArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiMoon,
  HiSun,
  HiOutlineDocument,
  HiAcademicCap,
} from "react-icons/hi2";


import {
  PiHouseDuotone,
  PiUserCircleDuotone,
  PiGridFourDuotone,
  PiBookBookmarkDuotone,
  PiImageDuotone,
  PiCertificate,
  PiDotsNine ,
} from "react-icons/pi";

import { FaDiscord, FaGithub, FaLinkedin, FaX } from "react-icons/fa6";
import { BiSolidLike, BiLinkExternal } from "react-icons/bi";
import { IoIosChatboxes } from "react-icons/io";
import { SiLeetcode, SiHuggingface } from "react-icons/si";
import { GiAchievement } from "react-icons/gi";
import { MdWork } from "react-icons/md";
import { FaTools, FaFileDownload } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { ImNewTab } from "react-icons/im";



export const iconLibrary: Record<string, IconType> = {
  chevronUp: HiChevronUp,
  chevronDown: HiChevronDown,
  chevronRight: HiChevronRight,
  chevronLeft: HiChevronLeft,
  refresh: HiOutlineArrowPath,
  arrowUpRight: HiArrowUpRight,
  check: HiCheck,
  arrowRight: HiArrowRight,
  helpCircle: HiMiniQuestionMarkCircle,
  infoCircle: HiInformationCircle,
  warningTriangle: HiExclamationTriangle,
  errorCircle: HiExclamationCircle,
  checkCircle: HiCheckCircle,
  email: HiEnvelope,
  globe: HiMiniGlobeAsiaAustralia,
  person: PiUserCircleDuotone,
  grid: PiGridFourDuotone,
  book: PiBookBookmarkDuotone,
  close: HiMiniXMark,
  openLink: HiOutlineLink,
  calendar: HiCalendarDays,
  home: PiHouseDuotone,
  gallery: PiImageDuotone,
  discord: FaDiscord,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaX,
  clipboard: HiClipboard,
  arrowUpRightFromSquare: HiArrowTopRightOnSquare,
  moon: HiMoon,
  sun: HiSun,
  document: HiOutlineDocument,
  like:BiSolidLike,
  chat: IoIosChatboxes,
  leetcode: SiLeetcode,
  huggingFace: SiHuggingface,
  certificate: PiCertificate,
  others: PiDotsNine ,
  academicCap: HiAcademicCap,
  achievement: GiAchievement,
  work: MdWork,
  tool: FaTools,
  fileDownload: FaFileDownload,
  downloadBtn: MdFileDownload,
  newTab: ImNewTab,
  externalLink: BiLinkExternal,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;