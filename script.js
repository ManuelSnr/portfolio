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
  let currentX = 0;
  let initialTransform = 0;

  function getTransformX() {
    const transform =
      element.style.transform ||
      (usePercentage ? "translateX(0%)" : "translateX(0px)");
    if (usePercentage) {
      const match = transform.match(/translateX\((.+?)%\)/);
      return match ? parseFloat(match[1]) : 0;
    } else {
      const match = transform.match(/translateX\((.+?)px\)/);
      return match ? parseFloat(match[1]) : 0;
    }
  }

  function handleStart(e) {
    // Only allow touch events (mobile), not mouse events (desktop)
    if (e.type === "mousedown") return;

    isDragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    initialTransform = getTransformX();

    element.style.transition = "none";

    e.preventDefault();
  }

  function handleMove(e) {
    if (!isDragging || e.type === "mousemove") return;

    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const currentIndex = getCurrentIndex();
    const maxIndex = getMaxIndex();

    // For non-looping carousels, prevent dragging at boundaries
    if (!allowLoop) {
      // Prevent dragging left when at first position (index 0)
      if (currentIndex === 0 && deltaX > 0) {
        return;
      }

      // Prevent dragging right when at last position
      if (currentIndex >= maxIndex && deltaX < 0) {
        return;
      }
    }

    if (usePercentage) {
      // Convert pixel movement to percentage for testimonial carousel
      const containerWidth = element.parentElement.offsetWidth;
      const percentageDelta = (deltaX / containerWidth) * 100;
      element.style.transform = `translateX(${initialTransform + percentageDelta}%)`;
    } else {
      element.style.transform = `translateX(${initialTransform + deltaX}px)`;
    }

    e.preventDefault();
  }

  function handleEnd() {
    if (!isDragging) return;

    isDragging = false;
    const deltaX = currentX - startX;
    const currentIndex = getCurrentIndex();
    const maxIndex = getMaxIndex();

    element.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    if (Math.abs(deltaX) > threshold) {
      // For looping carousels, always allow navigation
      if (allowLoop) {
        if (deltaX > 0) {
          onDrag("prev");
        } else {
          onDrag("next");
        }
      } else {
        // Check boundaries before triggering navigation for non-looping carousels
        if (deltaX > 0 && currentIndex > 0) {
          onDrag("prev");
        } else if (deltaX < 0 && currentIndex < maxIndex) {
          onDrag("next");
        } else {
          // Snap back to current position if at boundary
          if (usePercentage) {
            element.style.transform = `translateX(${initialTransform}%)`;
          } else {
            element.style.transform = `translateX(${initialTransform}px)`;
          }
        }
      }
    } else {
      // Snap back to current position
      if (usePercentage) {
        element.style.transform = `translateX(${initialTransform}%)`;
      } else {
        element.style.transform = `translateX(${initialTransform}px)`;
      }
    }
  }

  // Only add touch events (mobile), no mouse events (desktop)
  element.addEventListener("touchstart", handleStart, { passive: false });
  element.addEventListener("touchmove", handleMove, { passive: false });
  element.addEventListener("touchend", handleEnd);

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
  const columnWidth = 320 + 24; // item width + gap
  const itemsPerColumn = 3;
  const totalColumns = Math.ceil(items.length / itemsPerColumn);
  const visibleColumns = Math.floor(
    carousel.parentElement.offsetWidth / columnWidth,
  );
  const maxIndex = Math.max(0, totalColumns - visibleColumns);

  function updateCarousel() {
    const isMobile = window.innerWidth <= 640;
    const currentColumnWidth = isMobile ? 280 + 16 : columnWidth;
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
  window.addEventListener("resize", () => {
    const isMobile = window.innerWidth <= 640;
    const currentColumnWidth = isMobile ? 280 + 16 : columnWidth;
    const newVisibleColumns = Math.floor(
      carousel.parentElement.offsetWidth / currentColumnWidth,
    );
    const newMaxIndex = Math.max(0, totalColumns - newVisibleColumns);

    if (currentIndex > newMaxIndex) {
      currentIndex = newMaxIndex;
    }

    updateCarousel();
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
});
