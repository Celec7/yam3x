import type { TreeViewNode } from '@registry/components/tree-view'

type Translate = (english: string, chinese: string) => string

export function workspaceNodes(t: Translate): TreeViewNode[] {
  return [
    {
      key: 0,
      label: t('Workspace', '工作区'),
      description: t('Local records', '本地记录'),
      children: [
        {
          key: 'design',
          label: t('Design', '设计'),
          children: [
            {
              key: 'brief',
              label: t('Brief', '简报'),
              description: t('Project brief', '项目简报'),
              icon: 'draft',
            },
            { key: 'tokens', label: t('Tokens', '令牌') },
            { key: 'locked', label: t('Archived', '已归档'), disabled: true },
          ],
        },
        { key: 'notes', label: t('Notes', '笔记'), description: t('Team notes', '团队笔记') },
      ],
    },
    {
      key: 'shared',
      label: t('Shared', '共享'),
      children: [
        {
          key: 'documents',
          label: t('Documents', '文档'),
          children: [
            {
              key: 'deep',
              label: t(
                'A complete document name that remains available when text is enlarged',
                '文字放大时仍然完整保留且可读取的文档名称',
              ),
              description: t('Supporting material', '补充材料'),
            },
          ],
        },
      ],
    },
    { key: 'disabled', label: t('Unavailable', '不可用'), disabled: true },
    { key: 'zebra', label: t('Zebra', '斑马') },
  ]
}

export function lazyNodes(t: Translate): TreeViewNode[] {
  return [
    { key: 'remote', label: t('Remote documents', '远端文档'), hasChildren: true },
    { key: 'more', label: t('More sources', '更多来源'), hasChildren: true },
    { key: 'saved', label: t('Saved', '已保存') },
  ]
}
