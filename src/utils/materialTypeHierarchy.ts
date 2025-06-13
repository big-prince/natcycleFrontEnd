// Material type hierarchy definition and utility functions

export const materialTypeHierarchy = {
  // Primary type: plastic
  plastic: {
    label: "Plastic",
    subtypes: [
      { value: "500ml plastic", label: "500ml Plastic Bottles" },
      { value: "1000ml plastic", label: "1000ml Plastic Bottles" },
      { value: "1500ml plastic", label: "1500ml Plastic Bottles" },
      { value: "plastic bags", label: "Plastic Bags" },
      { value: "plastic containers", label: "Plastic Containers" },
    ],
  },
  // Primary type: glass
  glass: {
    label: "Glass",
    subtypes: [
      { value: "glass bottles", label: "Glass Bottles" },
      { value: "glass jars", label: "Glass Jars" },
    ],
  },
  // Primary type: paper
  paper: {
    label: "Paper",
    subtypes: [
      { value: "cardboard", label: "Cardboard" },
      { value: "newspaper", label: "Newspaper" },
      { value: "office paper", label: "Office Paper" },
    ],
  },
  // Primary type: metal
  metal: {
    label: "Metal",
    subtypes: [
      { value: "aluminum cans", label: "Aluminum Cans" },
      { value: "metal containers", label: "Metal Containers" },
      { value: "scrap metal", label: "Scrap Metal" },
    ],
  },
  // Primary type: organic
  organic: {
    label: "Organic",
    subtypes: [
      { value: "food waste", label: "Food Waste" },
      { value: "garden waste", label: "Garden Waste" },
    ],
  },
  // Primary type: eWaste
  eWaste: {
    label: "Electronic Waste",
    subtypes: [
      { value: "batteries", label: "Batteries" },
      { value: "small electronics", label: "Small Electronics" },
      { value: "large electronics", label: "Large Electronics" },
    ],
  },
  // Primary type: fabric
  fabric: {
    label: "Fabric",
    subtypes: [
      { value: "clothing", label: "Clothing" },
      { value: "textiles", label: "Textiles" },
    ],
  },
};

// Generate a flat list of all material types (primary and subtypes)
export const getAllMaterialTypes = () => {
  const allTypes: string[] = [];

  // Add primary types
  Object.keys(materialTypeHierarchy).forEach((primaryType) => {
    allTypes.push(primaryType);

    // Add subtypes
    materialTypeHierarchy[primaryType].subtypes.forEach((subtype) => {
      allTypes.push(subtype.value);
    });
  });

  return allTypes;
};

// Generate a list of just primary material types
export const getPrimaryMaterialTypes = () => {
  return Object.keys(materialTypeHierarchy);
};

// Get subtypes for a specific primary type
export const getSubtypesForPrimaryType = (primaryType: string) => {
  if (materialTypeHierarchy[primaryType]) {
    return materialTypeHierarchy[primaryType].subtypes.map(
      (subtype) => subtype.value
    );
  }
  return [];
};

// Get the label for a primary type
export const getPrimaryTypeLabel = (primaryType: string) => {
  return materialTypeHierarchy[primaryType]?.label || primaryType;
};

// Get the label for a subtype value
export const getSubtypeLabel = (primaryType: string, subtypeValue: string) => {
  const subtype = materialTypeHierarchy[primaryType]?.subtypes.find(
    (st) => st.value === subtypeValue
  );
  return subtype?.label || subtypeValue;
};

// Get all subtypes with their labels for a primary type
export const getSubtypesWithLabelsForPrimaryType = (primaryType: string) => {
  if (materialTypeHierarchy[primaryType]) {
    return materialTypeHierarchy[primaryType].subtypes;
  }
  return [];
};
