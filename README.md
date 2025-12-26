# 🏥 Kidney Disease Detection Platform

A complete AI-powered platform for detecting kidney diseases from CT scans using deep learning.

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   Node.js   │─────▶│   Python    │
│  Frontend   │      │   Backend   │      │   Flask     │
│  (Port 5173)│◀─────│  (Port 3000)│◀─────│  (Port 5000)│
└─────────────┘      └─────────────┘      └─────────────┘
     Upload              Base64              TensorFlow
     Image              Encoding             ResNet50 Model
```

## 📊 Classification System

The model classifies kidney CT scans into **4 categories**:

- **Normal**: Healthy kidney tissue
- **Cyst**: Fluid-filled sacs in the kidney
- **Stone**: Kidney stones (calculi)
- **Tumor**: Abnormal tissue growth

### Model Details

- **Architecture**: ResNet50 (Transfer Learning)
- **Training**: 4-fold Cross-validation
- **Model File**: `Random_Search_fold4.keras`
- **Input Size**: 256x256 RGB images
- **Classes**: ['Cyst', 'Normal', 'Stone', 'Tumor']

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### 1. Setup Python Server

```bash
cd python-server

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

Server runs on: `http://localhost:5000`

### 2. Setup Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Start server
npm start

# Or use nodemon for development
npm run dev
```

Server runs on: `http://localhost:3000`

### 3. Setup React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs on: `http://localhost:5173`

## 📁 Project Structure

```
kidney-disease/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── App.css          # Styling
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js backend
│   ├── index.js             # Express server
│   └── package.json
│
├── app.py                    # Python Flask server with model
│
├── model/                    # Trained models
│   └── saved_models/
│       └── Random_Search_fold4.keras
│
└── kidney-classifier/        # Training notebooks
    └── model.ipynb          # ResNet50 training notebook
```

## 🔌 API Endpoints

### Node.js Backend (`http://localhost:3000`)

#### Health Check

```
GET /api/health
```

#### Python Server Health

```
GET /api/python-health
```

#### Predict Single Image

```
POST /api/predict
Content-Type: multipart/form-data

Body: { image: <file> }
```

#### Predict Batch

```
POST /api/predict/batch
Content-Type: multipart/form-data

Body: { images: <file[]> }
```

### Python Server (`http://localhost:5000`)

#### Health Check

```
GET /health
```

#### Predict

```
POST /predict
Content-Type: application/json

Body: {
  image: "<base64_string>",
  mimetype: "image/jpeg",
  filename: "scan.jpg"
}

Response: {
  success: true,
  prediction: "Normal",
  confidence: 0.95,
  probabilities: {
    "Cyst": 0.02,
    "Normal": 0.95,
    "Stone": 0.01,
    "Tumor": 0.02
  },
  model: "Random_Search_fold4",
  classes: ["Cyst", "Normal", "Stone", "Tumor"]
}
```

## 🧪 Testing

### Test Python Server

```bash
cd python-server
python test_server.py
```

### Test with cURL

```bash
# Test backend health
curl http://localhost:3000/api/health

# Test Python server health
curl http://localhost:3000/api/python-health

# Upload image for prediction
curl -X POST http://localhost:3000/api/predict \
  -F "image=@path/to/your/image.jpg"
```

## 🎨 Features

### Frontend

- ✨ Modern, responsive UI
- 📤 Drag & drop image upload
- 🔍 Real-time image preview
- 📊 Visual confidence display for all 4 classes
- 🎯 Color-coded results
- ⚠️ Health warnings and recommendations

### Backend

- 🔄 Image format conversion (multipart → base64)
- 🛡️ File validation and size limits
- 📝 Comprehensive error handling
- 🔍 Health monitoring
- 📊 Batch processing support

### Python Server

- 🤖 ResNet50 transfer learning model
- 📈 Four-class classification (Cyst, Normal, Stone, Tumor)
- 🎯 Confidence scoring for all classes
- 🔄 Multiple input formats (base64 & file)
- 🚀 Optimized ResNet50 preprocessing (256x256)

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):

```env
PORT=3000
PYTHON_SERVER_URL=http://localhost:5000
```

**Python Server** (`.env`):

```env
PORT=5000
MODEL_PATH=model/saved_models/Random_Search_fold4.keras
```

## 🐛 Troubleshooting

### Python server won't start

- Check if model file exists at `model/saved_models/Random_Search_fold4.keras`
- Verify all dependencies are installed: `pip list`
- Check Python version: `python --version` (3.9-3.12 required, not 3.13+)
- Ensure TensorFlow is installed correctly

### Model prediction errors

- Verify preprocessing matches training (ResNet50, 256x256)
- Check label order: ['Cyst', 'Normal', 'Stone', 'Tumor']
- Ensure input images are RGB format

### Backend can't connect to Python server

- Ensure Python server is running on port 5000
- Check firewall settings
- Verify `PYTHON_SERVER_URL` in backend

### Frontend can't reach backend

- Ensure backend is running on port 3000
- Check CORS configuration
- Verify API URL in `App.jsx`

## 📝 License

This project is for educational and research purposes.

## ⚠️ Disclaimer

This is an AI-assisted diagnostic tool and should not replace professional medical advice. Always consult with healthcare professionals for accurate diagnosis and treatment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.
