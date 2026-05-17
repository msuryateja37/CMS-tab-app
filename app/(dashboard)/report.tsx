import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const INCIDENT_TYPES = [
  { id: 'safety', title: 'Safety', desc: 'Work place, accident, hazards', icon: 'warning' },
  { id: 'environmental', title: 'Environmental', desc: 'Spills, contamination', icon: 'leaf' },
  { id: 'equipment', title: 'Equipment', desc: 'Machinery failure', icon: 'cogs' },
  { id: 'security', title: 'Security', desc: 'Unauthorized access, theft', icon: 'shield' },
  { id: 'health', title: 'Health', desc: 'Illness, Exposure', icon: 'medkit' },
  { id: 'others', title: 'Others', desc: 'Other accidents', icon: 'ellipsis-h' },
];

const PROVINCES = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'];
const PROVINCES_WITH_IDS = [
  { id: 'e03fd95d-b235-4e9a-9e3c-185290a5e0a8', name: 'Eastern Cape' },
  { id: 'dummy-gauteng', name: 'Gauteng' },
  { id: 'dummy-wc', name: 'Western Cape' },
];

const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
const IMMEDIATE_ACTIONS = [
  { id: 'secured', label: 'Secured area' },
  { id: 'evacuated', label: 'Personnel evacuated' },
  { id: 'management', label: 'Management informed' },
  { id: 'firstaid', label: 'First aid administered' },
  { id: 'emergency', label: 'Emergency services contacted' },
  { id: 'others', label: 'Others' }
];

const TOTAL_STEPS = 5;
const STEPS_ARRAY = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

export default function ReportIncidentScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Step 2 Form States
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [timeObj, setTimeObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [province, setProvince] = useState('');
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [severity, setSeverity] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [otherDesc, setOtherDesc] = useState('');

  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Step 3 Form States
  const [impactProv, setImpactProv] = useState<{id: string, name: string} | null>(null);
  const [isImpactProvOpen, setIsImpactProvOpen] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [impactedPeople, setImpactedPeople] = useState<any[]>([]);
  const [manualUser, setManualUser] = useState({ name: '', email: '', phone: '' });
  const [impactDescription, setImpactDescription] = useState('');

  const { width } = useWindowDimensions();
  
  const isDesktop = width >= 768;
  const cardWidth = isDesktop ? '31%' : '100%';

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLocate = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      setLatitude(lat.toString());
      setLongitude(lon.toString());
      setMapRegion({ ...mapRegion, latitude: lat, longitude: lon });
    } catch (error) {
      alert('Error fetching location. Please ensure location services are enabled.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setIncidentDate(formattedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTimeObj(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIncidentTime(formattedTime);
    }
  };

  const fetchUsersByProvince = async (provinceId: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`https://cmsbackend-f4arbkegcchtbxc6.southafricanorth-01.azurewebsites.net/users/province/${provinceId}`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NTEwNjBkZC0xYjZmLTRmZGItYmQ0MS1kYzkyYWVlYzY4NGMiLCJyb2xlIjoiU1lTVEVNX0FETUlOSVNUUkFUT1IiLCJpYXQiOjE3Nzg3ODc0MTAsImV4cCI6MTc3ODc4ODMxMH0.j7F2ufK14wBKggCqzMp5bPZoPPTxNDbbSX4fFTLXKRE'
        }
      });
      const data = await response.json();
      setFetchedUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      alert('Error fetching users for this province.');
      console.error(error);
      setFetchedUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddPerson = (user: any) => {
    if (!impactedPeople.find(p => p.id === user.id)) {
      setImpactedPeople([...impactedPeople, user]);
    }
  };

  const handleRemovePerson = (userId: string) => {
    setImpactedPeople(impactedPeople.filter(p => p.id !== userId));
  };

  const handleAddManualPerson = () => {
    if (!manualUser.name) return alert("Name is required");
    setImpactedPeople([...impactedPeople, { ...manualUser, id: Date.now().toString() }]);
    setManualUser({ name: '', email: '', phone: '' });
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Incident Type</Text>
      <Text style={styles.stepSubtitle}>Please select the category that best describes the incident.</Text>
      
      <View style={styles.cardsGrid}>
        {INCIDENT_TYPES.map(type => {
          const isSelected = selectedType === type.id;
          return (
            <Pressable
              key={type.id}
              style={[styles.card, { width: cardWidth }, isSelected && styles.cardActive]}
              onPress={() => setSelectedType(type.id)}
            >
              <View style={[styles.iconWrapper, isSelected && styles.iconWrapperActive]}>
                <FontAwesome name={type.icon as any} size={24} color={isSelected ? '#fff' : '#2e78b7'} />
              </View>
              <Text style={[styles.cardTitle, isSelected && styles.textActive]}>{type.title}</Text>
              <Text style={[styles.cardDesc, isSelected && styles.textActive]}>{type.desc}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Info</Text>
      <Text style={styles.stepSubtitle}>Date, Location, Severity</Text>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Time of incident</Text>
          <Pressable onPress={() => setShowTimePicker(true)}>
            <View pointerEvents="none">
              <TextInput style={styles.input} placeholder="HH:MM" value={incidentTime} editable={false} />
            </View>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={timeObj}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Date of incident</Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <View pointerEvents="none">
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={incidentDate} editable={false} />
            </View>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
      </View>

      <Text style={[styles.stepTitle, { fontSize: 18, marginTop: 10 }]}>Location</Text>
      
      <View style={[styles.formRow, { zIndex: 10 }]}>
        <View style={[styles.formGroup, { flex: 1, zIndex: 10 }]}>
          <Text style={styles.inputLabel}>Province</Text>
          <View style={styles.dropdownContainer}>
            <Pressable style={styles.dropdownButton} onPress={() => setIsProvOpen(!isProvOpen)}>
              <Text style={{ color: province ? '#333' : '#888' }} numberOfLines={1}>{province || 'Select Province'}</Text>
              <FontAwesome name="chevron-down" size={12} color="#888" />
            </Pressable>
            {isProvOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                  {PROVINCES.map(prov => (
                    <Pressable key={prov} style={styles.dropdownItem} onPress={() => { setProvince(prov); setIsProvOpen(false); }}>
                      <Text style={styles.dropdownItemText}>{prov}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Building Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Block A" value={buildingName} onChangeText={setBuildingName} />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput style={styles.input} placeholder="Full street address" value={address} onChangeText={setAddress} />
      </View>

      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={mapRegion}
          onRegionChangeComplete={(region) => setMapRegion(region)}
        >
          {latitude && longitude ? (
            <Marker coordinate={{ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }} />
          ) : null}
        </MapView>
        <Pressable style={styles.btnMapOverlay} onPress={handleLocate}>
          <FontAwesome name="crosshairs" size={16} color="#2e78b7" style={{marginRight: 8}} />
          <Text style={{ color: '#2e78b7', fontWeight: 'bold' }}>Locate & Capture Lat/Long</Text>
        </Pressable>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={latitude} editable={false} placeholder="Auto-filled" />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={longitude} editable={false} placeholder="Auto-filled" />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Severity Level <Text style={{color: '#ef4444'}}>*</Text></Text>
        <View style={styles.radioGroup}>
          {SEVERITY_LEVELS.map(level => (
            <Pressable key={level} style={styles.radioOption} onPress={() => setSeverity(level)}>
              <FontAwesome name={severity === level ? "dot-circle-o" : "circle-o"} size={20} color={severity === level ? "#2e78b7" : "#888"} />
              <Text style={styles.radioText}>{level}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Immediate Action Taken</Text>
        <Text style={styles.inputSubLabel}>Select any immediate action that have been taken</Text>
        <View style={styles.checkboxGroup}>
          {IMMEDIATE_ACTIONS.map(action => {
            const isChecked = actions.includes(action.id);
            return (
              <Pressable key={action.id} style={styles.checkboxOption} onPress={() => {
                setActions(prev => prev.includes(action.id) ? prev.filter(a => a !== action.id) : [...prev, action.id]);
              }}>
                <FontAwesome name={isChecked ? "check-square" : "square-o"} size={20} color={isChecked ? "#2e78b7" : "#888"} />
                <Text style={styles.checkboxText}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {actions.includes('others') && (
          <TextInput 
            style={[styles.input, { marginTop: 15 }]} 
            placeholder="Please describe other actions..." 
            value={otherDesc}
            onChangeText={setOtherDesc}
          />
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>People and Impact</Text>
      <Text style={styles.stepSubtitle}>Identify affected personnel and describe the impact.</Text>

      <View style={[styles.formGroup, { zIndex: 20 }]}>
        <Text style={styles.inputLabel}>Select Province to fetch Users</Text>
        <View style={styles.dropdownContainer}>
          <Pressable style={styles.dropdownButton} onPress={() => setIsImpactProvOpen(!isImpactProvOpen)}>
            <Text style={{ color: impactProv ? '#333' : '#888' }} numberOfLines={1}>{impactProv?.name || 'Select Province'}</Text>
            <FontAwesome name="chevron-down" size={12} color="#888" />
          </Pressable>
          {isImpactProvOpen && (
            <View style={styles.dropdownMenu}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                {PROVINCES_WITH_IDS.map(prov => (
                  <Pressable key={prov.id} style={styles.dropdownItem} onPress={() => { 
                    setImpactProv(prov); 
                    setIsImpactProvOpen(false); 
                    fetchUsersByProvince(prov.id); 
                  }}>
                    <Text style={styles.dropdownItemText}>{prov.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Available Users {impactProv ? `from ${impactProv.name}` : ''}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Name</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Email</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1.5 }]}>Department</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Action</Text>
            </View>
            
            <View style={{ maxHeight: 250 }}>
              <ScrollView nestedScrollEnabled>
                {isLoadingUsers ? (
                  <View style={{ padding: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2e78b7" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Fetching users...</Text>
                  </View>
                ) : fetchedUsers.length === 0 ? (
                  <Text style={styles.emptyTableText}>
                    {impactProv ? 'No users found for this province.' : 'Please select a province to fetch users.'}
                  </Text>
                ) : (
                  fetchedUsers.map(user => (
                    <View key={user.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{user.name}</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{user.email || '-'}</Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]} numberOfLines={1}>{user.department?.name || '-'}</Text>
                      <View style={[styles.tableCell, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                        <Pressable style={styles.btnAddUser} onPress={() => handleAddPerson(user)}>
                          <FontAwesome name="plus" size={14} color="#fff" />
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Add User Manually</Text>
        <View style={styles.manualUserForm}>
          <TextInput style={[styles.input, { flex: 1, minWidth: 120 }]} placeholder="Name *" value={manualUser.name} onChangeText={t => setManualUser({...manualUser, name: t})} />
          <TextInput style={[styles.input, { flex: 1, minWidth: 120 }]} placeholder="Email" value={manualUser.email} onChangeText={t => setManualUser({...manualUser, email: t})} keyboardType="email-address" />
          <TextInput style={[styles.input, { flex: 1, minWidth: 120 }]} placeholder="Phone" value={manualUser.phone} onChangeText={t => setManualUser({...manualUser, phone: t})} keyboardType="phone-pad" />
          <Pressable style={styles.btnManualAdd} onPress={handleAddManualPerson}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Add</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Selected Impacted People ({impactedPeople.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Name</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Email</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Phone</Text>
              <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Action</Text>
            </View>
            {impactedPeople.length === 0 ? (
              <Text style={styles.emptyTableText}>No users added yet.</Text>
            ) : (
              impactedPeople.map(p => (
                <View key={p.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{p.name}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{p.email || '-'}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{p.phone || '-'}</Text>
                  <Pressable style={[styles.tableCell, { flex: 1, alignItems: 'center', justifyContent: 'center' }]} onPress={() => handleRemovePerson(p.id)}>
                    <FontAwesome name="trash" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Impact Description</Text>
        <TextInput 
          style={[styles.input, { height: 100, paddingTop: 12, textAlignVertical: 'top' }]} 
          placeholder="Describe the impact of the incident..." 
          multiline={true}
          value={impactDescription}
          onChangeText={setImpactDescription}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Report Incident</Text>

      <View style={styles.cardSection}>
        {/* Progressive Stepper */}
        <View style={styles.stepperContainer}>
          {/* Background Track */}
          <View style={styles.stepLineBackground} />
          {/* Active Progress Track */}
          <View style={[styles.stepLineProgress, { width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }]} />
          
          <View style={styles.stepsWrapper}>
            {STEPS_ARRAY.map(step => {
              const isActive = currentStep >= step;
              return (
                <View key={step} style={styles.stepIndicatorWrapper}>
                  <View style={[styles.stepCircle, isActive && styles.stepCircleActive]}>
                    {isActive && currentStep > step ? (
                      <FontAwesome name="check" size={16} color="#fff" />
                    ) : (
                      <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{step}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>Step {step}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Dynamic Content */}
        <View style={[styles.dynamicContentArea, { zIndex: 10 }]}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep > 3 && (
            <View style={styles.placeholderContent}>
              <Text style={styles.stepTitle}>Step {currentStep} Details</Text>
              <Text style={styles.stepSubtitle}>Based on your selection of: <Text style={{fontWeight: 'bold', color: '#2e78b7'}}>{selectedType?.toUpperCase() || 'NONE'}</Text></Text>
              <Text style={{marginTop: 20, color: '#888'}}>Additional form fields for step {currentStep} will go here.</Text>
            </View>
          )}
        </View>

        {/* Navigation Actions */}
        <View style={styles.actionButtons}>
          <Pressable style={[styles.btn, styles.btnBack, currentStep === 1 && styles.btnDisabled]} onPress={handleBack} disabled={currentStep === 1}>
            <Text style={styles.btnBackText}>Back</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.btn, styles.btnNext, (currentStep === 1 && !selectedType) && styles.btnDisabled]} 
            onPress={handleNext} 
            disabled={currentStep === 1 && !selectedType}
          >
            <Text style={styles.btnNextText}>{currentStep === TOTAL_STEPS ? 'Submit' : 'Next Step'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  content: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  cardSection: { backgroundColor: '#fff', padding: 30, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  
  // Stepper Styles
  stepperContainer: { position: 'relative', marginBottom: 40, marginTop: 10 },
  stepLineBackground: { position: 'absolute', top: 20, left: 15, right: 15, height: 4, backgroundColor: '#e5e7eb', zIndex: 1, borderRadius: 2 },
  stepLineProgress: { position: 'absolute', top: 20, left: 15, height: 4, backgroundColor: '#2e78b7', zIndex: 2, borderRadius: 2 },
  stepsWrapper: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 3 },
  stepIndicatorWrapper: { alignItems: 'center', width: 60 },
  stepCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 3, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { borderColor: '#2e78b7', backgroundColor: '#2e78b7' },
  stepText: { fontSize: 16, fontWeight: 'bold', color: '#9ca3af' },
  stepTextActive: { color: '#fff' },
  stepLabel: { marginTop: 8, fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  stepLabelActive: { color: '#2e78b7', fontWeight: 'bold' },

  // Content Styles
  dynamicContentArea: { minHeight: 300, marginBottom: 30 },
  stepContent: { flex: 1 },
  placeholderContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  stepSubtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
  
  // Grid Cards
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', rowGap: 15 },
  card: { backgroundColor: '#f9f9f9', borderWidth: 2, borderColor: '#eee', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center' },
  cardActive: { backgroundColor: '#eef6fc', borderColor: '#2e78b7' },
  iconWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eef6fc', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  iconWrapperActive: { backgroundColor: '#2e78b7' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  cardDesc: { fontSize: 12, color: '#666', textAlign: 'center' },
  textActive: { color: '#2e78b7' },

  // Actions
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
  btn: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnBack: { backgroundColor: '#f3f4f6' },
  btnBackText: { color: '#4b5563', fontWeight: 'bold', fontSize: 16 },
  btnNext: { backgroundColor: '#2e78b7' },
  btnNextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Form Elements
  formRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  inputSubLabel: { fontSize: 12, color: '#666', marginBottom: 15, marginTop: -5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, height: 45, backgroundColor: '#fff', fontSize: 14 },
  inputDisabled: { backgroundColor: '#f0f0f0', color: '#888' },
  
  // Step 3 Specific
  userListContainer: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  userListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  userListName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  userListSub: { fontSize: 12, color: '#666', marginTop: 2 },
  btnAddUser: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  manualUserForm: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  btnManualAdd: { backgroundColor: '#2e78b7', paddingHorizontal: 20, height: 45, borderRadius: 8, justifyContent: 'center' },
  
  table: { width: '100%', borderWidth: 1, borderColor: '#eee', borderRadius: 8, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tableHeadText: { fontWeight: 'bold', color: '#444' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  tableCell: { padding: 12, fontSize: 14, color: '#333' },
  emptyTableText: { padding: 20, textAlign: 'center', color: '#888' },

  // Dropdown
  dropdownContainer: { position: 'relative' },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, height: 45 },
  dropdownMenu: { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, elevation: 5, zIndex: 100 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  
  // Map & Actions
  mapContainer: { height: 250, backgroundColor: '#e5e7eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  map: { width: '100%', height: '100%' },
  btnMapOverlay: { position: 'absolute', bottom: 15, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioText: { fontSize: 14, color: '#333' },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 15, columnGap: 10 },
  checkboxOption: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '45%', minWidth: 160 },
  checkboxText: { fontSize: 14, color: '#333' },
});