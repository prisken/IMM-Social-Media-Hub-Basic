import React, { useState, useEffect } from 'react';
import './ProductLibrary.css';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  sku?: string;
  mediaFiles: string[];
  tags: string[];
  features: string[];
  specifications: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductImage {
  id: string;
  productId: string;
  imagePath: string;
  imageType: 'main' | 'detail' | 'lifestyle' | 'in-use' | 'generated';
  prompt?: string;
  generationSettings?: {
    style: string;
    background: string;
    lighting: string;
    composition: string;
  };
  createdAt: string;
}

interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templatePath: string;
  thumbnailPath: string;
  settings: {
    width: number;
    height: number;
    format: string;
    quality: number;
  };
  isActive: boolean;
  createdAt: string;
}

const ProductLibrary: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'images' | 'templates'>('list');
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    sku: '',
    tags: '',
    features: '',
    specifications: '',
    isActive: true
  });

  // AI Image Generation states
  const [imageGeneration, setImageGeneration] = useState({
    prompt: '',
    style: 'realistic',
    background: 'studio',
    lighting: 'professional',
    composition: 'centered',
    useCloudGeneration: false
  });

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Beauty', 'Sports', 
    'Books', 'Toys', 'Automotive', 'Health', 'Food & Beverage', 'Other'
  ];

  const styles = [
    'realistic', 'minimalist', 'vintage', 'modern', 'artistic', 
    'commercial', 'lifestyle', 'studio', 'outdoor', 'dramatic'
  ];

  const backgrounds = [
    'studio', 'white', 'gradient', 'nature', 'urban', 'abstract', 
    'texture', 'pattern', 'solid', 'transparent'
  ];

  const lighting = [
    'professional', 'natural', 'dramatic', 'soft', 'harsh', 
    'warm', 'cool', 'studio', 'outdoor', 'mixed'
  ];

  const compositions = [
    'centered', 'rule-of-thirds', 'asymmetric', 'symmetrical', 
    'close-up', 'wide-angle', 'overhead', 'low-angle', 'dynamic'
  ];

  useEffect(() => {
    loadProducts();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductImages(selectedProduct.id);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await window.electronAPI.db.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductImages = async (productId: string) => {
    try {
      const images = await window.electronAPI.db.getProductImages(productId);
      setProductImages(images);
    } catch (error) {
      console.error('Error loading product images:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await window.electronAPI.db.getProductTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleAddProduct = async () => {
    try {
      setLoading(true);
      const productData = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: productForm.price ? parseFloat(productForm.price) : undefined,
        sku: productForm.sku || undefined,
        mediaFiles: [],
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        features: productForm.features.split(',').map(feature => feature.trim()).filter(feature => feature),
        specifications: productForm.specifications ? JSON.parse(productForm.specifications) : {},
        isActive: productForm.isActive
      };

      await window.electronAPI.db.addProduct(productData);
      await loadProducts();
      setView('list');
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const updates = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: productForm.price ? parseFloat(productForm.price) : undefined,
        sku: productForm.sku || undefined,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        features: productForm.features.split(',').map(feature => feature.trim()).filter(feature => feature),
        specifications: productForm.specifications ? JSON.parse(productForm.specifications) : {},
        isActive: productForm.isActive
      };

      await window.electronAPI.db.updateProduct(selectedProduct.id, updates);
      await loadProducts();
      setView('list');
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      await window.electronAPI.db.deleteProduct(productId);
      await loadProducts();
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedProduct || !imageGeneration.prompt) {
      alert('Please select a product and enter a prompt');
      return;
    }

    try {
      setLoading(true);
      
      // Generate image using AI
      const imagePath = await window.electronAPI.ai.generateProductImage({
        productId: selectedProduct.id,
        prompt: imageGeneration.prompt,
        settings: {
          style: imageGeneration.style,
          background: imageGeneration.background,
          lighting: imageGeneration.lighting,
          composition: imageGeneration.composition
        },
        useCloudGeneration: imageGeneration.useCloudGeneration
      });

      // Save image to database
      await window.electronAPI.db.addProductImage({
        productId: selectedProduct.id,
        imagePath,
        imageType: 'generated',
        prompt: imageGeneration.prompt,
        generationSettings: {
          style: imageGeneration.style,
          background: imageGeneration.background,
          lighting: imageGeneration.lighting,
          composition: imageGeneration.composition
        }
      });

      await loadProductImages(selectedProduct.id);
      setImageGeneration(prev => ({ ...prev, prompt: '' }));
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template: ProductTemplate) => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    try {
      setLoading(true);
      
      const imagePath = await window.electronAPI.ai.createProductImageFromTemplate({
        productId: selectedProduct.id,
        templateId: template.id,
        settings: template.settings
      });

      await window.electronAPI.db.addProductImage({
        productId: selectedProduct.id,
        imagePath,
        imageType: 'generated',
        prompt: `Generated using template: ${template.name}`,
        generationSettings: {
          style: 'template-based',
          background: 'template',
          lighting: 'template',
          composition: 'template'
        }
      });

      await loadProductImages(selectedProduct.id);
    } catch (error) {
      console.error('Error creating image from template:', error);
      alert('Error creating image from template: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: '',
      price: '',
      sku: '',
      tags: '',
      features: '',
      specifications: '',
      isActive: true
    });
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price?.toString() || '',
      sku: product.sku || '',
      tags: product.tags.join(', '),
      features: product.features.join(', '),
      specifications: JSON.stringify(product.specifications, null, 2),
      isActive: product.isActive
    });
    setView('edit');
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('images');
  };

  const renderProductList = () => (
    <div className="product-list">
      <div className="product-list-header">
        <h2>Product Library</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setSelectedProduct(null);
            resetForm();
            setView('add');
          }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.mediaFiles.length > 0 ? (
                  <img src={`file://${product.mediaFiles[0]}`} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="category">{product.category}</p>
                <p className="description">{product.description.substring(0, 100)}...</p>
                {product.price && <p className="price">${product.price}</p>}
                <div className="product-actions">
                  <button onClick={() => selectProduct(product)}>View Images</button>
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProductForm = () => (
    <div className="product-form">
      <h2>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          value={productForm.name}
          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Product name"
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={productForm.description}
          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Product description"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            value={productForm.category}
            onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>SKU</label>
          <input
            type="text"
            value={productForm.sku}
            onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
            placeholder="Stock keeping unit"
          />
        </div>

        <div className="form-group">
          <label>Active</label>
          <input
            type="checkbox"
            checked={productForm.isActive}
            onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={productForm.tags}
          onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="form-group">
        <label>Features (comma-separated)</label>
        <input
          type="text"
          value={productForm.features}
          onChange={(e) => setProductForm(prev => ({ ...prev, features: e.target.value }))}
          placeholder="feature1, feature2, feature3"
        />
      </div>

      <div className="form-group">
        <label>Specifications (JSON)</label>
        <textarea
          value={productForm.specifications}
          onChange={(e) => setProductForm(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder='{"color": "red", "size": "large"}'
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button 
          className="btn-primary"
          onClick={selectedProduct ? handleUpdateProduct : handleAddProduct}
          disabled={loading}
        >
          {loading ? 'Saving...' : (selectedProduct ? 'Update Product' : 'Add Product')}
        </button>
        <button onClick={() => setView('list')}>Cancel</button>
      </div>
    </div>
  );

  const renderImageGeneration = () => (
    <div className="image-generation">
      <div className="generation-header">
        <h2>AI Image Generation</h2>
        <button onClick={() => setView('templates')}>Use Templates</button>
      </div>

      <div className="generation-form">
        <div className="form-group">
          <label>Prompt *</label>
          <textarea
            value={imageGeneration.prompt}
            onChange={(e) => setImageGeneration(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="Describe the image you want to generate..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Style</label>
            <select
              value={imageGeneration.style}
              onChange={(e) => setImageGeneration(prev => ({ ...prev, style: e.target.value }))}
            >
              {styles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Background</label>
            <select
              value={imageGeneration.background}
              onChange={(e) => setImageGeneration(prev => ({ ...prev, background: e.target.value }))}
            >
              {backgrounds.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lighting</label>
            <select
              value={imageGeneration.lighting}
              onChange={(e) => setImageGeneration(prev => ({ ...prev, lighting: e.target.value }))}
            >
              {lighting.map(light => (
                <option key={light} value={light}>{light}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Composition</label>
            <select
              value={imageGeneration.composition}
              onChange={(e) => setImageGeneration(prev => ({ ...prev, composition: e.target.value }))}
            >
              {compositions.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={imageGeneration.useCloudGeneration}
              onChange={(e) => setImageGeneration(prev => ({ ...prev, useCloudGeneration: e.target.checked }))}
            />
            Use Cloud Generation (faster, costs apply)
          </label>
        </div>

        <button 
          className="btn-primary"
          onClick={handleGenerateImage}
          disabled={loading || !imageGeneration.prompt}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      <div className="product-images">
        <h3>Product Images</h3>
        <div className="images-grid">
          {productImages.map(image => (
            <div key={image.id} className="image-card">
              <img src={`file://${image.imagePath}`} alt={`Product ${image.imageType}`} />
              <div className="image-info">
                <span className="image-type">{image.imageType}</span>
                {image.prompt && <p className="image-prompt">{image.prompt}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="templates">
      <div className="templates-header">
        <h2>Product Templates</h2>
        <button onClick={() => setView('images')}>Back to Images</button>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <img src={`file://${template.thumbnailPath}`} alt={template.name} />
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <p className="template-category">{template.category}</p>
              <button 
                className="btn-primary"
                onClick={() => handleCreateFromTemplate(template)}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Use Template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="product-library">
      <div className="product-library-header">
        <button 
          className={view === 'list' ? 'active' : ''}
          onClick={() => setView('list')}
        >
          Products
        </button>
        {selectedProduct && (
          <>
            <button 
              className={view === 'images' ? 'active' : ''}
              onClick={() => setView('images')}
            >
              Images
            </button>
            <button 
              className={view === 'templates' ? 'active' : ''}
              onClick={() => setView('templates')}
            >
              Templates
            </button>
          </>
        )}
      </div>

      <div className="product-library-content">
        {view === 'list' && renderProductList()}
        {view === 'add' && renderProductForm()}
        {view === 'edit' && renderProductForm()}
        {view === 'images' && selectedProduct && renderImageGeneration()}
        {view === 'templates' && renderTemplates()}
      </div>
    </div>
  );
};

export default ProductLibrary;

