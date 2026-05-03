(function () {
  const canvas = document.getElementById("signalCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const packets = [];
  const palette = ["#d8ff3e", "#4ef4ff", "#ff6f61", "#ffb238", "#9f7cff"];
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedPackets();
  }

  function seedPackets() {
    packets.length = 0;
    const count = Math.max(24, Math.floor(width / 42));
    for (let index = 0; index < count; index += 1) {
      packets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        axis: Math.random() > 0.5 ? "x" : "y",
        speed: 0.45 + Math.random() * 1.4,
        size: 2 + Math.random() * 5,
        color: palette[index % palette.length],
      });
    }
  }

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(244, 247, 245, 0.035)";
    const step = width < 720 ? 32 : 44;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function animate() {
    drawGrid();
    packets.forEach((packet) => {
      ctx.fillStyle = packet.color;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(packet.x, packet.y, packet.size * 2, packet.size);
      ctx.globalAlpha = 0.22;
      if (packet.axis === "x") {
        ctx.fillRect(packet.x - 46, packet.y, 42, 1);
        packet.x += packet.speed;
        if (packet.x > width + 60) packet.x = -60;
      } else {
        ctx.fillRect(packet.x, packet.y - 46, 1, 42);
        packet.y += packet.speed;
        if (packet.y > height + 60) packet.y = -60;
      }
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  animate();

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  const filters = document.querySelectorAll(".filter-button");
  const projects = document.querySelectorAll(".project-card");

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle("active", item === button));
      projects.forEach((project) => {
        const categories = project.dataset.category.split(" ");
        project.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });

  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const sectionLinks = navLinks.filter((link) => link.getAttribute("href").startsWith("#"));
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href")));
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  sections.filter(Boolean).forEach((section) => navObserver.observe(section));

  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (window.twikoo && document.querySelector("#tcomment")) {
    window.twikoo.init({
      envId: "https://twikoo.doufei.eu.org/",
      el: "#tcomment",
      lang: "zh-CN",
    });
  }
})();
