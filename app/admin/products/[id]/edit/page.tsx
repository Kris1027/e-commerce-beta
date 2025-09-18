import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductEditForm } from '@/components/admin/product-edit-form';
import { getProductById } from '@/lib/actions/admin-product-actions';

export const metadata: Metadata = {
  title: 'Edit Product | Admin',
  description: 'Edit product details',
};

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Edit Product
        </h1>
        <p className="text-muted-foreground mt-2">
          Update product information and manage images
        </p>
      </div>

      <ProductEditForm product={product} />
    </div>
  );
}