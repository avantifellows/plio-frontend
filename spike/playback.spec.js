// Throwaway spike for avantifellows/plio-backend#371. Never merge.
//
// Measures whether real YouTube playback through Plyr works reliably in
// headless Chromium/Chrome. Always emits a machine-readable `RESULTS:{json}`
// line on stdout (pass or fail) and writes the same JSON to
// spike/out/results.json so the 20 CI matrix runs (10 attempts x 2 browsers)
// can be aggregated into a flake-rate number per browser leg.

const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

// Classify the failure mode — the core datum of the spike. Separates
// environmental flake (YouTube bot wall on datacenter IPs, Error 153 referrer
// enforcement) from plain timeouts and everything else.
async function classifyFailure(page, err) {
  let iframeText = "";
  try {
    for (const frame of page.frames()) {
      if (frame.url().includes("youtube.com")) {
        const text = await frame
          .evaluate(() => (document.body ? document.body.innerText : ""))
          .catch(() => "");
        iframeText += " " + text;
      }
    }
  } catch (e) {
    /* page already gone */
  }
  const t = iframeText.toLowerCase();
  let failureClass = "other";
  if (t.includes("confirm you're not a bot") || t.includes("confirm you’re not a bot")) {
    failureClass = "bot_wall";
  } else if (t.includes("error 153") || t.includes("video player configuration error")) {
    failureClass = "error_153";
  } else if (err && /timeout|exceeded/i.test(String(err.message || err))) {
    failureClass = "timeout";
  }
  return { failureClass, iframeText: iframeText.trim().slice(0, 200) };
}

test("real YouTube playback via Plyr reaches 60s in headless browser", async ({
  page,
}) => {
  test.setTimeout(180000);

  const results = {
    browser: process.env.SPIKE_BROWSER || "chromium",
    ready_ms: null,
    playing_ms: null,
    first_progress_ms: null,
    duration_at_ready: null,
    marker_seen: false,
    final_currentTime: null,
    events_count: 0,
    codecs: null,
    passed: false,
  };

  let playStart = null;
  let caughtErr = null;

  const getEvents = async () => {
    try {
      return await page.evaluate(() => window.__events || []);
    } catch (err) {
      return [];
    }
  };

  try {
    await page.goto("/harness.html");

    // Codec probe: bundled Chromium ships no proprietary codecs — make any
    // gap explicit data instead of a mystery playback failure.
    results.codecs = await page.evaluate(() => ({
      h264_avc1: MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"'),
      vp9: MediaSource.isTypeSupported('video/webm; codecs="vp9"'),
      aac_mp4a: MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"'),
    }));

    // (a) Plyr `ready` within 30s of page load. wallTime in the harness is
    // performance.now(), i.e. ms since navigation start, so the ready event's
    // wallTime IS the ready latency.
    await page.waitForFunction(
      () => (window.__events || []).some((e) => e.type === "ready"),
      null,
      { timeout: 30000 }
    );
    let events = await getEvents();
    const readyEvent = events.find((e) => e.type === "ready");
    results.ready_ms = Math.round(readyEvent.wallTime);

    // Content duration for aqz-KE-bpKQ is ~596s; if this briefly reports a
    // pre-roll ad's duration instead, that's data (ads can run on
    // non-monetized channels since the 2020 Right-to-Monetize ToS).
    results.duration_at_ready = await page.evaluate(() =>
      window.player ? window.player.duration : null
    );

    // (b) Start playback: click the Plyr overlaid play button, fall back to a
    // programmatic play() if the click is flaky/intercepted.
    playStart = await page.evaluate(() => performance.now());
    let clicked = false;
    try {
      await page
        .locator("button.plyr__control--overlaid")
        .click({ timeout: 5000 });
      clicked = true;
    } catch (err) {
      /* fall through to programmatic play */
    }
    if (!clicked) {
      await page.evaluate(() => window.player.play());
    }

    // `playing` within 20s of starting playback.
    await page.waitForFunction(
      (start) =>
        (window.__events || []).some(
          (e) => e.type === "playing" && e.wallTime >= start
        ),
      playStart,
      { timeout: 20000 }
    );
    events = await getEvents();
    const playingEvent = events.find(
      (e) => e.type === "playing" && e.wallTime >= playStart
    );
    results.playing_ms = Math.round(playingEvent.wallTime - playStart);

    // (d) currentTime reaches >= 60s within 100s of the `playing` event.
    await page.waitForFunction(
      () => window.player && window.player.currentTime >= 60,
      null,
      { timeout: 100000, polling: 500 }
    );

    events = await getEvents();
    results.final_currentTime = await page.evaluate(
      () => window.player.currentTime
    );

    // (c) A timeupdate landed in the 5-10s window — the hook Plio's timed
    // question popups depend on.
    results.marker_seen = events.some(
      (e) =>
        e.type === "timeupdate" &&
        typeof e.currentTime === "number" &&
        e.currentTime >= 5 &&
        e.currentTime <= 10
    );

    // (d) Progression must be monotonically non-decreasing (no time jumps
    // backwards — we never seek in this test).
    const timeupdates = events
      .filter(
        (e) => e.type === "timeupdate" && typeof e.currentTime === "number"
      )
      .map((e) => e.currentTime);
    const regressions = [];
    for (let i = 1; i < timeupdates.length; i++) {
      if (timeupdates[i] < timeupdates[i - 1]) {
        regressions.push([timeupdates[i - 1], timeupdates[i]]);
      }
    }

    expect(results.final_currentTime, "currentTime >= 60s").toBeGreaterThanOrEqual(60);
    expect(results.marker_seen, "timeupdate in [5s, 10s] window").toBe(true);
    expect(regressions, "monotonically non-decreasing currentTime").toEqual([]);

    results.passed = true;
  } catch (err) {
    caughtErr = err;
    results.error = String(err && err.message ? err.message : err).split("\n")[0];
    throw err;
  } finally {
    const events = await getEvents();
    results.events_count = events.length;

    // Time from pressing play to the first real currentTime progress —
    // recorded separately from playing_ms so a pre-roll ad eating the clock
    // shows up in the data instead of just failing the run.
    if (playStart !== null) {
      const firstProgress = events.find(
        (e) =>
          e.type === "timeupdate" &&
          e.wallTime >= playStart &&
          typeof e.currentTime === "number" &&
          e.currentTime > 0
      );
      if (firstProgress) {
        results.first_progress_ms = Math.round(firstProgress.wallTime - playStart);
      }
    }

    if (results.final_currentTime === null) {
      try {
        results.final_currentTime = await page.evaluate(() =>
          window.player ? window.player.currentTime : null
        );
      } catch (err) {
        /* page already gone */
      }
    }

    if (!results.passed) {
      const { failureClass, iframeText } = await classifyFailure(page, caughtErr);
      results.failure_class = failureClass;
      if (iframeText) results.iframe_text_snippet = iframeText;
      results.last_10_events = events.slice(-10);
    }

    console.log("RESULTS:" + JSON.stringify(results));

    const outDir = path.join(__dirname, "out");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "results.json"),
      JSON.stringify(results, null, 2)
    );
  }
});
