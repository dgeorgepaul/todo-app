import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',      // output directory
			assets: 'build',     // output directory for assets
			fallback: 'index.html', // for SPA routing
			precompress: false,
			strict: true
		})
	}
};

export default config;