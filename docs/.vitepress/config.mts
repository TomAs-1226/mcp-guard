import { defineConfig } from 'vitepress';

const defaultRepo = 'TomAs-1226/mcp-guard';
const repo = process.env.DOCS_REPO ?? process.env.GITHUB_REPOSITORY ?? defaultRepo;
const [, repoName = 'mcp-guard'] = repo.split('/');
const base = process.env.DOCS_BASE ?? `/${repoName}/`;
const repoUrl = `https://github.com/${repo}`;

export default defineConfig({
  title: 'mcp-guard',
  description: 'Security auditing and policy gating for MCP servers',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#101827' }],
    ['meta', { property: 'og:title', content: 'mcp-guard docs' }],
    ['meta', { property: 'og:description', content: 'Security auditing and policy gating for MCP servers' }]
  ],
  themeConfig: {
    logo: '/brand-mark.svg',
    siteTitle: 'mcp-guard',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'CLI', link: '/cli' },
      { text: 'Testing', link: '/testing' },
      { text: 'Rules', link: '/rules' },
      { text: 'Security Model', link: '/security-model' },
      { text: 'GitHub Action', link: '/github-action' },
      { text: 'GitHub', link: repoUrl },
      { text: 'npm', link: 'https://www.npmjs.com/package/@baichen_yu/mcp-guard' }
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Landing', link: '/' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'CLI', link: '/cli' },
          { text: 'Testing', link: '/testing' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'Rules', link: '/rules' },
          { text: 'Security Model', link: '/security-model' }
        ]
      },
      {
        text: 'CI/CD',
        items: [
          { text: 'GitHub Action', link: '/github-action' },
          { text: 'Releasing', link: '/releasing' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: repoUrl }],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Built for practical MCP server audits.',
      copyright: 'MIT License'
    }
  }
});
