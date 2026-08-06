import { defineStore } from 'pinia';
import { ref } from 'vue';

// Pinia store to handle the API states
export const useApiState = defineStore('apiState', () => {
    // States to manage loading, error, success, etc.
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(false);
    const errors = ref([]);
    const downloading = ref(false);
    const success = ref(false);
    const message = ref('');

    // Actions to trigger loading, saving, success, error, etc.
    const setLoading = (state) => {
        loading.value = state;
    };

    const setSaving = (state) => {
        saving.value = state;
    };

    const setError = (errorMessage) => {
        error.value = errorMessage;
    };

    const setSuccess = (state) => {
        success.value = state;
    };

    const setDownloading = (state) => {
        downloading.value = state;
    };

    const setMessage = (msg) => {
        message.value = msg;
    };


    const setErrors = (err) => {
        errors.value = err
    }

    // Reset all states
    const resetState = () => {
        loading.value = false;
        saving.value = false;
        error.value = false;
        downloading.value = false;
        success.value = false;
        message.value = '';
        errors.value = []
    };

    return {
        loading,
        saving,
        error,
        success,
        message,
        errors,
        downloading,
        setLoading,
        setSaving,
        setError,
        setErrors,
        setSuccess,
        setMessage,
        setDownloading,
        resetState,
    };
});