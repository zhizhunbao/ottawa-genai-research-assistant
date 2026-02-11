# US-205: Bilingual Support (i18n) - Implementation Plan

## Overview

实现英法双语界面支持，用户可以一键切换界面语言，语言偏好持久化保存。

**User Story**: US-205
**Sprint**: 4
**Story Points**: 4
**Status**: ✅ Done

---

## 需求重述

- 界面支持一键英法切换
- 所有 UI 文本通过 i18n 管理
- 查询和响应支持双语处理
- 语言偏好持久化保存

---

## 实现阶段

### 阶段 1: i18n 框架设置 (Hye Ran Yoo - 3h)

#### 1.1 安装依赖

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

#### 1.2 配置 i18n

**文件**: `frontend/src/i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import enHome from './locales/en/home.json';
import enChat from './locales/en/chat.json';
import enCommon from './locales/en/common.json';
import frHome from './locales/fr/home.json';
import frChat from './locales/fr/chat.json';
import frCommon from './locales/fr/common.json';

const resources = {
  en: {
    home: enHome,
    chat: enChat,
    common: enCommon
  },
  fr: {
    home: frHome,
    chat: frChat,
    common: frCommon
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

---

### 阶段 2: 英文翻译文件 (Hye Ran Yoo - 4h)

#### 2.1 通用翻译

**文件**: `frontend/src/locales/en/common.json`

```json
{
  "appName": "Ottawa GenAI Research Assistant",
  "loading": "Loading...",
  "error": "An error occurred",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "confirm": "Confirm",
  "close": "Close",
  "language": "Language",
  "english": "English",
  "french": "Français"
}
```

#### 2.2 首页翻译

**文件**: `frontend/src/locales/en/home.json`

```json
{
  "hero": {
    "title": "AI-Powered Research Assistant",
    "subtitle": "Query economic development reports with natural language",
    "cta": "Start Research"
  },
  "features": {
    "title": "Features",
    "naturalLanguage": {
      "title": "Natural Language Search",
      "description": "Ask questions in plain English or French"
    },
    "citations": {
      "title": "Source Citations",
      "description": "Every answer backed by verifiable sources"
    },
    "bilingual": {
      "title": "Bilingual Support",
      "description": "Full support for English and French"
    }
  }
}
```

#### 2.3 聊天翻译

**文件**: `frontend/src/locales/en/chat.json`

```json
{
  "inputPlaceholder": "Ask a question about economic development...",
  "send": "Send",
  "newChat": "New Chat",
  "history": "Chat History",
  "sources": "Sources",
  "page": "Page",
  "confidence": {
    "high": "High Confidence",
    "medium": "Medium Confidence",
    "low": "Low Confidence"
  },
  "noResults": "No relevant information found for your query.",
  "deleteConfirm": "Are you sure you want to delete this chat?",
  "downloadDocument": "Download Document"
}
```

---

### 阶段 3: 法文翻译文件 (Hye Ran Yoo - 4h)

#### 3.1 通用翻译

**文件**: `frontend/src/locales/fr/common.json`

```json
{
  "appName": "Assistant de recherche GenAI Ottawa",
  "loading": "Chargement...",
  "error": "Une erreur s'est produite",
  "save": "Enregistrer",
  "cancel": "Annuler",
  "delete": "Supprimer",
  "confirm": "Confirmer",
  "close": "Fermer",
  "language": "Langue",
  "english": "English",
  "french": "Français"
}
```

#### 3.2 首页翻译

**文件**: `frontend/src/locales/fr/home.json`

```json
{
  "hero": {
    "title": "Assistant de recherche propulsé par l'IA",
    "subtitle": "Interrogez les rapports de développement économique en langage naturel",
    "cta": "Commencer la recherche"
  },
  "features": {
    "title": "Fonctionnalités",
    "naturalLanguage": {
      "title": "Recherche en langage naturel",
      "description": "Posez des questions en français ou en anglais"
    },
    "citations": {
      "title": "Citations de sources",
      "description": "Chaque réponse appuyée par des sources vérifiables"
    },
    "bilingual": {
      "title": "Support bilingue",
      "description": "Prise en charge complète du français et de l'anglais"
    }
  }
}
```

#### 3.3 聊天翻译

**文件**: `frontend/src/locales/fr/chat.json`

```json
{
  "inputPlaceholder": "Posez une question sur le développement économique...",
  "send": "Envoyer",
  "newChat": "Nouvelle conversation",
  "history": "Historique des conversations",
  "sources": "Sources",
  "page": "Page",
  "confidence": {
    "high": "Confiance élevée",
    "medium": "Confiance moyenne",
    "low": "Confiance faible"
  },
  "noResults": "Aucune information pertinente trouvée pour votre requête.",
  "deleteConfirm": "Êtes-vous sûr de vouloir supprimer cette conversation?",
  "downloadDocument": "Télécharger le document"
}
```

---

### 阶段 4: 语言切换组件 (Hye Ran Yoo - 2h)

#### 4.1 创建语言切换器

**文件**: `frontend/src/shared/components/LanguageSwitcher.tsx`

```typescript
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // 语言偏好自动保存到 localStorage (由 i18next-browser-languagedetector 处理)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          {t('english')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          {t('french')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 4.2 集成到 Header

**文件**: `frontend/src/shared/components/layout/Header.tsx`

```typescript
import { LanguageSwitcher } from '../LanguageSwitcher';

export function Header() {
  return (
    <header className="...">
      {/* ... 其他内容 */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {/* 用户菜单 */}
      </div>
    </header>
  );
}
```

---

### 阶段 5: 语言偏好持久化 (Hye Ran Yoo - 1h)

#### 5.1 配置语言检测器

i18next-browser-languagedetector 自动处理：

- 检测顺序: localStorage → navigator (浏览器语言)
- 自动保存到 localStorage
- 页面刷新后自动恢复

**验收**:
- [x] 语言切换后刷新页面保持选择
- [x] 新用户使用浏览器默认语言

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `frontend/src/i18n.ts` | i18n 配置 |
| 新建 | `frontend/src/locales/en/common.json` | 英文通用翻译 |
| 新建 | `frontend/src/locales/en/home.json` | 英文首页翻译 |
| 新建 | `frontend/src/locales/en/chat.json` | 英文聊天翻译 |
| 新建 | `frontend/src/locales/fr/common.json` | 法文通用翻译 |
| 新建 | `frontend/src/locales/fr/home.json` | 法文首页翻译 |
| 新建 | `frontend/src/locales/fr/chat.json` | 法文聊天翻译 |
| 新建 | `frontend/src/shared/components/LanguageSwitcher.tsx` | 语言切换器 |
| 修改 | `frontend/src/shared/components/layout/Header.tsx` | 集成切换器 |
| 修改 | `frontend/src/main.tsx` | 导入 i18n |

---

## 技术规格

| 参数 | 规格 |
|------|------|
| i18n 库 | i18next + react-i18next |
| 语言检测 | i18next-browser-languagedetector |
| 支持语言 | en (英语), fr (法语) |
| 默认语言 | en |
| 持久化 | localStorage |

---

## 成功标准

- [x] 界面支持一键英法切换
- [x] 所有 UI 文本通过 i18n 管理
- [x] 语言偏好持久化保存
- [x] 刷新页面后语言保持
- [x] 所有测试通过

---

## 估算复杂度: LOW

| 部分 | 时间估算 | 状态 |
|------|----------|------|
| i18n 设置 | 3h | ✅ 完成 |
| 英文翻译 | 4h | ✅ 完成 |
| 法文翻译 | 4h | ✅ 完成 |
| 语言切换组件 | 2h | ✅ 完成 |
| 持久化 | 1h | ✅ 完成 |
| **总计** | **14h** | **100%** |
