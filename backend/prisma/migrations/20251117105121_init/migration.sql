-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "area_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_reps" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'SR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_reps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retailers" (
    "id" SERIAL NOT NULL,
    "uid" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "region_id" INTEGER,
    "area_id" INTEGER,
    "distributor_id" INTEGER,
    "territory_id" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "routes" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_rep_retailers" (
    "id" SERIAL NOT NULL,
    "sales_rep_id" INTEGER NOT NULL,
    "retailer_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" INTEGER,

    CONSTRAINT "sales_rep_retailers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE INDEX "areas_region_id_idx" ON "areas"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_region_id_key" ON "areas"("name", "region_id");

-- CreateIndex
CREATE UNIQUE INDEX "distributors_name_key" ON "distributors"("name");

-- CreateIndex
CREATE INDEX "territories_area_id_idx" ON "territories"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "territories_name_area_id_key" ON "territories"("name", "area_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_reps_username_key" ON "sales_reps"("username");

-- CreateIndex
CREATE INDEX "sales_reps_username_idx" ON "sales_reps"("username");

-- CreateIndex
CREATE INDEX "sales_reps_role_idx" ON "sales_reps"("role");

-- CreateIndex
CREATE UNIQUE INDEX "retailers_uid_key" ON "retailers"("uid");

-- CreateIndex
CREATE INDEX "retailers_uid_idx" ON "retailers"("uid");

-- CreateIndex
CREATE INDEX "retailers_name_idx" ON "retailers"("name");

-- CreateIndex
CREATE INDEX "retailers_phone_idx" ON "retailers"("phone");

-- CreateIndex
CREATE INDEX "retailers_region_id_idx" ON "retailers"("region_id");

-- CreateIndex
CREATE INDEX "retailers_area_id_idx" ON "retailers"("area_id");

-- CreateIndex
CREATE INDEX "retailers_distributor_id_idx" ON "retailers"("distributor_id");

-- CreateIndex
CREATE INDEX "retailers_territory_id_idx" ON "retailers"("territory_id");

-- CreateIndex
CREATE INDEX "retailers_region_id_area_id_distributor_id_territory_id_idx" ON "retailers"("region_id", "area_id", "distributor_id", "territory_id");

-- CreateIndex
CREATE INDEX "retailers_updated_at_id_idx" ON "retailers"("updated_at" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sales_rep_retailers_retailer_id_key" ON "sales_rep_retailers"("retailer_id");

-- CreateIndex
CREATE INDEX "sales_rep_retailers_sales_rep_id_idx" ON "sales_rep_retailers"("sales_rep_id");

-- CreateIndex
CREATE INDEX "sales_rep_retailers_retailer_id_idx" ON "sales_rep_retailers"("retailer_id");

-- CreateIndex
CREATE INDEX "sales_rep_retailers_sales_rep_id_retailer_id_idx" ON "sales_rep_retailers"("sales_rep_id", "retailer_id");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retailers" ADD CONSTRAINT "retailers_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "territories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_rep_retailers" ADD CONSTRAINT "sales_rep_retailers_sales_rep_id_fkey" FOREIGN KEY ("sales_rep_id") REFERENCES "sales_reps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_rep_retailers" ADD CONSTRAINT "sales_rep_retailers_retailer_id_fkey" FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_rep_retailers" ADD CONSTRAINT "sales_rep_retailers_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "sales_reps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
