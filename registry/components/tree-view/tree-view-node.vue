<script setup lang="ts">
import { computed, inject } from 'vue'
import CheckboxBase from '../checkbox/checkbox-base.vue'
import Icon from '../icon/icon.vue'
import LinearProgressIndicator from '../progress-indicator/linear-progress-indicator.vue'
import { vRipple } from '../_shared/ripple'
import { treeViewKey } from './tree-view.context'
import type { TreeViewNode } from './tree-view.types'
const props = defineProps<{ node: TreeViewNode }>()
defineSlots<{ leading?(scope: { node: TreeViewNode; expanded: boolean }): unknown }>()
const ctx = inject(treeViewKey)!
const record = computed(() => ctx.records.value.get(props.node.key)!)
const expanded = computed(() => ctx.expanded.value.has(props.node.key))
const selected = computed(() => ctx.selected.value.has(props.node.key))
const disabled = computed(() => ctx.disabled.value || record.value.disabled)
const checking = computed(() => ctx.checking.value && props.node.checkable !== false)
const state = computed(() => ctx.checkState(props.node))
const load = computed(() => ctx.loadState(props.node.key))
const canSelect = computed(
  () => ctx.selectionMode.value !== 'none' && props.node.selectable !== false,
)
function onBeforeBranchLeave(element: Element) {
  element.setAttribute('inert', '')
  element.setAttribute('aria-hidden', 'true')
}
function onBeforeBranchEnter(element: Element) {
  element.removeAttribute('inert')
  element.removeAttribute('aria-hidden')
}
</script>

<template>
  <li
    :ref="(element) => ctx.register(node.key, element)"
    v-ripple
    data-yam3x-ripple
    data-yam3x-ripple-role="button"
    data-yam3x-ripple-target=":scope > .yam3x-tree-view__row"
    data-yam3x-ripple-container-target=":scope > .yam3x-tree-view__row"
    role="treeitem"
    class="yam3x-tree-view__item"
    :data-tree-key="node.key"
    :tabindex="ctx.focused.value === node.key ? 0 : -1"
    :aria-labelledby="ctx.labelId(node.key)"
    :aria-describedby="node.description ? `${ctx.labelId(node.key)}-description` : undefined"
    :aria-level="record.level"
    :aria-posinset="record.position"
    :aria-setsize="record.size"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-expanded="ctx.branch(node) ? expanded : undefined"
    :aria-selected="canSelect ? selected : undefined"
    :aria-checked="
      checking && ctx.selectionMode.value === 'none'
        ? state === 'indeterminate'
          ? 'mixed'
          : state === 'checked'
        : undefined
    "
    @pointerdown.stop
    @focus.self="ctx.focused.value = node.key"
    @keydown.self.stop="ctx.keydown($event, node)"
  >
    <div
      class="yam3x-tree-view__row"
      :class="{
        'yam3x-tree-view__row--selected': selected,
        'yam3x-tree-view__row--disabled': disabled,
      }"
      :style="{
        '--_yam3x-tree-view-level': record.level,
        '--_yam3x-tree-view-check-space': checking ? '56px' : '0px',
        '--_yam3x-tree-view-leading-space': $slots.leading || node.icon ? '32px' : '0px',
      }"
      @click="ctx.activate(node)"
    >
      <button
        v-if="ctx.branch(node)"
        v-ripple
        data-yam3x-ripple
        type="button"
        tabindex="-1"
        class="yam3x-tree-view__disclosure"
        :disabled="disabled"
        :aria-label="
          expanded ? ctx.messages.value.collapse(node.label) : ctx.messages.value.expand(node.label)
        "
        :aria-expanded="expanded"
        @pointerdown.stop
        @keydown.stop
        @click.stop="ctx.toggle(node)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          class="yam3x-tree-view__chevron"
          :class="{ 'yam3x-tree-view__chevron--expanded': expanded }"
        >
          <path d="m9 6 6 6-6 6" />
        </svg></button
      ><span
        v-else
        class="yam3x-tree-view__disclosure-space"
        aria-hidden="true"
      />
      <span
        v-if="checking"
        class="yam3x-tree-view__check-target"
        @pointerdown.stop
        @keydown.stop
        @click.stop="ctx.selectionMode.value === 'none' && ctx.check(node)"
      >
        <CheckboxBase
          class="yam3x-tree-view__check"
          :label="ctx.messages.value.check(node.label)"
          :state="state"
          :initial-state="state"
          :disabled="disabled"
          :input-tabindex="-1"
          :inert="ctx.selectionMode.value === 'none' ? true : undefined"
          :aria-hidden="ctx.selectionMode.value === 'none' ? 'true' : undefined"
          @click.stop="ctx.check(node, $event.currentTarget as HTMLInputElement)"
        />
      </span>
      <span
        v-if="$slots.leading || node.icon"
        class="yam3x-tree-view__leading"
        aria-hidden="true"
      >
        <slot
          name="leading"
          :node="node"
          :expanded="expanded"
          ><Icon :name="node.icon"
        /></slot>
      </span>
      <span class="yam3x-tree-view__text"
        ><span
          :id="ctx.labelId(node.key)"
          class="yam3x-tree-view__label"
          >{{ node.label }}</span
        >
        <span
          v-if="node.description"
          :id="`${ctx.labelId(node.key)}-description`"
          class="yam3x-tree-view__metadata"
          >{{ node.description }}</span
        >
      </span>
    </div>
    <Transition
      name="yam3x-tree-view-branch"
      @before-enter="onBeforeBranchEnter"
      @before-leave="onBeforeBranchLeave"
    >
      <div
        v-if="expanded && (ctx.branch(node) || load)"
        class="yam3x-tree-view__branch"
      >
        <div class="yam3x-tree-view__branch-clip">
          <div
            v-if="load"
            class="yam3x-tree-view__feedback"
            :style="{ '--_yam3x-tree-view-level': record.level }"
          >
            <template v-if="load === 'loading'"
              ><p role="status">{{ ctx.messages.value.loading(node.label) }}</p>
              <LinearProgressIndicator
                mode="indeterminate"
                :aria-label="ctx.messages.value.loading(node.label)"
            /></template>
            <template v-else-if="load === 'error'"
              ><p role="alert">{{ ctx.messages.value.failure }}</p>
              <button
                v-ripple
                data-yam3x-ripple
                type="button"
                tabindex="-1"
                class="yam3x-tree-view__retry"
                :disabled="disabled"
                :aria-label="ctx.messages.value.retry(node.label)"
                @pointerdown.stop
                @keydown.stop
                @click.stop="ctx.retry(node)"
              >
                {{ ctx.messages.value.retryText }}
              </button></template
            >
            <p
              v-else
              role="status"
            >
              {{ ctx.messages.value.emptyBranch }}
            </p>
          </div>
          <ul
            v-if="ctx.branch(node)"
            role="group"
            class="yam3x-tree-view__group"
            :aria-busy="load === 'loading' ? 'true' : undefined"
          >
            <TreeViewNode
              v-for="child in ctx.children(node) ?? []"
              :key="child.key"
              :node="child"
            >
              <template
                v-if="$slots.leading"
                #leading="scope"
                ><slot
                  name="leading"
                  v-bind="scope"
              /></template>
            </TreeViewNode>
          </ul>
        </div>
      </div>
    </Transition>
  </li>
</template>
