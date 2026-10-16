(function () {
  const themes = [
    'classic',
    'dots',
    'bars',
    'dots-vs-bars',
    'spinner',
    'shapes',
    'polygons',
    '3d',
    'progress',
    'wobbling',
    'infinity',
    'zig-zag',
    'wavy',
    'mechanic',
    'filling',
    'bouncing',
    'glowing',
    'rolling',
    'flipping',
    'growing',
    'continuous',
    'pulsing',
    'arcade',
    'hypnotic',
    'square',
    'circle',
    'square-vs-circle',
    'colorful',
    'nature',
    'time',
    'hungry',
    'shuriken',
    'dancers',
    'moving',
    'eyes',
    'line',
    'thin',
    'cut',
    'clones',
    'arrow',
    'blob',
    'maze',
    'factory',
  ];

  Object.defineProperty(window, 'setStyle', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: function (el, type) {
      if(
        !(el instanceof HTMLElement) ||
        !themes.includes(type)
      ) {
        return;
      }

    },
  });
})();
