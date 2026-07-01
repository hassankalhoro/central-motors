-- Flexible per-product data: variant comparison matrix + colour options.
ALTER TABLE "Product" ADD COLUMN "specs" JSONB;
