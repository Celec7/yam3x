<script setup lang="ts">
import { ref } from 'vue'
import { useDemoLocale } from './use-demo-locale'
import { LocaleProvider } from '@registry/components/localization'
import { Pagination } from '@registry/components/pagination'
import { TreeView } from '@registry/components/tree-view'
import { FileUpload } from '@registry/components/file-upload'
import { DataTable } from '@registry/components/data-table'
import { Form } from '@registry/components/form'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
const { locale: demoLocale } = useDemoLocale()
const locale = ref(demoLocale.value === 'zh' ? 'zh-CN' : 'en-US')
const page = ref(2)
</script>

<template>
  <div class="localization-demo">
    <div class="localization-demo__actions">
      <Button @click="locale = 'en-US'">English</Button>
      <Button @click="locale = 'zh-CN'">简体中文</Button>
    </div>
    <LocaleProvider :locale="locale">
      <section data-testid="locale-inherited">
        <Pagination
          v-model:page="page"
          :total="200"
        />
        <TreeView
          label="Records / 记录"
          :nodes="[]"
        />
        <FileUpload label="Attachments / 附件" />
        <DataTable
          caption="Projects / 项目"
          :rows="[]"
          :columns="[]"
          :row-key="() => 0"
        />
        <Form
          v-slot="{ fieldErrors }"
          :submit="() => undefined"
        >
          <FormField
            label="Title / 标题"
            :error="fieldErrors.title"
            width="100%"
          >
            <input
              name="title"
              required
            />
          </FormField>
          <Button type="submit">Submit / 提交</Button>
        </Form>
      </section>
      <LocaleProvider
        locale="en-US"
        :messages="{ pagination: { next: 'Continue' } }"
      >
        <section data-testid="locale-nested">
          <Pagination :total="100" />
        </section>
      </LocaleProvider>
    </LocaleProvider>
    <output data-testid="locale-page">{{ page }}</output>
  </div>
</template>

<style scoped>
.localization-demo,
.localization-demo section {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.localization-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
