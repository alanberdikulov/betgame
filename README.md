# Sequence Models, NER & Transformer Fine-Tuning in PyTorch

A three-part NLP project implementing character-level text generation, named entity recognition, and BERT fine-tuning for text classification — all in PyTorch.

## About

This project builds three progressively complex NLP systems, each addressing a different sequence modeling paradigm:

| Part | Task | Model | Key Technique |
|------|------|-------|---------------|
| **I** | Character-level text generation | LSTM | Temperature-controlled autoregressive sampling |
| **II** | Named Entity Recognition (NER) | Bidirectional GRU | Many-to-many sequence tagging with IOB labels |
| **III** | Abstract relevance classification | BERT / DeBERTa | Transformer fine-tuning with Hugging Face |

## Part I — Character-Level Language Modeling

Generate text in the style of **Edward Lear** using a character-level LSTM trained on his collected works (via Project Gutenberg).

### Architecture
```
Embedding(57, 64) → LSTM(64, 128) → Linear(128, 57)
```

### Pipeline
1. Clean & lowercase the corpus → 133k characters, 57 unique tokens
2. Build sliding-window input–target pairs (window=100, step=1)
3. Train with CrossEntropyLoss + Adam for 5 epochs
4. Generate text at temperatures 0.2, 0.5, 1.0
5. Evaluate with **perplexity** (exp of average cross-entropy)

## Part II — Named Entity Recognition

Tag tokens in sentences with IOB entity labels (person, organization, location, time, etc.) using a bidirectional GRU.

### Architecture
```
Embedding(vocab, 50, pad_idx=0) → Dropout(0.5) → BiGRU(50, 100) → Linear(200, n_tags)
```

### Pipeline
1. Group token-level dataframe into sentences of (word, tag) pairs
2. Build word/tag vocabularies (index 0 reserved for padding)
3. Left-pad all sequences to max sentence length
4. Train/val/test split (81/9/10) → train 8 epochs with best-checkpoint saving
5. Evaluate with **per-tag F1 scores** (padding excluded)
6. Visualize BiGRU hidden states with **PCA** (B- vs I- tag separation)

## Part III — Transformer Fine-Tuning

Classify scientific abstracts as **irrelevant (0)** or **not irrelevant (1)** by fine-tuning pretrained transformers.

### Models
- **BERT** (`bert-base-uncased`) — 110M parameters, AdamW(lr=2e-5), 3 epochs
- **DeBERTa** (`microsoft/deberta-v3-base`) — optional extension with disentangled attention

### Pipeline
1. Load & combine three abstract CSVs with binary labels
2. Stratified 90/10 train/validation split
3. Tokenize with Hugging Face `AutoTokenizer` (max_length=512)
4. Fine-tune with checkpoint saving and early stopping
5. Evaluate with **confusion matrix** and high-confidence example inspection

### Key Findings
- Class imbalance (~87% irrelevant) inflates overall accuracy — confusion matrix reveals the model under-predicts the minority class
- High-confidence decoded examples serve as a qualitative sanity check

## Project Structure

```
.
├── README.md
├── sequence_models_ner_transformers.ipynb
├── data/
│   ├── edward_lear.txt                          # Edward Lear corpus
│   ├── pg13650.txt                              # Full Project Gutenberg text
│   ├── ner_dataset.csv                          # NER tagged sequences
│   ├── review_78678_irrelevant.csv              # Abstracts (irrelevant)
│   ├── review_78678_not_irrelevant_included.csv # Abstracts (not irrelevant)
│   └── review_78678_not_irrelevant_excluded.csv # Abstracts (not irrelevant)
└── artifacts/                                    # Saved checkpoints & histories
```

## Setup

### Requirements

```bash
pip install torch numpy pandas matplotlib scikit-learn transformers
```

### Running

```bash
jupyter notebook sequence_models_ner_transformers.ipynb
```

A GPU is strongly recommended. The notebook saves all trained model checkpoints and training histories to `artifacts/`, so subsequent runs skip training automatically.

## Technologies

| Library | Usage |
|---------|-------|
| PyTorch | All three models (LSTM, BiGRU, BERT fine-tuning) |
| Hugging Face Transformers | BERT/DeBERTa tokenizers and pretrained models |
| scikit-learn | Train/test splits, F1 scores, confusion matrices, PCA |
| matplotlib | Loss curves, F1 bar charts, PCA scatter plots |
| NumPy / Pandas | Data processing and encoding |

## License

This project is provided for educational purposes.
