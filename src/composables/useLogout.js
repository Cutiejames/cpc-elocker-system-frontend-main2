// src/composables/useLogout.js
import { useRouter } from "vue-router";

export function useLogout() {
  const router = useRouter();

  const logout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/");
    }
  };

  return { logout };
}
