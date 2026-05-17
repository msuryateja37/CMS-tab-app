import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Mpumalanga",
  "Limpopo",
  "North West",
  "Northern Cape",
];
const BUILDINGS_MOCK: Record<string, string[]> = {
  Gauteng: ["Sandton City", "Menlyn Park", "Rosebank Mall"],
  "Western Cape": ["V&A Waterfront", "Canal Walk", "Tyger Valley"],
};

export default function InvoiceUploadScreen() {
  const router = useRouter();
  const [isFinalized, setIsFinalized] = useState(false);

  const [province, setProvince] = useState("");
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [building, setBuilding] = useState("");
  const [buildingModalVisible, setBuildingModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Upload State
  const [uploads, setUploads] = useState<{
    invoice: DocumentPicker.DocumentPickerAsset[];
    email: DocumentPicker.DocumentPickerAsset[];
    other: DocumentPicker.DocumentPickerAsset[];
  }>({
    invoice: [],
    email: [],
    other: [],
  });

  const canUnlockBuilding = !!province;
  const canUnlockDate = !!building;
  const canFinalize = !!province && !!building && !!date;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleFilePick = async (type: "invoice" | "email" | "other") => {
    const mimeTypes = {
      invoice: ["application/pdf"],
      email: ["image/*"],
      other: ["*/*"],
    };

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes[type],
        multiple: true,
      });

      if (!result.canceled) {
        setUploads((prev) => ({
          ...prev,
          [type]: [...prev[type], ...result.assets],
        }));
      }
    } catch (err) {
      console.error("Error picking document", err);
    }
  };

  const handleFinalize = () => {
    setIsFinalized(true);
  };

  const handleGoToVerification = () => {
    const serializeFiles = (assets: DocumentPicker.DocumentPickerAsset[]) => 
      JSON.stringify(assets.map(f => ({ name: f.name, uri: f.uri })));

    router.push({
      pathname: "/(dashboard)/workflow/verification",
      params: {
        province,
        building,
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        invoiceFiles: serializeFiles(uploads.invoice),
        emailFiles: serializeFiles(uploads.email),
        otherFiles: serializeFiles(uploads.other),
      },
    });
  };

  if (isFinalized) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.headerTitle}>Property Vault</Text>

        {/* Breadcrumbs */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>{province}</Text>
          <FontAwesome
            name="chevron-right"
            size={10}
            color="#888"
            style={{ marginHorizontal: 8 }}
          />
          <Text style={styles.breadcrumbText}>{building}</Text>
          <FontAwesome
            name="chevron-right"
            size={10}
            color="#888"
            style={{ marginHorizontal: 8 }}
          />
          <Text style={styles.breadcrumbText}>{date.getFullYear()}</Text>
          <FontAwesome
            name="chevron-right"
            size={10}
            color="#888"
            style={{ marginHorizontal: 8 }}
          />
          <Text style={styles.breadcrumbText}>
            {date.toLocaleString("default", { month: "long" })}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Document Uploads</Text>

          <UploadSlot
            title="Invoice"
            subtitle="Upload and review main invoice"
            icon="file-pdf-o"
            onPress={() => handleFilePick("invoice")}
            isUploaded={uploads.invoice.length > 0}
            files={uploads.invoice}
          />

          <UploadSlot
            title="Email Screenshot"
            subtitle="Screenshot of the original email"
            icon="envelope-o"
            onPress={() => handleFilePick("email")}
            isUploaded={uploads.email.length > 0}
            files={uploads.email}
          />

          <UploadSlot
            title="Other Supportive Documents"
            subtitle="Any additional relevant files"
            icon="paperclip"
            onPress={() => handleFilePick("other")}
            isUploaded={uploads.other.length > 0}
            files={uploads.other}
          />
        </View>

        <Pressable
          style={[styles.btnFinal, uploads.invoice.length === 0 && styles.btnDisabled]}
          disabled={uploads.invoice.length === 0}
          onPress={handleGoToVerification}
        >
          <Text style={styles.btnFinalText}>Verify Extracted Data</Text>
          <FontAwesome name="check-square-o" size={16} color="#fff" />
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Facility Management</Text>
        <Text style={styles.subHeader}>
          Follow the steps to prepare the invoice vault.
        </Text>

        {/* Step 1: Province */}
        <View style={styles.selectionCard}>
          <View style={styles.stepHeader}>
            <View
              style={[styles.stepNumber, province && styles.stepNumberDone]}
            >
              <Text style={styles.stepNumberText}>{province ? "✓" : "1"}</Text>
            </View>
            <Text style={styles.stepTitle}>Select Province</Text>
          </View>

          <Pressable
            style={styles.modalTrigger}
            onPress={() => setProvinceModalVisible(true)}
          >
            <Text
              style={[
                styles.modalTriggerText,
                !province && styles.placeholderText,
              ]}
            >
              {province || "Select Province"}
            </Text>
            <FontAwesome name="search" size={14} color="#888" />
          </Pressable>

          <SelectionModal
            visible={provinceModalVisible}
            title="Select Province"
            data={PROVINCES}
            onClose={() => setProvinceModalVisible(false)}
            onSelect={(val: string) => {
              setProvince(val);
              setBuilding("");
              setProvinceModalVisible(false);
            }}
          />
        </View>

        {/* Step 2: Building */}
        <View
          style={[
            styles.selectionCard,
            !canUnlockBuilding && styles.cardLocked,
          ]}
        >
          <View style={styles.stepHeader}>
            <View
              style={[styles.stepNumber, building && styles.stepNumberDone]}
            >
              <Text style={styles.stepNumberText}>{building ? "✓" : "2"}</Text>
            </View>
            <Text style={styles.stepTitle}>Select Building</Text>
          </View>
          {!canUnlockBuilding ? (
            <Text style={styles.lockText}>Please select a province first</Text>
          ) : (
            <>
              <Pressable
                style={styles.modalTrigger}
                onPress={() => setBuildingModalVisible(true)}
              >
                <Text
                  style={[
                    styles.modalTriggerText,
                    !building && styles.placeholderText,
                  ]}
                >
                  {building || "Select Building"}
                </Text>
                <FontAwesome name="search" size={14} color="#888" />
              </Pressable>

              <SelectionModal
                visible={buildingModalVisible}
                title="Select Building"
                data={
                  BUILDINGS_MOCK[province] || [
                    "Standard Building A",
                    "Complex B",
                    "Office Block C",
                  ]
                }
                onClose={() => setBuildingModalVisible(false)}
                onSelect={(val: string) => {
                  setBuilding(val);
                  setBuildingModalVisible(false);
                }}
              />
            </>
          )}
        </View>

        {/* Step 3: Month/Year */}
        <View
          style={[styles.selectionCard, !canUnlockDate && styles.cardLocked]}
        >
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, styles.stepNumberActive]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Period Selection</Text>
          </View>
          {!canUnlockDate ? (
            <Text style={styles.lockText}>Please select a building first</Text>
          ) : (
            <View style={styles.datePickerContainer}>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={18} color="#2e78b7" />
                <Text style={styles.dateButtonText}>
                  {date.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>
          )}
        </View>

        <Pressable
          style={[styles.btnFinal, !canFinalize && styles.btnDisabled]}
          onPress={handleFinalize}
          disabled={!canFinalize}
        >
          <Text style={styles.btnFinalText}>Access Property Vault</Text>
          <FontAwesome name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SelectionModal({ visible, title, data, onClose, onSelect }: any) {
  const [query, setQuery] = useState("");
  const filtered = data.filter((item: string) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <FontAwesome name="times" size={20} color="#64748b" />
            </Pressable>
          </View>

          <View style={styles.modalSearchBox}>
            <FontAwesome
              name="search"
              size={16}
              color="#888"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Search to filter..."
              style={{ flex: 1, height: 40 }}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <ScrollView style={styles.modalList}>
            {filtered.map((item: string, index: number) => (
              <Pressable
                key={index}
                onPress={() => onSelect(item)}
                style={styles.modalItem}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                <FontAwesome name="chevron-right" size={12} color="#cbd5e1" />
              </Pressable>
            ))}
            {filtered.length === 0 && (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No results found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function UploadSlot({
  title,
  subtitle,
  icon,
  onPress,
  isUploaded,
  files,
}: any) {
  const displayInfo = files && files.length > 0
    ? (files.length === 1 ? files[0].name : `${files.length} files attached`)
    : "";

  return (
    <Pressable
      style={[styles.uploadSlot, isUploaded && styles.uploadSlotDone]}
      onPress={onPress}
    >
      <View style={styles.uploadIconWrap}>
        <FontAwesome
          name={icon}
          size={24}
          color={isUploaded ? "#10b981" : "#2e78b7"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.uploadTitle}>{title}</Text>
        <Text style={styles.uploadSub}>{subtitle}</Text>
      </View>
      {isUploaded ? (
        <View style={{ alignItems: "flex-end" }}>
          <FontAwesome name="check-circle" size={20} color="#10b981" />
          <Text
            style={{ fontSize: 10, color: "#10b981", marginTop: 4 }}
            numberOfLines={1}
          >
            {displayInfo}
          </Text>
        </View>
      ) : (
        <View style={styles.btnUploadMini}>
          <Text style={styles.btnUploadMiniText}>Upload</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subHeader: { fontSize: 16, color: "#64748b", marginBottom: 24 },

  // Selection Cards
  selectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
  },
  cardLocked: { opacity: 0.5, backgroundColor: "#f1f5f9" },
  stepHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberActive: { backgroundColor: "#2e78b7" },
  stepNumberDone: { backgroundColor: "#10b981" },
  stepNumberText: { color: "#fff", fontWeight: "bold" },
  stepTitle: { fontSize: 18, fontWeight: "700", color: "#334155" },
  lockText: {
    color: "#94a3b8",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
  modalTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalTriggerText: { fontSize: 16, color: "#1e293b", fontWeight: "500" },
  placeholderText: { color: "#94a3b8" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  modalCloseBtn: { padding: 5 },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 15,
  },
  modalList: { flexGrow: 0 },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemText: { fontSize: 16, color: "#334155" },
  modalEmpty: { padding: 30, alignItems: "center" },
  modalEmptyText: { color: "#94a3b8", fontSize: 14 },

  datePickerContainer: { alignItems: "center", paddingVertical: 10 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2e78b7",
  },
  dateButtonText: { fontSize: 18, fontWeight: "600", color: "#1e293b" },

  btnFinal: {
    backgroundColor: "#2e78b7",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },
  btnFinalText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  btnDisabled: { backgroundColor: "#cbd5e1" },

  // Vault View
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  breadcrumbText: { fontSize: 14, color: "#2e78b7", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },

  uploadSlot: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 12,
  },
  uploadSlotDone: {
    borderStyle: "solid",
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  uploadTitle: { fontSize: 16, fontWeight: "600", color: "#334155" },
  uploadSub: { fontSize: 12, color: "#64748b" },
  btnUploadMini: {
    backgroundColor: "#2e78b7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnUploadMiniText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
