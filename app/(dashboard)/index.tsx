import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
// Ensure you have react-native-svg installed: npx expo install react-native-svg
import Svg, { Circle, G } from 'react-native-svg';

const STAT_BOXES = [
  { id: '1', title: 'Total Incidents', count: 142, trend: '+12.5%', isPositive: false }, 
  { id: '2', title: 'Closed', count: 89, trend: '+5.2%', isPositive: true },
  { id: '3', title: 'Pending', count: 24, trend: '-2.1%', isPositive: true }, 
  { id: '4', title: 'Resolved', count: 29, trend: '+8.4%', isPositive: true },
];

const CHART_DATA = [
  { label: 'Safety', value: 35, color: '#ef4444' },
  { label: 'Security', value: 25, color: '#3b82f6' },
  { label: 'Environmental', value: 20, color: '#10b981' },
  { label: 'Equipment', value: 12, color: '#f59e0b' },
  { label: 'Health', value: 8, color: '#8b5cf6' },
];

// Dummy Data for 12-Month Chart
const MONTHLY_DATA = [
  { month: 'Jan', total: 45, resolved: 30 },
  { month: 'Feb', total: 52, resolved: 35 },
  { month: 'Mar', total: 38, resolved: 25 },
  { month: 'Apr', total: 65, resolved: 40 },
  { month: 'May', total: 48, resolved: 38 },
  { month: 'Jun', total: 55, resolved: 45 },
  { month: 'Jul', total: 70, resolved: 50 },
  { month: 'Aug', total: 62, resolved: 48 },
  { month: 'Sep', total: 58, resolved: 42 },
  { month: 'Oct', total: 45, resolved: 35 },
  { month: 'Nov', total: 50, resolved: 40 },
  { month: 'Dec', total: 40, resolved: 38 },
];

// Dummy Data for Regional Distribution
const REGIONAL_DATA = [
  { region: 'North West', count: 65 },
  { region: 'Gauteng', count: 48 },
  { region: 'Free State', count: 35 },
  { region: 'Eastern Cape', count: 28 },
  { region: 'Mpumalanga', count: 22 },
  { region: 'KwaZulu-Natal', count: 18 },
];

// Extracted subset of your JSON payload for the table
const RAW_TABLE_DATA = [
  { id: '1', incidentNumber: 'INC-1775048753906', category: 'safety', severity: 'medium', status: 'CLOSED', createdAt: '2026-04-01T13:05:53.936Z', assignedTo: { name: 'Tshepo Radebe' }, location: 'Block-30B' },
  { id: '2', incidentNumber: 'INC-1772259794635', category: 'safety', severity: 'medium', status: 'ASSIGNED', createdAt: '2026-02-28T06:23:14.646Z', assignedTo: { name: 'Dumisani Mokoena' }, location: 'wwwww' },
  { id: '3', incidentNumber: 'INC-1771494193349', category: 'health', severity: 'medium', status: 'CLOSED', createdAt: '2026-02-19T09:43:13.351Z', assignedTo: { name: 'Thandi Nkosi' }, location: 'Building-A' },
  { id: '4', incidentNumber: 'INC-1771493788119', category: 'safety', severity: 'high', status: 'CLOSED', createdAt: '2026-02-19T09:36:28.125Z', assignedTo: { name: 'Ntombi Hlongwane' }, location: 'Building-b/201' },
  { id: '5', incidentNumber: 'INC-1771492005233', category: 'safety', severity: 'medium', status: 'CLOSED', createdAt: '2026-02-19T09:06:45.241Z', assignedTo: { name: 'Ayanda Zungu' }, location: 'Building-B/201' },
  { id: '6', incidentNumber: 'INC-1771489618549', category: 'safety', severity: 'high', status: 'CLOSED', createdAt: '2026-02-19T08:26:58.558Z', assignedTo: { name: 'Ntombi Hlongwane' }, location: 'Floor-B' },
  { id: '7', incidentNumber: 'INC-1771433323211', category: 'environmental', severity: 'high', status: 'ASSIGNED', createdAt: '2026-02-18T16:48:43.214Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Fuel Storage Tank Area – UT-03' },
  { id: '8', incidentNumber: 'INC-1771433185565', category: 'environmental', severity: 'high', status: 'ASSIGNED', createdAt: '2026-02-18T16:46:25.568Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Data Center – DC-01' },
  { id: '9', incidentNumber: 'INC-1771433082916', category: 'environmental', severity: 'critical', status: 'ASSIGNED', createdAt: '2026-02-18T16:44:42.919Z', assignedTo: { name: 'Zoleka Mbatha' }, location: 'Surveillance Monitoring Room – SM-01' },
  { id: '10', incidentNumber: 'INC-1771432717703', category: 'environmental', severity: 'critical', status: 'ASSIGNED', createdAt: '2026-02-18T16:38:37.705Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Waste Disposal Yard – UT-04' },
];

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const boxWidth = isDesktop ? '23%' : '48%';
  const ITEMS_PER_PAGE = 5;

  // Table logic
  const filteredData = useMemo(() => {
    return RAW_TABLE_DATA.filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.incidentNumber.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        (item.assignedTo?.name || '').toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const maxMonthlyValue = Math.max(...MONTHLY_DATA.map(d => d.total));
  const maxRegionalValue = Math.max(...REGIONAL_DATA.map(d => d.count));

  // Ring Chart Configurations
  const radius = 80;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;
  let currentAccumulation = 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Dashboard Overview</Text>
      
      {/* Stat Boxes */}
      <View style={styles.statsContainer}>
        {STAT_BOXES.map((stat) => (
          <View key={stat.id} style={[styles.statBox, { width: boxWidth }]}>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={styles.statCount}>{stat.count}</Text>
            <View style={styles.trendContainer}>
              <FontAwesome 
                name={stat.trend.startsWith('+') ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={stat.isPositive ? "#10b981" : "#ef4444"} 
              />
              <Text style={[styles.statTrend, { color: stat.isPositive ? "#10b981" : "#ef4444" }]}>
                {stat.trend} from last month
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 12 Months Bar Chart Section */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>12 Months Incident Trends</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} /><Text>Total Incidents</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#10b981' }]} /><Text>Resolved</Text></View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.barChartContainer}>
            {MONTHLY_DATA.map((data, index) => {
              const totalHeight = (data.total / maxMonthlyValue) * 100;
              const resolvedHeight = (data.resolved / maxMonthlyValue) * 100;
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barsWrapper}>
                    <View style={[styles.bar, { height: `${totalHeight}%`, backgroundColor: '#3b82f6' }]} />
                    <View style={[styles.bar, { height: `${resolvedHeight}%`, backgroundColor: '#10b981' }]} />
                  </View>
                  <Text style={styles.barLabel}>{data.month}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Two Column Layout for Desktop, Stacked for Mobile */}
      <View style={isDesktop ? styles.rowLayout : styles.colLayout}>
        {/* Category Ring Chart */}
        <View style={[styles.cardSection, isDesktop && { flex: 1, marginRight: 10 }]}>
          <Text style={styles.sectionTitle}>Incidents by Category</Text>
          
          <View style={styles.ringChartContainer}>
            <View style={styles.svgWrapper}>
              <Svg height="220" width="220" viewBox="0 0 200 200">
                <G rotation="-90" origin="100, 100">
                  {CHART_DATA.map((item, index) => {
                    const strokeDashoffset = circumference - (item.value / 100) * circumference;
                    const angle = (currentAccumulation / 100) * 360;
                    currentAccumulation += item.value;
                    
                    return (
                      <Circle
                        key={index}
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        rotation={angle}
                        origin="100, 100"
                        fill="transparent"
                      />
                    );
                  })}
                </G>
              </Svg>
              
              <View style={styles.chartCenterText}>
                <Text style={styles.chartCenterTotal}>142</Text>
                <Text style={styles.chartCenterLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.pillsContainer}>
              {CHART_DATA.map((item, index) => (
                <View key={index} style={styles.pill}>
                  <View style={[styles.pillDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pillLabel}>{item.label}</Text>
                  <View style={[styles.pillPercentBadge, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.pillPercentText, { color: item.color }]}>{item.value}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Regional Horizontal Bar Chart */}
        <View style={[styles.cardSection, isDesktop && { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.sectionTitle}>Regional Distribution</Text>
          <View style={styles.horizontalBarContainer}>
            {REGIONAL_DATA.map((data, index) => {
              const widthPercent = (data.count / maxRegionalValue) * 100;
              return (
                <View key={index} style={styles.hBarGroup}>
                  <View style={styles.hBarLabelContainer}>
                    <Text style={styles.hBarLabel}>{data.region}</Text>
                    <Text style={styles.hBarValue}>{data.count}</Text>
                  </View>
                  <View style={styles.hBarTrack}>
                    <View style={[styles.hBarFill, { width: `${widthPercent}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Data Table Section */}
      <View style={styles.cardSection}>
        <View style={styles.tableHeaderSection}>
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={16} color="#888" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search incidents..." 
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <View style={[styles.tableCell, { width: '18%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Reference</Text></View>
              <View style={[styles.tableCell, { width: '12%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Type</Text></View>
              <View style={[styles.tableCell, { width: '10%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Severity</Text></View>
              <View style={[styles.tableCell, { width: '12%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Status</Text></View>
              <View style={[styles.tableCell, { width: '14%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Reported Date</Text></View>
              <View style={[styles.tableCell, { width: '16%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Assigned To</Text></View>
              <View style={[styles.tableCell, { width: '18%' }]}><Text style={[styles.tableCellText, styles.tableHeadText]}>Location</Text></View>
            </View>

            {paginatedData.map((row) => (
              <View key={row.id} style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={styles.tableCellText} selectable numberOfLines={1}>{row.incidentNumber}</Text>
                </View>
                <View style={[styles.tableCell, { width: '12%' }]}>
                  <Text style={[styles.tableCellText, { textTransform: 'capitalize' }]} numberOfLines={1}>{row.category}</Text>
                </View>
                <View style={[styles.tableCell, { width: '10%' }]}>
                  <Text style={[styles.tableCellText, { textTransform: 'capitalize' }]} numberOfLines={1}>{row.severity}</Text>
                </View>
                <View style={[styles.tableCell, { width: '12%', alignItems: 'flex-start' }]}>
                  <Text style={styles.statusBadge}>{row.status}</Text>
                </View>
                <View style={[styles.tableCell, { width: '14%' }]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>{formatDate(row.createdAt)}</Text>
                </View>
                <View style={[styles.tableCell, { width: '16%' }]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>{row.assignedTo?.name || 'Unassigned'}</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={styles.tableCellText} numberOfLines={1}>{row.location}</Text>
                </View>
              </View>
            ))}
            
            {paginatedData.length === 0 && (
              <Text style={styles.emptyTableText}>No incidents found matching your search.</Text>
            )}
          </View>
        </ScrollView>

        {/* Pagination Controls */}
        <View style={styles.pagination}>
          <Text style={styles.pageInfo}>Showing {filteredData.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries</Text>
          <View style={styles.pageButtons}>
            <Pressable 
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]} 
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageBtnText}>Previous</Text>
            </Pressable>
            <Pressable 
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]} 
              onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <Text style={styles.pageBtnText}>Next</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  content: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 30 },
  statBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2, marginBottom: 10 },
  statTitle: { fontSize: 14, color: '#666', marginBottom: 10 },
  statCount: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statTrend: { fontSize: 12, marginLeft: 2 },
  
  cardSection: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  // 12 Months Bar Chart Styles
  chartLegend: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15, gap: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  barChartContainer: { minWidth: '100%', flexDirection: 'row', height: 250, alignItems: 'flex-end', justifyContent: 'space-evenly', paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  barGroup: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', minWidth: 50 },
  barsWrapper: { flexDirection: 'row', flex: 1, alignItems: 'flex-end', gap: 4 },
  bar: { width: 14, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barLabel: { marginTop: 10, fontSize: 12, color: '#666' },

  rowLayout: { flexDirection: 'row' },
  colLayout: { flexDirection: 'column' },

  // Ring Chart Styles
  ringChartContainer: { flexDirection: 'column', alignItems: 'center' },
  svgWrapper: { position: 'relative', width: 220, height: 220, justifyContent: 'center', alignItems: 'center' },
  chartCenterText: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  chartCenterTotal: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  chartCenterLabel: { fontSize: 14, color: '#888' },
  
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 20 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  pillDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  pillLabel: { fontSize: 14, color: '#555', marginRight: 10 },
  pillPercentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pillPercentText: { fontSize: 12, fontWeight: 'bold' },

  // Regional Bar Chart
  horizontalBarContainer: { flexDirection: 'column', gap: 15, marginTop: 10 },
  hBarGroup: { flexDirection: 'column', gap: 5 },
  hBarLabelContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  hBarLabel: { fontSize: 14, color: '#555' },
  hBarValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  hBarTrack: { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  hBarFill: { height: '100%', backgroundColor: '#8b5cf6', borderRadius: 5 },

  // Data Table
  tableHeaderSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, width: 250 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 14 },
  table: { width: '100%', minWidth: 900, borderWidth: 1, borderColor: '#eee', borderRadius: 8, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tableHeadText: { fontWeight: 'bold', color: '#444' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  tableCell: { padding: 12, justifyContent: 'center' },
  tableCellText: { fontSize: 14, color: '#333' },
  statusBadge: { backgroundColor: '#e0f2fe', color: '#0284c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  emptyTableText: { padding: 20, textAlign: 'center', color: '#888' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, flexWrap: 'wrap', gap: 10 },
  pageInfo: { fontSize: 14, color: '#666' },
  pageButtons: { flexDirection: 'row', gap: 10 },
  pageBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6 },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { color: '#333', fontSize: 14 }
});
