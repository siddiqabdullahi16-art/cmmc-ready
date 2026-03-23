import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";

type GapItem = {
  id: string;
  title: string;
  domain_name: string;
  status: string;
  remediation: string;
  notes: string;
};

type POAMData = {
  orgName: string;
  date: string;
  targetLevel: number;
  gaps: GapItem[];
};

export function POAMReport({ data }: { data: POAMData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.logo}>CMMC-Ready</Text>
          <View style={styles.headerRight}>
            <Text>CONFIDENTIAL — {data.orgName}</Text>
            <Text>{data.date}</Text>
          </View>
        </View>

        <Text style={styles.title}>Plan of Action & Milestones (POA&M)</Text>
        <Text style={styles.subtitle}>
          CMMC Level {data.targetLevel} — {data.gaps.length} items requiring remediation
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 30 }]}>#</Text>
            <Text style={[styles.tableHeaderCell, { width: 75 }]}>Control</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Domain</Text>
            <Text style={[styles.tableHeaderCell, { width: 55 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Remediation Action</Text>
            <Text style={[styles.tableHeaderCell, { width: 70 }]}>Target Date</Text>
            <Text style={[styles.tableHeaderCell, { width: 70 }]}>Assigned To</Text>
          </View>

          {data.gaps.map((gap, i) => (
            <View key={gap.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, { width: 30 }]}>{i + 1}</Text>
              <Text style={[styles.tableCell, { width: 75, fontFamily: "Helvetica-Bold", fontSize: 8 }]}>{gap.id}</Text>
              <Text style={[styles.tableCell, { width: 120, fontSize: 8 }]}>{gap.domain_name}</Text>
              <Text
                style={[
                  gap.status === "not_met" ? styles.statusNotMet : styles.statusPartial,
                  { width: 55 },
                ]}
              >
                {gap.status === "not_met" ? "NOT MET" : "PARTIAL"}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, fontSize: 8 }]}>{gap.remediation}</Text>
              <Text style={[styles.tableCell, { width: 70, fontSize: 8 }]}>___________</Text>
              <Text style={[styles.tableCell, { width: 70, fontSize: 8 }]}>___________</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureBlock}>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Prepared By</Text>
          </View>
          <View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Approved By</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>CMMC-Ready | Plan of Action & Milestones</Text>
          <Text>CONFIDENTIAL</Text>
        </View>
      </Page>
    </Document>
  );
}
