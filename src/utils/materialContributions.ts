import { IUserMaterialContribution } from "../types";
import materialApi from "../api/materialApi";

// Define dropoff interface for the utility
interface IDropoffData {
  _id: string;
  itemType?: string;
  itemQuantity?: number;
  dropOffQuantity?: Array<{
    materialType: string;
    units: number;
  }>;
  createdAt: string;
  pointsEarned?: number;
}

// Material interface for API response
interface IMaterial {
  _id: string;
  category: string;
  subCategory: string;
  name: string;
  cuValue: number;
  natPoints: number;
  isActive: boolean;
}

// Cache for materials to avoid repeated API calls
let materialsCache: IMaterial[] | null = null;

// Fetch all materials from API
const fetchMaterials = async (): Promise<IMaterial[]> => {
  if (materialsCache) {
    return materialsCache;
  }

  try {
    const response = await materialApi.getAllMaterials();
    materialsCache = response.data.data.materials as IMaterial[];
    return materialsCache;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
};

// Get material by category and subCategory
const getMaterialByCategoryAndSubCategory = (
  materials: IMaterial[],
  category: string,
  subCategory: string
): IMaterial | null => {
  return (
    materials.find(
      (material) =>
        material.category.toLowerCase() === category.toLowerCase() &&
        material.subCategory.toLowerCase() === subCategory.toLowerCase() &&
        material.isActive
    ) || null
  );
};

// Get label for material type (matching backend hierarchy)
const getMaterialLabel = (materialType: string): string => {
  const labelMapping: { [key: string]: string } = {
    plastic: "Plastic",
    fabric: "Fabric",
    glass: "Glass",
    mixed: "Mixed",
    organic: "Organic",
    paper: "Paper",
    metal: "Metal",
    ewaste: "Electronic Waste",
    aluminium: "Aluminum",
  };

  return (
    labelMapping[materialType] ||
    materialType.charAt(0).toUpperCase() + materialType.slice(1)
  );
};

// Calculate user contributions from dropoffs
export const calculateUserContributions = async (
  dropoffs: IDropoffData[],
  itemsCount: { [key: string]: number },
  materialTypes: string[] = []
): Promise<IUserMaterialContribution[]> => {
  const contributionMap: { [key: string]: IUserMaterialContribution } = {};

  // Fetch materials from API
  const materials = await fetchMaterials();

  // Initialize with itemsCount data (for backward compatibility)
  Object.keys(itemsCount).forEach((materialType) => {
    if (itemsCount[materialType] > 0) {
      contributionMap[materialType] = {
        materialType,
        label: getMaterialLabel(materialType),
        totalQuantity: itemsCount[materialType],
        totalDropoffs: 0,
        carbonUnits: 0, // Will be calculated properly below
        lastDropoff: undefined,
      };
    }
  });

  // Process dropoffs to calculate accurate contributions
  dropoffs.forEach((dropoff) => {
    const primaryType = dropoff.itemType?.toLowerCase() || "mixed";

    // If dropoff has detailed quantity breakdown, use it
    if (dropoff.dropOffQuantity && dropoff.dropOffQuantity.length > 0) {
      dropoff.dropOffQuantity.forEach((item) => {
        const subType = item.materialType.toLowerCase();
        const material = getMaterialByCategoryAndSubCategory(
          materials,
          primaryType,
          subType
        );

        if (material) {
          // Calculate CU using server formula: cuValue * (quantity / 2)
          const carbonUnits = material.cuValue * (item.units / 2);

          // Use primary type as the key instead of subtype to combine all subtypes
          if (!contributionMap[primaryType]) {
            contributionMap[primaryType] = {
              materialType: primaryType,
              label: getMaterialLabel(primaryType),
              totalQuantity: 0,
              totalDropoffs: 0,
              carbonUnits: 0,
              lastDropoff: undefined,
            };
          }

          contributionMap[primaryType].totalQuantity += item.units;
          contributionMap[primaryType].carbonUnits += carbonUnits;
          contributionMap[primaryType].totalDropoffs += 1;

          // Update last dropoff date
          if (
            !contributionMap[primaryType].lastDropoff ||
            new Date(dropoff.createdAt) >
              new Date(contributionMap[primaryType].lastDropoff!)
          ) {
            contributionMap[primaryType].lastDropoff = dropoff.createdAt;
          }
        }
      });
    } else {
      // Fallback to old logic if no detailed breakdown
      const materialType = primaryType;

      if (!contributionMap[materialType]) {
        contributionMap[materialType] = {
          materialType,
          label: getMaterialLabel(materialType),
          totalQuantity: 0,
          totalDropoffs: 0,
          carbonUnits: 0,
          lastDropoff: undefined,
        };
      }

      contributionMap[materialType].totalDropoffs += 1;

      // Update last dropoff date
      if (
        !contributionMap[materialType].lastDropoff ||
        new Date(dropoff.createdAt) >
          new Date(contributionMap[materialType].lastDropoff!)
      ) {
        contributionMap[materialType].lastDropoff = dropoff.createdAt;
      }

      // Add quantity if available (using estimated CU)
      if (dropoff.itemQuantity) {
        contributionMap[materialType].totalQuantity += dropoff.itemQuantity;
        // For fallback, use a default multiplier since we don't have specific material
        contributionMap[materialType].carbonUnits += dropoff.itemQuantity * 2; // Default multiplier
      }
    }
  });

  // Ensure all material types from backend are included, even with zero contributions
  materialTypes.forEach((materialType) => {
    if (!contributionMap[materialType]) {
      contributionMap[materialType] = {
        materialType,
        label: getMaterialLabel(materialType),
        totalQuantity: 0,
        totalDropoffs: 0,
        carbonUnits: 0,
        lastDropoff: undefined,
      };
    }
  });

  // Convert to array and sort by total contribution
  return Object.values(contributionMap).sort(
    (a: IUserMaterialContribution, b: IUserMaterialContribution) =>
      b.carbonUnits - a.carbonUnits
  );
};

// Get icon for material type (using React Icons instead of emojis)
export const getMaterialIcon = (materialType: string): string => {
  const iconMapping: { [key: string]: string } = {
    plastic: "bottle-water",
    fabric: "shirt",
    glass: "wine-glass",
    mixed: "recycle",
    organic: "leaf",
    paper: "file-text",
    metal: "cog",
    ewaste: "laptop",
    aluminium: "can",
  };

  return iconMapping[materialType] || "recycle";
};

// Get color for material type card (using lemon green as base)
export const getMaterialColor = (): string => {
  // Use the lemon green (#D4FF4F) as the primary background for all cards
  return "bg-[#D4FF4F] border-[#D4FF4F]";
};
