import type { Vehicle } from "@prisma/client";
export declare function findVehicleById(id: number): Promise<Vehicle | null>;
export declare function listVehicles(params?: {
    skip?: number;
    take?: number;
    brand?: string;
}): Promise<Vehicle[]>;
export declare function countVehicles(brand?: string): Promise<number>;
export declare function createVehicle(data: {
    nameEn: string;
    nameAr: string;
    brand: string;
    series: string;
    specifics: string;
    chassisCode: string;
    yearRange: string;
}): Promise<Vehicle>;
export declare function updateVehicle(id: number, data: {
    nameEn?: string;
    nameAr?: string;
    brand?: string;
    series?: string;
    specifics?: string;
    chassisCode?: string;
    yearRange?: string;
}): Promise<Vehicle>;
export declare function deleteVehicle(id: number): Promise<void>;
//# sourceMappingURL=vehicle.repository.d.ts.map