![Jellyfin Rewind Banner](Jellyfin%20Rewind%20Banner.png)

# Jellyfin Rewind

## Welcome to Jellyfin Rewind 2024!

> [!IMPORTANT]  
> Jellyfin Rewind 2025 **will launch on December 31st 2025** (2025-12-31)!
> If you want to be notified when it's time to review your listening habits of this year, **subscribe to release updates** by `watch`ing this repository.
> See you then! - Chaphasilor

### How to use

Because Jellyfin Rewind is web-based and (for now at least) not available as a plugin, it might be a bit tricky to get your browser to communicate with your Jellyfin server. The problem is that browsers won't allow "insecure" requests (HTTP) from a "secure" website (HTTP**S**), or requests from a non-private context (website not within your network) to a private context (Jellyfin server accessed over a local IP address within your network).  
So make sure you're not using a local IP address (starts with `192.168.`) or mDNS hostname (something like `jellyfin.local`). If you use something like Tailscale as your VPN, you could use your server's Tailscale IP address.

If you're unsure what your Jellyfin server is using, but your Jellyfin server is accessible over the internet, simply use the first link (http)!  
If that doesn't work, or your server **is NOT** accessible over the internet, you could self-host the Jellyfin Rewind website on your local network, for example on the same server that is running Jellyfin. For that, check out the [GitHub releases page](https://github.com/Chaphasilor/jellyfin-rewind/releases) and either download the zip-archive or use the provided Docker image. The zip-archive will need to be extracted into a folder that is served by a web server, like Apache or Nginx. The Docker image will need a to have port 80 exposed instead.

### Links

**Local Network / Self-Hosting**

If your Jellyfin server is only accessible on your local network, you will need to self-host Jellyfin Rewind so that it's also accessible on your local network. Otherwise your browser will block the connection.  
To do this, check out the [GitHub releases page](https://github.com/Chaphasilor/jellyfin-rewind/releases) and either download the zip-archive or use the [provided Docker image here](https://hub.docker.com/r/chaphasilor/jellyfin-rewind/tags). The zip-archive will need to be extracted into a folder that is served by a web server, like Apache or Nginx. The Docker image will need a to have port 80 exposed instead.

**HTTP** (works for both http and https Jellyfin servers, as long as they are accessible over the internet):

*Make sure your browser shows "insecure" / no lock at the top after opening the link, otherwise connecting to your HTTP-only Jellyfin server might not work!*

<http://jellyfin-rewind-http.chaphasilor.xyz>

**HTTPS** (**only use this if your Jellyfin server has an https connection and is accessible over the internet**, this is the best experience):

<https://jellyfin-rewind.chaphasilor.xyz>

### Download your Rewind report!

**Please, please, please download your Rewind report at the end!**

Jellyfin's statistics aren't very exhaustive, and any additional data could help offer you more insights during next year's Rewind! Especially if you don't have the *Playback Reporting* plugin installed, this year's Rewind report might come in very handy, so keep it safe!

If something doesn't work and you can't download the data, I'll be happy to help you resolve the issue.

### How does it work?

Glad you asked!  
Essentially, Jellyfin Rewind loads most of the information about your music from your Jellyfin server, processes it on your device, aggregates some nice statistics, and then shows the result to you!

Your data never leaves your device; it's very similar to using the Jellyfin app on your phone.

Sadly the build in statistics of Jellyfin are pretty lackluster as of now, even with the *Playback Reporting* plugin, so that *a lot* of data has to be processed on your device. That's why it takes a few seconds to generate your Rewind report.

For next year, I might release a separate plugin that can use your Jellyfin server in order to crunch the data. This would also solve some of the connection problems that might happen this year. If you're interested in helping me with the plugin, please be sure to reach out!

### Can I help out somehow?

If you know something about web development, are a designer of some sorts, or have experience (or are curious about) developing Jellyfin plugins, I'd love to hear from you! There's so much I want to implement for next year's Jellyfin Rewind, and I need your help to bring all these ideas to life!

I had many more features planned for this year, but simply didn't have the time. I originally planned to launch back in November, and that obviously didn't work out :)

Thanks to everyone who uses Jellyfin Rewind, I sincerely hope you enjoyed it as much as I did!  
See you next year!!!
