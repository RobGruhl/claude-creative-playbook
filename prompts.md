# Prompts

Paste these into Claude Code, opened in a clone of [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) with your song in `assets/`. Swap in your own topic, file names and lyrics. The first two are what actually started *What Are We Asking For?*.

## Start a video

> Please make an animation of this explanation of when to use code, decision models, language models, or human judgement. *[Paste the lyrics, and point at any docs or repo with more context.]* The song is `assets/song.m4a`. Build an appropriate and fun but informative animation, use karaoke style lyrics over the top.

Then, while it was planning:

> Feel free to time slice using ffmpeg and speech-to-text to match timing. Make sure that there are educational animations involved while still being fun.

Worth adding, which we didn't do:

> Show me the storyboard before you build anything.

## Steer the plan

> Give every concept its own character with a colour and an icon, and give the chorus a visual motif that grows each time it repeats.

> Write a seam contract: the exact transition code on each side of every section boundary, in absolute time.

> Build the shared world file and its test loops first, then render the loops and show me before any shots get built.

> Split the build across parallel agents, one per section, each running its own contact-sheet review. You integrate and check every seam.

## Finish and share

> When I paste the mp4 into Slack the thumbnail is black. Can we fix that and make an attractive clickable image thumbnail?

> Name the video something compelling.

> Make a 540p copy under 30 MB for chat.

> Render a clean version without the karaoke.

## Write the song

> Here's an explanation of *[topic]*. Turn it into song lyrics with [Verse]/[Pre-Chorus]/[Chorus]/[Bridge] tags. One concept per verse, a chorus that is the core question, and concrete images I could draw (objects, actions), not abstractions. Keep the lines singable.
