<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { makeUnionDebouncer } from "~/helpers/utils";

const route = useRoute();
const menuRef = ref();
const menuAnchor = ref();
const menuList = ref([
  {
    path: '/qa',
    title: '问卷量表',
  },
  {
    path: '/list',
    title: '参与者信息表',
  },
  {
    path: '/statics',
    title: '数据统计',
  }
]);
const menuActive = ref(-1);
let pathActive = -1;
watch(() => route.path, () => {
  const index = menuList.value.findIndex((item) => {
    return route.path.includes(item.path);
  });
  menuActive.value = index;
  pathActive = index;
}, {
  immediate: true
})
let menuItems: HTMLElement[] = [];
const menuAnchorHeight = ref(0);
const menuAnchorOffsetY = ref(0);
function updateAnchorOffset(active: number) {
  if (!menuItems.length || !menuExpanded.value) {
    return;
  }
  if (active === -1) {
    return;
  }
  const activeItem = menuItems[active];
  menuAnchorHeight.value = activeItem.clientHeight;
  menuAnchorOffsetY.value = activeItem.offsetTop;
}
watch(menuRef, (menuDom) => {
  if (!menuDom) {
    return;
  }
  menuItems = Array.from(menuDom.children);  
  updateAnchorOffset(menuActive.value);
});
watch(menuActive, (active) => {
  updateAnchorOffset(active);
});

const debounce = makeUnionDebouncer();
const debouncedUpdateAnchorOffset = debounce(updateAnchorOffset, 60);
function hoverMenuItem(index: number) {
  pathActive = menuActive.value;
  menuActive.value = index;
  debouncedUpdateAnchorOffset(index);
}
function leaveMenuItem() {
  menuActive.value = pathActive;
  debouncedUpdateAnchorOffset(menuActive.value);
}

const menuExpanded = ref(true);
const asideExpanderLabel = computed(() => menuExpanded.value ? '收起' : '展开');
function toggleMenuExpand() {
  menuExpanded.value = !menuExpanded.value;
}
async function main() {
  
}
main();
</script>

<template>
  <div class="home">
    <aside :class="{ 'close': !menuExpanded }">
      <div v-show="menuActive !== -1" ref="menuAnchor" class="menu-item__anchor"></div>
      <div class="menu-expander close-expander" @click="toggleMenuExpand">{{ asideExpanderLabel }}<span class="arrow reverse">→</span></div>
      <ul ref="menuRef" class="menu">
        <li class="menu-item" :class="{ 'highlight': menuActive === 0, 'active': menuActive === 0 }" @mouseenter="hoverMenuItem(0)" @mouseleave="leaveMenuItem">
          <RouterLink class="menu-item__link" :to="menuList[0].path">{{ menuList[0].title }}</RouterLink>
        </li>
        <li class="menu-item" :class="{ 'highlight': menuActive === 1, 'active': menuActive === 1 }" @mouseenter="hoverMenuItem(1)" @mouseleave="leaveMenuItem">
          <RouterLink class="menu-item__link" :to="menuList[1].path"
            >{{ menuList[1].title }}</RouterLink
          >
        </li>
        <li class="menu-item" :class="{ 'highlight': menuActive === 2, 'active': menuActive === 2 }" @mouseenter="hoverMenuItem(2)" @mouseleave="leaveMenuItem">
          <RouterLink class="menu-item__link" :to="menuList[2].path"
            >{{ menuList[2].title }}</RouterLink
          >
        </li>
      </ul>
    </aside>
    <article>
      <div v-if="!menuExpanded" class="menu-expander open-expander" @click="toggleMenuExpand">{{ asideExpanderLabel }}<span>→</span></div>
      <RouterView />
    </article>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  height: calc(100 * var(--vh));
}
aside {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  width: 20vw;
  background-image: linear-gradient(135deg, rgba(var(--wh-primary), 0.3), transparent);
  border-right: 1px solid rgba(var(--wh-black), 0.2);
  transition: width ease 0.2s;
  &.close {
    width: 0px;
  }
}

article {
  flex-grow: 1;
  overflow: hidden;
}
.menu {
  height: 100%;
  position: relative;
}
@mixin linkActive {
  font-weight: 700;
}
.menu-item {
  &.active {
    .menu-item__link {
      @include linkActive();
    }
  }
  &.highlight {
    .menu-item__link {
      color: rgba(var(--wh-white), 1);
    }
  }
}
.menu-item__link {
  position: relative;
  display: flex;
  padding: 16px 8px;
  color: var(--wh-color-text);
  font-size: 16px;
  line-height: 24px;
  transition: color ease 0.35s;
}
.menu-item__anchor {
  --height: v-bind(menuAnchorHeight);
  --offset-y: v-bind(menuAnchorOffsetY);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: calc(var(--height) * 1px);
  transform: translateY(calc(var(--offset-y) * 1px));
  background-color: rgba(var(--wh-brand), 0.95);
  transition: transform ease 0.35s;
}
.menu-expander {
  position: absolute;
  width: 24px;
  padding: 4px;
  padding-right: 2px;
  padding-left: 6px;
  
  transition: transform ease 0.35s;
  border: 1px solid var(--wh-color-text);
  background-color: var(--wh-color-bg-light);
  cursor: pointer;
  z-index: 2;

  &.close-expander {
    top: calc(var(--vh) * 50);
    right: 0;
    transform: translate(6px, -50%);
    border-right: none;
    border-radius: 4px 0 0 4px;
  }
  &.open-expander {
    top: calc(50 * var(--vh));
    left: 0;
    transform: translate(-6px, -50%);
    border-left: none;
    border-radius: 0 4px 4px 0;
  }
  &:hover {
    transform: translate(0, -50%);
  }
}
.arrow {
  display: block;
}
</style>
