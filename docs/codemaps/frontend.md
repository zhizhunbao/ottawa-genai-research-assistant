# 前端架构

**最后更新:** 2026-01-24
**框架:** Python
**入口点:** backend\app\main.py, frontend\dist\assets\index-B6hR0ryW.js, frontend\src\main.tsx, frontend\src\shared\components\ui\index.ts, frontend\src\stores\index.ts

## 项目结构

```
frontend/
  dist/
    assets/
      AnalyticsView-C9BXGsY_.js
      ChatView-DpjMYwjF.js
      DocumentUploadView-CnQcQsa8.js
      DocumentsView-B3VgFpyu.js
      HomeView-D24oThej.js
      LoginView-CGlFJgPa.js
      RegisterView-BCpJ5fXz.js
      SettingsView-DkPY23xy.js
      arrow-left-mx1H6gWc.js
      circle-check-big-CStUwwHd.js
      clsx-B-dksMZM.js
      documentsApi-CV7Mvq-T.js
      download-C6VIBWrw.js
      index-B6hR0ryW.js
      search-C2QvFCBi.js
      trending-up-6RKsb_-3.js
      triangle-alert-N__gE2FC.js
      user-ClZ4JMKx.js
  postcss.config.js
  src/
    app/
      App.tsx
    features/
      analysis/
        components/
          AnalyticsPage.tsx
        constants.ts
        hooks/
          useAnalysis.ts
        services/
          analysisApi.ts
        types.ts
        views/
          AnalyticsView.tsx
      auth/
        components/
          LoginPage.tsx
          RegisterPage.tsx
        hooks/
          useAuth.ts
          useLogin.ts
          useRegister.ts
        services/
          authApi.ts
        types.ts
        views/
          LoginView.tsx
          RegisterView.tsx
      documents/
        components/
          DocumentFilters.tsx
          DocumentList.tsx
          DocumentUploadForm.tsx
          DocumentUploadPage.tsx
          DocumentsPage.tsx
          ProcessingStatus.tsx
          UploadGuidance.tsx
        constants.ts
        hooks/
          useDocumentList.ts
          useDocumentUpload.ts
          useDocuments.ts
        services/
          documentsApi.ts
        tests/
          DocumentComponents.test.tsx
        types.ts
        views/
          DocumentUploadView.tsx
          DocumentsView.tsx
      home/
        components/
          CTASection.tsx
          FeatureSection.tsx
          Hero.tsx
          HomePage.tsx
          HowItWorksSection.tsx
        enums.ts
        hooks/
          useHomeData.ts
        views/
          HomeView.tsx
      research/
        components/
          ChatInput.tsx
          ChatPage.tsx
          ChatSidebar.tsx
          MessageItem.tsx
          MessageList.tsx
        enums.ts
        hooks/
          useChat.ts
          useDocuments.ts
        services/
          researchApi.ts
        types.ts
        views/
          ChatView.tsx
      settings/
        components/
          SettingsPage.tsx
        constants.ts
        hooks/
          useSettings.ts
        services/
          settingsApi.ts
        types.ts
        views/
          SettingsView.tsx
    i18n.ts
    main.tsx
    shared/
      components/
        layout/
          Footer.tsx
          Header.tsx
        ui/
          ActivityList.tsx
          Alert.tsx
          Button.tsx
          Card.tsx
          ErrorBoundary.tsx
          Input.tsx
          Label.tsx
          StatsCard.tsx
          index.ts
      enums.ts
      services/
        apiService.ts
      utils/
        cn.ts
    stores/
      authStore.ts
      chatStore.ts
      index.ts
    test/
      setup.ts
  tailwind.config.js
  vite.config.ts

```

## 关键组件

| 组件 | 路径 | 大小 |
|------|------|------|
| AnalyticsView-C9BXGsY_.js | frontend\dist\assets\AnalyticsView-C9BXGsY_.js | 9.5KB |
| ChatView-DpjMYwjF.js | frontend\dist\assets\ChatView-DpjMYwjF.js | 464.6KB |
| DocumentsView-B3VgFpyu.js | frontend\dist\assets\DocumentsView-B3VgFpyu.js | 12.3KB |
| DocumentUploadView-CnQcQsa8.js | frontend\dist\assets\DocumentUploadView-CnQcQsa8.js | 12.8KB |
| HomeView-D24oThej.js | frontend\dist\assets\HomeView-D24oThej.js | 33.7KB |
| LoginView-CGlFJgPa.js | frontend\dist\assets\LoginView-CGlFJgPa.js | 5.9KB |
| RegisterView-BCpJ5fXz.js | frontend\dist\assets\RegisterView-BCpJ5fXz.js | 7.4KB |
| SettingsView-DkPY23xy.js | frontend\dist\assets\SettingsView-DkPY23xy.js | 9.0KB |
| App.tsx | frontend\src\app\App.tsx | 2.4KB |
| AnalyticsPage.tsx | frontend\src\features\analysis\components\AnalyticsPage.tsx | 9.5KB |


## 数据流

用户交互 → 组件状态 → API 调用 → 数据更新 → UI 重渲染

## 外部依赖

暂无相关依赖

## 相关领域

- [后端架构](backend.md) - API 和服务层
- [数据库结构](database.md) - 数据模型
- [外部集成](integrations.md) - 第三方服务

---
*由 generate-codemaps.js 自动生成 - 2026-01-24T21:48:20.750Z*
