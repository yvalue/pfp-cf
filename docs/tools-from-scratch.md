# Tools 系统从 0 到 1 搭建指南

对标 ShipAny 的 `pages` 系统，完整说明 `tools` 系统的架构与搭建流程。

---

## 一、整体架构对比

两套系统都用同一个 block 分发机制（`getThemeBlock`），差异在于路由分组、布局 chrome、配置来源。

| | Pages | Tools |
|---|---|---|
| 路由分组 | `(landing)` | `(tools)` |
| 路由模式 | `[...slug]` 多段 catch-all | `[slug]` 单段 |
| 布局 chrome | Header + Footer | Sidebar + Topbar |
| 布局配置 | `messages/{locale}/landing.json` | `messages/{locale}/tools.json` |
| 页面配置 | `messages/{locale}/pages/{slug}.json` | `messages/{locale}/tools/{slug}.json` |
| 命名空间 | `pages.{slug}` | `tools.{slug}` |
| 页面类型 | `DynamicPage` | `ToolPage` |
| 静态 MDX 回退 | 支持 | 不支持，仅 JSON |
| Block 分发 | `getThemeBlock()` | `getThemeBlock()`，机制相同 |

---

## 二、文件结构

```
src/
├── app/[locale]/
│   └── (tools)/
│       ├── layout.tsx                        # 读取 tools.json，加载主题布局
│       └── [slug]/
│           └── page.tsx                      # 所有 tool 的统一动态路由
│
├── config/locale/messages/
│   ├── en/
│   │   ├── tools.json                        # Sidebar + Topbar 全局配置
│   │   └── tools/
│   │       └── {slug}.json                   # 每个 tool 的页面内容
│   └── zh/
│       ├── tools.json
│       └── tools/
│           └── {slug}.json
│
├── shared/types/blocks/
│   └── tools.d.ts                            # ToolPage、ToolSidebarConfig 等类型
│
└── themes/
    ├── default/
    │   ├── layouts/tools.tsx                 # Sidebar + Topbar + children 布局实现
    │   ├── blocks/
    │   │   ├── tool-sidebar.tsx              # 侧边栏 block（含移动端响应式）
    │   │   └── tool-topbar.tsx              # 顶部栏 block（面包屑 + 用户操作区）
    │   └── tools/
    │       └── dynamic-page.tsx             # Section 分发渲染器
    └── ai-pfp/
        ├── blocks/
        │   ├── tool-panel.tsx               # 核心交互 block（上传/生成/下载）
        │   ├── features-guide.tsx
        │   ├── features-accordion.tsx
        │   └── faq.tsx
        └── tools/
            └── dynamic-page.tsx            # ai-pfp 主题覆盖（可选）
```

---

## 三、搭建步骤

### Step 1：类型定义

文件：`src/shared/types/blocks/tools.d.ts`

```ts
import { UserNav } from './common';

export interface ToolNavItem {
  url: string;
  title: string;
  icon?: string;
  active?: boolean;
}

export interface ToolSidebarConfig {
  nav?: {
    items: ToolNavItem[];
  };
  primary_action?: {
    title: string;
    url?: string;
  };
}

export interface ToolTopbarBannerConfig {
  enabled?: boolean;
  id?: string;
  text: string;
  buttonText?: string;
  href?: string;
  target?: '_self' | '_blank';
  dismissedExpiryDays?: number;
}

export interface ToolTopbarConfig {
  breadcrumb_home?: string;
  current_label?: string;
  show_theme?: boolean;
  show_locale?: boolean;
  show_sign?: boolean;
  user_nav?: UserNav;
  topbanner?: ToolTopbarBannerConfig;
}

export interface ToolPage {
  title?: string;
  description?: string;
  sections?: Record<string, any>;
  show_sections?: string[];
}
```

对标 pages：pages 使用 `landing.d.ts` 的 `DynamicPage`，sections 类型为 `Record<string, Section>`；tools 的 `ToolPage.sections` 是 `Record<string, any>`，更宽松，容纳业务数据。

---

### Step 2：全局配置 JSON

文件：`src/config/locale/messages/en/tools.json`

控制所有 tool 页面共用的 Sidebar 导航和 Topbar 选项。每增加一个 tool，在 `sidebar.nav.items` 里追加一条。

```json
{
  "sidebar": {
    "nav": {
      "items": [
        {
          "url": "/professional-headshot-generator",
          "title": "Professional Headshot",
          "icon": "User"
        }
      ]
    },
    "primary_action": {
      "title": "Upgrade",
      "url": "/pricing"
    }
  },
  "topbar": {
    "breadcrumb_home": "Home",
    "show_theme": true,
    "show_locale": true,
    "show_sign": true,
    "topbanner": {
      "id": "tools-topbanner",
      "text": "New: Compare tool outputs faster with the updated workspace.",
      "buttonText": "Learn more",
      "href": "/updates",
      "target": "_self",
      "dismissedExpiryDays": 1
    },
    "user_nav": {
      "show_name": true,
      "show_credits": true,
      "show_sign_out": true,
      "items": [
        { "title": "Billing", "url": "/settings/billing", "icon": "CreditCard" }
      ]
    }
  }
}
```

对标 pages：pages 的 `landing.json` 定义 `header` / `footer`，tools 的 `tools.json` 定义 `sidebar` / `topbar`，结构完全对称。

---

### Step 3：路由 Layout

文件：`src/app/[locale]/(tools)/layout.tsx`

从 `tools.json` 读取配置，交给主题布局渲染。

```tsx
import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { getThemeLayout } from '@/core/theme';
import { LocaleDetector, TopBanner } from '@/shared/blocks/common';
import { ToolSidebarConfig, ToolTopbarConfig } from '@/shared/types/blocks/tools';

export default async function ToolsLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('tools');
  const Layout = await getThemeLayout('tools');

  const sidebar: ToolSidebarConfig = t.raw('sidebar');
  const topbar: ToolTopbarConfig = t.raw('topbar');

  return (
    <Layout sidebar={sidebar} topbar={topbar}>
      <LocaleDetector />
      {topbar.topbanner?.text && (
        <TopBanner
          enabled={topbar.topbanner.enabled}
          id={topbar.topbanner.id ?? 'tools-topbanner'}
          text={topbar.topbanner.text}
          buttonText={topbar.topbanner.buttonText}
          href={topbar.topbanner.href}
          target={topbar.topbanner.target}
          closable
          rememberDismiss
          dismissedExpiryDays={topbar.topbanner.dismissedExpiryDays ?? 1}
        />
      )}
      {children}
    </Layout>
  );
}
```

对标 pages：`(landing)/layout.tsx` 读取 `landing.json` 的 `header` / `footer`，逻辑完全对称。

---

### Step 4：动态路由页面

文件：`src/app/[locale]/(tools)/[slug]/page.tsx`

slug → 命名空间 `tools.{slug}` → 文件 `messages/{locale}/tools/{slug}.json`

```tsx
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getThemeToolPage } from '@/core/theme';
import type { ToolPage } from '@/shared/types/blocks/tools';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  try {
    const t = await getTranslations({ locale, namespace: `tools.${slug}` });
    const metadata = t.raw('metadata') as { title: string; description: string };
    return {
      title: metadata.title,
      description: metadata.description,
      alternates: {
        canonical: locale === envConfigs.locale ? `/${slug}` : `/${locale}/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const t = await getTranslations({ locale, namespace: `tools.${slug}` });
    const page = t.raw('page') as ToolPage;
    const Page = await getThemeToolPage('dynamic-page');
    return <Page locale={locale} page={page} />;
  } catch {
    notFound();
  }
}
```

对标 pages：`[...slug]/page.tsx` 先查 MDX，再查 `pages.{slug}` 命名空间；tools 只查 `tools.{slug}` 命名空间，没有 MDX 回退。

---

### Step 5：主题布局实现

文件：`src/themes/default/layouts/tools.tsx`

通过 `getThemeBlock` 动态加载 `tool-sidebar` / `tool-topbar` block，保持主题可覆盖性。

```tsx
import { ReactNode } from 'react';
import { getThemeBlock } from '@/core/theme';
import { ToolSidebarConfig as SidebarType, ToolTopbarConfig as TopbarType } from '@/shared/types/blocks/tools';

export default async function ToolsLayout({
  children,
  sidebar,
  topbar,
}: {
  children: ReactNode;
  sidebar: SidebarType;
  topbar: TopbarType;
}) {
  const Sidebar = await getThemeBlock('tool-sidebar');
  const Topbar = await getThemeBlock('tool-topbar');

  return (
    <div data-slot="tool-shell" className="bg-background text-foreground min-h-screen">
      <Sidebar sidebar={sidebar} />
      <main data-slot="tool-main" className="min-w-0 lg:pl-[240px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 md:px-6 lg:px-8">
          <Topbar topbar={topbar} />
          {children}
        </div>
      </main>
    </div>
  );
}
```

对标 pages：`layouts/landing.tsx` 用 `getThemeBlock('header')` / `getThemeBlock('footer')`，结构完全对称。

---

### Step 6：Dynamic Page 分发器

文件：`src/themes/default/tools/dynamic-page.tsx`

与 `pages/dynamic-page.tsx` 逻辑一致，区别只在接收 `ToolPage` 类型。

```tsx
import { getThemeBlock } from '@/core/theme';
import type { ToolPage } from '@/shared/types/blocks/tools';

export default async function ToolPageComponent({
  page,
  data,
}: {
  locale?: string;
  page: ToolPage;
  data?: Record<string, any>;
}) {
  const sections = await Promise.all(
    Object.keys(page.sections ?? {}).map(async (sectionKey) => {
      const section = page.sections?.[sectionKey];

      if (!section || section.disabled === true) return null;
      if (page.show_sections && !page.show_sections.includes(sectionKey)) return null;

      const block = section.block || section.id || sectionKey;

      try {
        if (section.component) return section.component;
        const DynamicBlock = await getThemeBlock(block);
        return <DynamicBlock key={sectionKey} section={section} {...(data || section.data || {})} />;
      } catch {
        return null;
      }
    })
  );

  return <>{sections}</>;
}
```

**Block 分发优先级**（与 pages 完全相同）：

1. `section.block` — 显式指定的 block 名
2. `section.id` — section 的 id
3. section key — JSON 中的键名

**`show_sections` 过滤**：指定时按数组顺序白名单渲染；省略时按 `sections` 的键顺序全量渲染。

---

### Step 7：Sidebar 和 Topbar Blocks

**tool-sidebar**：文件 `src/themes/default/blocks/tool-sidebar.tsx`

`'use client'` 组件，负责 desktop 固定侧边栏 + mobile 折叠菜单，接收 `ToolSidebarConfig`。

```tsx
'use client';
// 接收 sidebar: ToolSidebarConfig
// desktop: 固定 240px aside，含 brand / nav / footer
// mobile: sticky header + 展开菜单
export function ToolSidebar({ sidebar }: { sidebar: ToolSidebarConfig }) { ... }
```

**tool-topbar**：文件 `src/themes/default/blocks/tool-topbar.tsx`

`'use client'` 组件，通过 `usePathname()` 自动生成面包屑，右侧渲染主题切换 / 语言切换 / 用户菜单。

```tsx
'use client';
// 接收 topbar: ToolTopbarConfig
// 左侧: Home > {当前 tool 名} 面包屑
// 右侧: ThemeToggler / LocaleSelector / SignUser
export function ToolTopbar({ topbar }: { topbar: ToolTopbarConfig }) { ... }
```

---

### Step 8：为每个 Tool 创建 JSON 配置

文件：`src/config/locale/messages/en/tools/{slug}.json`

每个 tool 一个文件，`page.sections` 里每个 section 指定一个 block。

```json
{
  "metadata": {
    "title": "My AI Tool | Platform",
    "description": "SEO description."
  },
  "page": {
    "sections": {
      "generator": {
        "block": "tool-panel",
        "id": "generator",
        "title": "My AI Tool",
        "description": "Upload an image to get started.",
        "effects": [
          {
            "id": "style-a",
            "label": "Style A",
            "accentClassName": "bg-sky-300"
          }
        ],
        "images": {
          "before": { "src": "/imgs/tools/my-tool/before.jpg", "alt": "Before" },
          "after":  { "src": "/imgs/tools/my-tool/after.jpg",  "alt": "After"  }
        }
      },
      "guide": {
        "block": "features-guide",
        "id": "guide",
        "title": "How to Use",
        "items": [
          { "title": "Upload", "description": "Upload your photo." },
          { "title": "Choose", "description": "Pick a style." },
          { "title": "Download", "description": "Save the result." }
        ]
      },
      "faq": {
        "block": "faq",
        "id": "faq",
        "title": "FAQ",
        "items": [
          { "value": "faq-1", "question": "What formats?", "answer": "JPG, PNG, WebP." }
        ]
      }
    }
  }
}
```

然后在 `tools.json` 的 `sidebar.nav.items` 追加导航项：

```json
{ "url": "/my-tool", "title": "My Tool", "icon": "Wand" }
```

---

### Step 9：创建自定义交互 Block（可选）

对于需要客户端状态的 block（如 `tool-panel`），在主题 blocks 目录新建文件：

文件：`src/themes/ai-pfp/blocks/tool-panel.tsx`

```tsx
'use client';
// 接收 section: any（来自 JSON 的 generator section）
// 渲染左右分栏：左侧控制面板（上传、参数），右侧结果预览
export function ToolPanel({ section }: { section: any }) { ... }
export default ToolPanel;
```

Block 文件的导出约定：分发器先查找与 block 名对应的 PascalCase 命名导出，再查 `default` 导出，最后回退到默认主题。

| JSON `block` 值 | 文件路径 | 导出名 |
|---|---|---|
| `"tool-panel"` | `blocks/tool-panel.tsx` | `ToolPanel` 或 `default` |
| `"features-guide"` | `blocks/features-guide.tsx` | `FeaturesGuide` 或 `default` |
| `"faq"` | `blocks/faq.tsx` | `Faq` 或 `default` |

---

## 四、数据流

```
URL: /en/my-tool
        │
        ▼
(tools)/layout.tsx
  getTranslations('tools')         ← tools.json
  getThemeLayout('tools')
        │ sidebar, topbar
        ▼
  themes/default/layouts/tools.tsx
  getThemeBlock('tool-sidebar')    ← blocks/tool-sidebar.tsx
  getThemeBlock('tool-topbar')     ← blocks/tool-topbar.tsx
        │
        ▼
(tools)/[slug]/page.tsx   slug = "my-tool"
  getTranslations('tools.my-tool') ← tools/my-tool.json
  getThemeToolPage('dynamic-page')
        │ page: ToolPage
        ▼
  themes/default/tools/dynamic-page.tsx
  iterates page.sections
        │
        ├── getThemeBlock('tool-panel')       → ToolPanel block
        ├── getThemeBlock('features-guide')   → FeaturesGuide block
        └── getThemeBlock('faq')              → Faq block
```

---

## 五、检查清单

```
类型
  ☐ src/shared/types/blocks/tools.d.ts

路由
  ☐ src/app/[locale]/(tools)/layout.tsx
  ☐ src/app/[locale]/(tools)/[slug]/page.tsx

主题布局
  ☐ src/themes/default/layouts/tools.tsx
  ☐ src/themes/default/blocks/tool-sidebar.tsx
  ☐ src/themes/default/blocks/tool-topbar.tsx
  ☐ src/themes/default/tools/dynamic-page.tsx

全局配置（每次新增语言重复）
  ☐ src/config/locale/messages/en/tools.json
  ☐ src/config/locale/messages/zh/tools.json

每个 Tool（每次新增 tool 重复）
  ☐ src/config/locale/messages/en/tools/{slug}.json
  ☐ src/config/locale/messages/zh/tools/{slug}.json
  ☐ tools.json sidebar.nav.items 追加导航项
  ☐ 自定义交互 block（如需）: src/themes/{theme}/blocks/{block-name}.tsx
```
