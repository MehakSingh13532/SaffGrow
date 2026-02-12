# ML Models and Datasets

This directory contains machine learning models and datasets for the Saffron Dashboard project.

## Large Files (Git Ignored)

The following files are **not** included in the repository due to size constraints:

### 1. `Saffron_Kashmir_Natural_High_Res_Dataset.csv` (54 MB)
- Contains high-resolution saffron imagery and cultivation data
- Download from: [Your data source or cloud storage link]
- Place in this `ML/` directory before running training

### 2. `saffgrow_brain.pkl` (2.6 GB)
- Pre-trained ML model for saffron growth prediction
- Download from: [Your model storage link]
- Required for running predictions via `app.js`

### 3. `*.pkl` files
- All serialized model files are excluded from git

## Setup Instructions

1. **Download Large Files**
   ```bash
   # Download from your cloud storage/server
   # Place in ML/ directory
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Train or Use Model**
   ```bash
   python train_model.py
   ```

## .gitignore Configuration

Large files are excluded via `.gitignore`:
- `ML/Saffron_Kashmir_Natural_High_Res_Dataset.csv`
- `ML/*.pkl`
- `ML/*.h5`
- `ML/*.joblib`
- `ML/*.model`

## To Share Large Files

Use one of these alternatives:
- **Git LFS** (Git Large File Storage)
- **DVC** (Data Version Control)
- **Cloud Storage** (Google Drive, Dropbox, AWS S3)
- **Direct Download Links** in documentation
