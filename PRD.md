Build an OSS prototype for a multilingual username generator.

Goal

Create a small, clean, extensible library + CLI that generates human-readable pseudonymous usernames from language-specific dictionaries.

The output should feel like:
	•	readable
	•	mildly poetic / absurd / memorable
	•	not obviously tied to a real person
	•	culturally shaped by each language pack
	•	deterministic when seeded
	•	easy to extend with more languages later

Initial scope:
	1.	English
	•	support “standard American / Midwestern / Anglosphere but it's the 19th century UK or New England” style names
	•	examples of vibe:
	•	Elliot Parker
	•	Molly Whitaker
	•	Caleb Mercer
	•	Hazel Bennettson
	2.	Russian poetic
	•	support slightly absurd, literary, old-Russian-Empire / USSR-nomenklatura / fake-formal vibe
	•	examples of vibe:
	•	Эрнест Елисеев
	•	Поллианна Евфратьева
	•	Себастьян Больжедоров
	•	Аполлинарий Кондратьев
This is not a real-person generator. It should feel plausible enough to read, but often improbable or stylized.

The dictionaries will live in the repo and be editable by hand.

Important design constraints

Optimize for:
	•	readability
	•	maintainability
	•	explicit interfaces
	•	simple domain model
	•	SOLID-ish design without overengineering
	•	minimal dependencies
	•	cross-platform friendliness
	•	future portability to other languages/stacks

	•	TypeScript: plain Node + tsup/tsc + vitest

Focus on a library + CLI + tests + sample dictionaries.

Core product requirements

We are generating a “person-like” username, but the system must support naming systems that vary by locale.

Important: not every language uses given_name + surname.

Examples:
	•	English: given_name surname
	•	Some locales: surname given_name
	•	Some locales: single-name only
	•	Some locales may later require optional patronymic, middle name, clan name, particles, honorifics, etc.

So the interface design must not hardcode Western assumptions.

Design for a generic structured output.

Domain model requirements

Design a domain model for generated names that can represent:
	•	one-part names
	•	two-part names
	•	multi-part names
	•	different display orders
	•	language/locale metadata
	•	gender/style metadata when needed
	•	optional grammatical features for future use

At minimum, I want a generated result object that can express something like:
	•	internal structured parts
	•	rendered display string
	•	locale identifier
	•	style identifier
	•	seed used
	•	optional metadata tags

Example idea, not mandatory:
	•	GeneratedName
	•	parts: NamePart[]
	•	display: string
	•	locale: string
	•	style: string
	•	seed?: string | number
	•	metadata?: Record<string, unknown>

And each NamePart could have:
	•	type such as given, surname, patronymic, single, particle, etc.
	•	value
	•	position
	•	optional grammatical metadata

You do not need full linguistic correctness. Just design the interfaces so future packs can become more advanced.

Functional requirements

Implement:

1. Library API

A clean public API for:
	•	listing supported locales/styles
	•	generating one name
	•	generating many names
	•	seeding generation for reproducibility
	•	validating dictionary packs at load time
	•	rendering generated names to strings

2. CLI

A minimal CLI that supports commands like:
	•	generate one name
	•	generate N names
	•	choose locale
	•	choose style
	•	provide seed
	•	output JSON or plain text
	•	optionally inspect available locales/styles

Exact syntax is up to you, but keep it simple.

3. Dictionary-driven generation

The generator should load language packs from local files in the repo.

The dictionaries must be human-editable.

JSON

Each language pack should be easy to understand and update manually.

Initial language packs

Implement two initial packs:

A. en

An Anglosphere pack.

Use simple categories like:
	•	masculine given names
	•	feminine given names
	•	neutral given names
	•	surnames

The generator may choose from:
	•	masculine + surname
	•	feminine + surname
	•	neutral + surname

You may support a gender or style filter if cleanly designed, but keep v1 simple.

Use a small starter dictionary, around 80 entries per relevant category, enough to show structure clearly.

B. ru

A Russian stylized pack with a slightly absurd literary/bureaucratic flavor.


Support at least:
	•	given names
	•	full surnames

Store ready-made masculine and feminine surnames.

it is okay if the output is more evocative than strictly realistic.
Examples of acceptable vibe:
	•	Эрнест Елисеев
	•	Поллианна Евфратьева
	•	Аврора Кондратьева
	•	Аполлинарий Больжедоров

Avoid slurs, offensive words, overtly political references, or celebrity names (even a name like Dick or Dickenson can fail to pass word filters in some places)

Architecture requirements

I want the design to be interface-first.

Please structure the project roughly around:
	•	domain models
	•	generator interfaces
	•	pack/provider interfaces
	•	rendering
	•	validation
	•	CLI entrypoint
	•	concrete locale pack implementations

A good architecture would probably include concepts like:
	•	NameGenerator interface
	•	NamePack interface
	•	PackLoader or PackRepository
	•	NameRenderer
	•	RandomSource abstraction for deterministic seeding
	•	PackValidator

Do not blindly create layers just to look enterprise.
Keep it small and justified.

I want a clean separation between:
	•	the generic engine
	•	locale-specific data
	•	locale-specific composition rules
	•	presentation / CLI

Determinism and randomness

Implement deterministic generation with a seed.

Requirements:
	•	same seed + same locale/style + same code version + same dictionary => same result
	•	if no seed is provided, use a random source
	•	make the RNG abstraction replaceable and testable

Do not use unstable iteration order or hidden randomness that breaks reproducibility.

Validation requirements

Validate packs on startup or load.

Catch things like:
	•	missing required categories
	•	empty arrays where forbidden
	•	duplicate entries if relevant
	•	malformed schema
	•	unsupported part types
	•	illegal config combinations

Validation errors should be readable.

Rendering requirements

Support:
	•	plain rendered display string

Do not hardwire rendering only to "given surname".

The rendering layer should respect pack-defined display order.

Extensibility requirements

Design the system so that later I can add languages such as:
	•	Japanese
	•	Hungarian
	•	Indonesian single-name patterns
	•	Icelandic patronymic patterns
	•	Arabic multi-part names

You do not need to implement these now.
But the interfaces should not make them awkward.

Avoid assumptions like:
	•	every locale has surname
	•	every locale has exactly 2 parts
	•	every locale uses the same order
	•	every locale can be represented by one flat array

Repo requirements

Set up a clean OSS-ready repository structure.

Include:
	•	README
	•	license placeholder or recommendation
	•	clear folder structure
	•	sample dictionaries
	•	tests
	•	example CLI usage
	•	contribution notes for adding a new locale pack

Suggested structure, adapt as needed:

For Python:
	•	src/namegen/...
	•	tests
	•	packs

README requirements

Write a useful README that explains:
	•	what the project does
	•	why the architecture looks like this
	•	how to run it
	•	how to generate names
	•	how to add a new language pack
	•	current limitations
	•	examples of output

Keep the README practical, not marketing-fake.

Testing requirements

Add tests for:
	•	deterministic seeded generation
	•	pack validation
	•	rendering order
	•	English output shape
	•	Russian output shape
	•	CLI happy path
	•	at least one failure case for invalid pack data

Prefer small focused tests over giant integration spaghetti.

Coding style requirements
	•	keep functions small
	•	prefer explicit naming over cleverness
	•	avoid magical metaprogramming
	•	avoid framework cosplay
	•	avoid premature generic abstractions that hurt readability
	•	use comments only where they add real clarity
	•	add docstrings / TSDoc for public interfaces
	•	keep the code teachable

This is an OSS prototype, so optimize for “someone can open this repo and understand it fast”.

Non-goals for v1

Do not build:
	•	web frontend
	•	REST API
	•	database
	•	user accounts
	•	package publishing pipeline unless very light
	•	machine-learning name generation
	•	transliteration system
	•	localization UI
	•	huge corpus ingestion pipeline

Deliverables

I want the coding task to produce:
	1.	working library
	2.	working CLI
	3.	two starter language packs
	4.	tests
	5.	README
	6.	example outputs
	7.	clean folder structure

Implementation details to decide

You should make reasonable decisions for:
	•	exact file format for packs
	•	exact RNG implementation
	•	exact CLI parser
	•	exact validation approach
	•	exact public API shape

But explain these decisions briefly in README or code comments where useful.

Output examples

The prototype should be able to output things like:

English:
	•	Molly Bennett
	•	Caleb Whitaker
	•	Elliot Parker
	•	Nora Mercer

Russian poetic:
	•	Эрнест Кондратьев
	•	Поллианна Евфратьева
	•	Себастьян Елисеев
	•	Аврора Больжедорова

Again, exact outputs need not match these, but the vibe should be close.

Acceptance criteria

I will consider the task successful if:
	•	I can run the CLI and generate names for both locales
	•	seeded runs are reproducible
	•	the architecture does not hardcode Western naming assumptions
	•	dictionaries are easy to inspect and edit manually
	•	the code is clean enough to serve as a base for more locales
	•	the README explains how to extend the system
	•	tests pass

Do not let nice-to-haves distort the architecture.

Final instruction

Build the prototype directly.
Do not overcomplicate the abstraction tree.
Make the simplest architecture that still cleanly supports future non-Western naming patterns.
