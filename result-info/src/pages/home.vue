<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { SYSTEM_NAME } from "~/constants/main";
import { makeUnionDebouncer } from "~/helpers/utils";
import { disposeAuth } from "~/stores/auth";

const route = useRoute();
const menuRef = ref();
const menuAnchor = ref();
const menuList = ref([
  {
    path: '/statics',
    title: '数据概览',
  },
  {
    path: '/qa',
    title: '问卷量表',
  },
  {
    path: '/list',
    title: '服务记录',
  },
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
const router = useRouter();
function exit() {
  const result = disposeAuth();
  if (result === 0) {
    router.replace('/auth');
  }
}
function reset() {
  router.push('/auth?modify_password=true');
}
</script>

<template>
  <div class="home">
    <header class="top">
      <h1 class="main-title">
        <span class="menu-icon" @click="toggleMenuExpand">
          <span class="icon icon-expand icon-bold icon-free" :title="asideExpanderLabel" :class="{ 'expanded': menuExpanded }" ></span>
        </span>        
        <span>{{ SYSTEM_NAME }}</span>
      </h1>
      <div class="system">
        <div class="system-btn" @click="reset">修改密码</div>
        <div class="system-btn" @click="exit">退出系统</div>
      </div>
    </header>
    <div class="bottom">
      <aside :class="{ 'close': !menuExpanded }">
        <div v-show="menuActive !== -1" ref="menuAnchor" class="menu-item__anchor"></div>
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
        <RouterView />
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top {
  height: var(--top-height);
  background-color: #a0aad0;
  color: var(--wh-color-text-inverse);
  border-bottom: 1px solid var(--wh-color-bg-primary);
  position: relative;
}
.system {
  position: absolute;
  display: flex;
  right: 16px;
  top: calc(var(--top-height) / 2 - 11px);
  font-size: 14px;
  line-height: 22px;
}
.system-btn {
  cursor: pointer;
  transition: color .3s ease;
  &:hover {
    color: var(--wh-color-text-hover);
  }
  + .system-btn {
    margin-left: 6px;
  }
}
.main-title {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 18px;
  padding: 0 16px;
  color: var(--wh-color-text-inverse);
}
.menu-icon {
  display: flex;
  align-items: center;
  margin-top: 4px;
  margin-right: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  height: 32px;

  transition: all .3s ease;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--wh-primary-third), 0.3);
    box-shadow: inset 1px 1px 4px 0px rgba(0,0,0,0.3);
  }
}
.icon-expand {
  display: inline-flex;
  transition: all .3s ease;

  &:not(.expanded) {
    transform: scaleX(-1);
  }
}
.bottom {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  height: calc(100 * var(--vh) - var(--top-height));
}
aside {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  width: 20vw;
  background-image: linear-gradient(180deg, var(--wh-color-primary-third) 0%, var(--wh-color-primary-fourth) 100%);
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
  padding: 12px;
}

.menu-item {
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
  color: var(--wh-color-text-inverse);
  font-size: 16px;
  line-height: 24px;
  transition: color ease 0.35s;
}
.menu-item__anchor {
  --height: v-bind(menuAnchorHeight);
  --offset-y: v-bind(menuAnchorOffsetY);
  position: absolute;
  left: 12px;
  right: 12px;
  top: calc(var(--height) * 0.05px);
  height: calc(var(--height) * 0.9px);
  transform: translateY(calc(var(--offset-y) * 1px));
  background-color: rgba(var(--wh-white), 0.1);
  border-radius: 8px;
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
