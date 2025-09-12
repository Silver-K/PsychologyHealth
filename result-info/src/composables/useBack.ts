import { useRouter } from "vue-router";

export function useBack() {
  const router = useRouter();

  return function(path?: string) {
    if (router.options.history.state 
      && typeof router.options.history.state.position === 'number' 
      && router.options.history.state.position > 0
      && router.options.history.state.back) {
      router.back();
      return;
    }
    if (path) {
      router.push(path);
      return;
    }
    router.push('/');
  }
}