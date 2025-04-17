const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities, addComponents }) {
  // Custom utilities
  const newUtilities = {
    '.pixelated': {
      'image-rendering': 'pixelated',
    },
    '.pixel-borders': {
      'box-shadow': '-0.1875rem 0 0 0 #000, .1875rem 0 0 0 #000, 0 -0.1875rem 0 0 #000, 0 .1875rem 0 0 #000',
    },
    '.bg-pixel-pattern': {
      'background-color': 'var(--pixel-teal-light)',
      'background-image': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2368b0d8\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
    },
  }
  
  // Components
  const newComponents = {
    '.pixel-window': {
      'border': '2px solid black',
      'background-color': 'white',
      'position': 'relative',
      'image-rendering': 'pixelated',
      'box-shadow': '4px 4px 0 rgba(0, 0, 0, 0.2)',
      'overflow': 'hidden',
    },
    '.pixel-window-header': {
      'padding': '0.5rem',
      'font-weight': 'bold',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      'border-bottom': '2px solid black',
      'font-family': '\'Pixelify Sans\', monospace',
      'font-size': '1rem',
      'height': '2.2rem',
    },
    '.pixel-window-controls': {
      'display': 'flex',
      'gap': '4px',
    },
    '.pixel-window-button': {
      'width': '16px',
      'height': '16px',
      'border': '1px solid black',
      'background-color': '#d9d9d9',
      '&:hover': {
        'background-color': '#ffffff',
      },
    },
    '.pixel-window-content': {
      'padding': '1rem',
      'background-color': 'white',
    },
    '.pixel-button': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'padding': '0.5rem 0.8rem',
      'background-color': 'var(--button-primary-bg, theme(\'colors.pixel-blue.DEFAULT\'))',
      'color': 'black',
      'border': '2px solid black',
      'text-transform': 'uppercase',
      'font-family': 'theme(\'fontFamily.pixel\')',
      'font-size': 'theme(\'fontSize.pixel-base\')',
      'cursor': 'pointer',
      'box-shadow': '2px 2px 0 black',
      'transition': 'all 0.1s',
      'white-space': 'nowrap',
      'flex-shrink': '0',
      'image-rendering': 'pixelated',
      '&:hover': {
        'transform': 'translate(-1px, -1px)',
        'box-shadow': '3px 3px 0 black',
      },
      '&:active': {
        'transform': 'translate(1px, 1px)',
        'box-shadow': '1px 1px 0 black',
      },
      '&.green': {
        'background-color': 'theme(\'colors.pixel-green.DEFAULT\')',
      },
      '&.beige': {
        'background-color': 'theme(\'colors.pixel-beige.DEFAULT\')',
      },
      '&.pink': {
        'background-color': 'theme(\'colors.pixel-pink.DEFAULT\')',
      },
      '&.contrast': {
        'background-color': '#222',
        'color': '#fff',
      },
    },
    '.pixel-button-sm': {
      '@apply pixel-button': {},
      'padding': '0.3rem 0.6rem',
      'font-size': 'theme(\'fontSize.pixel-sm\')',
    },
    '.progress-pixel': {
      'height': '1.25rem',
      'position': 'relative',
      'background': '#ffeaea',
      'border': '.0938rem solid #000',
      'overflow': 'hidden',
      '& .fill': {
        'background-color': 'var(--fill-color, theme(\'colors.pixel-green.DEFAULT\'))',
        'height': '100%',
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'transition': 'width 0.5s ease',
      },
    },
  }

  addUtilities(newUtilities)
  addComponents(newComponents)
})
