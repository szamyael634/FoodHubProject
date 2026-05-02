"""
Hub E-Commerce - Flask Application for Vercel Deployment
Serves as the main framework for the application
"""

import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gladttjcpcgpvxdrhqmx.supabase.co')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_FUNCTIONS_URL = f"{SUPABASE_URL}/functions/v1"

@app.route('/')
def index():
    """Serve the frontend index.html"""
    try:
        return send_from_directory('frontend', 'index.html')
    except FileNotFoundError:
        return jsonify({
            'error': 'Frontend not found',
            'message': 'Please build the frontend first'
        }), 404

@app.route('/<path:path>')
def serve_frontend(path):
    """Serve static frontend files"""
    try:
        return send_from_directory('frontend', path)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Hub E-Commerce API',
        'supabase_url': SUPABASE_URL
    })

@app.route('/api/<path:function_path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy_supabase_function(function_path):
    """Proxy API requests to Supabase Edge Functions"""
    
    # Build the target URL
    target_url = f"{SUPABASE_FUNCTIONS_URL}/{function_path}"
    
    # Get query parameters
    query_params = request.args.to_dict()
    
    # Prepare headers
    headers = {
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Add any custom headers from the request
    for key, value in request.headers:
        if key.lower() not in ['host', 'content-length']:
            headers[key] = value
    
    try:
        # Make the request to Supabase
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            json=request.get_json() if request.is_json else None,
            data=request.get_data() if not request.is_json else None,
            params=query_params,
            timeout=30
        )
        
        # Return the response
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Failed to proxy request to Supabase',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# Vercel entry point
def handler(environ, start_response):
    """WSGI handler for Vercel"""
    return app(environ, start_response)

if __name__ == '__main__':
    # Local development
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
