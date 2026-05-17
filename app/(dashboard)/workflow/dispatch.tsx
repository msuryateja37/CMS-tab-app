import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

export default function DispatchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const DRAWING_WIDTH = 400;
  const DRAWING_HEIGHT = 220;

  const [signature, setSignature] = useState<string | null>(null);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    type: string;
    uri?: string;
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [signatureTimestamp, setSignatureTimestamp] = useState("");

  const signatureRef = useRef<any>(null);

  const [emailBody, setEmailBody] = useState("");

  // Initialize email body safely after mount
  useEffect(() => {
    if (params && params.building) {
      setEmailBody(`Hi,

Please find the verified invoice summary for ${params.building || "the property"}.

Invoice: INV-2024-8892
Amount: R 6,475.50
Period: ${(params as any).month || "--"}/${(params as any).year || "--"}

Signature confirmed by Supervisor.

View Vault: cmstabapp://vault?province=${(params as any).province || ""}&building=${params.building || ""}&year=${(params as any).year || ""}&month=${(params as any).month || ""}`);
    }
  }, [params]);

  // ATTACHMENTS
  const summaryData = useMemo(() => {
    const parse = (str: any) => (str ? JSON.parse(str as string) : []);

    const invoices = parse(params.invoiceFiles).map((f: any) => ({
      ...f,
      type: "PDF",
    }));

    const emails = parse(params.emailFiles).map((f: any) => ({
      ...f,
      type: "Image",
    }));

    const others = parse(params.otherFiles).map((f: any) => ({
      ...f,
      type: "Other",
    }));

    return {
      invoiceNumber: "INV-2024-8892",
      totalAmount: "R 6,475.50",
      serviceProvider: "City Power & Water Solutions",
      attachments: [...invoices, ...emails, ...others],
    };
  }, [params]);

  // CLEAR SIGNATURE
  const clearSignature = () => {
    setSignature(null);
  };

  // SIGNATURE CALLBACKS
  const handleOK = (img: string) => {
    setSignature(img);
    setSignatureTimestamp(new Date().toLocaleDateString());
    setSignatureModalVisible(false);
  };

  const handleEmpty = () => {
    Alert.alert("Signature Required", "Please provide your signature.");
  };

  // SEND
  const handleSend = () => {
    if (!signature) {
      Alert.alert(
        "Signature Required",
        "Please provide a signature before dispatching.",
      );

      return;
    }

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);

      Alert.alert("Success", "Dispatch successful!");

      router.replace("/(dashboard)/workflow/upload");
    }, 1500);
  };

  // PREVIEW DOC
  const handleViewDocument = (doc: {
    name: string;
    type: string;
    uri?: string;
  }) => {
    setPreviewDoc(doc);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled={scrollEnabled}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={16} color="#2e78b7" />
          </Pressable>

          <Text style={styles.title}>Dispatch Documents</Text>
        </View>

        {/* SUMMARY */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="file-text-o" size={18} color="#2e78b7" />

            <Text style={styles.sectionTitle}>Review Summary</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Property</Text>

              <Text style={styles.summaryValue} numberOfLines={1}>
                {params.building}
              </Text>

              <Text style={styles.summarySubValue}>{params.province}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Billing Period</Text>

              <Text style={styles.summaryValue}>
                {params.month}/{params.year}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Invoice Details</Text>

              <Text style={styles.summaryValue}>
                {summaryData.invoiceNumber}
              </Text>

              <Text style={styles.summarySubValue}>
                {summaryData.serviceProvider}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>

              <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                {summaryData.totalAmount}
              </Text>

              <View style={styles.attachmentBadge}>
                <FontAwesome name="paperclip" size={10} color="#64748b" />

                <Text style={styles.attachmentText}>
                  {summaryData.attachments.length} Attachments
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Documents for Review</Text>

          <View style={styles.docList}>
            {summaryData.attachments.map((doc, index) => (
              <View key={doc.uri || index} style={styles.docItem}>
                <View style={styles.docInfo}>
                  <FontAwesome
                    name={doc.type === "PDF" ? "file-pdf-o" : "file-image-o"}
                    size={14}
                    color="#64748b"
                  />

                  <Text style={styles.docName}>{doc.name}</Text>
                </View>

                <Pressable
                  style={styles.btnView}
                  onPress={() => handleViewDocument(doc)}
                >
                  <Text style={styles.btnViewText}>View</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* SIGNATURE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Supervisor Signature</Text>

          <View style={styles.signaturePadPlaceholder}>
            {signature ? (
              <View style={styles.signatureConfirmedContainer}>
                <Image
                  source={{ uri: signature }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
                <Text style={styles.signatureTimestamp}>
                  E-Signed on {signatureTimestamp}
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.signatureAction}
                onPress={() => setSignatureModalVisible(true)}
              >
                <FontAwesome name="pencil" size={24} color="#cbd5e1" />

                <Text style={styles.signaturePlaceholderText}>
                  Tap to sign document
                </Text>
              </Pressable>
            )}
          </View>

          {signature && (
            <Pressable onPress={clearSignature} style={styles.clearSignature}>
              <Text style={styles.clearSignatureText}>Clear Signature</Text>
            </Pressable>
          )}
        </View>

        {/* MESSAGE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Dispatch Summary Message</Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            value={emailBody}
            onChangeText={setEmailBody}
          />

          <View style={styles.deepLinkBadge}>
            <FontAwesome name="link" size={12} color="#2e78b7" />

            <Text style={styles.deepLinkText}>Vault deep-link included</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={16} color="#2e78b7" />

          <Text style={styles.infoText}>
            By clicking dispatch, you are confirming that all extracted
            information is correct and the supporting documents have been
            reviewed.
          </Text>
        </View>

        {/* SEND */}
        <Pressable
          style={[styles.btnSend, !signature && styles.btnDisabled]}
          onPress={handleSend}
          disabled={!signature || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome
                name="send"
                size={16}
                color="#fff"
                style={{ marginRight: 10 }}
              />

              <Text style={styles.btnSendText}>Confirm & Dispatch</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* PREVIEW MODAL */}
      <Modal
        visible={!!previewDoc}
        animationType="slide"
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{previewDoc?.name}</Text>

            <Pressable onPress={() => setPreviewDoc(null)}>
              <FontAwesome name="times" size={20} color="#333" />
            </Pressable>
          </View>

          <View style={styles.previewContent}>
            {previewDoc?.type === "Image" && previewDoc.uri ? (
              <Image
                source={{ uri: previewDoc.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <>
                <FontAwesome name="file-pdf-o" size={80} color="#cbd5e1" />

                <Text style={styles.previewText}>Read-Only Preview Mode</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* SIGNATURE MODAL */}
      <Modal
        visible={signatureModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignatureModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.signatureModalContent}>
            <Text style={styles.signatureModalTitle}>Electronic Signature</Text>

            <Text style={styles.signatureModalSub}>
              Please sign below to authorize this dispatch.
            </Text>

            <View style={styles.drawingArea}>
              <SignatureScreen
                ref={signatureRef}
                onOK={handleOK}
                onEmpty={handleEmpty}
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
                <Text style={styles.modalBtnTextConfirm}>
                  Confirm Signature
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 2,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },

  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },

  summarySubValue: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 15,
  },

  attachmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  attachmentText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },

  docList: {
    marginTop: 5,
  },

  docItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  docInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  docName: {
    fontSize: 13,
    color: "#334155",
  },

  btnView: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },

  btnViewText: {
    fontSize: 12,
    color: "#2e78b7",
    fontWeight: "bold",
  },

  signaturePadPlaceholder: {
    height: 220,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginTop: 10,
    overflow: "hidden",
    position: "relative",
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
    height: 150,
  },

  signatureTimestamp: {
    fontSize: 12,
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

  signaturePlaceholderText: {
    fontSize: 13,
    color: "#94a3b8",
  },

  signatureFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 6,
    alignItems: "center",
  },

  signatureText: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "600",
  },

  clearSignature: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  clearSignatureText: {
    fontSize: 12,
    color: "#ef4444",
  },

  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: "#1e293b",
    textAlignVertical: "top",
  },

  deepLinkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: "#eef6fc",
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  deepLinkText: {
    fontSize: 11,
    color: "#2e78b7",
    fontWeight: "bold",
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eef6fc",
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 18,
  },

  btnSend: {
    backgroundColor: "#2e78b7",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  btnSendText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  btnDisabled: {
    backgroundColor: "#cbd5e1",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  modalHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  previewContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  previewText: {
    marginTop: 20,
    color: "#94a3b8",
  },

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
    padding: 24,
  },

  signatureModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },

  signatureModalSub: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },

  drawingArea: {
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    overflow: "hidden",
    position: "relative",
  },

  svgContainer: {
    width: 400,
    height: 220,
    backgroundColor: "#fff",
  },

  placeholderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  drawingPlaceholder: {
    color: "#cbd5e1",
    marginTop: 10,
    fontSize: 13,
  },

  resetPadBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 20,
  },

  resetPadText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
  },

  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  modalBtnCancel: {
    backgroundColor: "#f1f5f9",
  },

  modalBtnConfirm: {
    backgroundColor: "#2e78b7",
  },

  modalBtnTextCancel: {
    color: "#64748b",
    fontWeight: "600",
  },

  modalBtnTextConfirm: {
    color: "#fff",
    fontWeight: "600",
  },
});
