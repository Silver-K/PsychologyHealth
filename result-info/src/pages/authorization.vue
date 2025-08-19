<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus'
import type { UserAccount } from '~/types/account';
import { getAuth } from '~/stores/auth';

const router = useRouter();
const form = ref<UserAccount>({
  username: '',
  password: '',
});
const formRules = {
  username: [
    {
      required: true,
      message: '用户名不能为空',
      trigger: 'change',
    }
  ],
  password: [
    {
      required: true,
      message: '密码不能为空',
      trigger: 'change',
    }
  ]
}
const formRef = ref<FormInstance>();
const login = async () => {
  if (!formRef.value) {
    return;
  }
  await formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    const fail = getAuth(form.value);
    if (!fail) {
      formRef.value?.resetFields();
      router.push('/');
    } else {
      ElMessage({
        message: '用户名或密码有误，无法进入系统',
        type: 'error'
      });
    }
  });
}
</script>
<template>
  <div class="authorization-page">
    <div class="login-box">
      <h4 class="title">登录</h4>
      <ElForm ref="formRef" class="form" :model="form" :rules="formRules" label-width="auto">
        <ElFormItem label="" prop="username">
          <ElInput size="large" placeholder="用户名" v-model="form.username" @keyup.enter="login"></ElInput>
        </ElFormItem>
        <ElFormItem label="" prop="password">
          <ElInput size="large" type="password" placeholder="密码" show-password v-model="form.password" @keyup.enter="login"></ElInput>
        </ElFormItem>
      </ElForm>
      <div class="btns">
        <ElButton size="large" class="login-btn" type="primary" @click="login">进入系统</ElButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.authorization-page {
  background-image: linear-gradient(170deg, rgba(var(--wh-brand), 0.3) 40%, transparent);
  height: calc(100 * var(--vh));
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.login-box {
  margin-top: calc(28 * var(--vh));
  width: 520px;
  height: 300px;
  border-radius: 16px;
  box-shadow: -2px -4px 16px 4px rgba(var(--wh-black), 0.2) inset, 2px 4px 16px 0px rgba(var(--wh-black), 0.2);
  background-color: var(--wh-color-bg);
}
.title {
  text-align: center;
  font-size: 32px;
  line-height: 48px;
  margin-top: 24px;
  color: rgba(var(--wh-black), 0.75);
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
}
.login-btn {
  display: flex;
  width: 100%;
}
</style>