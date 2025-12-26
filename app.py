import os
import warnings

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # 0=all, 1=info, 2=warning, 3=error
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN custom ops messages
warnings.filterwarnings('ignore', category=DeprecationWarning)

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load the trained model - Updated to Random_Search_fold4
# Use the correct path where your notebook saved the model
MODEL_PATH = r'kidney-classifier\saved_model\Random_Search_fold4.keras'

# Alternative: Check if file exists and provide helpful error
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model file not found at: {MODEL_PATH}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Looking for file at absolute path: {os.path.abspath(MODEL_PATH)}")
    # List what's actually in the directory
    base_dir = os.path.dirname(MODEL_PATH)
    if os.path.exists(base_dir):
        print(f"Files in {base_dir}:")
        for f in os.listdir(base_dir):
            print(f"  - {f}")

model = None

# IMPORTANT: Must match training labels exactly (same order)
LABELS = ['Cyst', 'Normal', 'Stone', 'Tumor']

def load_keras_model():
    """Load the Keras model at startup"""
    global model
    try:
        model = load_model(MODEL_PATH)
        print(f"✓ Model loaded successfully from {MODEL_PATH}")
        print(f"✓ Model expects input shape: {model.input_shape}")
        print(f"✓ Model outputs {model.output_shape[-1]} classes: {LABELS}")
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise e

def preprocess_image_from_file(img_file):
    """
    Preprocess uploaded image file for ResNet50 model
    MUST MATCH TRAINING PREPROCESSING EXACTLY
    
    Args:
        img_file: File object from request
    
    Returns:
        preprocessed image array
    """
    # Read image
    img = Image.open(io.BytesIO(img_file.read()))
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to 256x256 (MUST match training image_size)
    img = img.resize((256, 256))
    
    # Convert to array
    img_array = np.array(img)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    # Apply ResNet50 preprocessing (MUST match training)
    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
    
    return img_array

def preprocess_image_from_base64(base64_string):
    """
    Preprocess base64 encoded image for ResNet50 model
    MUST MATCH TRAINING PREPROCESSING EXACTLY
    
    Args:
        base64_string: Base64 encoded image string
    
    Returns:
        preprocessed image array
    """
    # Decode base64 string
    img_data = base64.b64decode(base64_string)
    
    # Read image
    img = Image.open(io.BytesIO(img_data))
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to 256x256 (MUST match training image_size)
    img = img.resize((256, 256))
    
    # Convert to array
    img_array = np.array(img)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    # Apply ResNet50 preprocessing (MUST match training)
    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
    
    return img_array

def classify_prediction(predictions):
    """
    Process multi-class predictions
    
    Args:
        predictions: Array of probabilities for each class [Cyst, Normal, Stone, Tumor]
    
    Returns:
        dict: Classification result with all class probabilities
    """
    # Get predicted class index
    predicted_idx = np.argmax(predictions)
    predicted_class = LABELS[predicted_idx]
    confidence = float(predictions[predicted_idx])
    
    # Create probability map for all classes
    class_probabilities = {
        label: float(prob) for label, prob in zip(LABELS, predictions)
    }
    
    return {
        'predicted_class': predicted_class,
        'confidence': confidence,
        'all_probabilities': class_probabilities
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'classes': LABELS
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict kidney condition from uploaded CT scan image
    Now supports 4 classes: Cyst, Normal, Stone, Tumor
    """
    try:
        # Check if request is JSON (base64) or form-data (file upload)
        if request.is_json:
            data = request.get_json()
            
            if 'image' not in data:
                return jsonify({
                    'error': 'No image data provided',
                    'message': 'Please provide base64 encoded image in "image" field'
                }), 400
            
            base64_image = data['image']
            img_array = preprocess_image_from_base64(base64_image)
            
        else:
            if 'image' not in request.files:
                return jsonify({
                    'error': 'No image file provided',
                    'message': 'Please upload an image file with key "image"'
                }), 400
            
            img_file = request.files['image']
            
            if img_file.filename == '':
                return jsonify({
                    'error': 'Empty filename',
                    'message': 'Please select a valid image file'
                }), 400
            
            img_array = preprocess_image_from_file(img_file)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)[0]
        
        # Classify
        result = classify_prediction(predictions)
        
        return jsonify({
            'success': True,
            'prediction': result['predicted_class'],
            'confidence': result['confidence'],
            'probabilities': result['all_probabilities'],
            'model': 'Random_Search_fold4',
            'classes': LABELS
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict multiple images at once
    Now supports 4 classes: Cyst, Normal, Stone, Tumor
    """
    try:
        results = []
        
        if request.is_json:
            data = request.get_json()
            
            if 'images' not in data or not isinstance(data['images'], list):
                return jsonify({
                    'error': 'No image data provided',
                    'message': 'Please provide an array of base64 encoded images'
                }), 400
            
            images = data['images']
            
            if len(images) == 0:
                return jsonify({
                    'error': 'Empty image list',
                    'message': 'Please provide at least one image'
                }), 400
            
            for idx, img_data in enumerate(images):
                try:
                    base64_image = img_data.get('image')
                    filename = img_data.get('filename', f'image_{idx}')
                    
                    img_array = preprocess_image_from_base64(base64_image)
                    predictions = model.predict(img_array, verbose=0)[0]
                    result = classify_prediction(predictions)
                    
                    results.append({
                        'index': idx,
                        'filename': filename,
                        'success': True,
                        'prediction': result['predicted_class'],
                        'confidence': result['confidence'],
                        'probabilities': result['all_probabilities']
                    })
                
                except Exception as e:
                    results.append({
                        'index': idx,
                        'filename': img_data.get('filename', f'image_{idx}'),
                        'success': False,
                        'error': str(e)
                    })
        
        else:
            if 'images' not in request.files:
                return jsonify({
                    'error': 'No image files provided',
                    'message': 'Please upload image files with key "images"'
                }), 400
            
            images = request.files.getlist('images')
            
            if len(images) == 0:
                return jsonify({
                    'error': 'Empty file list',
                    'message': 'Please select valid image files'
                }), 400
            
            for idx, img_file in enumerate(images):
                try:
                    img_array = preprocess_image_from_file(img_file)
                    predictions = model.predict(img_array, verbose=0)[0]
                    result = classify_prediction(predictions)
                    
                    results.append({
                        'index': idx,
                        'filename': img_file.filename,
                        'success': True,
                        'prediction': result['predicted_class'],
                        'confidence': result['confidence'],
                        'probabilities': result['all_probabilities']
                    })
                
                except Exception as e:
                    results.append({
                        'index': idx,
                        'filename': img_file.filename,
                        'success': False,
                        'error': str(e)
                    })
        
        return jsonify({
            'success': True,
            'total': len(results),
            'results': results,
            'model': 'Random_Search_fold4',
            'classes': LABELS
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    load_keras_model()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
