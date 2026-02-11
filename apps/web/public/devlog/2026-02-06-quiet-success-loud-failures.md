---
title: "Quiet Success, Loud Failures"
date: 2026-02-06
tags: [devex, ai, tools]
slug: quiet-success-loud-failures
---

I love watching tests pass. That cascade of green checkmarks feels satisfying, even when I don't read each line. It's like visual confirmation that everything's working.

But AI coding agents don't share my appreciation for test theater. When they run test suites between steps, all that verbose output pollutes their context window. They're burning tokens on "✓ should validate user input" messages that add zero value to their decision making.

So I've flipped the script. All my test, lint, and compile commands now run quiet on success. No output means everything passed. But when things break, LLMs want details. I find that something like `--bail=5` gives them enough info to move to the next step, or loop through test scripts until everything is fixed. I also have a `test:verbose` script in case I want the whole thing.
