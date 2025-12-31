<script>
  import { goto } from "$app/navigation";
</script>

<h1>Welcome</h1>
<p>
  to this years Jellyfin rewind! Just follow the guide to log into your server,
  but dont worry all the communication stays between your server and your
  browser.<br />
  <br />
  If you are paranoid (as you generally should be), feel free to monitor the
  network traffic in the devtools or even checkout the code which is linked
  below!
</p>

<div class="warning">
  <h3>But Wait!</h3>
  You will need to have the Playback reporting plugin installed and
  active!<br />
</div>

<div class="info">
  <h3>Configuration</h3>
  <p class="a">
    The Plugin should also be configured to keep at least one year of data, else
    the rewind wont be able to give you a full year recap. You can configure
    this here:
  </p>
  <code> Dashboard > Playback Reporting > Settings > Data Retention </code>
  <p class="b">and set "Keep data for" to at least 1 year</p>
</div>

<div class="info">
  <h3>One Last Thing</h3>
  This year we've rewritten the whole Rewind into another Web-Framework. <br>
  In true Rewind fashion we manged to barely finish in time, so there might be
  more bugs than usual.<br>
  Sorry about that in advance!<br>
  For the best Experience we also recommend checking out your Rewind on a PC or
  Laptop.
  <br />
</div>

<button on:click={() => goto("/login")}>Proceed to Login</button>

<style>
  .a {
    margin-bottom: 0.8rem;
  }
  .b {
    margin-top: 0.8rem;
  }
  .info,
  .warning {
    margin: 2rem;
  }
  .warning {
    margin-top: 3rem;
  }
  button {
    cursor: e-resize;
  }
</style>
