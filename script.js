// Emmanuel Odoemelam - Website JavaScript

// ═══════════════════════════════════════════════════════════════
// FADE-IN ON SCROLL
// ═══════════════════════════════════════════════════════════════
function initFadeInObserver() {
  const fades = document.querySelectorAll(".fade");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  fades.forEach((el) => io.observe(el));
}

// ═══════════════════════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════════════════════
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const drawer = document.querySelector(".mobile-drawer");
  const overlay = document.querySelector(".drawer-overlay");
  const drawerClose = document.querySelector(".drawer-close");

  if (!hamburger || !drawer || !overlay || !drawerClose) return;

  function openDrawer() {
    drawer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
}

// ═══════════════════════════════════════════════════════════════
// SHOWREEL FUNCTIONALITY (Homepage only)
// ═══════════════════════════════════════════════════════════════
function initShowreel() {
  const reelContainer = document.querySelector(".reel-video-wrap");
  const reelThumbnail = document.querySelector(".reel-thumbnail");
  const reelVideo = document.querySelector(".reel-video");
  const playBtn = document.querySelector(".reel-play-btn");

  if (!reelContainer || !reelVideo || !reelThumbnail || !playBtn) return;

  function playReel() {
    reelVideo.play();
    reelThumbnail.classList.add("hidden");
    playBtn.classList.add("hidden");
  }

  // Play on click
  reelContainer.addEventListener("click", playReel);

  // Auto-play immediately when video is loaded and ready
  if (reelVideo.readyState >= 3) {
    // HAVE_FUTURE_DATA or better
    setTimeout(playReel, 500); // Small delay for better UX
  } else {
    reelVideo.addEventListener(
      "canplaythrough",
      () => {
        setTimeout(playReel, 500); // Small delay for better UX
      },
      { once: true },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// VISION CHECKLIST (About page only)
// ═══════════════════════════════════════════════════════════════
function initVisionChecklist() {
  const checkboxes = document.querySelectorAll(".vision-check");
  if (checkboxes.length === 0) return;

  checkboxes.forEach((box) => {
    box.addEventListener("click", () => {
      const item = box.closest(".vision-item");
      const isDone = box.classList.contains("done");
      if (isDone) {
        box.classList.remove("done");
        item.classList.remove("done-item");
      } else {
        box.classList.add("done");
        item.classList.add("done-item");
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// TABS FUNCTIONALITY (Lab page only)
// ═══════════════════════════════════════════════════════════════
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  if (tabs.length === 0 || panels.length === 0) return;

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById("panel-" + target);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function () {
  initFadeInObserver();
  initMobileMenu();
  initShowreel();
  initVisionChecklist();
  initTabs();
});
