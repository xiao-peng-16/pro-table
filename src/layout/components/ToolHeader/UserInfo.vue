<template>
  <el-dropdown trigger="click">
    <div class="userInfo">
      <img src="https://avatars.githubusercontent.com/u/42399487?v=4" />
      <span>追风铃</span>
    </div>
    <template #dropdown>
      <el-dropdown-item @click="loginOut">退出登录</el-dropdown-item>
    </template>
  </el-dropdown>
</template>


<script setup lang="ts" name="AppView">
  import '../../style/user-info.scss' 
  import { ref, unref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElDropdown  } from "element-plus"

  const loginOut = () => {
    alert('退出登录')
  }
</script>