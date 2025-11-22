document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[aria-label="Open Menu"]');
  const nav = document.querySelector('nav[data-state]');

  if (!menuToggle || !nav) return;

  const updateAriaLabel = (isOpen) => {
    menuToggle.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
  };

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.dataset.state === 'true';
    nav.dataset.state = (!isOpen).toString();
    updateAriaLabel(!isOpen);
  });

  document.addEventListener('click', (e) => {
    const isOpen = nav.dataset.state === 'true';
    if (isOpen && !nav.contains(e.target)) {
      nav.dataset.state = 'false';
      updateAriaLabel(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.dataset.state === 'true') {
      nav.dataset.state = 'false';
      updateAriaLabel(false);
    }
  });
});
