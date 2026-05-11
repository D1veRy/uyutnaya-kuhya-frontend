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
  if (!window.Swiper) {
    return;
  }

  const slider = document.querySelector(".gallery__slider");
  const slides = slider ? [...slider.querySelectorAll(".swiper-wrapper > .swiper-slide")] : [];
  const pagination = document.querySelector(".gallery__pagination");

  if (!slider || slides.length === 0 || !pagination) {
    return;
  }

  const updatePagination = (activeIndex) => {
    [...pagination.children].forEach((dot, index) => {
      dot.classList.toggle("swiper-pagination-bullet-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  let swiper = null;

  pagination.replaceChildren(
    ...slides.map((slide, index) => {
      const dot = document.createElement("button");
      dot.className = "swiper-pagination-bullet";
      dot.type = "button";
      dot.setAttribute("aria-label", `Слайд ${index + 1}`);
      dot.addEventListener("click", () => {
        swiper?.slideToLoop(index);
      });
      return dot;
    }),
  );

  swiper = new Swiper(slider, {
    loop: true,
    loopAdditionalSlides: slides.length,
    speed: 450,
    grabCursor: true,
    keyboard: {
      enabled: true,
    },
    navigation: {
      prevEl: ".slider-button--prev",
      nextEl: ".slider-button--next",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      641: {
        slidesPerView: 3,
        spaceBetween: 16,
      },
    },
    on: {
      init(currentSwiper) {
        updatePagination(currentSwiper.realIndex);
      },
      slideChange(currentSwiper) {
        updatePagination(currentSwiper.realIndex);
      },
    },
  });
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
