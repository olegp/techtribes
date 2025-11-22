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
      this.tooltipElement.classList.add('show');

      this.position(trigger, side);
    }, 200);
  }

  hide() {
    clearTimeout(this.showTimeout);

    this.hideTimeout = setTimeout(() => {
      this.tooltipElement.classList.remove('show');
      this.currentTrigger = null;
    }, 100);
  }

  position(trigger, side) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const gap = 8;

    let top, left;

    switch (side) {
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + gap;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
      default:
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
    }

    top = Math.max(gap, Math.min(top, window.innerHeight - tooltipRect.height - gap));
    left = Math.max(gap, Math.min(left, window.innerWidth - tooltipRect.width - gap));

    this.tooltipElement.style.top = `${top + window.scrollY}px`;
    this.tooltipElement.style.left = `${left + window.scrollX}px`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Tooltip();
  });
} else {
  new Tooltip();
}
