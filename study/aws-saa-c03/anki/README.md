# Anki cards

Flashcards belong in [`cards.tsv`](cards.tsv). The file is prepared as tab-separated text for Anki import.

Before adding or reorganizing cards, use the available Anki-card skill so card wording and import format stay consistent.

## Card rules

- Test one fact, distinction, or architecture decision per card.
- Make the prompt understandable without the course open.
- Prefer recall questions over copied definitions.
- Keep answers short; link to a note when more context is needed.
- Use tags such as `aws`, `saa-c03`, and `iam` or `ec2`.
- Do not turn every sentence into a card. Focus on durable knowledge and mistakes worth remembering.

The initial columns are `Front`, `Back`, and `Tags`. If the Anki skill chooses a different note type later, document the migration here.
