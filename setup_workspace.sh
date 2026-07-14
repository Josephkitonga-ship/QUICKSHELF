#!/bin/bash
set -e

echo "========================================================="
echo "        QUICKSHELF MONOREPO WORKSPACE BUILDER            "
echo "========================================================="

echo "📁 Creating application directories..."
mkdir -p apps/api-gateway/src/config
mkdir -p apps/api-gateway/src/controllers
mkdir -p apps/api-gateway/src/queues/workers
mkdir -p apps/api-gateway/src/utils

mkdir -p apps/pos-app/src/screens
mkdir -p apps/pos-app/src/hooks
mkdir -p apps/pos-app/src/services
mkdir -p apps/pos-app/desktop

mkdir -p apps/tenant-storefront/src/app/\[tenant\]/item/\[id\]
mkdir -p apps/tenant-storefront/src/app/\[tenant\]/checkout
mkdir -p apps/tenant-storefront/public

mkdir -p packages/shared-types/src
mkdir -p packages/shared-ui/src/components
mkdir -p packages/shared-ui/src/theme
mkdir -p tenants/template/pb_data
mkdir -p scripts

echo "✍️ Writing configurations..."
cat << 'E_INNER' > package.json
{
  "name": "quickshelf-workspace",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:gateway": "bun --filter api-gateway dev",
    "dev:storefront": "bun --filter tenant-storefront dev"
  }
}
E_INNER

cat << 'E_INNER' > bunfig.toml
[install]
lockfile = true
E_INNER

cat << 'E_INNER' > packages/shared-types/package.json
{
  "name": "@quickshelf/shared-types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
E_INNER

cat << 'E_INNER' > packages/shared-types/src/index.ts
export type MarketplaceChannel = 'jumia' | 'kilimall';
export type IntegrationStatus = 'active' | 'paused' | 'error';

export interface MarketplaceConnection {
  id: string;
  productId: string;
  platformName: MarketplaceChannel;
  marketplaceSku: string;
  syncEnabled: boolean;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
}

export interface Product {
  id: string;
  skuReference: string;
  title: string;
  description: string | null;
  basePriceKes: number;
  unifiedStock: number;
  isPublishedStorefront: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithIntegrations extends Product {
  integrations: MarketplaceConnection[];
}

export type OrderSourceChannel = 'pos' | 'storefront' | 'jumia' | 'kilimall';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'mpesa' | 'cash' | 'marketplace_escrow';

export interface OrderItem {
  id?: number;
  orderId: string;
  productId: string;
  quantityRequested: number;
  unitPriceKes: number;
}

export interface Order {
  id: string;
  sourceChannel: OrderSourceChannel;
  externalOrderReference: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmountKes: number;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
E_INNER

cat << 'E_INNER' > apps/api-gateway/package.json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "dev": "bun --hot src/index.ts"
  },
  "dependencies": {
    "@quickshelf/shared-types": "workspace:*",
    "hono": "^4.0.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0",
    "dotenv": "^16.0.0"
  }
}
E_INNER

cat << 'E_INNER' > apps/tenant-storefront/package.json
{
  "name": "tenant-storefront",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@quickshelf/shared-types": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
E_INNER

cat << 'E_INNER' > apps/pos-app/package.json
{
  "name": "pos-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@quickshelf/shared-types": "workspace:*",
    "expo": "~51.0.0",
    "pocketbase": "^0.21.0",
    "react": "18.2.0",
    "react-native": "0.74.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.0.0"
  }
}
E_INNER

cat << 'E_INNER' > packages/shared-ui/package.json
{
  "name": "@quickshelf/shared-ui",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "dependencies": {
    "react": "^18.0.0"
  }
}
E_INNER

cat << 'E_INNER' > packages/shared-ui/src/index.ts
export const VERSION = "1.0.0";
E_INNER

echo "⚡ Running Bun structural package linkages..."
bun install

echo "========================================================="
echo "🎉 SUCCESS: Quickshelf monorepo layout fully established!"
echo "========================================================="
