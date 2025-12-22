import { marked } from "marked";
// keep ordered
const DOCS = ["quick-start", "api"];
const THEME_KEY = "color-theme";
const root = document.documentElement;

const savedTheme = localStorage.getItem(THEME_KEY);

if (savedTheme) {
  root.style.colorScheme = savedTheme;
} else {
  root.style.colorScheme = "light dark"; // Use system preference
}

document.addEventListener("DOMContentLoaded", () => {
  // toggle light & dark
  const toggle = document.querySelector("#light-dark-icon") as HTMLElement;
  if (toggle) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", () => {
      const currentScheme = getComputedStyle(root).colorScheme;
      const isDark = currentScheme.includes("dark");
      const newTheme = isDark ? "light" : "dark";

      root.style.colorScheme = newTheme;
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }

  // shrink/open sub menu
  document.querySelectorAll(".controller").forEach((e) => {
    e.addEventListener("click", () => {
      document
        .querySelector(`#${e.getAttribute("data-control")}`)
        ?.classList.toggle("controlled-opened");
      e.querySelector("[data-controller-icon]")?.classList.toggle("reversed");
    });
  });

  //shrink/open menu
  // we need it to be positioned as if it is in the original location but actually it's not
  const menuEl = document.querySelector("#menu") as HTMLElement;
  let menuOpened = true,
    toggleMenuLeft;
  const toggleMenuEl = document.querySelector("#togglemenuicon") as HTMLElement;
  const { left, top } = toggleMenuEl.getBoundingClientRect();
  toggleMenuEl.style.position = "fixed";
  toggleMenuEl.style.top = top + "px";
  toggleMenuLeft = toggleMenuEl.style.left = left + "px";
  document.body.appendChild(toggleMenuEl);

  toggleMenuEl.addEventListener("click", () => {
    if (menuOpened) {
      toggleMenuEl.style.left = "50px";
    } else {
      toggleMenuEl.style.left = toggleMenuLeft;
    }

    menuEl.classList.toggle("menu-closed");
    toggleMenuEl.classList.toggle("reversed");
    menuOpened = !menuOpened;
  });

  document
    .querySelector("#slowimagerenderer")
    ?.addEventListener("click", () => {
      document.querySelector(
        "#slowimagecontainer"
      )!.innerHTML = `<auto-img id="lazyloadedautoimg1"
                          src="https://fastly.picsum.photos/id/200/800/600.jpg?hmac=wHrUWgaA9t7IwxTeGzmRrvvnBIMCFvJ29yZVL8dr8EE"
                          focus="27,235;452,490"
                          padding="10"
                          placeholder="data:image/png;base64,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"></auto-img>
              `;
    });

  window["AutoImgAPI"].loadAll("[data-auto-img]");
  DOCS.reverse().forEach(async (name) => {
    try {
      const response = await fetch(`./docs/${name}.md`);
      if (response.ok) {
        const content = await response.text();
        const wrapper = document.createElement("div");
        wrapper.id = `${name}-content`;
        wrapper.setAttribute("class", "fxc-ss text-left w-[80%]");
        wrapper.innerHTML = marked.parse(content) as string;
        document.querySelector("#content")?.prepend(wrapper);
        window["Prism"]?.highlightAll();
      }
    } catch (error) {
      console.warn(`Failed to load ${name}.md:`, error);
    }
  });
});
