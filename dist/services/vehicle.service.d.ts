import type { Vehicle } from "@prisma/client";
export declare function listVehicles(q: {
    page?: number;
    limit?: number;
    brand?: string;
}): Promise<{
    items: Vehicle[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getVehicle(id: number): Promise<Vehicle>;
export declare function createVehicle(input: {
    nameEn?: string;
    nameAr?: string;
    brand: string;
    series: string;
    specifics: string;
    chassisCode: string;
    yearRange: string;
}): Promise<Vehicle>;
export declare function updateVehicle(id: number, input: {
    nameEn?: string;
    nameAr?: string;
    brand?: string;
    series?: string;
    specifics?: string;
    chassisCode?: string;
    yearRange?: string;
}): Promise<Vehicle>;
export declare function deleteVehicle(id: number): Promise<void>;
//# sourceMappingURL=vehicle.service.d.ts.map