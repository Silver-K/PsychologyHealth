<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus'
import type { ResetAccount, UserAccount } from '~/types/account';
import { getAuth, resetAuth } from '~/stores/auth';

const router = useRouter();
const route = useRoute();

const isLogin = computed(() => !route.query.modify_password);
const loginTitle = computed(() => isLogin.value ? '登入系统' : '修改密码');
const form = ref<UserAccount>({
  password: '',
});
const setForm = ref<ResetAccount>({
  newPassword: '',
  oldPassword: '',
})
const formRef = ref<FormInstance>();
const login = async () => {
  if (!formRef.value) {
    return;
  }
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const { success, message } = await getAuth(form.value);
    if (success) {
      await router.push('/');
      formRef.value?.resetFields();
    } else {
      ElMessage({
        message,
        type: 'error'
      });
    }
  });
}

const setFormRef = ref<FormInstance>();
const setPassword = async () => {
  if (!setFormRef.value) {
    return;
  }
  await setFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const { success, message } = await resetAuth(setForm.value);
    if (success) {
      await router.back();
      setFormRef.value?.resetFields();
    } else {
      ElMessage({
        message,
        type: 'error'
      });
    }
  });
}
const cancel = async () => {
  await router.back();
  setFormRef.value?.resetFields();
}
</script>
<template>
  <div class="authorization-page" :class="{ modify: !isLogin }">
    <div class="login-box" :class="{ modify: !isLogin }">
      <h4 class="title">{{ loginTitle }}</h4>
        <template v-if="isLogin">
          <ElForm ref="formRef" class="form" :model="form" label-width="auto" @submit.prevent>
            <ElFormItem label="" prop="password">
              <ElInput size="large" type="password" placeholder="密码" show-password v-model="form.password" @keyup.enter="login"></ElInput>
            </ElFormItem>
          </ElForm>
        </template>
        <template v-else>
          <ElForm ref="setFormRef" class="form" :model="setForm" label-width="auto" @submit.prevent>
            <ElFormItem label="" prop="oldPassword">
              <ElInput size="large" type="password" placeholder="旧密码" show-password v-model="setForm.oldPassword" @keyup.enter="setPassword"></ElInput>
            </ElFormItem>
            <ElFormItem label="" prop="newPassword">
              <ElInput size="large" type="password" placeholder="新密码" show-password v-model="setForm.newPassword" @keyup.enter="setPassword"></ElInput>
            </ElFormItem>
          </ElForm>
        </template>
      <div class="btns">
        <template v-if="isLogin">
          <ElButton size="large" class="login-btn" plain @click.prevent="login">进入系统</ElButton>
        </template>
        <template v-else>
          <ElButton size="large" class="confirm-btn" type="primary" @click="setPassword">确认修改</ElButton>
          <ElButton size="large" class="cancel-btn" @click="cancel">放弃修改</ElButton>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.authorization-page {
  background-image: url(~/assets/imgs/kvt.webp);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  height: calc(100 * var(--vh));
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.login-box {
  margin-top: calc(28 * var(--vh));
  width: 520px;
  height: 260px;
  border-radius: 16px;
  box-shadow: -2px -4px 16px 4px rgba(var(--wh-black), 0.2) inset, 2px 4px 16px 0px rgba(var(--wh-white), 0.2);
  background-color: rgba(255,255,255,.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(var(--wh-white), 0.2);

  &.modify {
    height: 300px;
  }
}
.title {
  text-align: center;
  font-size: 32px;
  line-height: 48px;
  margin-top: 24px;
  color: rgba(var(--wh-white), .8);
  text-shadow: 0px 2px 16px rgba(0,171,243, .4);
}
.form {
  margin-top: 18px;
  margin-left: 54px;
  margin-right: 54px;
}
.btns {
  margin-top: 24px;
  margin-left: 54px;
  margin-right: 54px;
  text-align: center;
  display: flex;
}
.login-btn {
  display: flex;
  width: 100%;
  --el-button-text-color: rgba(var(--wh-black), .8);
  --el-button-bg-color: rgba(var(--wh-white), 0.75);
  --el-button-hover-bg-color: rgba(var(--wh-primary), 0.75);
  --el-button-hover-text-color: rgba(var(--wh-white), 0.95);
  --el-button-hover-border-color: rgba(var(--wh-white), 0.75);
  --el-button-active-border-color: rgba(var(--wh-white), 0.75);
}
</style>