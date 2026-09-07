"""
Lightweight FHIR R4 Resource and Bundle Validator for MediKiosk.

Validates structural integrity, required identifiers, ISO dates, coding schemas,
and type boundaries without external heavy dependencies.
"""

from typing import Dict, Any, List
import re
from datetime import datetime
from app.schemas.interoperability import FHIRValidationResult


class FHIRValidator:
    ISO_DATE_PATTERN = re.compile(
        r"^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?)?)?$"
    )

    def validate_date_string(self, date_str: str) -> bool:
        """Validates if string conforms to standard FHIR date / dateTime."""
        if not date_str or not isinstance(date_str, str):
            return False
        return bool(self.ISO_DATE_PATTERN.match(date_str))

    def validate_patient(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "Patient":
            errors.append("Invalid resourceType for Patient")
        if not res.get("id"):
            errors.append("Patient resource must have an id")
        return errors

    def validate_observation(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "Observation":
            errors.append("Invalid resourceType for Observation")
        if not res.get("id"):
            errors.append("Observation must have an id")
        if not res.get("status"):
            errors.append("Observation must have a status")
        if not res.get("code"):
            errors.append("Observation must have a codeableConcept")
        return errors

    def validate_allergy(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "AllergyIntolerance":
            errors.append("Invalid resourceType for AllergyIntolerance")
        if not res.get("id"):
            errors.append("AllergyIntolerance must have an id")
        if not res.get("code"):
            errors.append("AllergyIntolerance must have a code")
        return errors

    def validate_medication(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") not in ["MedicationStatement", "MedicationRequest"]:
            errors.append("Resource must be MedicationStatement or MedicationRequest")
        if not res.get("id"):
            errors.append("Medication resource must have an id")
        if not res.get("status"):
            errors.append("Medication resource must have a status")
        return errors

    def validate_document_reference(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "DocumentReference":
            errors.append("Invalid resourceType for DocumentReference")
        if not res.get("id"):
            errors.append("DocumentReference must have an id")
        if not res.get("status"):
            errors.append("DocumentReference must have a status")
        if not res.get("content") or not isinstance(res.get("content"), list):
            errors.append("DocumentReference must contain at least one content attachment")
        return errors

    def validate_condition(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "Condition":
            errors.append("Invalid resourceType for Condition")
        if not res.get("id"):
            errors.append("Condition must have an id")
        if not res.get("code"):
            errors.append("Condition must have a code")
        return errors

    def validate_composition(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "Composition":
            errors.append("Invalid resourceType for Composition")
        if not res.get("id"):
            errors.append("Composition must have an id")
        if not res.get("title"):
            errors.append("Composition must have a title")
        if not res.get("section") or not isinstance(res.get("section"), list):
            errors.append("Composition must have sections")
        return errors

    def validate_consent(self, res: Dict[str, Any]) -> List[str]:
        errors = []
        if res.get("resourceType") != "Consent":
            errors.append("Invalid resourceType for Consent")
        if not res.get("id"):
            errors.append("Consent must have an id")
        if not res.get("status"):
            errors.append("Consent must have a status")
        if not res.get("scope"):
            errors.append("Consent must specify scope")
        return errors

    def validate_resource(self, res: Dict[str, Any]) -> List[str]:
        """Routes resource to specific validator based on resourceType."""
        rt = res.get("resourceType")
        if not rt:
            return ["Resource missing resourceType field"]

        if rt == "Patient":
            return self.validate_patient(res)
        elif rt == "Observation":
            return self.validate_observation(res)
        elif rt == "AllergyIntolerance":
            return self.validate_allergy(res)
        elif rt in ["MedicationStatement", "MedicationRequest"]:
            return self.validate_medication(res)
        elif rt == "DocumentReference":
            return self.validate_document_reference(res)
        elif rt == "Condition":
            return self.validate_condition(res)
        elif rt == "Composition":
            return self.validate_composition(res)
        elif rt == "Consent":
            return self.validate_consent(res)
        return []

    @classmethod
    def validate_bundle(cls, bundle: Dict[str, Any]) -> FHIRValidationResult:
        """Validates entire FHIR Bundle and all constituent resources."""
        inst = cls()
        return inst._do_validate_bundle(bundle)

    def _do_validate_bundle(self, bundle: Dict[str, Any]) -> FHIRValidationResult:
        errors: List[str] = []
        warnings: List[str] = []

        if not isinstance(bundle, dict):
            return FHIRValidationResult(is_valid=False, errors=["Bundle must be a JSON object"])

        if bundle.get("resourceType") != "Bundle":
            errors.append("Root resourceType must be 'Bundle'")

        if bundle.get("type") not in ["collection", "document", "transaction", "batch"]:
            errors.append("Bundle type must be valid (e.g., 'collection')")

        entries = bundle.get("entry", [])
        if not isinstance(entries, list):
            errors.append("Bundle 'entry' field must be an array")
            return FHIRValidationResult(is_valid=False, errors=errors)

        if len(entries) == 0:
            warnings.append("Bundle contains no resource entries")

        resource_ids = set()
        for idx, entry in enumerate(entries):
            res = entry.get("resource")
            if not res or not isinstance(res, dict):
                errors.append(f"Entry {idx} missing inner 'resource' object")
                continue

            r_errors = self.validate_resource(res)
            for err in r_errors:
                errors.append(f"Entry {idx} ({res.get('resourceType', 'Unknown')}): {err}")

            rid = res.get("id")
            if rid:
                if rid in resource_ids:
                    warnings.append(f"Duplicate resource ID detected: {rid}")
                resource_ids.add(rid)

        is_valid = len(errors) == 0
        return FHIRValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)


fhir_validator = FHIRValidator()
