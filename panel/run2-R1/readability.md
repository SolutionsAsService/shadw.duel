# Run 2 R1 Readability (Solarski)

Verdict: OBJECT

**What moved.** The settings now work. Each card has a horizon, a moon or sun, parallax and a time of day, so the ground plane and atmosphere differ from card to card (Cinder Wolf's red peaks against Abyssal Kraken's night sea). That answers part of "samey" at the level of the background.

**What still reads as simple.** By Solarski's test, the silhouette carries the read, and here the silhouettes are the run-1 drawings unchanged. Put before.png beside cards-a/b: the dragon, wolf, kraken, golem, angel and serpent have the same outlines. They are built from straight-edged polygons, with stick limbs on Gale Harpy and Wandering Duelist and a cone body on Brine Witch, and none of them has secondary shapes like a mane, horns, fins or cloth folds to break the outline. The new "detail" does not model form. The triangulated hairlines on Ashen Dragon and Cinder Wolf read as a wireframe mesh, and the rivet dots are scattered evenly, so they read as noise rather than texture. Every subject also wears the same full glowing rim at the same weight, in the same element colour, centred at the same scale. That uniform treatment is what makes the cards look generic: in sheet.png the 75 thumbnails differ in background and match in subject.

**Changes, ranked by how much they answer the owner:**
1. **Redraw subject silhouettes in build-card-art.cjs.** Use curve-against-straight shape language (curved C/Q muscle and body lines, angular claws and armour) and give each creature 2-3 shapes that break its outline. Gate it with a filled-black thumbnail check so no two silhouettes match. Expected to move: "too simple" and "samey", most strongly.
2. **Light the subject from the scene's light source instead of the uniform rim.** Make the lit side light, let the shadow side fall into the background value, and keep the rim only on the backlit edge, using the art-scenes sun or moon vector. Expected to move: the subjects gain volume (light and form), and each card's lighting becomes its own.
3. **Vary composition per card.** Use crop, scale and viewpoint: a close-up head for the kraken, a small titan in a vast landscape, a low angle for the knights. Cluster texture marks at the one focal point. Camera dx of ±29 is only a nudge. Expected to move: "samey" in the hand and on the board.
