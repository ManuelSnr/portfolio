// Emmanuel Odoemelam - Website JavaScript

// ═══════════════════════════════════════════════════════════════
// DRAG/SWIPE UTILITY
// ═══════════════════════════════════════════════════════════════
function addDragSupport(
  element,
  onDrag,
  getCurrentIndex,
  getMaxIndex,
  threshold = 50,
  usePercentage = false,
  allowLoop = false,
) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let initialTransform = 0;
  let isVerticalScroll = false;

  function getTransformX() {
    const transform = element.style.transform || (usePercentage ? "translateX(0%)" : "translateX(0px)");
    if (usePercentage) {
      const match = transform.match(/translateX\((.+?)%\)/);
      return match ? parseFloat(match[1]) : 0;
    } else {
      const match = transform.match(/translateX\((.+?)px\)/);
      return match ? parseFloat(match[1]) : 0;
    }
  }

  function handleStart(e) {
    isDragging = true;
    isVerticalScroll = false;
    startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    currentX = startX;
    initialTransform = getTransformX();

    element.style.transition = "none";

    // Don't preventDefault for touchstart so we don't break vertical scrolling
    if (e.type.includes("mouse")) {
      e.preventDefault();
    }
  }

  function handleMove(e) {
    if (!isDragging) return;

    const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const y = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

    const deltaX = x - startX;
    const deltaY = Math.abs(y - startY);

    if (e.type.includes("touch") && !isVerticalScroll) {
      // If user scrolls vertically more than horizontally, cancel drag
      if (deltaY > Math.abs(deltaX) && Math.abs(deltaX) < 10) {
        isVerticalScroll = true;
        isDragging = false;
        element.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
        if (usePercentage) {
          element.style.transform = `translateX(${initialTransform}%)`;
        } else {
          element.style.transform = `translateX(${initialTransform}px)`;
        }
        return;
      } else if (Math.abs(deltaX) > 5) {
        // Prevent default only if clearly swiping horizontally
        e.preventDefault();
      }
    } else if (e.type.includes("mouse")) {
      e.preventDefault();
    }

    currentX = x;
    const currentIndex = getCurrentIndex();
    const maxIndex = getMaxIndex();

    // Prevent dragging out of bounds
    if (!allowLoop) {
      if (currentIndex === 0 && deltaX > 0) return;
      if (currentIndex >= maxIndex && deltaX < 0) return;
    }

    if (usePercentage) {
      const containerWidth = element.parentElement.offsetWidth;
      const percentageDelta = (deltaX / containerWidth) * 100;
      element.style.transform = `translateX(${initialTransform + percentageDelta}%)`;
    } else {
      element.style.transform = `translateX(${initialTransform + deltaX}px)`;
    }
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = currentX - startX;
    const currentIndex = getCurrentIndex();
    const maxIndex = getMaxIndex();

    element.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    if (Math.abs(deltaX) > threshold && !isVerticalScroll) {
      if (allowLoop) {
        if (deltaX > 0) onDrag("prev");
        else onDrag("next");
      } else {
        if (deltaX > 0 && currentIndex > 0) {
          onDrag("prev");
        } else if (deltaX < 0 && currentIndex < maxIndex) {
          onDrag("next");
        } else {
          if (usePercentage) element.style.transform = `translateX(${initialTransform}%)`;
          else element.style.transform = `translateX(${initialTransform}px)`;
        }
      }
    } else {
      if (usePercentage) element.style.transform = `translateX(${initialTransform}%)`;
      else element.style.transform = `translateX(${initialTransform}px)`;
    }
  }

  // Touch Events
  element.addEventListener("touchstart", handleStart, { passive: false });
  element.addEventListener("touchmove", handleMove, { passive: false });
  element.addEventListener("touchend", handleEnd);

  // Mouse Events
  element.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);

  // Prevent drag on images and links
  element.addEventListener("dragstart", (e) => e.preventDefault());
}

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

  // Immediately mark elements already in viewport as visible
  fades.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
    if (isInViewport) {
      el.classList.add("in");
    } else {
      io.observe(el);
    }
  });
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

  function playConfetti(element) {
    if (typeof lottie === "undefined") return;

    // Create a container for the confetti
    const container = document.createElement("div");
    container.style.position = "absolute";
    // Increase size so the burst looks good relative to the checkbox
    container.style.width = "120px";
    container.style.height = "120px";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
    container.style.pointerEvents = "none";
    container.style.zIndex = "10";

    element.appendChild(container);

    const animation = lottie.loadAnimation({
      container: container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "Assets/General/Confetti.json",
    });

    animation.addEventListener("complete", () => {
      animation.destroy();
      container.remove();
    });
  }

  function playPopSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) return;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("AudioContext not supported", e);
    }
  }

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
        playConfetti(box);
        playPopSound();
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

      // Get scroll target before making changes
      const tabBar = btn.closest(".tab-bar");
      if (tabBar) {
        const wrapper = tabBar.closest(".sticky-tab-wrapper");
        const nav = document.querySelector("nav");
        const navHeight = nav ? nav.getBoundingClientRect().height : 0;

        let targetTop = 0;
        if (wrapper) {
          targetTop = wrapper.getBoundingClientRect().top + window.scrollY;
        } else {
          targetTop = tabBar.getBoundingClientRect().top + window.scrollY;
        }

        const isMobile = window.innerWidth <= 640;
        const stickyOffset = isMobile ? 88 : 120;

        // Always smooth scroll to bring the section into focus
        window.scrollTo({
          top: targetTop - stickyOffset,
          behavior: 'smooth'
        });
      }

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
    // On mobile, CSS handles vertical stacking — don't apply transform
    if (window.innerWidth <= 768) {
      track.style.transform = "none";
    } else {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

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

  // Add drag/swipe support with boundary-respecting navigation (desktop only)
  if (window.innerWidth > 768) {
    addDragSupport(
      track,
      (direction) => {
        if (direction === "prev" && currentIndex > 0) {
          currentIndex--;
          updateSlider();
        } else if (direction === "next" && currentIndex < totalSlides - 1) {
          currentIndex++;
          updateSlider();
        }
        resetAutoScroll();
      },
      () => currentIndex,
      () => totalSlides - 1,
      50,
      true,
      false,
    );
  }

  // Initialize
  updateSlider();

  // Re-evaluate on resize
  window.addEventListener("resize", updateSlider);
}

// ═══════════════════════════════════════════════════════════════
// RESOURCES CAROUSEL
// ═══════════════════════════════════════════════════════════════
function initResourcesCarousel() {
  const track = document.querySelector(".resources-track");
  const prevBtn = document.querySelector(".resources-prev");
  const nextBtn = document.querySelector(".resources-next");
  const cards = document.querySelectorAll(".resource-card");

  if (!track || !prevBtn || !nextBtn || cards.length === 0) return;

  let currentIndex = 0;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getMaxIndex() {
    // On mobile: 3 positions (0, 1, 2) to show each card individually
    // On desktop: 2 positions (0, 1) to show 2 cards at a time
    return isMobile() ? cards.length - 1 : 1;
  }

  function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 16; // Gap between cards
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update button states
    const maxIndex = getMaxIndex();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
  }

  function goToNext() {
    const maxIndex = getMaxIndex();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  // Event listeners
  nextBtn.addEventListener("click", goToNext);
  prevBtn.addEventListener("click", goToPrev);

  // Add drag/swipe support
  addDragSupport(
    track,
    (direction) => {
      if (direction === "prev") {
        goToPrev();
      } else {
        goToNext();
      }
    },
    () => currentIndex,
    getMaxIndex,
  );

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      updateCarousel();
    }, 250);
  });

  // Initialize
  updateCarousel();
}

// ═══════════════════════════════════════════════════════════════
// MOMENTS CAROUSEL (Auto-sliding with navigation)
// ═══════════════════════════════════════════════════════════════
function initMomentsCarousel() {
  const carousel = document.querySelector(".moments-carousel");
  const cards = document.querySelectorAll(".moment-card");
  const prevBtn = document.querySelector(".moments-prev");
  const nextBtn = document.querySelector(".moments-next");

  if (!carousel || cards.length === 0) return;

  let currentIndex = 0;
  let autoSlideInterval;
  const autoSlideDelay = 3000; // 3 seconds
  let isHovering = false;

  function getCardWidth() {
    return cards[0].offsetWidth + 16; // card width + gap
  }

  function getVisibleCards() {
    const containerWidth = carousel.parentElement.offsetWidth;
    const cardWidth = getCardWidth();
    return Math.floor(containerWidth / cardWidth);
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCards());
  }

  function updateCarousel() {
    const offset = currentIndex * getCardWidth();
    carousel.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  }

  function updateButtons() {
    const maxIndex = getMaxIndex();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function goToNext() {
    const maxIndex = getMaxIndex();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    } else {
      // Loop back to start
      currentIndex = 0;
      updateCarousel();
    }
  }

  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
      if (!isHovering) {
        goToNext();
      }
    }, autoSlideDelay);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  // Event listeners
  prevBtn.addEventListener("click", () => {
    goToPrev();
    stopAutoSlide();
    startAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    goToNext();
    stopAutoSlide();
    startAutoSlide();
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", () => {
    isHovering = true;
  });

  carousel.addEventListener("mouseleave", () => {
    isHovering = false;
  });

  // Add drag/swipe support
  addDragSupport(
    carousel,
    (direction) => {
      if (direction === "prev") {
        goToPrev();
      } else {
        goToNext();
      }
      stopAutoSlide();
      startAutoSlide();
    },
    () => currentIndex,
    getMaxIndex,
  );

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      updateCarousel();
    }, 250);
  });

  // Initialize
  updateCarousel();
  startAutoSlide();
}

// ═══════════════════════════════════════════════════════════════
// VISION CAROUSEL NAVIGATION
// ═══════════════════════════════════════════════════════════════
function initVisionCarousel() {
  const carousel = document.querySelector(".vision-list");
  const prevBtn = document.querySelector(".vision-prev");
  const nextBtn = document.querySelector(".vision-next");

  if (!carousel || !prevBtn || !nextBtn) return;

  const items = carousel.querySelectorAll(".vision-item");
  if (items.length === 0) return;

  let currentIndex = 0;
  let maxIndex = 0;
  const itemsPerColumn = 3;
  const totalColumns = Math.ceil(items.length / itemsPerColumn);

  function updateCarousel() {
    const isMobile = window.innerWidth <= 768;
    const gap = isMobile ? 16 : 24;
    const itemWidth = items[0].offsetWidth;
    const currentColumnWidth = itemWidth + gap;

    // Calculate maxIndex dynamically based on actual width
    const visibleColumns = Math.max(1, Math.floor(carousel.parentElement.offsetWidth / currentColumnWidth));
    maxIndex = Math.max(0, totalColumns - visibleColumns);

    // Ensure currentIndex doesn't exceed maxIndex after resize
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const translateX = currentIndex * -currentColumnWidth;
    carousel.style.transform = `translateX(${translateX}px)`;

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function goToNext() {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  prevBtn.addEventListener("click", goToPrev);
  nextBtn.addEventListener("click", goToNext);

  // Add drag/swipe support
  addDragSupport(
    carousel,
    (direction) => {
      if (direction === "prev") {
        goToPrev();
      } else {
        goToNext();
      }
    },
    () => currentIndex,
    () => maxIndex,
  );

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel();
    }, 250);
  });

  // Initial update
  updateCarousel();

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (document.querySelector("#vision:hover")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    }
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
  initVisionCarousel();
  initTabs();
  initTestimonials();
  initResourcesCarousel();
  initMomentsCarousel();
  initGithubCalendar();
  initCompanyPills();
});

// ═══════════════════════════════════════════════════════════════
// COMPANY PILL EXPAND/COLLAPSE
// ═══════════════════════════════════════════════════════════════
function initCompanyPills() {
  const pills = document.querySelectorAll(".company-pill[data-company]");
  if (pills.length === 0) return;

  function closeAll() {
    document.querySelectorAll(".company-pill.expanded").forEach((pill) => {
      pill.classList.remove("expanded");
      const hero = pill.closest('.hero');
      if (hero) hero.style.zIndex = "";
    });
  }

  pills.forEach((pill) => {
    // Create container to hold the original space
    const container = document.createElement('span');
    container.className = 'company-pill-container';

    // Create invisible ghost to maintain dimensions in flow
    const ghost = document.createElement('span');
    ghost.className = 'company-pill-ghost';
    const logo = pill.querySelector('.company-pill-logo');
    const name = pill.querySelector('.company-pill-name');
    if (logo) ghost.appendChild(logo.cloneNode(true));
    if (name) ghost.appendChild(name.cloneNode(true));

    // Wrap the pill
    pill.parentNode.insertBefore(container, pill);
    container.appendChild(ghost);
    container.appendChild(pill); // pill becomes absolute inside the container

    function expandPill() {
      // Lock in the exact pixel width of the collapsed state for smooth px-to-px animation on close
      pill.style.setProperty('--collapsed-width', `${ghost.offsetWidth + 2}px`);

      // Smart placement: ensure the expanded card stays within its content container or viewport
      const rect = container.getBoundingClientRect();
      const expandedWidth = Math.min(280, window.innerWidth - 40);

      let maxRight = window.innerWidth - 20;
      let minLeft = 20;

      // Find the text container bounding it
      const contentContainer = pill.closest('.hero-body, .intro-body');
      if (contentContainer) {
        const containerRect = contentContainer.getBoundingClientRect();
        // Respect the container's right boundary, but don't exceed the viewport
        maxRight = Math.min(containerRect.right, window.innerWidth - 20);
        minLeft = Math.max(containerRect.left, 20);
      }

      let targetLeft = 0;

      if (rect.left + expandedWidth > maxRight) {
        // Shift left to prevent right overflow
        const shift = (rect.left + expandedWidth) - maxRight;
        targetLeft = -shift;

        // Guarantee it doesn't overflow the left edge either
        if (rect.left + targetLeft < minLeft) {
          targetLeft = minLeft - rect.left;
        }
      }

      // Lock EXACT pixel values for flawless Safari/cross-browser interpolation
      pill.style.setProperty('--collapsed-width', `${ghost.offsetWidth + 2}px`);
      pill.style.setProperty('--expanded-width', `${expandedWidth}px`);
      pill.style.setProperty('--detail-width', `${Math.min(248, window.innerWidth - 72)}px`);
      pill.style.setProperty('--expand-x', `${targetLeft}px`);

      pill.classList.add("expanded");

      // Ensure hero container renders above the sticky tabs while pill is open
      const hero = pill.closest('.hero');
      if (hero) hero.style.zIndex = "999";
    }

    function collapsePill() {
      pill.classList.remove("expanded");
      const hero = pill.closest('.hero');
      if (hero) hero.style.zIndex = "";
    }

    let hoverTimeout;

    pill.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          closeAll();
          expandPill();
        }, 100);
      }
    });

    pill.addEventListener("mouseleave", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        clearTimeout(hoverTimeout);
        collapsePill();
      }
    });

    pill.addEventListener("click", (e) => {
      if (e.target.closest(".pill-social-link")) return;

      if (window.matchMedia("(hover: hover)").matches) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const isOpen = pill.classList.contains("expanded");
      closeAll();

      if (!isOpen) {
        expandPill();
      }
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".company-pill")) {
      closeAll();
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// GITHUB CALENDAR
// ═══════════════════════════════════════════════════════════════
function initGithubCalendar() {
  const grids = document.querySelectorAll(".github-grid");
  if (grids.length > 0) {
    // Create tooltip element
    let tooltip = document.querySelector(".github-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "github-tooltip";
      document.body.appendChild(tooltip);
    }

    async function renderCustomGithubCalendar(username) {
      try {
        const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        if (!res.ok) throw new Error("Failed to fetch contributions");
        const data = await res.json();

        // Update titles if they exist
        const titles = document.querySelectorAll(".github-title");
        titles.forEach(title => {
          title.textContent = `${data.totalContributions} contributions in the last year`;
        });

        const days = data.contributions.flat();

        grids.forEach(grid => {
          grid.innerHTML = ""; // Clear loading state

          const wrapper = grid.closest(".github-wrapper");
          const monthsContainer = wrapper ? wrapper.querySelector(".github-months") : null;

          if (monthsContainer) monthsContainer.innerHTML = "";

          let lastMonth = -1;
          data.contributions.forEach((col) => {
            if (col.length === 0) return;
            const firstDay = new Date(col[0].date + "T00:00:00");
            const month = firstDay.getMonth();

            const monthCell = document.createElement("span");
            if (month !== lastMonth) {
              const innerSpan = document.createElement("span");
              innerSpan.textContent = firstDay.toLocaleDateString("en-US", { month: "short" });
              monthCell.appendChild(innerSpan);
              lastMonth = month;
            }
            if (monthsContainer) monthsContainer.appendChild(monthCell);
          });

          // Render boxes
          days.forEach((day, index) => {
            const box = document.createElement("div");
            box.className = "github-box";

            let level = 0;
            if (day.contributionLevel === "FIRST_QUARTILE") level = 1;
            if (day.contributionLevel === "SECOND_QUARTILE") level = 2;
            if (day.contributionLevel === "THIRD_QUARTILE") level = 3;
            if (day.contributionLevel === "FOURTH_QUARTILE") level = 4;

            box.style.backgroundColor = `var(--gh-${level})`;

            const countText = day.contributionCount === 0 ? "No" : day.contributionCount;
            const dateObj = new Date(day.date + "T00:00:00");
            const dateString = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateObj > today) {
              box.style.visibility = "hidden";
              box.style.pointerEvents = "none";
            } else {
              // Custom Tooltip events
              box.addEventListener("mouseenter", () => {
                tooltip.innerHTML = `<strong>${countText} contribution${day.contributionCount === 1 ? '' : 's'}</strong> on ${dateString}`;
                tooltip.classList.add("visible");
                const rect = box.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
                tooltip.style.top = rect.top + window.scrollY + "px";
              });
              box.addEventListener("mouseleave", () => {
                tooltip.classList.remove("visible");
              });
            }

            const colIndex = Math.floor(index / 7);
            box.style.animationDelay = `${colIndex * 0.02}s`;

            grid.appendChild(box);
          });
        });

      } catch (err) {
        console.error("Error loading custom GitHub calendar:", err);
        grids.forEach(grid => {
          grid.innerHTML = '<div class="github-loading">Could not load contributions graph.</div>';
        });
      }
    }

    renderCustomGithubCalendar("ManuelSnr");
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITION (LAB NAVIGATION)
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const labLinks = document.querySelectorAll('a[href*="lab.html"]');
  labLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.href;

      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';

      const textContainer = document.createElement('div');
      textContainer.className = 'page-transition-text';
      overlay.appendChild(textContainer);

      document.body.appendChild(overlay);

      // Force reflow
      overlay.offsetHeight;

      overlay.classList.add('active');

      const phrases = [
        "实验室",
        "Le Labo",
        "Ụlọ Nnyocha",
        "The Lab"
      ];

      // Start text sequence after 1s fill-up
      setTimeout(() => {
        textContainer.classList.add('visible');
        textContainer.innerText = phrases[0];

        let currentPhrase = 0;
        let dotCount = 0;

        const interval = setInterval(() => {
          if (currentPhrase < phrases.length - 1) {
            currentPhrase++;
            textContainer.innerText = phrases[currentPhrase];
          } else {
            clearInterval(interval);
          }
        }, 1000); // 1s per phrase

      }, 1000);

      // Navigate after fill (1s) + text cycle (3s for first 3 phrases + 400ms for the last) = 4400ms total
      setTimeout(() => {
        window.location.href = url;
      }, 4600);
    });
  });
});

// PRODUCT MODAL LOGIC
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const productsData = {
    "regirl": {
      title: "Regirl",
      range: "2023 - 2024",
      url: "https://example.com/regirl",
      desc: "An end-to-end e-commerce experience designed for modern luxury.",
      images: [
        "Assets/Projects/Regirl/Content/Cover Image.webp",
        "Assets/Projects/Regirl/Content/Cover Image.webp" // duplicate to show carousel
      ]
    },
    "theya": {
      title: "Theya",
      range: "2023 - 2024",
      url: "https://example.com/theya",
      desc: "Bitcoin's simplest self-custody app.",
      images: [
        "Assets/Projects/Theya/Content/Cover image.webp",
        "Assets/Projects/Theya/Content/Cover image.webp"
      ]
    },
    "hyper": {
      title: "Hyper",
      range: "2023 - 2024",
      url: "https://example.com/hyper",
      desc: "A fast-paced competitive mobile gaming platform.",
      images: [
        "Assets/General/reel-thumbnail.jpg"
      ]
    },
    "resource": {
      title: "UX Research Template Pack",
      range: "2024",
      url: "https://example.com/resource",
      desc: "Used by 250+ designers to streamline their research workflow.",
      images: [
        "Assets/General/resource-3.jpg"
      ]
    },
    "product5": {
      title: "Product 5",
      range: "2023",
      url: "https://example.com/product5",
      desc: "Description for Product 5.",
      images: [
        "Assets/General/resource-3.jpg"
      ]
    },
    "product6": {
      title: "Product 6",
      range: "2022",
      url: "https://example.com/product6",
      desc: "Description for Product 6.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.Used by 250+ designers to streamline their research workflow.",
      images: [
        "Assets/Projects/Regirl/Content/Cover Image.webp",
        "Assets/Projects/Theya/Content/Cover image.webp",
        "Assets/General/reel-thumbnail.jpg",
        "Assets/General/resource-3.jpg",
        "Assets/Projects/Theya/Content/Cover image.webp"
      ]
    }
  };

  const productCards = document.querySelectorAll('.product-card');
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('product-modal-close');

  if (!modal) return;

  const titleEl = document.getElementById('product-modal-title');
  const rangeEl = document.getElementById('product-modal-range');
  const descEl = document.getElementById('product-modal-desc');
  const visitBtn = document.getElementById('product-modal-visit');
  const carouselEl = document.getElementById('product-modal-carousel');
  const dotsContainer = document.getElementById('carousel-dots');

  productCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const id = card.getAttribute('data-product-id');
      if (id) {
        e.preventDefault();
        const data = productsData[id];
        if (!data) return;

        // Populate Info
        titleEl.innerText = data.title;
        rangeEl.innerText = data.range;
        descEl.innerText = data.desc;
        visitBtn.href = data.url;

        // Populate Carousel
        carouselEl.innerHTML = '';
        carouselEl.scrollLeft = 0; // Reset scroll position
        document.querySelector('.product-modal-info').scrollTop = 0; // Reset text scroll position
        dotsContainer.innerHTML = '';

        data.images.forEach((imgSrc, idx) => {
          const img = document.createElement('img');
          img.src = imgSrc;
          carouselEl.appendChild(img);

          const dot = document.createElement('div');
          dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
          dot.addEventListener('click', () => {
            carouselEl.scrollTo({
              left: carouselEl.offsetWidth * idx,
              behavior: 'smooth'
            });
          });
          dotsContainer.appendChild(dot);
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Carousel Navigation
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  prevBtn.addEventListener('click', () => {
    carouselEl.scrollBy({ left: -carouselEl.offsetWidth, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    carouselEl.scrollBy({ left: carouselEl.offsetWidth, behavior: 'smooth' });
  });

  // Update dots on scroll
  carouselEl.addEventListener('scroll', () => {
    const index = Math.round(carouselEl.scrollLeft / carouselEl.offsetWidth);
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  });
});
