document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".canvas-item");
  const toggleBtn = document.getElementById("layout-toggle");

  // Free-roaming canvas states
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Canvas offset
  let targetCanvasX = 0;
  let targetCanvasY = 0;
  let currentCanvasX = 0;
  let currentCanvasY = 0;

  // Config
  const dragFriction = 0.08;
  const layoutTransitionSpeed = 0.04;
  const minimap = document.getElementById("minimap");
  const minimapDots = document.getElementById("minimap-dots");
  const minimapUser = document.getElementById("minimap-user");
  const dragInstructions = document.querySelector(".drag-instructions");
  const spreadXY = 7000;
  let layoutState = 'random'; // Default to explore mode

  // Pre-calculate positions for both states
  const positions = [];

  // Cylinder Config (Arranged)
  const radius = 850; // Distance from center
  const itemsPerRow = 10;
  const angleStep = 360 / itemsPerRow;
  const rowSpacing = 400;

  // Calculate total rows for vertical wrapping
  const totalItems = items.length;
  const rowCount = Math.ceil(totalItems / itemsPerRow);
  const totalCylinderHeight = rowCount * rowSpacing;

  items.forEach((item, index) => {
    // Determine bounds for random scattering
    const spreadZ = 3500;

    // Arranged (Cylinder) coords
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const arrangedAngle = col * angleStep;

    // Center rows vertically around 0
    const centerOffset = (rowCount - 1) / 2;
    const arrangedY = (row - centerOffset) * rowSpacing;

    // Spread further for more items
    const randomX = (Math.random() - 0.5) * spreadXY;
    const randomY = (Math.random() - 0.5) * spreadXY;
    // Push Z backwards so items don't get too close to the camera (which causes massive perspective scaling)
    const randomZ = -(Math.random() * spreadZ) - 200; // -200 to -3700

    // Create minimap dot
    const dot = document.createElement("div");
    dot.className = "minimap-dot";
    minimapDots.appendChild(dot);

    // Parallax speed based on Z depth (closer = faster, further = slower)
    // Map Z (-200 to -3700) to parallax (1.0 to 0.2)
    const zRatio = (Math.abs(randomZ) - 200) / 3500;
    const parallaxSpeed = 1.0 - (zRatio * 0.8);

    const itemData = {
      element: item,
      mapDot: dot, // link minimap dot
      parallax: parallaxSpeed, // for X/Y pan in random mode

      // Target states
      arranged: { tx: 0, ty: arrangedY, ry: arrangedAngle, tz: -radius },
      random: { tx: randomX, ty: randomY, ry: 0, tz: randomZ },

      // Initialize items slightly pushed back in their random locations so they subtly drift forward on load
      current: {
        tx: randomX,
        ty: randomY,
        ry: 0,
        tz: randomZ - 400
      }
    };

    item.itemData = itemData;
    positions.push(itemData);
  });

  // Toggle Logic
  toggleBtn.addEventListener("click", () => {
    if (layoutState === 'arranged') {
      layoutState = 'random';
      toggleBtn.classList.add("random");
      minimap.classList.add("active");
      if (dragInstructions) dragInstructions.classList.add("random");
    } else {
      layoutState = 'arranged';
      toggleBtn.classList.remove("random");
      minimap.classList.remove("active");
      if (dragInstructions) dragInstructions.classList.remove("random");

      // Reset camera view back to default center
      targetCanvasX = 0;
      targetCanvasY = 0;
    }
  });

  // Modal Elements
  const modal = document.getElementById("lab-modal");
  const modalClose = document.getElementById("modal-close");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalMediaContainer = document.getElementById("modal-media-container");
  const modalLabel = document.getElementById("modal-label");
  const modalType = document.getElementById("modal-type");
  const modalSpinner = document.getElementById("modal-spinner");

  // Exit Transition Logic
  const backBtn = document.querySelector(".lab-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = backBtn.href;

      const overlay = document.createElement("div");
      overlay.className = "lab-exit-overlay";
      document.body.appendChild(overlay);

      // Force reflow
      overlay.offsetHeight;

      overlay.classList.add("active");

      // Navigate to Home after the 1s top-to-bottom wipe covers the screen
      setTimeout(() => {
        window.location.href = url;
      }, 1000);
    });
  }

  const openModal = (item) => {
    modalSpinner.classList.add('active'); // Show spinner

    // Extract media
    const media = item.querySelector('.visual-media');
    if (media) {
      modalMediaContainer.innerHTML = media.outerHTML;
      const modalMediaElem = modalMediaContainer.firstElementChild;

      // Handle loading state
      if (modalMediaElem.tagName === 'IMG') {
        modalMediaElem.removeAttribute('loading'); // ensure it loads instantly

        if (modalMediaElem.complete && modalMediaElem.naturalHeight !== 0) {
          modalSpinner.classList.remove('active');
        } else {
          modalMediaElem.addEventListener('load', () => modalSpinner.classList.remove('active'));
        }
      } else if (modalMediaElem.tagName === 'VIDEO') {
        if (modalMediaElem.readyState >= 3) {
          modalSpinner.classList.remove('active');
        } else {
          modalMediaElem.addEventListener('canplay', () => modalSpinner.classList.remove('active'));
        }
        modalMediaElem.play();
      }
    }

    // Extract text
    const label = item.querySelector('.visual-label');
    const type = item.querySelector('.visual-type');
    modalLabel.textContent = label ? label.textContent : '';
    modalType.textContent = type ? type.textContent : '';

    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => {
      modalMediaContainer.innerHTML = ''; // clear media
    }, 300);
  };

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // Drag Interactions
  let draggingItem = null;

  const onPointerDown = (e) => {
    if (e.target.closest('.lab-ui') || e.target.closest('.lab-modal')) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (layoutState === 'random') {
      const itemNode = e.target.closest('.canvas-item');
      if (itemNode && itemNode.itemData) {
        draggingItem = itemNode.itemData;

        window.startItemX = clientX;
        window.startItemY = clientY;
        window.initialRandomTX = draggingItem.random.tx;
        window.initialRandomTY = draggingItem.random.ty;

        // Elevate item slightly while dragging
        draggingItem.element.style.zIndex = 100;
        document.body.classList.add('is-dragging');
        return;
      }
    }

    isDragging = true;
    document.body.classList.add('is-dragging');
    targetCanvasZ = -300; // Deep push back when grabbed

    const panMultiplier = window.innerWidth <= 768 ? 2.5 : 1.5;
    startX = clientX - (targetCanvasX / panMultiplier);
    startY = clientY - (targetCanvasY / panMultiplier);

    window.startClientX = clientX;
    window.startClientY = clientY;
  };

  const onPointerMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (draggingItem) {
      const deltaX = clientX - window.startItemX;
      const deltaY = clientY - window.startItemY;

      // Compensate for mobile scale if needed, but 1.5x speed feels good for throwing cards
      draggingItem.random.tx = window.initialRandomTX + deltaX * 1.5;
      draggingItem.random.ty = window.initialRandomTY + deltaY * 1.5;
      return;
    }

    if (!isDragging) return;

    const panMultiplier = window.innerWidth <= 768 ? 2.5 : 1.5;
    targetCanvasX = (clientX - startX) * panMultiplier;
    targetCanvasY = (clientY - startY) * panMultiplier;
  };

  const onPointerUp = (e) => {
    if (draggingItem) {
      draggingItem.element.style.zIndex = '';
      document.body.classList.remove('is-dragging');

      if (e && window.startItemX !== undefined) {
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const dist = Math.abs(clientX - window.startItemX) + Math.abs(clientY - window.startItemY);

        if (dist < 10) {
          openModal(draggingItem.element);
        }
      }
      draggingItem = null;
      return;
    }

    isDragging = false;
    document.body.classList.remove('is-dragging');
    targetCanvasZ = 0; // Snap back

    if (e && window.startClientX !== undefined) {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const dist = Math.abs(clientX - window.startClientX) + Math.abs(clientY - window.startClientY);

      if (dist < 10) {
        const item = e.target.closest('.canvas-item');
        if (item) {
          openModal(item);
        }
      }
    }
  };

  window.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("mouseleave", onPointerUp);

  window.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);

  const onWheel = (e) => {
    if (modal.classList.contains('active')) return;
    e.preventDefault();

    targetCanvasX -= e.deltaX * 0.5;
    targetCanvasY -= e.deltaY * 0.5;
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  const dragCanvas = document.getElementById("drag-canvas");
  let currentCameraRotateX = 0;

  let targetCanvasZ = 0;
  let currentCanvasZ = 0;

  // Render Loop
  function render() {
    // Lerp Global Drag values
    currentCanvasX += (targetCanvasX - currentCanvasX) * dragFriction;
    currentCanvasY += (targetCanvasY - currentCanvasY) * dragFriction;
    currentCanvasZ += (targetCanvasZ - currentCanvasZ) * dragFriction;

    let targetCameraRotateX = 0;

    // Render each item
    positions.forEach(itemData => {
      // Determine target local properties based on state
      const target = layoutState === 'arranged' ? itemData.arranged : itemData.random;

      // Lerp local properties for smooth layout transitions
      itemData.current.tx += (target.tx - itemData.current.tx) * layoutTransitionSpeed;
      itemData.current.ty += (target.ty - itemData.current.ty) * layoutTransitionSpeed;
      itemData.current.ry += (target.ry - itemData.current.ry) * layoutTransitionSpeed;
      itemData.current.tz += (target.tz - itemData.current.tz) * layoutTransitionSpeed;

      // Final properties combining global drag and local position
      let finalTX = itemData.current.tx;
      let finalTY = itemData.current.ty;
      let finalRY = itemData.current.ry;
      let finalTZ = itemData.current.tz;

      if (layoutState === 'arranged') {
        // Dragging in arranged mode: X rotates the cylinder
        finalRY += currentCanvasX * -0.2;

        // Vertical drag tilts the camera (applied globally outside loop)
        targetCameraRotateX = Math.max(-25, Math.min(25, currentCanvasY * -0.1));

      } else {
        // Dragging in random mode: X and Y pan the view, enhanced by item parallax
        finalTX += currentCanvasX * itemData.parallax;
        finalTY += currentCanvasY * itemData.parallax;

        // Update minimap red dot position relative to the camera (endless radar effect)
        if (itemData.mapDot) {
          // Calculate relative position (where it is on screen basically)
          const relX = itemData.current.tx + currentCanvasX;
          const relY = itemData.current.ty + currentCanvasY;

          const px = (relX / spreadXY) * 100 + 50;
          const py = (relY / spreadXY) * 100 + 50;
          itemData.mapDot.style.left = `${px}%`;
          itemData.mapDot.style.top = `${py}%`;
        }
      }

      itemData.element.style.transform = `translateX(${finalTX}px) translateY(${finalTY}px) rotateY(${finalRY}deg) translateZ(${finalTZ}px)`;
    });

    // Apply global camera tilt and responsive scale, plus the Z push-back interaction
    const mobileScale = window.innerWidth <= 768 ? 0.55 : 1;
    currentCameraRotateX += (targetCameraRotateX - currentCameraRotateX) * dragFriction;
    dragCanvas.style.transform = `scale(${mobileScale}) translateZ(${currentCanvasZ}px) rotateX(${currentCameraRotateX}deg)`;

    requestAnimationFrame(render);
  }

  render();
});
