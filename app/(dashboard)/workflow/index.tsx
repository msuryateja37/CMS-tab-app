import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';

const blueWorkflow = [
  {
    title: 'Receipt of Invoice',
    status: 'Pending',
    icon: 'file-invoice',
  },
  {
    title: 'Supervisor Processing',
    status: 'In Review',
    icon: 'user-check',
  },
  {
    title: 'Submission',
    status: 'Approved',
    icon: 'paper-plane',
  },
];

const greenWorkflow = [
  {
    title: 'Clerk Verification',
    status: 'In Review',
    icon: 'clipboard-check',
  },
  {
    title: 'Compilation',
    status: 'Pending',
    icon: 'folder-open',
  },
  {
    title: 'Property Verification',
    status: 'Verified',
    icon: 'search-location',
  },
  {
    title: 'Certification',
    status: 'Approved',
    icon: 'certificate',
  },
];

const StatusBadge = ({ status }: any) => {
  const getColor = () => {
    switch (status) {
      case 'Approved':
      case 'Verified':
        return '#16A34A';

      case 'Rejected':
        return '#DC2626';

      case 'In Review':
        return '#2563EB';

      default:
        return '#F59E0B';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getColor(),
        },
      ]}
    >
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

const WorkflowCard = ({
  item,
  type,
}: any) => {
  const isBlue = type === 'blue';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isBlue
            ? '#DBEAFE'
            : '#DCFCE7',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <FontAwesome5
          name={item.icon}
          size={24}
          color={
            isBlue ? '#2563EB' : '#16A34A'
          }
        />

        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.cardTitle}>
        {item.title}
      </Text>

      <Text style={styles.cardDescription}>
        Workflow processing stage
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Open
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Arrow = () => (
  <View style={styles.arrowContainer}>
    <Text style={styles.arrow}>➜</Text>
  </View>
);

export default function WorkflowDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        Document Workflow Dashboard
      </Text>

      <Text style={styles.sectionTitle}>
        Invoice Submission Workflow
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        <View style={styles.row}>
          {blueWorkflow.map((item, index) => (
            <React.Fragment key={index}>
              <WorkflowCard
                item={item}
                type='blue'
              />

              {index !==
                blueWorkflow.length - 1 && (
                <Arrow />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>
        Verification Workflow
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        <View style={styles.row}>
          {greenWorkflow.map(
            (item, index) => (
              <React.Fragment key={index}>
                <WorkflowCard
                  item={item}
                  type='green'
                />

                {index !==
                  greenWorkflow.length -
                    1 && <Arrow />}
              </React.Fragment>
            )
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 24,
  },

  heading: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
    color: '#111827',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 20,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },

  card: {
    width: 280,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },

  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  arrowContainer: {
    paddingHorizontal: 16,
  },

  arrow: {
    fontSize: 32,
    color: '#94A3B8',
  },
});