/*
 * doulongfei portfolio
 * 纯渐进增强：页面在没有这个脚本时也完整可读。每个功能相互隔离，
 * 单个功能出错不会影响其他功能（尤其不会让 .reveal 内容一直隐藏）。
 */
(function () {
  "use strict";

  window.__siteReady = true;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function run(name, fn, onError) {
    try {
      fn();
    } catch (error) {
      console.error("[site] " + name + " failed:", error);
      if (onError) onError();
    }
  }

  /* ---------- 入场动画 ---------- */
  function revealAll() {
    $$(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function initReveal() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .forEach(function (entry, index) {
            // 同一批进入视口的元素依次错开，而不是一起弹出
            entry.target.style.setProperty("--reveal-delay", Math.min(index, 5) * 70 + "ms");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    $$(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- 背景信号动画 ---------- */
  function initSignalCanvas() {
    var canvas = $("#signalCanvas");
    if (!canvas || reduceMotion.matches) return;
    // 样式表没加载成功时 canvas 不是 fixed 背景，别把正文挤到下面去
    if (getComputedStyle(canvas).position !== "fixed") return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var palette = ["#d8ff3e", "#4ef4ff", "#ff6f61", "#ffb238", "#9f7cff"];
    var packets = [];
    var width = 0;
    var height = 0;
    var last = 0;
    var frameId = 0;

    function seed() {
      var count = Math.round(Math.min(40, Math.max(12, width / 44)));
      packets = [];
      for (var i = 0; i < count; i += 1) {
        packets.push({
          x: Math.random() * width,
          y: Math.random() * height,
          horizontal: Math.random() > 0.5,
          speed: 0.35 + Math.random() * 1.1,
          size: 2 + Math.random() * 4,
          color: palette[i % palette.length],
        });
      }
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var nextWidth = window.innerWidth;
      var widthChanged = Math.abs(nextWidth - width) > 40;
      width = nextWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 移动端地址栏伸缩只改变高度，不重新撒点，避免画面跳动
      if (widthChanged || !packets.length) seed();
    }

    function frame(now) {
      frameId = requestAnimationFrame(frame);
      var delta = now - last;
      if (delta < 30) return; // ~30fps 足够，省电
      var step = Math.min(delta, 100) / 16.7;
      last = now;

      ctx.clearRect(0, 0, width, height);
      packets.forEach(function (p) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.75;
        if (p.horizontal) {
          ctx.fillRect(p.x, p.y, p.size * 2, p.size);
          ctx.globalAlpha = 0.2;
          ctx.fillRect(p.x - 46, p.y + p.size / 2, 42, 1);
          p.x += p.speed * step;
          if (p.x > width + 60) p.x = -60;
        } else {
          ctx.fillRect(p.x, p.y, p.size, p.size * 2);
          ctx.globalAlpha = 0.2;
          ctx.fillRect(p.x + p.size / 2, p.y - 46, 1, 42);
          p.y += p.speed * step;
          if (p.y > height + 60) p.y = -60;
        }
      });
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    frameId = requestAnimationFrame(frame);

    reduceMotion.addEventListener("change", function (event) {
      if (!event.matches) return;
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, width, height);
    });
  }

  /* ---------- 顶栏：滚动态、移动端菜单、当前章节高亮 ---------- */
  function initHeader() {
    var header = $("[data-header]");
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!header || !toggle || !nav) return;

    var ticking = false;
    function syncScrolled() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(syncScrolled);
      },
      { passive: true }
    );
    syncScrolled();

    function setOpen(open) {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 821px)").addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });

    if (!("IntersectionObserver" in window)) return;
    var links = $$('a[href^="#"]', nav);
    var sections = [$("#top")].concat(
      links.map(function (link) {
        return $(link.getAttribute("href"));
      })
    );
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      if (section) spy.observe(section);
    });
  }

  /* ---------- 项目筛选 ---------- */
  function initFilters() {
    var bar = $("[data-filter-bar]");
    if (!bar) return;
    var buttons = $$("[data-filter]", bar);
    var cards = $$(".project-card");
    var status = $("[data-filter-status]");

    function matches(card, filter) {
      return filter === "all" || card.dataset.category.split(/\s+/).indexOf(filter) !== -1;
    }

    buttons.forEach(function (button) {
      var count = cards.filter(function (card) {
        return matches(card, button.dataset.filter);
      }).length;
      $(".chip-count", button).textContent = count;
    });

    bar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      var filter = button.dataset.filter;
      var shown = 0;

      buttons.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });

      cards.forEach(function (card) {
        var visible = matches(card, filter);
        var wasHidden = card.hidden;
        card.hidden = !visible;
        if (!visible) return;
        // 重新出现的卡片重播入场动画
        if (wasHidden && card.classList.contains("is-visible") && !reduceMotion.matches) {
          card.classList.remove("is-visible");
          void card.offsetWidth;
          card.style.setProperty("--reveal-delay", Math.min(shown, 5) * 50 + "ms");
          card.classList.add("is-visible");
        }
        shown += 1;
      });

      if (status) status.textContent = "显示 " + shown + " 个项目";
    });
  }

  /* ---------- 卡片柔光跟随 ---------- */
  function initSpotlight() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".project-card, .capability-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      });
    });
  }

  /* ---------- GitHub 实时数据（失败时保留 HTML 中的静态数字） ---------- */
  function initMetrics() {
    var box = $("[data-metrics]");
    if (!box || !window.fetch || !window.Promise) return;

    var user = "doulongfei";
    var cacheKey = "gh-stats:" + user;
    var ttl = 6 * 60 * 60 * 1000;

    function readCache() {
      try {
        var cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached && Date.now() - cached.time < ttl) return cached.stats;
      } catch (error) {
        /* 隐私模式等场景下存储不可用，忽略 */
      }
      return null;
    }

    function writeCache(stats) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), stats: stats }));
      } catch (error) {
        /* 同上 */
      }
    }

    function getJSON(url) {
      var controller = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (controller) controller.abort();
      }, 8000);
      return fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller ? controller.signal : undefined,
      })
        .then(function (response) {
          if (!response.ok) throw new Error("GitHub API " + response.status);
          return response.json();
        })
        .finally(function () {
          clearTimeout(timer);
        });
    }

    function fetchStats() {
      var api = "https://api.github.com/users/" + user;
      return getJSON(api).then(function (profile) {
        var pages = Math.min(Math.ceil(profile.public_repos / 100) || 1, 5);
        var requests = [];
        for (var page = 1; page <= pages; page += 1) {
          requests.push(getJSON(api + "/repos?per_page=100&type=owner&page=" + page));
        }
        return Promise.all(requests).then(function (lists) {
          var repos = [].concat.apply([], lists);
          var languages = {};
          var stars = 0;
          var original = 0;
          repos.forEach(function (repo) {
            if (repo.language) languages[repo.language] = true;
            stars += repo.stargazers_count || 0;
            if (!repo.fork) original += 1;
          });
          return {
            repos: profile.public_repos,
            original: original,
            languages: Object.keys(languages).length,
            stars: stars,
          };
        });
      });
    }

    function render(stats) {
      Object.keys(stats).forEach(function (key) {
        var value = stats[key];
        var el = $('[data-stat="' + key + '"]', box);
        if (el && typeof value === "number" && isFinite(value) && value > 0) {
          el.textContent = value;
        }
      });
    }

    var cached = readCache();
    if (cached) {
      render(cached);
      return;
    }
    // 空闲时再请求，不和首屏的贡献图抢带宽
    var whenIdle = window.requestIdleCallback || function (callback) {
      return setTimeout(callback, 1200);
    };
    whenIdle(function () {
      fetchStats()
        .then(function (stats) {
          writeCache(stats);
          render(stats);
        })
        .catch(function (error) {
          console.info("[site] GitHub stats unavailable, keeping static values:", error.message);
        });
    });
  }

  /* ---------- 证书大图 ---------- */
  function initLightbox() {
    var dialog = $("[data-lightbox-dialog]");
    // 不支持 <dialog> 时，链接会直接打开图片
    if (!dialog || typeof dialog.showModal !== "function") return;
    var caption = $("[data-lightbox-caption]", dialog);
    var image = document.createElement("img");
    caption.parentNode.insertBefore(image, caption);
    var trigger = null;

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[data-lightbox]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      trigger = link;
      var thumb = $("img", link);
      image.src = link.href;
      image.alt = thumb ? thumb.alt : "";
      caption.textContent = link.dataset.caption || "";
      dialog.showModal();
    });

    // 点击遮罩关闭
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", function () {
      image.removeAttribute("src");
      if (trigger) trigger.focus();
    });
  }

  /* ---------- 复制邮箱 ---------- */
  function initCopy() {
    function fallbackCopy(text) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      document.body.removeChild(field);
      return ok;
    }

    $$("[data-copy]").forEach(function (button) {
      var label = button.getAttribute("aria-label");
      var timer = 0;
      button.addEventListener("click", function () {
        var text = button.dataset.copy;
        var attempt =
          navigator.clipboard && window.isSecureContext
            ? navigator.clipboard.writeText(text).then(
                function () {
                  return true;
                },
                function () {
                  return fallbackCopy(text);
                }
              )
            : Promise.resolve(fallbackCopy(text));

        attempt.then(function (ok) {
          button.classList.toggle("is-copied", ok);
          button.setAttribute("aria-label", ok ? "已复制邮箱地址" : "复制失败，请手动复制");
          clearTimeout(timer);
          timer = setTimeout(function () {
            button.classList.remove("is-copied");
            button.setAttribute("aria-label", label);
          }, 1800);
        });
      });
    });
  }

  /* ---------- Twikoo 评论：接近视口时再加载（约 600KB） ---------- */
  // 按顺序尝试多个 CDN；integrity 锁定 twikoo@1.6.39 的文件内容，
  // 任何 CDN 返回的内容被篡改都会被浏览器拒绝。升级版本时需同时更新版本号和哈希：
  //   curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
  var TWIKOO_VERSION = "1.6.39";
  var TWIKOO_INTEGRITY = "sha384-2/TAh70RaX8JpFlt9NtSVWnK5f86EMdON6ucP5R1dFhCWXaYvTLkB5yf9pp6S6+b";
  var TWIKOO_SOURCES = [
    "https://registry.npmmirror.com/twikoo/" + TWIKOO_VERSION + "/files/dist/twikoo.all.min.js",
    "https://cdn.jsdelivr.net/npm/twikoo@" + TWIKOO_VERSION + "/dist/twikoo.all.min.js",
    "https://unpkg.com/twikoo@" + TWIKOO_VERSION + "/dist/twikoo.all.min.js",
  ];

  function initComments() {
    var shell = $(".comment-shell");
    var status = $("[data-comment-status]");
    if (!shell || !status || !$("#tcomment")) return;

    var message = $("[data-comment-message]", status);
    var retry = $("[data-comment-retry]", status);
    var loading = false;

    function setState(state, text) {
      status.hidden = state === "done";
      status.classList.toggle("is-error", state === "error");
      retry.hidden = state !== "error";
      if (text) message.textContent = text;
    }

    function injectScript(src) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = src;
        script.integrity = TWIKOO_INTEGRITY;
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = function () {
          resolve();
        };
        script.onerror = function () {
          script.remove();
          reject(new Error("failed to load " + src));
        };
        document.body.appendChild(script);
      });
    }

    // 依次尝试各个源；某个源 8 秒还没加载完（被墙时常见的是挂起而不是报错）
    // 就并行启动下一个，先成功的为准
    function loadScript() {
      if (window.twikoo) return Promise.resolve();
      return new Promise(function (resolve, reject) {
        var next = 0;
        var pending = 0;
        var settled = false;

        function tryNext() {
          if (settled || next >= TWIKOO_SOURCES.length) return;
          var src = TWIKOO_SOURCES[next];
          next += 1;
          pending += 1;
          var timer = setTimeout(tryNext, 8000);
          injectScript(src).then(
            function () {
              clearTimeout(timer);
              if (settled) return;
              settled = true;
              resolve();
            },
            function () {
              clearTimeout(timer);
              pending -= 1;
              if (next < TWIKOO_SOURCES.length) {
                tryNext();
              } else if (pending === 0 && !settled) {
                settled = true;
                reject(new Error("all twikoo sources failed"));
              }
            }
          );
        }

        tryNext();
      });
    }

    function load() {
      if (loading) return;
      loading = true;
      setState("loading", "评论加载中…");

      // Twikoo 会用自身根节点替换挂载点，重试前确保挂载点存在
      if (!$("#tcomment")) {
        var mount = document.createElement("div");
        mount.id = "tcomment";
        shell.appendChild(mount);
      }

      loadScript()
        .then(function () {
          return window.twikoo.init({
            envId: "https://twikoo.doufei.eu.org/",
            el: "#tcomment",
            lang: "zh-CN",
          });
        })
        .then(function () {
          setState("done");
        })
        .catch(function (error) {
          console.error("[site] comments failed:", error);
          loading = false;
          setState("error", "评论区暂时无法加载，可以稍后重试或直接发邮件。");
        });
    }

    retry.addEventListener("click", load);

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        if (
          entries.some(function (entry) {
            return entry.isIntersecting;
          })
        ) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(shell);
  }

  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  run("reveal", initReveal, revealAll);
  run("header", initHeader);
  run("filters", initFilters);
  run("spotlight", initSpotlight);
  run("canvas", initSignalCanvas);
  run("metrics", initMetrics);
  run("lightbox", initLightbox);
  run("copy", initCopy);
  run("comments", initComments);
  run("year", initYear);

})();
