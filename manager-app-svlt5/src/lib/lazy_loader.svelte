
<script>
  import { Router, Route, Link } from "svelte-navigator";
  import BackButton from "./BackButton.svelte";
  import ForwardButton from "./ForwardButton.svelte";
  import LazyRoute from "./LazyRoute.svelte";

	// The REPL packages dynamic imports in the same way it
	// packages static imports, so no scripts are actually loaded
	// over the network.
	// The components load right away, so we delay their loading
	// artificially.
	// To see lazy routes work properly clone the repo and start
	// the example from the /example/lazy-loading folder.
	const delayModuleLoad = module =>
    new Promise(res =>
      setTimeout(() => res(module), Math.random() * 2000),
    );
  const Home = () => import("./Home.svelte").then(delayModuleLoad);
  const About = () => import("./About.svelte").then(delayModuleLoad);
  const Blog = () => import("./Blog.svelte").then(delayModuleLoad);
</script>

<Router>
  <header>
    <h1>History</h1>

    <nav>
      <BackButton />
      <ForwardButton />
      <Link to="/">Base</Link>
      <Link to="home">Home</Link>
      <Link to="about">About</Link>
      <Link to="blog">Blog</Link>
    </nav>
  </header>

  <main>
    <!--
      When `delayMs` is set, the fallback will be displayed
      after `delayMs` milliseconds.
      It might lead to a better UX, because it will suppress
      a flash of spinners on a fast connection.
    -->
    <LazyRoute path="blog/*blogRoute" component={Blog} delayMs={500}>
      <h4>Loading...</h4>
    </LazyRoute>
    <LazyRoute path="home" component={Home} delayMs={500}>
      Loading Home...
    </LazyRoute>
    <LazyRoute path="about" component={About} delayMs={500}>
      Loading About...
    </LazyRoute>
    <Route>
      <h3>Default</h3>
      <p>No Route could be matched.</p>
    </Route>
  </main>
</Router>
