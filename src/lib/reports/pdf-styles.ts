import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  headerRight: {
    textAlign: "right",
    fontSize: 9,
    color: "#737373",
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#0a0a0a",
  },
  subtitle: {
    fontSize: 12,
    color: "#525252",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    color: "#0a0a0a",
  },
  subsectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#262626",
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
    color: "#404040",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  // Score box
  scoreBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 8,
    color: "#737373",
    marginTop: 2,
  },
  // Table
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableCell: {
    fontSize: 9,
    color: "#404040",
  },
  // Status badges
  statusMet: {
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  statusNotMet: {
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  statusPartial: {
    color: "#ca8a04",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 10,
    fontSize: 8,
    color: "#a3a3a3",
  },
  // Signature block
  signatureBlock: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
    marginBottom: 5,
    paddingBottom: 30,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#737373",
  },
});
