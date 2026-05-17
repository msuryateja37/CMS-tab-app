import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

// Mock Data Structure representing dispatched invoices
const VAULT_DATA: any = {
  Gauteng: {
    "Sandton City": {
      "2024": {
        March: {
          invoiceNumber: "INV-2024-8892",
          amount: "R 6,475.50",
          date: "2024-03-12",
          provider: "City Power & Water Solutions",
          status: "Verified & Dispatched",
          supervisor: {
            name: "Thabo Mokoena",
            email: "supervisor@dlrrd.gov.za",
            phone: "+27123456789",
          },
          attachments: [
            { name: "INV-2024-8892.pdf", type: "PDF" },
            { name: "Email_Confirmation.png", type: "Image" },
          ],
        },
      },
    },
    "Menlyn Park": {},
  },
  "Western Cape": {
    "V&A Waterfront": {
      "2024": {
        February: {
          invoiceNumber: "INV-2024-1102",
          amount: "R 12,240.00",
          date: "2024-02-15",
          provider: "Cape Water Services",
          status: "Verified & Dispatched",
          supervisor: {
            name: "Sarah Jenkins",
            email: "s.jenkins@dlrrd.gov.za",
            phone: "+27219876543",
          },
          attachments: [{ name: "Water_Invoice.pdf", type: "PDF" }],
        },
      },
    },
  },
};

export default function DocumentVaultScreen() {
  const router = useRouter();
  const [path, setPath] = useState<string[]>([]); // Tracks [Province, Building, Year, Month]
  const [readDocs, setReadDocs] = useState<Record<string, boolean>>({});

  // New states for the Stamping Workflow
  const [isPrinted, setIsPrinted] = useState(false);
  const [stampedFiles, setStampedFiles] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);

  // Signature states
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [signatureTimestamp, setSignatureTimestamp] = useState("");
  const signatureRef = useRef<any>(null);

  const currentLevelData = path.reduce(
    (acc, part) => acc[part] || {},
    VAULT_DATA,
  );
  const isDetailView = path.length === 4;

  const handleNavigateInto = (key: string) => {
    setPath([...path, key]);
  };

  const handleBack = () => {
    setPath(path.slice(0, -1));
  };

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);

  const toggleRead = (docKey: string) => {
    setReadDocs((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  };

  const handleSignatureOK = (img: string) => {
    setSignature(img);
    setSignatureTimestamp(new Date().toLocaleString());
    setSignatureModalVisible(false);
  };

  const handleSignatureEmpty = () => {
    Alert.alert("Signature Required", "Please provide your signature.");
  };

  const clearSignature = () => {
    setSignature(null);
  };

  const allRead = useMemo(() => {
    if (!isDetailView || !currentLevelData.attachments) return false;
    return currentLevelData.attachments.every(
      (_: any, index: number) => readDocs[`${path.join("-")}-${index}`],
    );
  }, [isDetailView, currentLevelData, readDocs, path]);

  const handleUploadStamped = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });

      if (!result.canceled) {
        setStampedFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.error("Error picking document", err);
    }
  };

  const handleConfirmFinalStatus = () => {
    if (!signature) {
      Alert.alert("Signature Required", "Please provide a signature before updating the confirmation status.");
      return;
    }

    Alert.alert(
      "Final Confirmation",
      "Are you sure you want to mark these documents as officially stamped and confirmed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Update",
          onPress: () => {
            Alert.alert("Success", "The record status has been updated to 'Confirmed & Stamped'.");
            setPath([]); // Reset to vault home
            setIsPrinted(false);
            setStampedFiles([]);
            setSignature(null);
          },
        },
      ]
    );
  };

  const handlePrintAll = () => {
    Alert.alert(
      "Print Job Started",
      "All documents have been sent to the printer. Please stamp the physical copies and upload them here once ready.",
      [{ text: "OK", onPress: () => setIsPrinted(true) }],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Document Vault</Text>
          <Text style={styles.subtitle}>Verified & Dispatched Records</Text>
        </View>

        {/* Breadcrumbs */}
        <View style={styles.breadcrumb}>
          <Pressable onPress={() => setPath([])}>
            <FontAwesome name="home" size={16} color="#2e78b7" />
          </Pressable>
          {path.map((part, idx) => (
            <React.Fragment key={idx}>
              <FontAwesome
                name="chevron-right"
                size={10}
                color="#cbd5e1"
                style={{ marginHorizontal: 8 }}
              />
              <Pressable onPress={() => setPath(path.slice(0, idx + 1))}>
                <Text style={styles.breadcrumbText}>{part}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        {isDetailView ? (
          <View style={styles.detailCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dispatch Summary</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {stampedFiles.length > 0
                    ? "Awaiting Final Confirmation"
                    : currentLevelData.status}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Invoice Number</Text>
                <Text style={styles.infoValue}>
                  {currentLevelData.invoiceNumber}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Total Amount</Text>
                <Text style={[styles.infoValue, { color: "#10b981" }]}>
                  {currentLevelData.amount}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.subSectionTitle}>Supervisor Contact</Text>
            <View style={styles.supervisorBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.supervisorName}>
                  {currentLevelData.supervisor.name}
                </Text>
                <Text style={styles.supervisorRole}>Site Supervisor</Text>
              </View>
              <View style={styles.contactActions}>
                <Pressable
                  style={[styles.contactBtn, { backgroundColor: "#eef6fc" }]}
                  onPress={() => handleEmail(currentLevelData.supervisor.email)}
                >
                  <FontAwesome name="envelope" size={16} color="#2e78b7" />
                </Pressable>
                <Pressable
                  style={[styles.contactBtn, { backgroundColor: "#f0fdf4" }]}
                  onPress={() => handleCall(currentLevelData.supervisor.phone)}
                >
                  <FontAwesome name="phone" size={16} color="#10b981" />
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.subSectionTitle}>Attachments</Text>
            <Text style={styles.readInstruction}>
              Please review and mark each document as read.
            </Text>

            {currentLevelData.attachments.map((file: any, index: number) => {
              const docKey = `${path.join("-")}-${index}`;
              const isRead = !!readDocs[docKey];

              return (
                <View key={index} style={styles.fileRow}>
                  <View style={styles.fileItem}>
                    <FontAwesome
                      name={file.type === "PDF" ? "file-pdf-o" : "file-image-o"}
                      size={16}
                      color="#64748b"
                    />
                    <Text style={styles.fileName}>{file.name}</Text>
                  </View>

                  <Pressable
                    style={styles.readToggle}
                    onPress={() => toggleRead(docKey)}
                  >
                    <Text
                      style={[styles.readText, isRead && styles.readTextActive]}
                    >
                      {isRead ? "Read" : "Mark as read"}
                    </Text>
                    <FontAwesome
                      name={isRead ? "dot-circle-o" : "circle-o"}
                      size={18}
                      color={isRead ? "#10b981" : "#cbd5e1"}
                    />
                  </Pressable>
                </View>
              );
            })}

            {allRead && !isPrinted && (
              <Pressable style={styles.btnPrintAll} onPress={handlePrintAll}>
                <FontAwesome name="print" size={18} color="#fff" />
                <Text style={styles.btnPrintText}>Print All Documents</Text>
              </Pressable>
            )}

            {/* Stamping Workflow UI */}
            {isPrinted && (
              <View style={styles.stampingSection}>
                <View style={styles.divider} />
                <Text style={styles.subSectionTitle}>
                  3. Stamped Documents Upload
                </Text>

                <Pressable
                  style={[
                    styles.uploadSlot,
                    stampedFiles.length > 0 && styles.uploadSlotDone,
                  ]}
                  onPress={handleUploadStamped}
                >
                  <View style={styles.uploadIconWrap}>
                    <FontAwesome
                      name="cloud-upload"
                      size={24}
                      color={stampedFiles.length > 0 ? "#10b981" : "#2e78b7"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadTitle}>Upload Stamped PDF</Text>
                    <Text style={styles.uploadSub}>
                      {stampedFiles.length > 0
                        ? `${stampedFiles.length} file(s) uploaded`
                        : "Scan and upload the stamped documents"}
                    </Text>
                  </View>
                </Pressable>

                <Text style={styles.subSectionTitle}>
                  4. Admin Clerk Signature
                </Text>
                <View style={styles.signaturePadPlaceholder}>
                  {signature ? (
                    <View style={styles.signatureConfirmedContainer}>
                      <Image
                        source={{ uri: signature }}
                        style={styles.signatureImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.signatureTimestamp}>
                        E-Signed by Clerk on {signatureTimestamp}
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.signatureAction}
                      onPress={() => setSignatureModalVisible(true)}
                    >
                      <FontAwesome name="pencil" size={24} color="#cbd5e1" />
                      <Text style={styles.signaturePlaceholderText}>
                        Tap to sign confirmation
                      </Text>
                    </Pressable>
                  )}
                </View>
                {signature && (
                  <Pressable onPress={clearSignature} style={styles.clearSignature}>
                    <Text style={styles.clearSignatureText}>Clear Signature</Text>
                  </Pressable>
                )}

                {stampedFiles.length > 0 && (
                  <Pressable
                    style={[styles.btnConfirmFinal, !signature && styles.btnDisabled]}
                    onPress={handleConfirmFinalStatus}
                    disabled={!signature}
                  >
                    <FontAwesome name="check-circle" size={18} color="#fff" />
                    <Text style={styles.btnConfirmFinalText}>
                      Update Confirmation Status
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            <Pressable
              style={[styles.btnBack, allRead && { marginTop: 15 }]}
              onPress={handleBack}
            >
              <Text style={styles.btnBackText}>Go Back</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.folderGrid}>
            {Object.keys(currentLevelData).map((key) => (
              <Pressable
                key={key}
                style={styles.folderItem}
                onPress={() => handleNavigateInto(key)}
              >
                <FontAwesome
                  name={path.length === 3 ? "file-text" : "folder"}
                  size={40}
                  color={path.length === 3 ? "#94a3b8" : "#2e78b7"}
                />
                <Text style={styles.folderLabel} numberOfLines={1}>
                  {key}
                </Text>
              </Pressable>
            ))}
            {Object.keys(currentLevelData).length === 0 && (
              <Text style={styles.emptyText}>
                No records found in this category.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* SIGNATURE MODAL */}
      <Modal
        visible={signatureModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignatureModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.signatureModalContent}>
            <Text style={styles.signatureModalTitle}>Admin Clerk Signature</Text>
            <Text style={styles.signatureModalSub}>
              Please sign below to confirm receipt and stamping of physical documents.
            </Text>

            <View style={styles.drawingArea}>
              <SignatureScreen
                ref={signatureRef}
                onOK={handleSignatureOK}
                onEmpty={handleSignatureEmpty}
                autoClear={false}
                imageType="image/png"
                androidHardwareAccelerationDisabled={true}
                webStyle={`.m-signature-pad {box-shadow: none; border: none; width: 100%; height: 100%; position: absolute; left: 0; top: 0; margin: 0;}
                           .m-signature-pad--body {position: absolute; left: 0; right: 0; top: 0; bottom: 0;}
                           .m-signature-pad--body canvas {width: 100% !important; height: 100% !important;}
                           .m-signature-pad--footer {display: none; margin: 0px;}
                           body,html {height: 100%; width: 100%; margin: 0px; overflow: hidden;}`}
                descriptionText=""
              />
            </View>

            <Pressable 
              onPress={() => signatureRef.current?.clearSignature()} 
              style={styles.resetPadBtn}
            >
              <Text style={styles.resetPadText}>Reset Pad</Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setSignatureModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => signatureRef.current?.readSignature()}
              >
                <Text style={styles.modalBtnTextConfirm}>Confirm Signature</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b" },

  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  breadcrumbText: { fontSize: 13, color: "#2e78b7", fontWeight: "600" },

  folderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  folderItem: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
  },
  folderLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  emptyText: { color: "#94a3b8", fontStyle: "italic", marginTop: 20 },

  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  statusBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { color: "#10b981", fontSize: 11, fontWeight: "bold" },

  infoRow: { flexDirection: "row", marginBottom: 15 },
  infoLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "600",
  },
  infoValue: { fontSize: 15, fontWeight: "700", color: "#1e293b" },

  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 20 },

  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  supervisorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
  },
  supervisorName: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  supervisorRole: { fontSize: 12, color: "#64748b" },
  contactActions: { flexDirection: "row", gap: 10 },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  readInstruction: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 15,
    fontStyle: "italic",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  fileItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileName: { fontSize: 13, color: "#475569" },
  readToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  readTextActive: {
    color: "#10b981",
  },
  btnPrintAll: {
    backgroundColor: "#1e293b",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 10,
  },
  stampingSection: {
    marginTop: 10,
  },
  uploadSlot: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 1,
  },
  uploadTitle: { fontSize: 15, fontWeight: "600", color: "#334155" },
  uploadSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  signaturePadPlaceholder: {
    height: 180,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginTop: 5,
    overflow: "hidden",
  },
  signatureConfirmedContainer: {
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  signatureImage: {
    width: '100%',
    height: 120,
  },
  signatureTimestamp: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 5,
    fontWeight: '600',
  },
  signatureAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signaturePlaceholderText: { fontSize: 13, color: "#94a3b8" },
  clearSignature: { alignSelf: "flex-end", marginTop: 8 },
  clearSignatureText: { fontSize: 12, color: "#ef4444" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signatureModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    padding: 24,
  },
  signatureModalTitle: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  signatureModalSub: { fontSize: 14, color: "#64748b", marginBottom: 20 },
  drawingArea: {
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  resetPadBtn: { alignSelf: "flex-end", marginTop: 10, marginBottom: 20 },
  resetPadText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnCancel: { backgroundColor: "#f1f5f9" },
  modalBtnConfirm: { backgroundColor: "#2e78b7" },
  modalBtnTextCancel: { color: "#64748b", fontWeight: "600" },
  modalBtnTextConfirm: { color: "#fff", fontWeight: "600" },
  btnConfirmFinal: {
    backgroundColor: "#10b981",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 10,
  },
  btnDisabled: { backgroundColor: "#cbd5e1" },
  btnConfirmFinalText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  btnPrintText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  btnBack: {
    marginTop: 30,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBackText: { color: "#64748b", fontWeight: "bold" },
});
