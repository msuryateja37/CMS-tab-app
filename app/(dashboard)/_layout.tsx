import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Slot, useGlobalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", icon: "dashboard", path: "/(dashboard)" },
  {
    name: "Facility Management",
    icon: "sitemap",
    children: [
      { name: "Invoice Upload", path: "/(dashboard)/workflow/upload" },
      { name: "Document Vault", path: "/(dashboard)/workflow/vault" },
    ],
  },
  {
    name: "Incidents",
    icon: "warning",
    children: [
      { name: "All incidents", path: "/(dashboard)/all" },
      { name: "Report incidents", path: "/(dashboard)/report" },
      { name: "Assigned to me", path: "#" },
    ],
  },
  {
    name: "Security",
    icon: "shield",
    children: ["Security Incidents", "Report Breach", "Access Controls"],
  },
  { name: "Facilities Management", icon: "building" },
  {
    name: "OHS Management",
    icon: "medkit",
    children: [
      "Hazard Reports",
      "Risk Registers",
      "JSA Documents",
      "Safe Work Procedures",
    ],
  },
  {
    name: "Operations",
    icon: "cogs",
    children: ["Permit to work", "Inspections", "Audits"],
  },
  {
    name: "Emergency",
    icon: "ambulance",
    children: ["Response plan", "Drill Schedule", "Equipment Inventory"],
  },
  {
    name: "Performance",
    icon: "line-chart",
    children: ["KPI Dashboard", "PDCA workflow", "Action Plans"],
  },
  { name: "Administration", icon: "users" },
];

export default function TabLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<{
    parent: string;
    child: string | null;
  }>({ parent: "Dashboard", child: null });
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  // Auto-collapse on smaller screens
  const isMobile = width < 768;
  const sidebarWidth = isCollapsed ? 60 : 250;

  // Extract user details from params or fallback to defaults
  const fullName = (params.fullName as string) || "Admin User";
  const email = (params.email as string) || "admin@example.com";
  const role = (params.role as string) || "Administrator";

  // Convert to lowercase for robust role comparison
  const emailLower = email.toLowerCase();
  const roleLower = role.toLowerCase();

  const isAdminClerk = emailLower === "adminclerk@dlrrd.gov.za";
  const isSupervisor =
    roleLower === "administrator" || roleLower === "supervisor";

  // Filter items based on role if necessary
  const filteredSidebarItems = SIDEBAR_ITEMS.map((item) => {
    if (item.name === "Facility Management") {
      const children = item.children?.filter((child) => {
        const childName =
          typeof child === "string" ? child : (child as any).name;
        if (childName === "Invoice Upload") return isSupervisor;
        if (childName === "Document Vault") return isAdminClerk;
        return true;
      });
      if (!children || children.length === 0) return null;
      return { ...item, children };
    }
    if (item.name === "Administration" && !isAdminClerk && !isSupervisor) {
      return null;
    }
    return item;
  }).filter(Boolean) as typeof SIDEBAR_ITEMS;

  const handleLogout = () => {
    router.replace("/login");
  };

  const handleParentClick = (item: any) => {
    if (item.children) {
      // Collapse other menus and toggle the current one
      setExpandedMenu((prev) => (prev === item.name ? null : item.name));
    } else {
      setExpandedMenu(null);
      setActiveItem({ parent: item.name, child: null });
      if (item.path && item.path !== "#") {
        router.push(item.path as any);
      }
    }
  };

  const handleChildClick = (parentName: string, child: any) => {
    const childName = typeof child === "string" ? child : child.name;
    const childPath = typeof child === "string" ? "#" : child.path;

    setActiveItem({ parent: parentName, child: childName });
    if (childPath && childPath !== "#") {
      router.push(childPath as any);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {/* Sidebar */}
        <View
          style={[
            styles.sidebar,
            { width: isMobile ? (isCollapsed ? 0 : 250) : sidebarWidth },
          ]}
        >
          <View style={styles.sidebarHeader}>
            {!isCollapsed && <Text style={styles.sidebarTitle}>Menu</Text>}
            <Pressable
              onPress={() => setIsCollapsed(!isCollapsed)}
              style={styles.collapseBtn}
            >
              <FontAwesome
                name={isCollapsed ? "chevron-right" : "chevron-left"}
                size={16}
                color="#fff"
              />
            </Pressable>
          </View>

          <ScrollView style={styles.sidebarNav}>
            {filteredSidebarItems.map((item, idx) => {
              const isExpanded = expandedMenu === item.name;
              const isParentActive = activeItem.parent === item.name;

              return (
                <View key={idx}>
                  <Pressable
                    style={[
                      styles.navItem,
                      isParentActive && styles.activeNavItem,
                    ]}
                    onPress={() => handleParentClick(item)}
                  >
                    <FontAwesome
                      name={item.icon as any}
                      size={20}
                      color={isParentActive ? "#60a5fa" : "#fff"}
                      style={styles.navIcon}
                    />
                    {!isCollapsed && (
                      <>
                        <Text
                          style={[
                            styles.navText,
                            isParentActive && styles.activeNavText,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.children && (
                          <FontAwesome
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={12}
                            color="#aaa"
                            style={styles.chevronIcon}
                          />
                        )}
                      </>
                    )}
                  </Pressable>

                  {!isCollapsed && isExpanded && item.children && (
                    <View style={styles.childrenContainer}>
                      {item.children.map((child, childIdx) => {
                        const childName =
                          typeof child === "string" ? child : child.name;
                        const isChildActive =
                          isParentActive && activeItem.child === childName;
                        return (
                          <Pressable
                            key={childIdx}
                            style={[
                              styles.childNavItem,
                              isChildActive && styles.activeChildNavItem,
                            ]}
                            onPress={() => handleChildClick(item.name, child)}
                          >
                            <Text
                              style={[
                                styles.childNavText,
                                isChildActive && styles.activeChildNavText,
                              ]}
                            >
                              {childName}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome
              name="sign-out"
              size={20}
              color="#fff"
              style={styles.navIcon}
            />
            {!isCollapsed && <Text style={styles.navText}>Logout</Text>}
          </Pressable>
        </View>

        {/* Main Content Areas */}
        <View style={styles.main}>
          {/* Top Bar */}
          <View style={styles.topbar}>
            <View style={styles.topbarInner}>
              {isMobile && (
                <Pressable
                  onPress={() => setIsCollapsed(!isCollapsed)}
                  style={styles.mobileMenuBtn}
                >
                  <FontAwesome name="bars" size={24} color="#333" />
                </Pressable>
              )}
              <View style={styles.spacer} />

              <Pressable
                style={styles.profileBtn}
                onPress={() => setShowProfile(!showProfile)}
              >
                <Text style={styles.profileName}>{fullName}</Text>
                <FontAwesome name="user-circle" size={28} color="#2e78b7" />
              </Pressable>
            </View>

            {/* Profile Dropdown Details */}
            {showProfile && (
              <View style={styles.profileDropdown}>
                <Text style={styles.dropdownTitle}>Profile Details</Text>
                <Text style={styles.dropdownText}>Name: {fullName}</Text>
                <Text style={styles.dropdownText}>Email: {email}</Text>
                <Text style={styles.dropdownText}>Role: {role}</Text>
              </View>
            )}
          </View>

          {/* Page Content */}
          <View style={styles.content}>
            <Slot />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f4f4f4" },
  sidebar: {
    backgroundColor: "#1e1e2d",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sidebarTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  collapseBtn: { padding: 5 },
  sidebarNav: { flex: 1, paddingTop: 10 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 16,
    paddingRight: 20,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  activeNavItem: { backgroundColor: "#2a2a3f", borderLeftColor: "#60a5fa" },
  navIcon: { width: 24, textAlign: "center" },
  navText: { color: "#fff", marginLeft: 15, fontSize: 14 },
  activeNavText: { color: "#60a5fa", fontWeight: "bold" },
  chevronIcon: { marginLeft: "auto" },
  childrenContainer: { backgroundColor: "#151521", paddingVertical: 5 },
  childNavItem: { paddingVertical: 12, paddingLeft: 60, paddingRight: 20 },
  activeChildNavItem: { backgroundColor: "#2a2a3f" },
  childNavText: { color: "#ccc", fontSize: 13 },
  activeChildNavText: { color: "#60a5fa", fontWeight: "bold" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  main: { flex: 1, flexDirection: "column" },
  topbar: {
    backgroundColor: "#fff",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  topbarInner: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  mobileMenuBtn: { padding: 5, marginRight: 15 },
  spacer: { flex: 1 },
  profileBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileName: { fontSize: 16, fontWeight: "500", color: "#333" },
  profileDropdown: {
    position: "absolute",
    top: 65,
    right: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    width: 250,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  dropdownText: { fontSize: 14, color: "#666", marginBottom: 5 },
  content: { flex: 1, padding: 20 },
});
