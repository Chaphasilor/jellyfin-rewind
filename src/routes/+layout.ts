// disable global server side rendering
//
// disable because everything should stay in the browser
// global because every page will "go through" this layout

export const ssr = false;

// Since this project uses the static adapter
// which will build an static web page, every page
// needs to be prerender to avoid errors while
// building. This is because server code ($lib)
// shouldnt exist in an static application
export const prerender = true