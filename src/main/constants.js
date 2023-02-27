const __VERSION = "_V1.1.0"

export const BRANCHES = {
  PWABRANCH: 'origin/PWA' + __VERSION,
  BASEUIBRANCH: 'origin/BaseUI' + __VERSION,
  BASEUIINVBRANCH: '+BaseUI' + __VERSION,
  TAILWINDBRANCH: 'origin/Tailwind' + __VERSION,
  TAILWINDDAISYBRANCH: 'origin/TailwindDaisy' + __VERSION,
  TAILWINDFLOWBITEBRANCH: 'origin/TailwindFlowbite' + __VERSION,
  UNOBRANCH: 'origin/UnoCss' + __VERSION,
  UNODAISYBRANCH: 'origin/UnoCssDaisy' + __VERSION
}

export const PACKAGEDATA = {
  package: {
    "name": "neo-t3-sveltekit-scaffold",
    "version": "0.0.1",
    "private": true,
    "scripts": {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      "lint": "prettier --plugin-search-dir . --check . && eslint .",
      "format": "prettier --plugin-search-dir . --write ."
    },
    "type": "module"
  },
  init: {
    dev: {
      "@sveltejs/adapter-auto": "^2.0.0",
      "@sveltejs/kit": "^1.5.0",
      "@typescript-eslint/eslint-plugin": "^5.45.0",
      "@typescript-eslint/parser": "^5.45.0",
      "eslint": "^8.28.0",
      "eslint-config-prettier": "^8.5.0",
      "eslint-plugin-svelte3": "^4.0.0",
      "prettier": "^2.8.0",
      "prettier-plugin-svelte": "^2.8.1",
      "svelte": "^3.54.0",
      "svelte-check": "^3.0.1",
      "tslib": "^2.4.1",
      "typescript": "^4.9.3",
      "vite": "^4.0.0"
    }
  },

  PWA: {
    dev: {
      "@sveltejs/adapter-static": "^2.0.1",
      "@types/cookie": "^0.5.1",
      "@vite-pwa/sveltekit": "^0.1.3",
      "svelte-preprocess": "^5.0.1",
      "vite-plugin-pwa": "^0.14.4",
      "workbox-precaching": "^6.5.4",
      "workbox-routing": "^6.5.4",
      "workbox-window": "^6.5.4"
    }
  },

  TRPC: {
    dev: {
      "@sveltejs/adapter-node": "^1.2.0",
    },
    dep: {
      "@trpc/client": "^10.12.0",
      "@trpc/server": "^10.12.0",
      "@types/ws": "^8.5.4",
      "trpc-sveltekit": "^3.4.2",
      "trpc-transformer": "^2.2.2",
      "ws": "^8.12.1",
      "zod": "^3.20.6"
    }
  },

  Prisma: {
    dev: {
      "prisma": "^4.10.1",
    },
    dep: {
      "@prisma/client": "^4.10.1"
    }
  },

  Prisma_AuthJs: {
    dev: {
      "@next-auth/prisma-adapter": "^1.0.5",
    },
  },

  AuthJs: {
    dep: {
      "@auth/core": "^0.5.0",
      "@auth/sveltekit": "^0.2.2"
    }
  },

  TailwindCss: {
    dev: {
      "autoprefixer": "^10.4.13",
      "postcss": "^8.4.21",
      "tailwindcss": "^3.2.7",
    }
  },

  TailwindCss_DaisyUi: {
    dep: {
      "daisyui": "^2.51.1"
    }
  },

  TailwindCss_FlowBite: {
    dev: {
      "flowbite": "^1.6.3",
      "flowbite-svelte": "^0.30.4",
    }
  },

  UnoCss: {
    dev: {
      "autoprefixer": "^10.4.13",
      "postcss": "^8.4.21",
      "postcss-load-config": "^4.0.1",
      "svelte-preprocess": "^5.0.1",
      "unocss": "^0.50.1",
    }
  },

  UnoCss_DaisyUi: {
    dev: {
      "unocss-preset-daisy": "^1.2.0",
      "@kidonng/daisyui": "2.50.1-0",
    }
  },
}
