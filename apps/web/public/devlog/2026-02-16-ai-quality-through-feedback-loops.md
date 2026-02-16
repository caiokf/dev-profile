---
title: "AI Quality Through Feedback Loops"
date: 2026-02-16
tags: [ai, workflow, automation, tools]
slug: ai-quality-through-feedback-loops
---

I wanted to build something simple: feed a poem to an AI and get back an image with recurring characters. Should be easy, right?

Wrong. No matter how much I tweaked the prompt, the AI kept messing up basic requirements. Wrong colors I explicitly banned. Characters swapped or missing entirely. I was about to write this off as "AI just isn't good enough yet."

Then I stopped fighting the prompt and built a feedback system instead. The workflow now works like this:

1. Generate the initial image
2. Have another model analyze it with specific questions:
   - Is character X described correctly?
   - Are forbidden characters present?
   - Is there unwanted text?
3. Get back structured JSON with pass/fail for each rule
4. If anything failed, regenerate with the original prompt plus the feedback
5. Repeat up to 5 times

This completely solved the problem. The issue wasn't that AI wasn't capable. I just needed to use it differently. Instead of trying to craft the perfect prompt upfront, I built a system that iteratively improves through validation and feedback.
