export const THEME_STORAGE_KEY = "theme";

/**
 * Executado no <head> antes da pintura, para aplicar o tema salvo sem "piscar"
 * o tema errado. A escolha fica no localStorage, sem prazo de expiração.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"})()`;
