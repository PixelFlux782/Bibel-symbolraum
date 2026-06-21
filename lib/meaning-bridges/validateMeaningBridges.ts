import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { getAllBridges } from "./bridgeRegistry";
import type { MeaningBridge } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  bridgeId: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  bridgeId: string;
  field: string;
  message: string;
}

/**
 * Validate all meaning bridges in the registry
 */
export function validateMeaningBridges(): ValidationResult {
  const bridges = getAllBridges();
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Track seen IDs for uniqueness check
  const seenIds = new Set<string>();

  // Get valid meaning node IDs
  const validMeaningNodeIds = new Set(meaningNodes.map((node) => node.id));

  // Get valid symbol IDs from meaning links
  const validSymbolIds = new Set(
    [
      ...symbolMeaningLinks.map((link) => link.symbolId),
      ...hebrewWords.map((word) => word.id),
    ],
  );

  // Get valid biblical reference IDs
  const validBiblicalReferenceIds = new Set(
    biblicalReferences.map((ref) => ref.id)
  );

  bridges.forEach((bridge) => {
    validateBridgeId(bridge, seenIds, errors);
    validateSourceId(bridge, validSymbolIds, validBiblicalReferenceIds, warnings);
    validateTargetId(bridge, validSymbolIds, validBiblicalReferenceIds, warnings);
    validateMeaningFields(bridge, validMeaningNodeIds, errors);
    validateScriptureAnchors(bridge, validBiblicalReferenceIds, warnings);
    validateRequiredFields(bridge, errors);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateBridgeId(
  bridge: MeaningBridge,
  seenIds: Set<string>,
  errors: ValidationError[]
) {
  if (!bridge.id) {
    errors.push({
      bridgeId: "unknown",
      field: "id",
      message: "Bridge ID is required",
    });
    return;
  }

  if (seenIds.has(bridge.id)) {
    errors.push({
      bridgeId: bridge.id,
      field: "id",
      message: `Duplicate bridge ID: ${bridge.id}`,
    });
  }
  seenIds.add(bridge.id);
}

function validateSourceId(
  bridge: MeaningBridge,
  validSymbolIds: Set<string>,
  validBiblicalReferenceIds: Set<string>,
  warnings: ValidationWarning[]
) {
  if (!bridge.sourceId) {
    warnings.push({
      bridgeId: bridge.id,
      field: "sourceId",
      message: "Source ID is missing",
    });
    return;
  }

  const isKnownSymbol = validSymbolIds.has(bridge.sourceId);
  const isKnownBiblical = validBiblicalReferenceIds.has(bridge.sourceId);

  if (!isKnownSymbol && !isKnownBiblical) {
    warnings.push({
      bridgeId: bridge.id,
      field: "sourceId",
      message: `Source '${bridge.sourceId}' not found in known symbols or biblical references (may be external)`,
    });
  }
}

function validateTargetId(
  bridge: MeaningBridge,
  validSymbolIds: Set<string>,
  validBiblicalReferenceIds: Set<string>,
  warnings: ValidationWarning[]
) {
  if (!bridge.targetId) {
    warnings.push({
      bridgeId: bridge.id,
      field: "targetId",
      message: "Target ID is missing",
    });
    return;
  }

  const isKnownSymbol = validSymbolIds.has(bridge.targetId);
  const isKnownBiblical = validBiblicalReferenceIds.has(bridge.targetId);

  if (!isKnownSymbol && !isKnownBiblical) {
    warnings.push({
      bridgeId: bridge.id,
      field: "targetId",
      message: `Target '${bridge.targetId}' not found in known symbols or biblical references (may be external)`,
    });
  }
}

function validateMeaningFields(
  bridge: MeaningBridge,
  validMeaningNodeIds: Set<string>,
  errors: ValidationError[]
) {
  if (!bridge.meaningFields || bridge.meaningFields.length === 0) {
    errors.push({
      bridgeId: bridge.id,
      field: "meaningFields",
      message: "At least one meaning field is required",
    });
    return;
  }

  bridge.meaningFields.forEach((fieldId) => {
    if (!validMeaningNodeIds.has(fieldId)) {
      errors.push({
        bridgeId: bridge.id,
        field: "meaningFields",
        message: `Meaning field '${fieldId}' is not defined in meaningNodes`,
      });
    }
  });
}

function validateScriptureAnchors(
  bridge: MeaningBridge,
  validBiblicalReferenceIds: Set<string>,
  warnings: ValidationWarning[]
) {
  if (!bridge.scriptureAnchors || bridge.scriptureAnchors.length === 0) {
    return; // Scripture anchors are optional
  }

  bridge.scriptureAnchors.forEach((anchorId) => {
    if (!validBiblicalReferenceIds.has(anchorId)) {
      warnings.push({
        bridgeId: bridge.id,
        field: "scriptureAnchors",
        message: `Scripture anchor '${anchorId}' not found in known biblical references (external reference)`,
      });
    }
  });
}

function validateRequiredFields(
  bridge: MeaningBridge,
  errors: ValidationError[]
) {
  if (!bridge.title || bridge.title.trim().length === 0) {
    errors.push({
      bridgeId: bridge.id,
      field: "title",
      message: "Bridge title is required",
    });
  }

  if (!bridge.summary || bridge.summary.trim().length === 0) {
    errors.push({
      bridgeId: bridge.id,
      field: "summary",
      message: "Bridge summary is required",
    });
  }
}

/**
 * Log validation results in a human-readable format
 */
export function logValidationResults(result: ValidationResult): void {
  console.log("\n=== MEANING BRIDGE VALIDATION ===\n");

  if (result.valid) {
    console.log("✓ All bridges are valid!\n");
  } else {
    console.log("✗ Validation failed with errors:\n");
    result.errors.forEach((error) => {
      console.log(`  [${error.bridgeId}] ${error.field}: ${error.message}`);
    });
    console.log("");
  }

  if (result.warnings.length > 0) {
    console.log("⚠ Warnings:\n");
    result.warnings.forEach((warning) => {
      console.log(
        `  [${warning.bridgeId}] ${warning.field}: ${warning.message}`
      );
    });
    console.log("");
  }

  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}\n`);
}
