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

  let autoplayBlocked = false;

  function playReel() {
    const playPromise = reelVideo.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Successfully playing
          reelThumbnail.classList.add("hidden");
          playBtn.classList.add("hidden");
          autoplayBlocked = false;
        })
        .catch((error) => {
          console.log("Autoplay prevented by browser:", error);
          // Autoplay was blocked, keep controls visible
          autoplayBlocked = true;
          // Make sure thumbnail and play button are visible
          reelThumbnail.classList.remove("hidden");
          playBtn.classList.remove("hidden");
        });
    }
  }

  // Play on click - this will work even if autoplay was blocked
  reelContainer.addEventListener("click", () => {
    playReel();
  });

  // Attempt auto-play immediately when video is loaded and ready
  if (reelVideo.readyState >= 3) {
    // Video is already loaded
    setTimeout(playReel, 500);
  } else {
    // Wait for video to load
    reelVideo.addEventListener(
      "canplaythrough",
      () => {
        setTimeout(playReel, 500);
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
// TESTIMONIAL CAROUSEL (Homepage only)
// ═══════════════════════════════════════════════════════════════
function initTestimonials() {
  const track = document.querySelector(".testimonial-track");
  const cards = document.querySelectorAll(".testimonial-card");
  const dotsContainer = document.querySelector(".testimonial-dots");
  const prevBtn = document.querySelector(".testimonial-prev");
  const nextBtn = document.querySelector(".testimonial-next");
  const testimonialSection = document.getElementById("testimonials");

  if (
    !track ||
    cards.length === 0 ||
    !dotsContainer ||
    !prevBtn ||
    !nextBtn ||
    !testimonialSection
  )
    return;

  let currentIndex = 0;
  const totalSlides = cards.length;
  let autoScrollInterval = null;
  const autoScrollDelay = 7000; // 7 seconds - increased from 5
  let isInView = false;

  // Create dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("button");
    dot.classList.add("testimonial-dot");
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoScroll();
    });
    dotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll(".testimonial-dot");

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update active card with smoother transition
    cards.forEach((card, index) => {
      card.classList.toggle("active", index === currentIndex);
    });

    // Update active dot
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    // Update button states - don't disable, loop instead
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
  }

  function startAutoScroll() {
    // Clear any existing interval first
    stopAutoScroll();
    // Only start if section is in view
    if (isInView) {
      autoScrollInterval = setInterval(() => {
        nextSlide();
      }, autoScrollDelay);
    }
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoScroll();
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoScroll();
  });

  // Keyboard navigation
  const handleKeydown = (e) => {
    const testimonialCards = document.querySelector("#testimonials");
    if (!testimonialCards) return;

    if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoScroll();
    }
    if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoScroll();
    }
  };

  document.addEventListener("keydown", handleKeydown);

  // Pause auto-scroll on hover
  testimonialSection.addEventListener("mouseenter", stopAutoScroll);
  testimonialSection.addEventListener("mouseleave", () => {
    if (isInView) {
      startAutoScroll();
    }
  });

  // Only start auto-scroll when testimonial section comes into view
  const testimonialObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;
        if (entry.isIntersecting) {
          startAutoScroll();
        } else {
          stopAutoScroll();
        }
      });
    },
    { threshold: 0.3 },
  );

  testimonialObserver.observe(testimonialSection);

  // Initialize
  updateSlider();
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
  initTestimonials();
});
