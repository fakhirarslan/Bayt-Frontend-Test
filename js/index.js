// Slider class
class Slider {
  constructor(sliderClassName = "slider") {
    // I have used Object.defineProperty so that I can update the values of states without using setter method
    Object.defineProperty(this, "slider", {
      value: document.querySelector(`.${sliderClassName}`),
    });
    Object.defineProperty(this, "sliderList", {
      value: this.slider.querySelector(".slider-list"),
    });
    Object.defineProperty(this, "sliderTrack", {
      value: this.slider.querySelector(".slider-track"),
    });
    Object.defineProperty(this, "slides", {
      value: this.slider.querySelectorAll(".slide"),
      writable: true,
    });
    Object.defineProperty(this, "arrows", {
      value: this.slider.querySelector(".slider-arrows"),
    });
    Object.defineProperty(this, "prev", {
      value: this.arrows.children[0],
    });
    Object.defineProperty(this, "next", {
      value: this.arrows.children[1],
    });
    Object.defineProperty(this, "slideWidth", {
      value: this.slides[0].offsetWidth,
      writable: true,
    });
    Object.defineProperty(this, "slideIndex", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posInit", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posX1", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posX2", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posY1", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posY2", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "posFinal", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "isSwipe", {
      value: false,
      writable: true,
    });
    Object.defineProperty(this, "isScroll", {
      value: false,
      writable: true,
    });
    Object.defineProperty(this, "allowSwipe", {
      value: true,
      writable: true,
    });
    Object.defineProperty(this, "transition", {
      value: true,
      writable: true,
    });
    Object.defineProperty(this, "nextTrf", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "prevTrf", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(this, "lastTrf", {
      value: (this.slides.length - 1) * this.slideWidth,
      writable: true,
    });
    Object.defineProperty(this, "posThreshold", {
      value: this.slides[0].offsetWidth * 0.35,
      writable: true,
    });
    Object.defineProperty(this, "trfRegExp", {
      value: /([-0-9.]+(?=px))/,
      writable: true,
    });
    Object.defineProperty(this, "swipeStartTime", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(this, "swipeEndTime", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(this, "ulElement", {
      value: undefined,
      writable: true,
    });
  }

  // This method is to intialize the slider process
  initialize = () => {
    this.sliderTrack.style.transform = "translate3d(0px, 0px, 0px)";
    this.sliderList.classList.add("grab");

    this.sliderTrack.addEventListener(
      "transitionend",
      () => (this.allowSwipe = true)
    );
    this.slider.addEventListener("touchstart", this.swipeStart);
    this.slider.addEventListener("mousedown", this.swipeStart);

    // Autoplay functionality
    let autplayDuration = this.slider.getAttribute("autoplay");
    if (autplayDuration !== null) {
      setInterval(
        () => {
          if (this.slides.length - 1 === this.slideIndex) {
            this.slideIndex = 0;
          } else {
            this.slideIndex++;
          }
          this.slide();
        },
        autplayDuration ? autplayDuration * 1000 : 2000
      );
    }

    // Hide arrows if there is only one slide
    if (this.slides.length <= 1) {
      this.arrows.classList.add("display-none");
    }

    this.arrows.addEventListener("click", () => {
      let target = event.target;

      if (target.classList.contains("next")) {
        if (this.slides.length - 1 === this.slideIndex) {
          this.slideIndex = 0;
        } else {
          this.slideIndex++;
        }
      } else if (target.classList.contains("prev")) {
        if (this.slideIndex === 0) {
          this.slideIndex = this.slides.length - 1;
        } else {
          this.slideIndex--;
        }
      } else {
        return;
      }

      this.slide();
    });

    this.addDots();
  };

  getEvent = () => {
    return event.type.search("touch") !== -1 ? event.touches[0] : event;
  };

  // This method is for the transition effect for slides
  slide = () => {
    if (this.transition) {
      this.sliderTrack.style.transition = "transform .5s";
    }
    this.sliderTrack.style.transform = `translate3d(-${
      this.slideIndex * this.slideWidth
    }px, 0px, 0px)`;

    let dotList = this.ulElement.querySelectorAll("li");
    if (dotList.length > 1) {
      for (let i = 0; i < dotList.length; i++) {
        if (i === this.slideIndex) {
          dotList[i].classList.add("active");
        } else {
          dotList[i].classList.remove("active");
        }
      }
    }
  };

  // This method is to intiliaze swipe funtionality to move slides for mobile view
  swipeStart = () => {
    let evt = this.getEvent();

    if (this.allowSwipe) {
      this.swipeStartTime = Date.now();

      this.transition = true;

      this.nextTrf = (this.slideIndex + 1) * -this.slideWidth;
      this.prevTrf = (this.slideIndex - 1) * -this.slideWidth;

      this.posInit = this.posX1 = evt.clientX;
      this.posY1 = evt.clientY;

      this.sliderTrack.style.transition = "";

      document.addEventListener("touchmove", this.swipeAction);
      document.addEventListener("mousemove", this.swipeAction);
      document.addEventListener("touchend", this.swipeEnd);
      document.addEventListener("mouseup", this.swipeEnd);

      this.sliderList.classList.remove("grab");
      this.sliderList.classList.add("grabbing");
    }
  };

  // This method is to perform the slide change on swipe
  swipeAction = () => {
    let evt = this.getEvent(),
      style = this.sliderTrack.style.transform,
      transform = +style.match(this.trfRegExp)[0];

    this.posX2 = this.posX1 - evt.clientX;
    this.posX1 = evt.clientX;

    this.posY2 = this.posY1 - evt.clientY;
    this.posY1 = evt.clientY;

    if (!this.isSwipe && !this.isScroll) {
      let posY = Math.abs(this.posY2);
      if (posY > 7 || this.posX2 === 0) {
        this.isScroll = true;
        this.allowSwipe = false;
      } else if (posY < 7) {
        this.isSwipe = true;
      }
    }

    if (this.isSwipe) {
      if (this.slideIndex === 0) {
        if (this.posInit < this.posX1) {
          this.setTransform(this.transform, 0);
          return;
        } else {
          this.allowSwipe = true;
        }
      }

      // Prohibition of moving to the right on the last slide
      if (this.slideIndex === this.slides.length - 1) {
        if (this.posInit > this.posX1) {
          this.setTransform(this.transform, this.lastTrf);
          return;
        } else {
          this.allowSwipe = true;
        }
      }

      if (
        (this.posInit > this.posX1 && this.transform < this.nextTrf) ||
        (this.posInit < this.posX1 && this.transform > this.prevTrf)
      ) {
        this.reachEdge();
        return;
      }

      this.sliderTrack.style.transform = `translate3d(${
        transform - this.posX2
      }px, 0px, 0px)`;
    }
  };

  swipeEnd = () => {
    this.posFinal = this.posInit - this.posX1;

    this.isScroll = false;
    this.isSwipe = false;

    document.removeEventListener("touchmove", this.swipeAction);
    document.removeEventListener("mousemove", this.swipeAction);
    document.removeEventListener("touchend", this.swipeEnd);
    document.removeEventListener("mouseup", this.swipeEnd);

    this.sliderList.classList.add("grab");
    this.sliderList.classList.remove("grabbing");

    if (this.allowSwipe) {
      this.swipeEndTime = Date.now();
      if (
        Math.abs(this.posFinal) > this.posThreshold ||
        this.swipeEndTime - this.swipeStartTime < 300
      ) {
        if (this.posInit < this.posX1) {
          this.slideIndex--;
        } else if (this.posInit > this.posX1) {
          this.slideIndex++;
        }
      }

      if (this.posInit !== this.posX1) {
        this.allowSwipe = false;
        this.slide();
      } else {
        this.allowSwipe = true;
      }
    } else {
      this.allowSwipe = true;
    }
  };

  setTransform = (transform, comapreTransform) => {
    if (transform >= comapreTransform) {
      if (transform > comapreTransform) {
        this.sliderTrack.style.transform = `translate3d(${comapreTransform}px, 0px, 0px)`;
      }
    }
    this.allowSwipe = false;
  };

  reachEdge = () => {
    this.transition = false;
    this.swipeEnd();
    this.allowSwipe = true;
  };

  // Method to add dots navigation to slider
  addDots = () => {
    // Add dots if only there are more than 1 slides
    if (this.slides.length > 1) {
      var ul = document.createElement("ul");
      this.slider.appendChild(ul);
      this.ulElement = ul;

      for (let i = 0; i < this.slides.length; i++) {
        var li = document.createElement("li");
        ul.appendChild(li);
      }
      this.ulElement.querySelector("li").classList.add("active");
      let liItems = this.ulElement.querySelectorAll("li");

      for (let i = 0; i < liItems.length; i++) {
        liItems[i].classList.add(`li${i}`);
        liItems[i].classList.add("cursor-pointer");
        liItems[i].addEventListener("click", () => {
          let target = event.target;

          if (target.classList.contains(`li${i}`)) {
            this.slideIndex = i;
          } else {
            return;
          }

          this.slide();
        });
      }
    }
  };
}
