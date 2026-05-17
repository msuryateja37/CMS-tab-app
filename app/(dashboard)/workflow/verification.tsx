import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function VerificationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Mocked Extracted Data (In a real app, this comes from an OCR API)
  const extractedData = {
    invoiceNumber: "INV-2024-8892",
    invoiceDate: "2024-03-12",
    serviceProvider: "City Power & Water Solutions",
    buildingName: params.building as string, // Matching for demo purposes
    accountNumber: "99283341002",
    referenceNumber: "ZAF-7721-BC",
    billingPeriod: `${params.month}/${params.year}`, // Matching for demo purposes
    description:
      "Monthly utility assessment for municipal services including grid maintenance and refuse collection fees.",
    sections: [
      { label: "Electricity", amount: "R 4,250.00" },
      { label: "Water & Sanitation", amount: "R 1,120.50" },
      { label: "Municipal Land Tax", amount: "R 890.00" },
      { label: "Refuse Collection", amount: "R 215.00" },
    ],
  };

  const isPropertyMatch = params.building === extractedData.buildingName;
  const isPeriodMatch = true; // Logic would compare params.month/year vs extracted

  const handleConfirm = () => {
    router.push({
      pathname: "/(dashboard)/workflow/dispatch",
      params: {
        ...params,
        // Ensure all received params (including file URIs) are passed forward
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={16} color="#2e78b7" />
          </Pressable>
          <Text style={styles.title}>Invoice Verification</Text>
        </View>

        <Text style={styles.subtitle}>
          Review the information extracted from the uploaded document.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <DataField
              label="Invoice Number"
              value={extractedData.invoiceNumber}
              flex={1}
            />
            <DataField
              label="Invoice Date"
              value={extractedData.invoiceDate}
              flex={1}
            />
          </View>

          <View style={styles.row}>
            <DataField
              label="Received Date"
              value={new Date().toLocaleDateString()}
              flex={1}
            />
            <DataField
              label="Service Provider"
              value={extractedData.serviceProvider}
              flex={1}
            />
          </View>
        </View>

        {/* Property Comparison Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Property Validation</Text>
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonItem}>
              <Text style={styles.compLabel}>Selected Building</Text>
              <Text style={styles.compValue}>{params.building}</Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={styles.compLabel}>Extracted Building</Text>
              <Text style={styles.compValue}>{extractedData.buildingName}</Text>
            </View>
          </View>
          {isPropertyMatch && (
            <View style={styles.matchPill}>
              <FontAwesome name="check-circle" size={16} color="#10b981" />
              <Text style={styles.matchText}>Property Match Confirmed</Text>
            </View>
          )}
        </View>

        {/* Billing Sections */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details & Amounts</Text>
          <View style={[styles.row, { marginBottom: 15 }]}>
            <DataField
              label="Account Number"
              value={extractedData.accountNumber}
              flex={1}
            />
            <DataField
              label="Reference"
              value={extractedData.referenceNumber}
              flex={1}
            />
          </View>

          <View style={styles.amountTable}>
            {extractedData.sections.map((section, idx) => (
              <View key={idx} style={styles.amountRow}>
                <Text style={styles.amountLabel}>{section.label}</Text>
                <Text style={styles.amountValue}>{section.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Period Comparison */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Billing Period Verification</Text>
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonItem}>
              <Text style={styles.compLabel}>Selected Month</Text>
              <Text style={styles.compValue}>
                {params.month}/{params.year}
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={styles.compLabel}>Extracted Period</Text>
              <Text style={styles.compValue}>
                {extractedData.billingPeriod}
              </Text>
            </View>
          </View>
          {isPeriodMatch && (
            <View style={[styles.matchPill, { backgroundColor: "#ecfdf5" }]}>
              <FontAwesome name="check-circle" size={16} color="#10b981" />
              <Text style={styles.matchText}>Period belongs to selection</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General Description</Text>
          <Text style={styles.descriptionText}>
            {extractedData.description}
          </Text>
        </View>

        <Pressable style={styles.btnConfirm} onPress={handleConfirm}>
          <Text style={styles.btnConfirmText}>
            Approve & Proceed to Dispatch
          </Text>
          <FontAwesome name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function DataField({ label, value, flex }: any) {
  return (
    <View style={{ flex: flex || 1, marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 1,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
  },
  row: { flexDirection: "row", gap: 20 },
  fieldLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "600",
  },
  fieldValue: { fontSize: 15, color: "#1e293b", fontWeight: "500" },

  // Comparison Styles
  comparisonBox: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  comparisonItem: { flex: 1, alignItems: "center" },
  comparisonDivider: {
    width: 1,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 10,
  },
  compLabel: { fontSize: 11, color: "#64748b", marginBottom: 4 },
  compValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },

  matchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  matchText: { color: "#10b981", fontWeight: "700", fontSize: 13 },

  // Amount Table
  amountTable: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  amountLabel: { fontSize: 14, color: "#475569" },
  amountValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },

  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    fontStyle: "italic",
  },

  btnConfirm: {
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: "#10b981",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnConfirmText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
