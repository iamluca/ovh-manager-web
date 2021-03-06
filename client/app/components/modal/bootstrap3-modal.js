/*!
 * Bootstrap v3.0.2 by @fat and @mdo
 * Copyright 2013 Twitter, Inc.
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0
 *
 * Designed and built with all the love in the world by @mdo and @fat.
 */

/* ========================================================================
 * Bootstrap: transition.js v3.0.2
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+(function($) {
  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    const el = document.createElement("bootstrap");

    const transEndEventNames = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd otransitionend",
      transition: "transitionend"
    };

    for (const name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function(duration) {
    let called = false,
      $el = this;
    $(this).one($.support.transition.end, () => {
      called = true;
    });
    const callback = function() {
      if (!called) $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };

  $(() => {
    $.support.transition = transitionEnd();
  });
})(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.2
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+(function($) {
  // MODAL CLASS DEFINITION
  // ======================

  const Modal = function(element, options) {
    this.options = options;
    this.$element = $(element);
    this.$backdrop = this.isShown = null;

    if (this.options.remote) this.$element.load(this.options.remote);
  };

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  Modal.prototype.toggle = function(_relatedTarget) {
    return this[!this.isShown ? "show" : "hide"](_relatedTarget);
  };

  Modal.prototype.show = function(_relatedTarget) {
    const that = this;
    const e = $.Event("show.bs.modal", { relatedTarget: _relatedTarget });

    this.$element.trigger(e);

    if (this.isShown || e.isDefaultPrevented()) return;

    this.isShown = true;

    this.escape();

    this.$element.on(
      "click.dismiss.modal",
      '[data-dismiss="modal"]',
      $.proxy(this.hide, this)
    );

    this.backdrop(() => {
      const transition = $.support.transition && that.$element.hasClass("fade");

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body); // don't move modals dom position
      }

      that.$element.show();

      if (transition) {
        that.$element[0].offsetWidth; // force reflow
      }

      that.$element.addClass("in").attr("aria-hidden", false);

      that.enforceFocus();

      const e = $.Event("shown.bs.modal", { relatedTarget: _relatedTarget });

      transition
        ? that.$element
            .find(".modal-dialog") // wait for modal to slide in
            .one($.support.transition.end, () => {
              that.$element.focus().trigger(e);
            })
            .emulateTransitionEnd(300)
        : that.$element.focus().trigger(e);
    });
  };

  Modal.prototype.hide = function(e) {
    if (e) e.preventDefault();

    e = $.Event("hide.bs.modal");

    this.$element.trigger(e);

    if (!this.isShown || e.isDefaultPrevented()) return;

    this.isShown = false;

    this.escape();

    $(document).off("focusin.bs.modal");

    this.$element
      .removeClass("in")
      .attr("aria-hidden", true)
      .off("click.dismiss.modal");

    $.support.transition && this.$element.hasClass("fade")
      ? this.$element
          .one($.support.transition.end, $.proxy(this.hideModal, this))
          .emulateTransitionEnd(300)
      : this.hideModal();
  };

  Modal.prototype.enforceFocus = function() {
    $(document)
      .off("focusin.bs.modal") // guard against infinite focus loop
      .on(
        "focusin.bs.modal",
        $.proxy(function(e) {
          if (
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length
          ) {
            this.$element.focus();
          }
        }, this)
      );
  };

  Modal.prototype.escape = function() {
    if (this.isShown && this.options.keyboard) {
      this.$element.on(
        "keyup.dismiss.bs.modal",
        $.proxy(function(e) {
          e.which == 27 && this.hide();
        }, this)
      );
    } else if (!this.isShown) {
      this.$element.off("keyup.dismiss.bs.modal");
    }
  };

  Modal.prototype.hideModal = function() {
    const that = this;
    this.$element.hide();
    this.backdrop(() => {
      that.removeBackdrop();
      that.$element.trigger("hidden.bs.modal");
    });
  };

  Modal.prototype.removeBackdrop = function() {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null;
  };

  Modal.prototype.backdrop = function(callback) {
    const that = this;
    const animate = this.$element.hasClass("fade") ? "fade" : "";

    if (this.isShown && this.options.backdrop) {
      const doAnimate = $.support.transition && animate;

      this.$backdrop = $(`<div class="modal-backdrop ${animate}" />`).appendTo(
        document.body
      );

      this.$element.on(
        "click.dismiss.modal",
        $.proxy(function(e) {
          if (e.target !== e.currentTarget) return;
          this.options.backdrop == "static"
            ? this.$element[0].focus.call(this.$element[0])
            : this.hide.call(this);
        }, this)
      );

      if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

      this.$backdrop.addClass("in");

      if (!callback) return;

      doAnimate
        ? this.$backdrop
            .one($.support.transition.end, callback)
            .emulateTransitionEnd(150)
        : callback();
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass("in");

      $.support.transition && this.$element.hasClass("fade")
        ? this.$backdrop
            .one($.support.transition.end, callback)
            .emulateTransitionEnd(150)
        : callback();
    } else if (callback) {
      callback();
    }
  };

  // MODAL PLUGIN DEFINITION
  // =======================

  const old = $.fn.modal;

  $.fn.modal = function(option, _relatedTarget) {
    return this.each(function() {
      const $this = $(this);
      let data = $this.data("bs.modal");
      const options = $.extend(
        {},
        Modal.DEFAULTS,
        $this.data(),
        typeof option === "object" && option
      );

      if (!data) $this.data("bs.modal", (data = new Modal(this, options)));
      if (typeof option === "string") data[option](_relatedTarget);
      else if (options.show) data.show(_relatedTarget);
    });
  };

  $.fn.modal.Constructor = Modal;

  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function() {
    $.fn.modal = old;
    return this;
  };

  // MODAL DATA-API
  // ==============

  $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(
    e
  ) {
    const $this = $(this);
    const href = $this.attr("href");
    const $target = $(
      $this.attr("data-target") || (href && href.replace(/.*(?=#[^\s]+$)/, ""))
    ); // strip for ie7
    const option = $target.data("modal")
      ? "toggle"
      : $.extend(
          { remote: !/#/.test(href) && href },
          $target.data(),
          $this.data()
        );

    e.preventDefault();

    $target.modal(option, this).one("hide", () => {
      $this.is(":visible") && $this.focus();
    });
  });

  $(document)
    .on("show.bs.modal", ".modal", () => {
      $(document.body).addClass("modal-open");
    })
    .on("hidden.bs.modal", ".modal", () => {
      $(document.body).removeClass("modal-open");
    });
})(jQuery);
