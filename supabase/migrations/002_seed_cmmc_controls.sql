-- =============================================================================
-- 002_seed_cmmc_controls.sql - CMMC 2.0 Domains & All 110 Controls
-- NIST SP 800-171 Rev 2 mapping (17 Level 1 + 93 Level 2 = 110 total)
-- Idempotent: uses ON CONFLICT DO NOTHING
-- =============================================================================

-- =============================================================================
-- Domains (14)
-- =============================================================================

insert into cmmc_domains (name, abbreviation, sort_order) values
  ('Access Control', 'AC', 1),
  ('Awareness and Training', 'AT', 2),
  ('Audit and Accountability', 'AU', 3),
  ('Configuration Management', 'CM', 4),
  ('Identification and Authentication', 'IA', 5),
  ('Incident Response', 'IR', 6),
  ('Maintenance', 'MA', 7),
  ('Media Protection', 'MP', 8),
  ('Physical Protection', 'PE', 9),
  ('Personnel Security', 'PS', 10),
  ('Risk Assessment', 'RA', 11),
  ('Security Assessment', 'CA', 12),
  ('System and Communications Protection', 'SC', 13),
  ('System and Information Integrity', 'SI', 14)
on conflict (abbreviation) do nothing;

-- =============================================================================
-- Controls - Access Control (AC) - 22 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- AC Level 1 (4 practices)
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L1-3.1.1',
  'Authorized Access Control',
  'Limit information system access to authorized users, processes acting on behalf of authorized users, or devices (including other information systems).',
  1,
  'Do you limit system access to only authorized users, processes, and devices?',
  'Implement access control lists (ACLs) and user account management procedures. Ensure all accounts are approved, assigned, and regularly reviewed. Disable or remove inactive accounts promptly.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L1-3.1.2',
  'Transaction and Function Control',
  'Limit information system access to the types of transactions and functions that authorized users are permitted to execute.',
  1,
  'Do you restrict users to only the transactions and functions they are authorized to perform?',
  'Implement role-based access control (RBAC). Define roles with minimum necessary permissions. Map each user to appropriate roles and review assignments periodically.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L1-3.1.20',
  'External Connections',
  'Verify and control/limit connections to and use of external information systems.',
  1,
  'Do you verify and control connections to external systems?',
  'Establish policies governing connections to external systems. Implement boundary protection mechanisms such as firewalls. Document and approve all external system connections.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L1-3.1.22',
  'Control Public Information',
  'Control information posted or processed on publicly accessible information systems.',
  1,
  'Do you control what CUI is posted or processed on publicly accessible systems?',
  'Designate individuals authorized to post information on public systems. Implement review procedures before content is publicly released. Train authorized individuals on CUI handling.',
  4
),
-- AC Level 2 (18 practices)
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.3',
  'Control CUI Flow',
  'Control the flow of CUI in accordance with approved authorizations.',
  2,
  'Do you control the flow of CUI based on approved authorizations?',
  'Implement information flow control policies using firewalls, guards, and encrypted tunnels. Define and enforce approved paths for CUI transmission between systems and networks.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.4',
  'Separation of Duties',
  'Separate the duties of individuals to reduce the risk of malevolent activity without collusion.',
  2,
  'Do you enforce separation of duties for critical functions?',
  'Identify and document duties that require separation. Assign different individuals to different roles. Use system-enforced access controls to prevent one person from completing a critical task alone.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.5',
  'Least Privilege',
  'Employ the principle of least privilege, including for specific security functions and privileged accounts.',
  2,
  'Do you enforce least privilege for all user accounts including privileged accounts?',
  'Review all user privileges and reduce to minimum necessary. Create separate accounts for administrative functions. Implement privileged access management (PAM) solutions.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.6',
  'Non-Privileged Account Use',
  'Use non-privileged accounts or roles when accessing nonsecurity functions.',
  2,
  'Do users use non-privileged accounts for routine nonsecurity tasks?',
  'Require administrators to have separate standard accounts for daily tasks. Block privileged accounts from browsing the internet or accessing email. Implement technical controls to enforce this separation.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.7',
  'Privileged Functions',
  'Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.',
  2,
  'Do you prevent non-privileged users from executing privileged functions and log all privileged actions?',
  'Configure systems to restrict privileged functions to authorized accounts. Enable auditing of all privileged operations. Review audit logs regularly for unauthorized privilege use.',
  9
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.8',
  'Unsuccessful Logon Attempts',
  'Limit unsuccessful logon attempts.',
  2,
  'Do your systems lock accounts or delay access after a defined number of failed login attempts?',
  'Configure account lockout policies (e.g., lock after 5 failed attempts for 30 minutes). Implement progressive delays between attempts. Alert security personnel of repeated failures.',
  10
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.9',
  'Privacy and Security Notices',
  'Provide privacy and security notices consistent with applicable CUI rules.',
  2,
  'Do your systems display approved privacy and security notices before granting access?',
  'Configure login banners on all systems that display approved use notifications. Include warnings about monitoring and unauthorized use. Ensure banners meet organizational and federal requirements.',
  11
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.10',
  'Session Lock',
  'Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity.',
  2,
  'Do your systems automatically lock sessions after inactivity and hide displayed information?',
  'Configure automatic screen lock after 15 minutes of inactivity (or less). Require re-authentication to resume. Enable pattern-hiding displays (screensaver or blank screen).',
  12
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.11',
  'Session Termination',
  'Terminate (automatically) a user session after a defined condition.',
  2,
  'Do your systems automatically terminate sessions after defined conditions (e.g., inactivity timeout)?',
  'Configure session timeouts for all applications and remote access. Define conditions for automatic termination (e.g., idle time, time of day). Implement re-authentication requirements.',
  13
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.12',
  'Remote Access Control',
  'Monitor and control remote access sessions.',
  2,
  'Do you monitor and control all remote access sessions?',
  'Implement VPN or zero-trust network access for all remote connections. Log and monitor remote sessions. Require MFA for remote access. Restrict remote access to approved methods only.',
  14
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.13',
  'Remote Access Confidentiality',
  'Employ cryptographic mechanisms to protect the confidentiality of remote access sessions.',
  2,
  'Do you use encryption (e.g., VPN, TLS) to protect remote access sessions?',
  'Require encrypted connections (TLS 1.2+, IPsec VPN) for all remote access. Disable unencrypted remote protocols. Validate certificate configurations regularly.',
  15
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.14',
  'Remote Access Routing',
  'Route remote access via managed access control points.',
  2,
  'Is all remote access routed through managed and monitored access control points?',
  'Configure network architecture so all remote access passes through a managed access point (e.g., VPN concentrator, jump server). Monitor traffic at these points. Block direct remote connections that bypass controls.',
  16
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.15',
  'Privileged Remote Access',
  'Authorize remote execution of privileged commands and remote access to security-relevant information.',
  2,
  'Do you explicitly authorize and monitor remote execution of privileged commands?',
  'Document and approve all privileged remote access needs. Implement privileged access workstations or jump servers. Log and review all remote privileged command execution.',
  17
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.16',
  'Wireless Access Authorization',
  'Authorize wireless access prior to allowing such connections.',
  2,
  'Do you require authorization before allowing wireless network connections?',
  'Implement 802.1X or WPA3-Enterprise for wireless authentication. Maintain an approved list of wireless devices. Disable unauthorized wireless access points. Conduct regular wireless scans.',
  18
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.17',
  'Wireless Access Protection',
  'Protect wireless access using authentication and encryption.',
  2,
  'Do you protect wireless networks with strong authentication and encryption?',
  'Deploy WPA3 or WPA2-Enterprise with AES encryption. Use RADIUS or certificate-based authentication. Disable WEP and open networks. Segment wireless traffic from CUI networks.',
  19
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.18',
  'Mobile Device Connection',
  'Control connection of mobile devices.',
  2,
  'Do you control and restrict mobile device connections to organizational systems?',
  'Implement a mobile device management (MDM) solution. Define and enforce a mobile device policy. Require device enrollment before access. Enable remote wipe capability.',
  20
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.19',
  'Encrypt CUI on Mobile Devices',
  'Encrypt CUI on mobile devices and mobile computing platforms.',
  2,
  'Is CUI encrypted on all mobile devices and mobile computing platforms?',
  'Enable full-device encryption on all mobile devices (e.g., BitLocker, FileVault, Android encryption). Use encrypted containers for CUI. Verify encryption is active through MDM compliance checks.',
  21
),
(
  (select id from cmmc_domains where abbreviation = 'AC'),
  'AC.L2-3.1.21',
  'Portable Storage Use',
  'Limit use of portable storage devices on external systems.',
  2,
  'Do you restrict the use of organization-controlled portable storage devices on external systems?',
  'Define policies limiting portable storage use. Implement DLP controls to block unauthorized USB devices. Use encrypted portable storage when necessary. Train users on portable storage risks.',
  22
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Awareness and Training (AT) - 3 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'AT'),
  'AT.L2-3.2.1',
  'Role-Based Risk Awareness',
  'Ensure that managers, systems administrators, and users of organizational systems are made aware of the security risks associated with their activities and of the applicable policies, standards, and procedures related to the security of those systems.',
  2,
  'Do you provide security awareness training that covers risks, policies, and procedures relevant to each role?',
  'Develop role-based security awareness training. Deliver initial training for new hires and annual refresher training. Document training completion and maintain records.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'AT'),
  'AT.L2-3.2.2',
  'Role-Based Training',
  'Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities.',
  2,
  'Do you provide specialized security training for personnel with security-related roles?',
  'Identify roles requiring specialized security training (e.g., system admins, incident responders). Deliver role-specific technical training. Track training completion and competency.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'AT'),
  'AT.L2-3.2.3',
  'Insider Threat Awareness',
  'Provide security awareness training on recognizing and reporting potential indicators of insider threat.',
  2,
  'Do you train personnel to recognize and report potential insider threats?',
  'Include insider threat scenarios in security awareness training. Establish clear reporting procedures. Provide examples of insider threat indicators. Conduct periodic refresher training.',
  3
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Audit and Accountability (AU) - 9 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.1',
  'System Auditing',
  'Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.',
  2,
  'Do you create and retain audit logs sufficient to investigate unauthorized activity?',
  'Enable audit logging on all systems processing CUI. Define log retention periods (minimum 1 year recommended). Store logs securely with tamper protection. Include who, what, when, where, and outcome.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.2',
  'User Accountability',
  'Ensure that the actions of individual system users can be uniquely traced to those users so they can be held accountable for their actions.',
  2,
  'Can all user actions be uniquely traced to individual users?',
  'Prohibit shared accounts. Implement unique user IDs for all users. Log user identity with all auditable events. Correlate logs across systems to maintain traceability.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.3',
  'Event Review',
  'Review and update logged events.',
  2,
  'Do you regularly review audit logs and update the list of auditable events?',
  'Establish a regular log review schedule (at least weekly for critical systems). Use SIEM tools to automate analysis. Update auditable events based on threat intelligence and incidents.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.4',
  'Audit Failure Alerting',
  'Alert in the event of an audit logging process failure.',
  2,
  'Do your systems alert administrators when audit logging fails?',
  'Configure alerts for audit system failures (e.g., log storage full, logging service stopped). Define response procedures for audit failures. Test alerting mechanisms regularly.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.5',
  'Audit Record Correlation',
  'Correlate audit record review, analysis, and reporting processes to support organizational processes for investigation and response to suspicious activities.',
  2,
  'Do you correlate audit records across systems to support investigation of suspicious activities?',
  'Deploy a SIEM solution to centralize and correlate logs. Create correlation rules for common attack patterns. Establish procedures to investigate correlated alerts.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.6',
  'Audit Reduction and Reporting',
  'Provide audit record reduction and report generation to support on-demand analysis and reporting.',
  2,
  'Can you generate audit reports and perform on-demand analysis of audit records?',
  'Implement log management tools with search, filter, and reporting capabilities. Create standard reports for compliance and investigation. Enable ad-hoc query capability for analysts.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.7',
  'Authoritative Time Source',
  'Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.',
  2,
  'Are all system clocks synchronized to an authoritative time source (e.g., NTP)?',
  'Configure NTP on all systems pointing to authoritative time sources. Verify time synchronization regularly. Use at least two independent time sources for redundancy.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.8',
  'Audit Record Protection',
  'Protect audit information and audit logging tools from unauthorized access, modification, and deletion.',
  2,
  'Do you protect audit logs and logging tools from unauthorized access, modification, and deletion?',
  'Restrict access to audit logs to authorized personnel only. Store logs on separate systems or write-once media. Implement integrity checks on log files. Back up logs to secure storage.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'AU'),
  'AU.L2-3.3.9',
  'Audit Management',
  'Limit management of audit logging functionality to a subset of privileged users.',
  2,
  'Is management of audit logging restricted to a limited set of privileged users?',
  'Define a small group of authorized audit administrators. Restrict access to audit configuration and tools. Log all changes to audit configuration. Review access to audit management quarterly.',
  9
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Configuration Management (CM) - 9 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.1',
  'System Baselining',
  'Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles.',
  2,
  'Do you maintain baseline configurations and system inventories throughout the system lifecycle?',
  'Create and document baseline configurations for all system types. Maintain a current hardware and software inventory. Update baselines when changes are approved. Use automated tools to track deviations.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.2',
  'Security Configuration Enforcement',
  'Establish and enforce security configuration settings for information technology products employed in organizational systems.',
  2,
  'Do you enforce security configuration settings (e.g., hardening guides, STIGs) on all IT products?',
  'Apply CIS Benchmarks or DISA STIGs to all systems. Use configuration management tools to enforce settings. Scan for deviations regularly. Document exceptions with risk acceptance.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.3',
  'System Change Management',
  'Track, review, approve or disapprove, and log changes to organizational systems.',
  2,
  'Do you track, review, approve, and log all changes to organizational systems?',
  'Implement a formal change management process. Require documented change requests with impact analysis. Obtain approval before implementation. Log all changes with before/after states.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.4',
  'Impact Analysis',
  'Analyze the security impact of changes prior to implementation.',
  2,
  'Do you analyze the security impact of system changes before implementing them?',
  'Include security impact analysis in the change management process. Test changes in a non-production environment first. Document security implications. Obtain security team review for significant changes.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.5',
  'Access Restrictions for Change',
  'Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.',
  2,
  'Do you enforce access restrictions for making changes to organizational systems?',
  'Restrict system change privileges to authorized personnel. Implement separate development, test, and production environments. Use change windows and approval workflows. Log all change activities.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.6',
  'Least Functionality',
  'Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.',
  2,
  'Do you configure systems to provide only essential capabilities and disable unnecessary functions?',
  'Disable unnecessary services, ports, and protocols. Remove or disable unused software. Whitelist approved applications where possible. Review system functionality periodically.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.7',
  'Nonessential Functionality',
  'Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.',
  2,
  'Do you disable or prevent nonessential programs, functions, ports, protocols, and services?',
  'Conduct regular port and service scans. Disable unused network protocols. Block unnecessary outbound connections. Maintain a whitelist of approved software and services.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.8',
  'Application Execution Policy',
  'Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software or deny-all, permit-by-exception (whitelisting) policy to allow the execution of authorized software.',
  2,
  'Do you use application whitelisting or blacklisting to control software execution?',
  'Implement application whitelisting (preferred) or blacklisting on all endpoints. Use tools like AppLocker, WDAC, or similar. Maintain and update the approved software list. Monitor for unauthorized executions.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'CM'),
  'CM.L2-3.4.9',
  'User-Installed Software',
  'Control and monitor user-installed software.',
  2,
  'Do you control and monitor software that users install on organizational systems?',
  'Restrict local administrator rights to prevent unauthorized installations. Implement a software request and approval process. Monitor for unauthorized software installations. Use endpoint management tools.',
  9
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Identification and Authentication (IA) - 11 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- IA Level 1 (2 practices)
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L1-3.5.1',
  'Identification',
  'Identify information system users, processes acting on behalf of users, or devices.',
  1,
  'Do you uniquely identify all users, processes, and devices accessing your systems?',
  'Assign unique identifiers to all users and devices. Prohibit shared or group accounts. Implement device identification for network access. Maintain a registry of all identifiers.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L1-3.5.2',
  'Authentication',
  'Authenticate (or verify) the identities of those users, processes, or devices, as a prerequisite to allowing access to organizational information systems.',
  1,
  'Do you authenticate all users, processes, and devices before granting access?',
  'Require authentication for all system access. Implement strong password policies (minimum 12 characters, complexity requirements). Enable multi-factor authentication where possible.',
  2
),
-- IA Level 2 (9 practices)
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.3',
  'Multifactor Authentication',
  'Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.',
  2,
  'Do you enforce multifactor authentication for all privileged access and network access to non-privileged accounts?',
  'Deploy MFA for all privileged accounts (local and remote). Enable MFA for all remote/network access. Use hardware tokens, authenticator apps, or push notifications. Avoid SMS-only MFA.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.4',
  'Replay-Resistant Authentication',
  'Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts.',
  2,
  'Do you use replay-resistant authentication (e.g., challenge-response, time-based tokens) for network access?',
  'Implement replay-resistant protocols (e.g., Kerberos, TLS with mutual authentication, TOTP). Disable legacy authentication protocols (NTLM v1, basic auth over HTTP). Verify authentication mechanisms resist replay attacks.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.5',
  'Identifier Reuse',
  'Prevent reuse of identifiers for a defined period.',
  2,
  'Do you prevent reuse of user identifiers for a defined period after account removal?',
  'Define an identifier reuse prevention period (minimum 2 years recommended). Maintain records of retired identifiers. Configure systems to block reassignment of identifiers during the prevention period.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.6',
  'Identifier Handling',
  'Disable identifiers after a defined period of inactivity.',
  2,
  'Do you disable user accounts after a defined period of inactivity?',
  'Configure automatic account disabling after 90 days of inactivity (or less). Implement automated scanning for inactive accounts. Notify users before disabling. Review disabled accounts periodically.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.7',
  'Password Complexity',
  'Enforce a minimum password complexity and change of characters when new passwords are created.',
  2,
  'Do you enforce password complexity requirements including minimum length and character variety?',
  'Require minimum 12-character passwords with mixed case, numbers, and special characters. Enforce password history (minimum 24 passwords remembered). Implement character change requirements for new passwords.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.8',
  'Password Reuse',
  'Prohibit password reuse for a specified number of generations.',
  2,
  'Do you prevent users from reusing recent passwords?',
  'Configure systems to remember at least 24 previous passwords. Prevent users from rapidly cycling through passwords. Implement minimum password age (at least 1 day) to prevent circumvention.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.9',
  'Temporary Passwords',
  'Allow temporary password use for system logons with an immediate change to a permanent password.',
  2,
  'Do you require immediate password change when temporary passwords are issued?',
  'Configure systems to force password change on first use of temporary credentials. Set short expiration on temporary passwords (24 hours max). Use secure channels to communicate temporary passwords.',
  9
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.10',
  'Cryptographically-Protected Passwords',
  'Store and transmit only cryptographically-protected passwords.',
  2,
  'Are all passwords stored and transmitted in encrypted or hashed form?',
  'Use strong hashing algorithms for stored passwords (bcrypt, scrypt, or Argon2). Require TLS for all password transmission. Disable protocols that transmit passwords in cleartext. Audit for plaintext password storage.',
  10
),
(
  (select id from cmmc_domains where abbreviation = 'IA'),
  'IA.L2-3.5.11',
  'Obscure Feedback',
  'Obscure feedback of authentication information.',
  2,
  'Do your systems obscure passwords and authentication information during entry?',
  'Configure all login screens to mask password input. Ensure authentication APIs do not return credentials in responses. Prevent browsers from caching credentials where possible.',
  11
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Incident Response (IR) - 3 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'IR'),
  'IR.L2-3.6.1',
  'Incident Handling',
  'Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.',
  2,
  'Do you have an operational incident response capability covering preparation through recovery?',
  'Develop and document an incident response plan. Define incident response team roles and responsibilities. Establish communication procedures. Conduct incident response exercises at least annually.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'IR'),
  'IR.L2-3.6.2',
  'Incident Reporting',
  'Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.',
  2,
  'Do you track, document, and report security incidents to appropriate officials and authorities?',
  'Define incident reporting procedures and timelines. Identify internal and external reporting contacts (including DIBCAC for CUI incidents). Implement an incident tracking system. Report CUI incidents within 72 hours.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'IR'),
  'IR.L2-3.6.3',
  'Incident Response Testing',
  'Test the organizational incident response capability.',
  2,
  'Do you test your incident response capability at least annually?',
  'Conduct tabletop exercises or simulations at least annually. Include all incident response team members. Document lessons learned and update procedures. Test both technical and communication aspects.',
  3
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Maintenance (MA) - 6 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.1',
  'Perform Maintenance',
  'Perform maintenance on organizational systems.',
  2,
  'Do you perform timely maintenance on all organizational systems?',
  'Establish a maintenance schedule for all systems. Document maintenance procedures. Track maintenance activities. Ensure maintenance is performed by authorized personnel only.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.2',
  'System Maintenance Control',
  'Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.',
  2,
  'Do you control the tools, techniques, and personnel used for system maintenance?',
  'Maintain an approved list of maintenance tools. Inspect tools before use. Require authorization for maintenance personnel. Supervise maintenance by non-authorized personnel. Remove unnecessary tools after maintenance.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.3',
  'Equipment Sanitization',
  'Ensure equipment removed for off-site maintenance is sanitized of any CUI.',
  2,
  'Do you sanitize equipment of CUI before removing it for off-site maintenance?',
  'Implement media sanitization procedures before off-site maintenance. Verify sanitization was successful. Document chain of custody for equipment sent off-site. Use encrypted storage to simplify sanitization.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.4',
  'Media Inspection',
  'Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems.',
  2,
  'Do you scan diagnostic and maintenance media for malicious code before use?',
  'Scan all external media with up-to-date antivirus before use. Maintain dedicated maintenance media. Restrict use of personal media for maintenance. Document media inspection procedures.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.5',
  'Nonlocal Maintenance',
  'Require multifactor authentication to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete.',
  2,
  'Do you require MFA for remote maintenance sessions and terminate them when complete?',
  'Require MFA for all remote maintenance access. Use encrypted connections for remote maintenance. Terminate sessions upon completion. Log all remote maintenance activities. Use dedicated maintenance accounts.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'MA'),
  'MA.L2-3.7.6',
  'Maintenance Personnel',
  'Supervise the maintenance activities of maintenance personnel without required access authorization.',
  2,
  'Do you supervise maintenance personnel who do not have required access authorization?',
  'Escort and supervise unauthorized maintenance personnel at all times. Verify authorization status before granting unescorted access. Document supervision requirements in maintenance procedures.',
  6
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Media Protection (MP) - 9 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- MP Level 1 (1 practice)
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L1-3.8.3',
  'Media Disposal',
  'Sanitize or destroy information system media containing Federal Contract Information before disposal or release for reuse.',
  1,
  'Do you sanitize or destroy media containing FCI/CUI before disposal or reuse?',
  'Implement media sanitization procedures (NIST SP 800-88 guidelines). Maintain sanitization equipment. Document disposal activities. Use certified destruction services for sensitive media.',
  1
),
-- MP Level 2 (3 practices)
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.1',
  'Media Protection',
  'Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.',
  2,
  'Do you physically control and securely store all media containing CUI?',
  'Store CUI media in locked containers or secure rooms. Implement check-in/check-out procedures. Mark media with CUI designations. Maintain inventory of CUI media. Restrict access to storage areas.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.2',
  'Media Access',
  'Limit access to CUI on system media to authorized users.',
  2,
  'Do you restrict access to CUI on system media to authorized users only?',
  'Implement access controls on digital media. Restrict physical access to CUI media storage. Maintain access logs for CUI media. Review access authorizations periodically.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.4',
  'Media Markings',
  'Mark media with necessary CUI markings and distribution limitations.',
  2,
  'Do you mark all media containing CUI with appropriate CUI markings and distribution limitations?',
  'Apply CUI markings to all media containing CUI. Include distribution limitation statements. Train personnel on marking requirements. Inspect media for proper markings during audits.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.5',
  'Media Accountability',
  'Control access to media containing CUI and maintain accountability for media during transport outside of controlled areas.',
  2,
  'Do you maintain accountability for media containing CUI during transport outside controlled areas?',
  'Implement chain-of-custody procedures for CUI media transport. Use tamper-evident packaging. Track media movement with logs. Assign responsibility for media during transport.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.6',
  'Portable Storage Encryption',
  'Implement cryptographic mechanisms to protect the confidentiality of CUI stored on digital media during transport unless otherwise protected by alternative physical safeguards.',
  2,
  'Do you encrypt CUI on portable digital media used for transport?',
  'Require encryption on all portable storage devices (USB drives, external hard drives). Use FIPS-validated encryption. Prohibit transport of unencrypted CUI on portable media. Enforce via DLP policies.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.7',
  'Removable Media',
  'Control the use of removable media on system components.',
  2,
  'Do you control and restrict the use of removable media on organizational systems?',
  'Implement device control policies to restrict removable media. Whitelist approved removable devices. Disable USB ports where not needed. Monitor removable media usage via endpoint management.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.8',
  'Shared Media',
  'Prohibit the use of portable storage devices when such devices have no identifiable owner.',
  2,
  'Do you prohibit the use of portable storage devices that have no identifiable owner?',
  'Establish a policy prohibiting unowned portable media. Label all organization-issued portable media. Implement technical controls to block unregistered devices. Conduct periodic audits of portable media.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'MP'),
  'MP.L2-3.8.9',
  'Protect Backups',
  'Protect the confidentiality of backup CUI at storage locations.',
  2,
  'Do you protect the confidentiality of CUI in backups at storage locations?',
  'Encrypt all backups containing CUI. Store backups in secure locations with access controls. Test backup integrity regularly. Maintain backup access logs. Apply the same protection to backups as to source data.',
  9
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Physical Protection (PE) - 6 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- PE Level 1 (4 practices)
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L1-3.10.1',
  'Limit Physical Access',
  'Limit physical access to organizational information systems, equipment, and the respective operating environments to authorized individuals.',
  1,
  'Do you limit physical access to systems and equipment to authorized individuals?',
  'Implement physical access controls (badges, keys, locks). Maintain access authorization lists. Escort visitors at all times. Review physical access authorizations periodically.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L1-3.10.3',
  'Escort Visitors',
  'Escort visitors and monitor visitor activity.',
  1,
  'Do you escort all visitors and monitor their activity in controlled areas?',
  'Implement a visitor management process. Require visitors to sign in and out. Issue temporary visitor badges. Escort visitors in all controlled areas. Log visitor activities.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L1-3.10.4',
  'Physical Access Logs',
  'Maintain audit logs of physical access.',
  1,
  'Do you maintain logs of physical access to facilities and systems?',
  'Implement electronic or manual access logging. Record entry and exit times. Retain logs for at least 1 year. Review logs periodically for anomalies.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L1-3.10.5',
  'Manage Physical Access',
  'Control and manage physical access devices.',
  1,
  'Do you control and manage physical access devices (keys, badges, combinations)?',
  'Maintain inventory of all physical access devices. Change combinations and rekey locks periodically. Collect access devices from terminated employees. Audit access device inventory regularly.',
  4
),
-- PE Level 2 (2 practices)
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L2-3.10.2',
  'Protect and Monitor Facility',
  'Protect and monitor the physical facility and support infrastructure for organizational systems.',
  2,
  'Do you monitor and protect the physical facility including support infrastructure?',
  'Install surveillance cameras at key entry points. Implement environmental controls (fire suppression, HVAC monitoring). Monitor facility 24/7 or use intrusion detection. Protect utility infrastructure.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'PE'),
  'PE.L2-3.10.6',
  'Alternative Work Sites',
  'Enforce safeguarding measures for CUI at alternate work sites.',
  2,
  'Do you enforce CUI safeguarding measures at alternate work sites (e.g., home offices)?',
  'Define security requirements for alternate work sites. Require VPN and encrypted connections. Ensure physical security of CUI at remote locations. Include alternate work sites in security assessments.',
  6
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Personnel Security (PS) - 2 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'PS'),
  'PS.L2-3.9.1',
  'Screen Individuals',
  'Screen individuals prior to authorizing access to organizational systems containing CUI.',
  2,
  'Do you screen individuals before granting access to systems containing CUI?',
  'Conduct background checks before granting CUI access. Define screening criteria based on risk level. Re-screen at defined intervals. Document screening results and maintain records.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'PS'),
  'PS.L2-3.9.2',
  'Personnel Actions',
  'Ensure that organizational systems containing CUI are protected during and after personnel actions such as terminations and transfers.',
  2,
  'Do you protect CUI systems during and after personnel terminations and transfers?',
  'Disable access within 24 hours of termination. Retrieve all access devices and credentials. Conduct exit interviews covering CUI responsibilities. Transfer CUI access during role changes. Document all personnel actions.',
  2
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Risk Assessment (RA) - 3 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'RA'),
  'RA.L2-3.11.1',
  'Risk Assessments',
  'Periodically assess the risk to organizational operations (including mission, functions, image, or reputation), organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.',
  2,
  'Do you conduct periodic risk assessments of your systems and CUI processing?',
  'Conduct risk assessments at least annually. Identify threats, vulnerabilities, and impacts. Document risk assessment results. Update risk assessments when significant changes occur.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'RA'),
  'RA.L2-3.11.2',
  'Vulnerability Scan',
  'Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified.',
  2,
  'Do you conduct regular vulnerability scans and scan when new vulnerabilities are identified?',
  'Conduct vulnerability scans at least monthly. Scan after significant changes. Use authenticated scanning where possible. Remediate critical and high vulnerabilities within defined timelines.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'RA'),
  'RA.L2-3.11.3',
  'Vulnerability Remediation',
  'Remediate vulnerabilities in accordance with risk assessments.',
  2,
  'Do you remediate vulnerabilities based on risk assessment priorities?',
  'Define remediation timelines based on severity (critical: 15 days, high: 30 days, medium: 90 days). Track remediation progress. Implement compensating controls when immediate remediation is not possible. Verify remediation effectiveness.',
  3
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - Security Assessment (CA) - 4 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
(
  (select id from cmmc_domains where abbreviation = 'CA'),
  'CA.L2-3.12.1',
  'Security Control Assessment',
  'Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.',
  2,
  'Do you periodically assess the effectiveness of your security controls?',
  'Conduct security control assessments at least annually. Use automated tools where possible. Document assessment results. Create POA&Ms for identified deficiencies.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'CA'),
  'CA.L2-3.12.2',
  'Plan of Action',
  'Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.',
  2,
  'Do you maintain and implement plans of action and milestones (POA&Ms) to address security deficiencies?',
  'Create POA&Ms for all identified security deficiencies. Include milestones, responsible parties, and completion dates. Review and update POA&Ms at least quarterly. Track progress to resolution.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'CA'),
  'CA.L2-3.12.3',
  'Security Control Monitoring',
  'Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.',
  2,
  'Do you continuously monitor security controls for ongoing effectiveness?',
  'Implement continuous monitoring tools and processes. Define monitoring frequencies based on risk. Automate monitoring where possible. Report monitoring results to appropriate officials.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'CA'),
  'CA.L2-3.12.4',
  'System Security Plan',
  'Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.',
  2,
  'Do you maintain a current system security plan (SSP) that describes your system and security implementations?',
  'Develop an SSP covering all CUI systems. Include system boundaries, environments, and interconnections. Document how each security requirement is implemented. Review and update at least annually.',
  4
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - System and Communications Protection (SC) - 16 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- SC Level 1 (2 practices)
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L1-3.13.1',
  'Boundary Protection',
  'Monitor, control, and protect organizational communications (i.e., information transmitted or received by organizational systems) at the external boundaries and key internal boundaries of the information systems.',
  1,
  'Do you monitor and protect communications at external and key internal system boundaries?',
  'Deploy firewalls at all network boundaries. Implement intrusion detection/prevention systems. Monitor network traffic. Define and enforce network segmentation policies.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L1-3.13.5',
  'Public-Access System Separation',
  'Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.',
  1,
  'Are publicly accessible systems separated from internal networks via DMZ or logical separation?',
  'Place public-facing systems in a DMZ. Implement firewall rules between DMZ and internal networks. Restrict traffic between public and internal zones. Monitor DMZ traffic.',
  2
),
-- SC Level 2 (14 practices)
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.2',
  'Security Engineering',
  'Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.',
  2,
  'Do you apply security engineering principles in the design and development of organizational systems?',
  'Incorporate security into the system development lifecycle. Apply defense-in-depth principles. Conduct security architecture reviews. Follow secure coding practices.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.3',
  'Role Separation',
  'Separate user functionality from system management functionality.',
  2,
  'Do you separate user-facing functionality from system management functionality?',
  'Implement separate interfaces for administration and user functions. Use different networks or VLANs for management traffic. Restrict management interfaces to authorized administrators.',
  4
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.4',
  'Shared Resource Control',
  'Prevent unauthorized and unintended information transfer via shared system resources.',
  2,
  'Do you prevent unauthorized information transfer through shared system resources?',
  'Implement memory protection and process isolation. Clear shared resources between user sessions. Configure systems to prevent data remnants in shared storage. Encrypt data at rest.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.6',
  'Network Communication by Exception',
  'Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception).',
  2,
  'Do your firewalls and network devices default to deny-all and only allow explicitly permitted traffic?',
  'Configure firewalls with default-deny rules. Document all permitted traffic flows. Review firewall rules quarterly. Remove outdated or unnecessary rules.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.7',
  'Split Tunneling',
  'Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling).',
  2,
  'Do you prevent split tunneling on remote devices connected to your network?',
  'Configure VPN clients to disable split tunneling. Route all traffic through the organizational VPN when connected. Monitor for split tunneling violations. Include requirements in remote access policy.',
  7
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.8',
  'Data in Transit',
  'Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.',
  2,
  'Do you encrypt CUI during transmission using approved cryptographic mechanisms?',
  'Require TLS 1.2 or higher for all CUI transmissions. Use IPsec VPN for site-to-site connections. Disable unencrypted protocols (HTTP, FTP, Telnet). Validate encryption configurations regularly.',
  8
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.9',
  'Network Disconnect',
  'Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity.',
  2,
  'Do you terminate network connections after session end or defined inactivity period?',
  'Configure session timeouts on all network devices and applications. Terminate idle VPN connections after 30 minutes. Implement session management for web applications. Log session terminations.',
  9
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.10',
  'Key Management',
  'Establish and manage cryptographic keys for cryptography employed in organizational systems.',
  2,
  'Do you have established procedures for managing cryptographic keys throughout their lifecycle?',
  'Implement a key management policy covering generation, distribution, storage, rotation, and destruction. Use hardware security modules (HSMs) for critical keys. Rotate keys on defined schedules. Document key management procedures.',
  10
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.11',
  'CUI Encryption',
  'Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.',
  2,
  'Do you use FIPS-validated cryptographic modules to protect CUI confidentiality?',
  'Deploy FIPS 140-2 (or 140-3) validated cryptographic modules. Verify FIPS validation certificates. Configure systems to use only FIPS-approved algorithms. Document FIPS compliance.',
  11
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.12',
  'Collaborative Device Control',
  'Prohibit remote activation of collaborative computing devices and provide indication of devices in use to users present at the device.',
  2,
  'Do you prevent remote activation of cameras/microphones and provide indicators when they are active?',
  'Disable remote activation of webcams and microphones by default. Enable hardware or software indicators when devices are active. Provide physical covers for cameras. Include in acceptable use policies.',
  12
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.13',
  'Mobile Code',
  'Control and monitor the use of mobile code.',
  2,
  'Do you control and monitor the use of mobile code (e.g., JavaScript, ActiveX, Flash)?',
  'Define a mobile code usage policy. Configure browsers and email clients to restrict unauthorized mobile code. Monitor mobile code execution. Block known malicious mobile code sources.',
  13
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.14',
  'Voice over Internet Protocol',
  'Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.',
  2,
  'Do you control and monitor VoIP usage within your organization?',
  'Implement VoIP on a separate VLAN. Encrypt VoIP traffic. Monitor VoIP for unauthorized use. Apply access controls to VoIP systems. Include VoIP in network security architecture.',
  14
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.15',
  'Communications Authenticity',
  'Protect the authenticity of communications sessions.',
  2,
  'Do you protect the authenticity of communications sessions (e.g., using TLS certificates, mutual authentication)?',
  'Implement TLS with valid certificates for all communications. Use mutual authentication where appropriate. Validate certificates and certificate chains. Monitor for certificate anomalies.',
  15
),
(
  (select id from cmmc_domains where abbreviation = 'SC'),
  'SC.L2-3.13.16',
  'Data at Rest',
  'Protect the confidentiality of CUI at rest.',
  2,
  'Do you encrypt CUI at rest on all systems and storage media?',
  'Enable full-disk encryption on all endpoints (BitLocker, FileVault). Encrypt databases containing CUI. Use encrypted storage for backups. Verify encryption is active through compliance scanning.',
  16
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Controls - System and Information Integrity (SI) - 7 practices
-- =============================================================================

insert into cmmc_controls (domain_id, control_id, title, description, level, assessment_question, remediation_guidance, sort_order)
values
-- SI Level 1 (4 practices)
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L1-3.14.1',
  'Flaw Remediation',
  'Identify, report, and correct information and information system flaws in a timely manner.',
  1,
  'Do you identify, report, and correct system flaws (e.g., apply patches) in a timely manner?',
  'Implement a patch management process. Apply critical patches within 15 days. Test patches before deployment to production. Maintain a patch compliance dashboard.',
  1
),
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L1-3.14.2',
  'Malicious Code Protection',
  'Provide protection from malicious code at appropriate locations within organizational information systems.',
  1,
  'Do you deploy malicious code protection (antivirus/anti-malware) on all systems?',
  'Deploy antivirus/anti-malware on all endpoints and servers. Enable real-time scanning. Configure automatic definition updates. Monitor and respond to malware detections.',
  2
),
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L1-3.14.4',
  'Update Malicious Code Protection',
  'Update malicious code protection mechanisms when new releases are available.',
  1,
  'Do you keep malicious code protection mechanisms (signatures, engines) up to date?',
  'Configure automatic updates for antivirus definitions and engines. Verify updates are applying successfully. Monitor for systems with outdated definitions. Alert on update failures.',
  3
),
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L1-3.14.5',
  'System and File Scanning',
  'Perform periodic scans of the information system and real-time scans of files from external sources as files are downloaded, opened, or executed.',
  1,
  'Do you perform periodic full-system scans and real-time scanning of downloaded files?',
  'Schedule weekly full-system scans. Enable real-time scanning for all file operations. Scan email attachments and downloads automatically. Configure scan policies for removable media.',
  4
),
-- SI Level 2 (3 practices)
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L2-3.14.3',
  'Security Alerts and Advisories',
  'Monitor system security alerts and advisories and take action in response.',
  2,
  'Do you monitor security alerts and advisories and take appropriate action?',
  'Subscribe to vendor security advisories and US-CERT alerts. Assign personnel to monitor and triage alerts. Define response procedures for different alert severities. Track actions taken on advisories.',
  5
),
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L2-3.14.6',
  'Monitor Communications for Attacks',
  'Monitor organizational systems, including inbound and outbound communications traffic, to detect attacks and indicators of potential attacks.',
  2,
  'Do you monitor inbound and outbound communications for attacks and indicators of compromise?',
  'Deploy network intrusion detection/prevention systems (IDS/IPS). Monitor email for phishing and malware. Implement DNS filtering. Use threat intelligence feeds. Review alerts and investigate anomalies.',
  6
),
(
  (select id from cmmc_domains where abbreviation = 'SI'),
  'SI.L2-3.14.7',
  'Identify Unauthorized Use',
  'Identify unauthorized use of organizational systems.',
  2,
  'Do you monitor for and identify unauthorized use of organizational systems?',
  'Implement user behavior analytics (UBA). Monitor for anomalous login patterns. Track unauthorized software installations. Review system logs for unauthorized access attempts. Alert on policy violations.',
  7
)
on conflict (control_id) do nothing;

-- =============================================================================
-- Verification: Count controls by level
-- Expected: 17 Level 1 + 93 Level 2 = 110 total
-- =============================================================================
-- To verify after running: select level, count(*) from cmmc_controls group by level;
