import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const STAT_BOXES = [
  { id: '1', title: 'Open', count: 45, trend: '+5.2%', isPositive: false }, 
  { id: '2', title: 'In Progress', count: 28, trend: '-1.4%', isPositive: true },
  { id: '3', title: 'Critical', count: 8, trend: '+2.1%', isPositive: false }, 
  { id: '4', title: 'Closed', count: 184, trend: '+14.5%', isPositive: true },
];

// Filter Options
const PROVINCES = ['All', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'];
const STATUSES = ['All', 'RAISED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const SEVERITIES = ['All', 'low', 'medium', 'high', 'critical'];

const RAW_TABLE_DATA = [
  { id: '1', incidentNumber: 'INC-1775048753906', category: 'safety', severity: 'medium', status: 'CLOSED', province: 'Gauteng', createdAt: '2026-04-01T13:05:53.936Z', assignedTo: { name: 'Tshepo Radebe' }, location: 'Block-30B' },
  { id: '2', incidentNumber: 'INC-1772259794635', category: 'safety', severity: 'medium', status: 'ASSIGNED', province: 'Eastern Cape', createdAt: '2026-02-28T06:23:14.646Z', assignedTo: { name: 'Dumisani Mokoena' }, location: 'wwwww' },
  { id: '3', incidentNumber: 'INC-1771494193349', category: 'health', severity: 'medium', status: 'CLOSED', province: 'North West', createdAt: '2026-02-19T09:43:13.351Z', assignedTo: { name: 'Thandi Nkosi' }, location: 'Building-A' },
  { id: '4', incidentNumber: 'INC-1771493788119', category: 'safety', severity: 'high', status: 'CLOSED', province: 'North West', createdAt: '2026-02-19T09:36:28.125Z', assignedTo: { name: 'Ntombi Hlongwane' }, location: 'Building-b/201' },
  { id: '5', incidentNumber: 'INC-1771492005233', category: 'safety', severity: 'medium', status: 'CLOSED', province: 'Mpumalanga', createdAt: '2026-02-19T09:06:45.241Z', assignedTo: { name: 'Ayanda Zungu' }, location: 'Building-B/201' },
  { id: '6', incidentNumber: 'INC-1771489618549', category: 'safety', severity: 'high', status: 'IN_PROGRESS', province: 'North West', createdAt: '2026-02-19T08:26:58.558Z', assignedTo: { name: 'Ntombi Hlongwane' }, location: 'Floor-B' },
  { id: '7', incidentNumber: 'INC-1771433323211', category: 'environmental', severity: 'high', status: 'ASSIGNED', province: 'North West', createdAt: '2026-02-18T16:48:43.214Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Fuel Storage Tank Area – UT-03' },
  { id: '8', incidentNumber: 'INC-1771433185565', category: 'environmental', severity: 'high', status: 'RAISED', province: 'North West', createdAt: '2026-02-18T16:46:25.568Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Data Center – DC-01' },
  { id: '9', incidentNumber: 'INC-1771433082916', category: 'environmental', severity: 'critical', status: 'ASSIGNED', province: 'North West', createdAt: '2026-02-18T16:44:42.919Z', assignedTo: { name: 'Zoleka Mbatha' }, location: 'Surveillance Monitoring Room – SM-01' },
  { id: '10', incidentNumber: 'INC-1771432717703', category: 'environmental', severity: 'critical', status: 'RESOLVED', province: 'North West', createdAt: '2026-02-18T16:38:37.705Z', assignedTo: { name: 'Thandiwe Ngobese' }, location: 'Waste Disposal Yard – UT-04' },
];

export default function AllIncidentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter States
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const boxWidth = isDesktop ? '23%' : '48%';
  const ITEMS_PER_PAGE = 5;

  // Table & Filter logic
  const filteredData = useMemo(() => {
    return RAW_TABLE_DATA.filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.incidentNumber.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        (item.assignedTo?.name || '').toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      const matchesProvince = selectedProvince === 'All' || item.province === selectedProvince;
      const matchesStatus = selectedStatus === 'All' || item.status.toUpperCase() === selectedStatus.toUpperCase();
      const matchesSeverity = selectedSeverity === 'All' || item.severity.toLowerCase() === selectedSeverity.toLowerCase();

      return matchesSearch && matchesProvince && matchesStatus && matchesSeverity;
    });
  }, [searchQuery, selectedProvince, selectedStatus, selectedSeverity]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1); 
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>All Incidents</Text>

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

        {/* Data Table Section */}
        <View style={[styles.cardSection, { zIndex: 10 }]}>
          <View style={styles.tableHeaderSection}>
            <Text style={styles.sectionTitle}>Recent Incidents</Text>
            
            {/* Filters Row */}
            <View style={styles.filtersWrapper}>
              {/* Province Filter */}
              <View style={styles.dropdownContainer}>
                <Pressable style={styles.dropdownButton} onPress={() => toggleDropdown('province')}>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>
                    {selectedProvince === 'All' ? 'All Provinces' : selectedProvince}
                  </Text>
                  <FontAwesome name="chevron-down" size={12} color="#888" />
                </Pressable>
                {openDropdown === 'province' && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {PROVINCES.map(prov => (
                        <Pressable key={prov} style={styles.dropdownItem} onPress={() => { setSelectedProvince(prov); setOpenDropdown(null); setCurrentPage(1); }}>
                          <Text style={[styles.dropdownItemText, selectedProvince === prov && styles.dropdownItemTextActive]}>{prov}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Status Filter */}
              <View style={styles.dropdownContainer}>
                <Pressable style={styles.dropdownButton} onPress={() => toggleDropdown('status')}>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>
                    {selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
                  </Text>
                  <FontAwesome name="chevron-down" size={12} color="#888" />
                </Pressable>
                {openDropdown === 'status' && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {STATUSES.map(stat => (
                        <Pressable key={stat} style={styles.dropdownItem} onPress={() => { setSelectedStatus(stat); setOpenDropdown(null); setCurrentPage(1); }}>
                          <Text style={[styles.dropdownItemText, selectedStatus === stat && styles.dropdownItemTextActive]}>{stat}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Severity Filter */}
              <View style={styles.dropdownContainer}>
                <Pressable style={styles.dropdownButton} onPress={() => toggleDropdown('severity')}>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>
                    {selectedSeverity === 'All' ? 'All Severities' : selectedSeverity}
                  </Text>
                  <FontAwesome name="chevron-down" size={12} color="#888" />
                </Pressable>
                {openDropdown === 'severity' && (
                  <View style={styles.dropdownMenu}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {SEVERITIES.map(sev => (
                        <Pressable key={sev} style={styles.dropdownItem} onPress={() => { setSelectedSeverity(sev); setOpenDropdown(null); setCurrentPage(1); }}>
                          <Text style={[styles.dropdownItemText, { textTransform: 'capitalize' }, selectedSeverity === sev && styles.dropdownItemTextActive]}>{sev}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Search Bar */}
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
                <Text style={styles.emptyTableText}>No incidents found matching your filters.</Text>
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
      
      {/* Transparent overlay to close dropdowns when clicking outside */}
      {openDropdown && (
        <Pressable style={styles.overlay} onPress={() => setOpenDropdown(null)} />
      )}
    </View>
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
  tableHeaderSection: { flexDirection: 'column', gap: 10, marginBottom: 15, zIndex: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  filtersWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  
  // Dropdown Styles
  dropdownContainer: { position: 'relative', minWidth: 140, zIndex: 30 },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  dropdownButtonText: { fontSize: 13, color: '#333', flex: 1, marginRight: 8, textTransform: 'capitalize' },
  dropdownMenu: { position: 'absolute', top: 45, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5, zIndex: 100 },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 13, color: '#444' },
  dropdownItemTextActive: { fontWeight: 'bold', color: '#2e78b7' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },

  // Search & Table
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, width: 200, height: 40 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13 },
  
  table: { width: '100%', minWidth: 900, borderWidth: 1, borderColor: '#eee', borderRadius: 8, overflow: 'hidden', zIndex: 1 },
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