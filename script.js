const header = document.querySelector("[data-header]");
const form = document.querySelector(".booking-form");
const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector("[data-modal-close]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = form?.querySelector("[type='submit']");
const phoneInput = document.querySelector("#phone");
let lastFocusedElement = null;

const phonePattern = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

const updateHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

const initSlider = () => {
  const slider = document.querySelector(".gallery__slider");
  const wrapper = slider?.querySelector(".swiper-wrapper");
  const slides = wrapper ? [...wrapper.querySelectorAll(".swiper-slide")] : [];
  const prevButton = document.querySelector(".slider-button--prev");
  const nextButton = document.querySelector(".slider-button--next");
  const pagination = document.querySelector(".gallery__pagination");

  if (!slider || !wrapper || slides.length === 0 || !prevButton || !nextButton || !pagination) {
    return;
  }

  let activeIndex = 0;
  let slidesPerView = 1;
  let gap = 0;
  let startX = 0;

  const getMaxIndex = () => Math.max(slides.length - slidesPerView, 0);

  const updatePagination = () => {
    const maxIndex = getMaxIndex();
    const dotsCount = maxIndex + 1;

    if (pagination.children.length !== dotsCount) {
      pagination.replaceChildren();

      for (let index = 0; index < dotsCount; index += 1) {
        const dot = document.createElement("button");
        dot.className = "swiper-pagination-bullet";
        dot.type = "button";
        dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
        dot.addEventListener("click", () => {
          activeIndex = index;
          updateSlider();
        });
        pagination.append(dot);
      }
    }

    [...pagination.children].forEach((dot, index) => {
      dot.classList.toggle("swiper-pagination-bullet-active", index === activeIndex);
    });
  };

  const updateSlider = () => {
    const slideWidth = (slider.clientWidth - gap * (slidesPerView - 1)) / slidesPerView;

    activeIndex = Math.min(Math.max(activeIndex, 0), getMaxIndex());
    wrapper.style.gap = `${gap}px`;
    wrapper.style.transform = `translateX(${-activeIndex * (slideWidth + gap)}px)`;

    slides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
    });

    updatePagination();
  };

  const setDirection = (step) => {
    activeIndex += step;

    if (activeIndex < 0) {
      activeIndex = getMaxIndex();
    } else if (activeIndex > getMaxIndex()) {
      activeIndex = 0;
    }

    updateSlider();
  };

  const syncLayout = () => {
    const isWide = window.matchMedia("(min-width: 641px)").matches;

    slidesPerView = isWide ? 3 : 1;
    gap = isWide ? 16 : 0;
    updateSlider();
  };

  prevButton.addEventListener("click", () => setDirection(-1));
  nextButton.addEventListener("click", () => setDirection(1));
  window.addEventListener("resize", syncLayout);

  slider.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const deltaX = event.changedTouches[0].clientX - startX;

      if (Math.abs(deltaX) > 48) {
        setDirection(deltaX > 0 ? -1 : 1);
      }
    },
    { passive: true },
  );

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      setDirection(-1);
    } else if (event.key === "ArrowRight") {
      setDirection(1);
    }
  });

  slider.tabIndex = 0;
  syncLayout();
};

const formatPhone = (value) => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  digits = digits.slice(1, 11);

  let result = "+7";
  if (digits.length > 0) {
    result += `(${digits.slice(0, 3)}`;
  }
  if (digits.length >= 3) {
    result += ")";
  }
  if (digits.length > 3) {
    result += `-${digits.slice(3, 6)}`;
  }
  if (digits.length > 6) {
    result += `-${digits.slice(6, 8)}`;
  }
  if (digits.length > 8) {
    result += `-${digits.slice(8, 10)}`;
  }

  return result;
};

const initPhoneMask = () => {
  if (!phoneInput) {
    return;
  }

  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value) {
      phoneInput.value = "+7(";
    }
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value === "+7(" || phoneInput.value === "+7") {
      phoneInput.value = "";
    }
  });
};

const setFieldError = (input, message) => {
  const field = input.closest(".field");
  const error = document.querySelector(`[data-error-for="${input.id}"]`);

  field?.classList.toggle("is-invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");

  if (error) {
    error.textContent = message;
  }
};

const validateForm = () => {
  if (!form) {
    return false;
  }

  let isValid = true;
  const fields = [...form.querySelectorAll(".field__control")];

  fields.forEach((input) => {
    const value = input.value.trim();
    let message = "";

    if (!value) {
      message = "Заполните поле.";
    } else if ((input.id === "first-name" || input.id === "last-name") && value.length < 2) {
      message = "Минимум 2 символа.";
    } else if (input.type === "email" && !input.validity.valid) {
      message = "Введите корректный email.";
    } else if (input.id === "phone" && !phonePattern.test(value)) {
      message = "Формат: +7(999)-999-99-99.";
    }

    setFieldError(input, message);

    if (message) {
      isValid = false;
    }
  });

  return isValid;
};

const openModal = () => {
  if (!modal) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("is-modal-open");
  closeModalButton?.focus();
};

const closeModal = () => {
  if (!modal) {
    return;
  }

  modal.hidden = true;
  document.body.classList.remove("is-modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
};

const submitForm = async (event) => {
  event.preventDefault();

  if (!form || !validateForm()) {
    const firstInvalid = form?.querySelector(".field.is-invalid .field__control");
    firstInvalid?.focus();
    return;
  }

  const formData = new FormData(form);

  submitButton.disabled = true;
  formStatus.textContent = "";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Submit failed");
    }

    form.reset();
    openModal();
  } catch (error) {
    formStatus.textContent =
      "Не удалось отправить форму. Проверьте подключение и попробуйте ещё раз.";
  } finally {
    submitButton.disabled = false;
  }
};

const initReveal = () => {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  elements.forEach((element) => observer.observe(element));
};

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) {
    closeModal();
  }
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

closeModalButton?.addEventListener("click", closeModal);
form?.addEventListener("submit", submitForm);

updateHeaderState();
initSlider();
initPhoneMask();
initReveal();
