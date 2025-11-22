class Tooltip {
  constructor() {
    this.tooltipElement = null;
    this.currentTrigger = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.init();
  }

  init() {
    this.createTooltipElement();
    this.attachEventListeners();
  }

  createTooltipElement() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tooltip';
    this.tooltipElement.setAttribute('role', 'tooltip');
    document.body.appendChild(this.tooltipElement);
  }

  attachEventListeners() {
    const triggers = document.querySelectorAll('[data-tooltip]');

    triggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => this.show(e.currentTarget));
      trigger.addEventListener('mouseleave', () => this.hide());
      trigger.addEventListener('focus', (e) => this.show(e.currentTarget));
      trigger.addEventListener('blur', () => this.hide());
    });
  }

  show(trigger) {
    clearTimeout(this.hideTimeout);

    this.showTimeout = setTimeout(() => {
      const text = trigger.getAttribute('data-tooltip');
      const side = trigger.getAttribute('data-side') || 'top';

      if (!text) return;

      this.currentTrigger = trigger;
      this.tooltipElement.textContent = text;

      this.tooltipElement.style.visibility = 'visible';
      this.tooltipElement.style.opacity = '0';

      this.position(trigger, side);

      requestAnimationFrame(() => {
        this.tooltipElement.classList.add('show');
      });
    }, 200);
  }

  hide() {
    clearTimeout(this.showTimeout);

    this.hideTimeout = setTimeout(() => {
      this.tooltipElement.classList.remove('show');
      setTimeout(() => {
        this.tooltipElement.style.visibility = '';
        this.tooltipElement.style.opacity = '';
      }, 200);
      this.currentTrigger = null;
    }, 100);
  }

  position(trigger, side) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const gap = 8;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top, left;

    switch (side) {
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + gap;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + gap;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
      default:
        top = triggerRect.top + scrollY - tooltipRect.height - gap;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
    }

    const maxTop = scrollY + window.innerHeight - tooltipRect.height - gap;
    const maxLeft = scrollX + window.innerWidth - tooltipRect.width - gap;

    top = Math.max(scrollY + gap, Math.min(top, maxTop));
    left = Math.max(scrollX + gap, Math.min(left, maxLeft));

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Tooltip();
  });
} else {
  new Tooltip();
}
