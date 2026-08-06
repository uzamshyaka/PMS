<template>
  <div>
    <div v-if="apiState.success" class="mt-4 p-2 bg-green-100 text-green-700 text-sm rounded-lg">
      <p class="m-0">{{ apiState.message }}</p>
    </div>
    <div v-if="apiState.saving" class="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2">
      <span class="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
      <span>Processing...</span>
    </div>
    <div v-if="apiState.loading" class="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2">
      <span class="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
      <span>Loading...</span>
    </div>
    <div v-if="apiState.error" class="mt-4 p-2 bg-red-100 text-red-700 text-sm rounded-lg">
      <strong class="block">Error!</strong>
      <p class="m-0">{{ apiState.message }}</p>
    </div>
    <div v-if="apiState.errors?.length" class="mt-2">
      <ul>
        <li class="text-red-700" v-for="err in apiState.errors" :key="err">
          {{ err }}
        </li>
      </ul>
    </div>
    <div v-if="apiState.downloading" class="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2">
      <span class="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
      <span>Downloading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useApiState } from "@/stores/apiState";
const apiState = useApiState();

watch(
  async () => apiState.success,
  async (current, old) => {
    if (!current) return;
    if (apiState.errors.length) {
      apiState.setErrors([]);
    }
    setTimeout(() => {
      apiState.setSuccess(false);
      apiState.setMessage("");
    }, 3000);
  }
);

watch(
  async () => apiState.error,
  async (current, old) => {
    if (!current) return;
    setTimeout(() => {
      apiState.setError(false);
      apiState.setMessage("");
      if (apiState.errors.length) {
        apiState.setErrors([]);
      }
    }, 9000);
  }
);

watch(
  async () => apiState.loading,
  async (current, old) => {
    if (!current) return;
    if (apiState.success) {
      setTimeout(() => {
        apiState.setSuccess(false);
        apiState.setMessage("");
      }, 3000)
    }
  }
);

watch(
  async () => apiState.downloading,
  async (current, old) => {
    if (!current) return;
    if (apiState.downloading) {
      setTimeout(async () => {
        apiState.setDownloading(false);
        apiState.setMessage("");
      }, 3000);
    }
  }
);
</script>
