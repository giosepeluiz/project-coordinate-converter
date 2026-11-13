/**
 * Executado antes da pintura, para aplicar o tema salvo sem "piscar" o tema
 * errado. Lê a configuração "cfg" (JSON) e, se não houver, a chave antiga "theme".
 */
export const themeInitScript = `(function(){var t;try{var c=JSON.parse(localStorage.getItem("cfg")||"null");t=c&&c.theme;if(!t)t=localStorage.getItem("theme")}catch(e){}var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"})()`;
