// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalRecords
 * @dev Smart contract for managing medical document records on blockchain
 * @author Vmedithon Team
 */
contract MedicalRecords {
    
    // Struct to store medical document information
    struct MedicalDocument {
        string ipfsHash;        // IPFS hash of the document
        address patientAddress; // Patient's wallet address
        address doctorAddress;  // Doctor's wallet address
        uint256 timestamp;      // When the document was uploaded
        string documentType;    // Type of medical document
        bool isActive;          // Document status
        string metadata;        // Additional metadata
    }
    
    // Struct to store patient information
    struct Patient {
        string name;
        string email;
        uint256 dateOfBirth;
        bool isRegistered;
        uint256 documentCount;
    }
    
    // Struct to store doctor information
    struct Doctor {
        string name;
        string license;
        string specialization;
        bool isVerified;
        uint256 documentCount;
    }
    
    // State variables
    address public owner;
    uint256 public totalDocuments;
    uint256 public totalPatients;
    uint256 public totalDoctors;
    
    // Mappings
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(string => MedicalDocument) public documents; // ipfsHash => MedicalDocument
    mapping(address => string[]) public patientDocuments; // patient => ipfsHashes
    mapping(address => string[]) public doctorDocuments; // doctor => ipfsHashes
    
    // Enhanced Access Control Mappings
    mapping(address => bool) public authorizedAddresses; // Keep for backward compatibility
    mapping(address => mapping(address => bool)) public patientDoctorAccess; // patient => doctor => hasAccess
    mapping(address => mapping(address => bool)) public doctorAccessRequests; // doctor => patient => hasPendingRequest
    mapping(address => address[]) public patientAuthorizedDoctors; // patient => array of authorized doctors
    mapping(address => address[]) public doctorAccessiblePatients; // doctor => array of accessible patients
    
    // Access Request Tracking
    struct AccessRequest {
        address doctor;
        address patient;
        string reason;
        uint256 requestTime;
        bool isPending;
    }
    
    mapping(bytes32 => AccessRequest) public accessRequests; // requestId => AccessRequest
    mapping(address => bytes32[]) public patientPendingRequests; // patient => requestIds[]
    mapping(address => bytes32[]) public doctorSentRequests; // doctor => requestIds[]
    
    // Events
    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name, string license);
    event DocumentUploaded(
        string indexed ipfsHash,
        address indexed patient,
        address indexed doctor,
        string documentType
    );
    event DocumentAccessed(string indexed ipfsHash, address indexed accessor);
    event PermissionGranted(address indexed grantee, address indexed grantor);
    event PermissionRevoked(address indexed revokee, address indexed revoker);
    
    // Enhanced Access Control Events
    event AccessRequested(
        bytes32 indexed requestId,
        address indexed doctor,
        address indexed patient,
        string reason
    );
    event AccessApproved(
        bytes32 indexed requestId,
        address indexed doctor,
        address indexed patient
    );
    event AccessDenied(
        bytes32 indexed requestId,
        address indexed doctor,
        address indexed patient
    );
    event AccessRevoked(
        address indexed doctor,
        address indexed patient
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyPatient() {
        require(patients[msg.sender].isRegistered, "Only registered patients can call this");
        _;
    }
    
    modifier onlyDoctor() {
        require(doctors[msg.sender].isVerified, "Only verified doctors can call this");
        _;
    }
    
    // Enhanced Access Control Modifiers
    modifier hasPatientAccess(address _patient) {
        require(
            msg.sender == _patient || // Patient themselves
            patientDoctorAccess[_patient][msg.sender] || // Authorized doctor
            authorizedAddresses[msg.sender], // Legacy authorized address
            "Access denied: No permission to view patient data"
        );
        _;
    }
    
    modifier canAccessDocument(string memory _ipfsHash) {
        MedicalDocument storage doc = documents[_ipfsHash];
        require(
            msg.sender == doc.patientAddress || // Patient themselves
            (doctors[msg.sender].isVerified && patientDoctorAccess[doc.patientAddress][msg.sender]) || // Authorized doctor
            msg.sender == doc.doctorAddress || // Document creator (original doctor)
            authorizedAddresses[msg.sender], // Legacy authorized address
            "Access denied: No permission to view this document"
        );
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedAddresses[msg.sender] || 
            patients[msg.sender].isRegistered || 
            doctors[msg.sender].isVerified || 
            msg.sender == owner,
            "Not authorized to access this function"
        );
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier documentExists(string memory _ipfsHash) {
        require(bytes(documents[_ipfsHash].ipfsHash).length > 0, "Document does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalDocuments = 0;
        totalPatients = 0;
        totalDoctors = 0;
    }
    
    /**
     * @dev Register a new patient
     * @param _name Patient's name
     * @param _email Patient's email
     * @param _dateOfBirth Patient's date of birth (timestamp)
     */
    function registerPatient(
        string memory _name,
        string memory _email,
        uint256 _dateOfBirth
    ) external {
        require(!patients[msg.sender].isRegistered, "Patient already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        patients[msg.sender] = Patient({
            name: _name,
            email: _email,
            dateOfBirth: _dateOfBirth,
            isRegistered: true,
            documentCount: 0
        });
        
        totalPatients++;
        emit PatientRegistered(msg.sender, _name);
    }
    
    /**
     * @dev Register a new doctor
     * @param _name Doctor's name
     * @param _license Doctor's license number
     * @param _specialization Doctor's specialization
     */
    function registerDoctor(
        string memory _name,
        string memory _license,
        string memory _specialization
    ) external {
        require(!doctors[msg.sender].isVerified, "Doctor already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_license).length > 0, "License cannot be empty");
        
        doctors[msg.sender] = Doctor({
            name: _name,
            license: _license,
            specialization: _specialization,
            isVerified: true,
            documentCount: 0
        });
        
        totalDoctors++;
        emit DoctorRegistered(msg.sender, _name, _license);
    }
    
    /**
     * @dev Upload a medical document
     * @param _ipfsHash IPFS hash of the document
     * @param _patientAddress Patient's address
     * @param _documentType Type of medical document
     * @param _metadata Additional metadata
     */
    function uploadDocument(
        string memory _ipfsHash,
        address _patientAddress,
        string memory _documentType,
        string memory _metadata
    ) external onlyDoctor validAddress(_patientAddress) {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(documents[_ipfsHash].ipfsHash).length == 0, "Document already exists");
        
        documents[_ipfsHash] = MedicalDocument({
            ipfsHash: _ipfsHash,
            patientAddress: _patientAddress,
            doctorAddress: msg.sender,
            timestamp: block.timestamp,
            documentType: _documentType,
            isActive: true,
            metadata: _metadata
        });
        
        patientDocuments[_patientAddress].push(_ipfsHash);
        doctorDocuments[msg.sender].push(_ipfsHash);
        
        patients[_patientAddress].documentCount++;
        doctors[msg.sender].documentCount++;
        totalDocuments++;
        
        emit DocumentUploaded(_ipfsHash, _patientAddress, msg.sender, _documentType);
    }
    
    /**
     * @dev Get document details by IPFS hash
     * @param _ipfsHash IPFS hash of the document
     */
    function getDocument(string memory _ipfsHash) 
        external 
        view 
        documentExists(_ipfsHash) 
        canAccessDocument(_ipfsHash)
        returns (
            string memory ipfsHash,
            address patientAddress,
            address doctorAddress,
            uint256 timestamp,
            string memory documentType,
            bool isActive,
            string memory metadata
        ) 
    {
        MedicalDocument memory doc = documents[_ipfsHash];
        
        return (
            doc.ipfsHash,
            doc.patientAddress,
            doc.doctorAddress,
            doc.timestamp,
            doc.documentType,
            doc.isActive,
            doc.metadata
        );
    }
    
    /**
     * @dev Get all document hashes for a patient
     * @param _patientAddress Patient's address
     */
    function getPatientDocuments(address _patientAddress) 
        external 
        view 
        validAddress(_patientAddress)
        hasPatientAccess(_patientAddress)
        returns (string[] memory) 
    {
        return patientDocuments[_patientAddress];
    }
    
    /**
     * @dev Get all document hashes uploaded by a doctor
     * @param _doctorAddress Doctor's address
     */
    function getDoctorDocuments(address _doctorAddress) 
        external 
        view 
        validAddress(_doctorAddress)
        returns (string[] memory) 
    {
        require(
            msg.sender == _doctorAddress || 
            authorizedAddresses[msg.sender] || 
            msg.sender == owner,
            "Not authorized to view doctor documents"
        );
        
        return doctorDocuments[_doctorAddress];
    }
    
    /**
     * @dev Grant access permission to another address
     * @param _grantee Address to grant permission to
     */
    function grantPermission(address _grantee) external onlyPatient validAddress(_grantee) {
        authorizedAddresses[_grantee] = true;
        emit PermissionGranted(_grantee, msg.sender);
    }
    
    /**
     * @dev Revoke access permission from an address
     * @param _revokee Address to revoke permission from
     */
    function revokePermission(address _revokee) external onlyPatient validAddress(_revokee) {
        authorizedAddresses[_revokee] = false;
        emit PermissionRevoked(_revokee, msg.sender);
    }
    
    /**
     * @dev Deactivate a document
     * @param _ipfsHash IPFS hash of the document to deactivate
     */
    function deactivateDocument(string memory _ipfsHash) 
        external 
        documentExists(_ipfsHash) 
    {
        MedicalDocument storage doc = documents[_ipfsHash];
        require(
            msg.sender == doc.patientAddress || 
            msg.sender == doc.doctorAddress || 
            msg.sender == owner,
            "Not authorized to deactivate this document"
        );
        
        doc.isActive = false;
    }
    
    /**
     * @dev Get patient information
     * @param _patientAddress Patient's address
     */
    function getPatientInfo(address _patientAddress) 
        external 
        view 
        validAddress(_patientAddress)
        returns (
            string memory name,
            string memory email,
            uint256 dateOfBirth,
            bool isRegistered,
            uint256 documentCount
        ) 
    {
        require(
            msg.sender == _patientAddress || 
            authorizedAddresses[msg.sender] || 
            msg.sender == owner,
            "Not authorized to view patient info"
        );
        
        Patient memory patient = patients[_patientAddress];
        return (
            patient.name,
            patient.email,
            patient.dateOfBirth,
            patient.isRegistered,
            patient.documentCount
        );
    }
    
    /**
     * @dev Get doctor information
     * @param _doctorAddress Doctor's address
     */
    function getDoctorInfo(address _doctorAddress) 
        external 
        view 
        validAddress(_doctorAddress)
        returns (
            string memory name,
            string memory license,
            string memory specialization,
            bool isVerified,
            uint256 documentCount
        ) 
    {
        Doctor memory doctor = doctors[_doctorAddress];
        return (
            doctor.name,
            doctor.license,
            doctor.specialization,
            doctor.isVerified,
            doctor.documentCount
        );
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 _totalDocuments,
            uint256 _totalPatients,
            uint256 _totalDoctors
        ) 
    {
        return (totalDocuments, totalPatients, totalDoctors);
    }
    
    // ============================================
    // ENHANCED ACCESS CONTROL FUNCTIONS
    // ============================================
    
    /**
     * @dev Doctor requests access to patient's medical records
     * @param _patient Patient's address
     * @param _reason Reason for requesting access
     */
    function requestPatientAccess(address _patient, string memory _reason) 
        external 
        onlyDoctor 
        validAddress(_patient) 
    {
        require(patients[_patient].isRegistered, "Patient not registered");
        require(!patientDoctorAccess[_patient][msg.sender], "Access already granted");
        require(!doctorAccessRequests[msg.sender][_patient], "Request already pending");
        
        // Generate unique request ID
        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, _patient, block.timestamp, _reason)
        );
        
        // Create access request
        accessRequests[requestId] = AccessRequest({
            doctor: msg.sender,
            patient: _patient,
            reason: _reason,
            requestTime: block.timestamp,
            isPending: true
        });
        
        // Track the request
        doctorAccessRequests[msg.sender][_patient] = true;
        patientPendingRequests[_patient].push(requestId);
        doctorSentRequests[msg.sender].push(requestId);
        
        emit AccessRequested(requestId, msg.sender, _patient, _reason);
    }
    
    /**
     * @dev Patient approves doctor's access request
     * @param _requestId Request ID to approve
     */
    function approveAccessRequest(bytes32 _requestId) 
        external 
        onlyPatient 
    {
        AccessRequest storage request = accessRequests[_requestId];
        require(request.isPending, "Request not found or already processed");
        require(request.patient == msg.sender, "Only patient can approve their own requests");
        require(doctors[request.doctor].isVerified, "Doctor not verified");
        
        // Grant access
        patientDoctorAccess[msg.sender][request.doctor] = true;
        doctorAccessRequests[request.doctor][msg.sender] = false;
        request.isPending = false;
        
        // Add to tracking arrays
        patientAuthorizedDoctors[msg.sender].push(request.doctor);
        doctorAccessiblePatients[request.doctor].push(msg.sender);
        
        emit AccessApproved(_requestId, request.doctor, msg.sender);
        emit PermissionGranted(request.doctor, msg.sender);
    }
    
    /**
     * @dev Patient denies doctor's access request
     * @param _requestId Request ID to deny
     */
    function denyAccessRequest(bytes32 _requestId) 
        external 
        onlyPatient 
    {
        AccessRequest storage request = accessRequests[_requestId];
        require(request.isPending, "Request not found or already processed");
        require(request.patient == msg.sender, "Only patient can deny their own requests");
        
        // Deny access
        doctorAccessRequests[request.doctor][msg.sender] = false;
        request.isPending = false;
        
        emit AccessDenied(_requestId, request.doctor, msg.sender);
    }
    
    /**
     * @dev Patient revokes previously granted access to a doctor
     * @param _doctor Doctor's address to revoke access from
     */
    function revokePatientAccess(address _doctor) 
        external 
        onlyPatient 
        validAddress(_doctor) 
    {
        require(patientDoctorAccess[msg.sender][_doctor], "Doctor doesn't have access");
        require(doctors[_doctor].isVerified, "Doctor not verified");
        
        // Revoke access
        patientDoctorAccess[msg.sender][_doctor] = false;
        
        // Remove from tracking arrays
        _removeFromArray(patientAuthorizedDoctors[msg.sender], _doctor);
        _removeFromArray(doctorAccessiblePatients[_doctor], msg.sender);
        
        emit AccessRevoked(_doctor, msg.sender);
        emit PermissionRevoked(_doctor, msg.sender);
    }
    
    /**
     * @dev Check if doctor has access to patient's records
     * @param _doctor Doctor's address
     * @param _patient Patient's address
     * @return bool Access status
     */
    function checkDoctorAccess(address _doctor, address _patient) 
        external 
        view 
        returns (bool) 
    {
        return patientDoctorAccess[_patient][_doctor];
    }
    
    /**
     * @dev Get patient's authorized doctors
     * @param _patient Patient's address
     * @return address[] Array of authorized doctor addresses
     */
    function getPatientAuthorizedDoctors(address _patient) 
        external 
        view 
        hasPatientAccess(_patient)
        returns (address[] memory) 
    {
        return patientAuthorizedDoctors[_patient];
    }
    
    /**
     * @dev Get doctor's accessible patients
     * @param _doctor Doctor's address
     * @return address[] Array of accessible patient addresses
     */
    function getDoctorAccessiblePatients(address _doctor) 
        external 
        view 
        returns (address[] memory) 
    {
        require(
            msg.sender == _doctor || authorizedAddresses[msg.sender],
            "Access denied: Only doctor or authorized address can view"
        );
        return doctorAccessiblePatients[_doctor];
    }
    
    /**
     * @dev Get patient's pending access requests
     * @param _patient Patient's address
     * @return bytes32[] Array of pending request IDs
     */
    function getPatientPendingRequests(address _patient) 
        external 
        view 
        hasPatientAccess(_patient)
        returns (bytes32[] memory) 
    {
        return patientPendingRequests[_patient];
    }
    
    /**
     * @dev Get doctor's sent requests
     * @param _doctor Doctor's address
     * @return bytes32[] Array of sent request IDs
     */
    function getDoctorSentRequests(address _doctor) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        require(
            msg.sender == _doctor || authorizedAddresses[msg.sender],
            "Access denied: Only doctor or authorized address can view"
        );
        return doctorSentRequests[_doctor];
    }
    
    /**
     * @dev Get access request details
     * @param _requestId Request ID
     * @return doctor The doctor's address
     * @return patient The patient's address  
     * @return reason The reason for access request
     * @return requestTime The timestamp of request
     * @return isPending Whether request is still pending
     */
    function getAccessRequest(bytes32 _requestId) 
        external 
        view 
        returns (
            address doctor,
            address patient,
            string memory reason,
            uint256 requestTime,
            bool isPending
        ) 
    {
        AccessRequest memory request = accessRequests[_requestId];
        require(
            msg.sender == request.doctor || 
            msg.sender == request.patient || 
            authorizedAddresses[msg.sender],
            "Access denied: Only involved parties can view request details"
        );
        
        return (
            request.doctor,
            request.patient,
            request.reason,
            request.requestTime,
            request.isPending
        );
    }
    
    /**
     * @dev Internal function to remove address from array
     * @param _array Array to modify
     * @param _addr Address to remove
     */
    function _removeFromArray(address[] storage _array, address _addr) internal {
        for (uint i = 0; i < _array.length; i++) {
            if (_array[i] == _addr) {
                _array[i] = _array[_array.length - 1];
                _array.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Emergency function to pause contract (only owner)
     */
    function emergencyStop() external onlyOwner {
        // Implementation for emergency stop if needed
        // This is a placeholder for emergency functionality
    }
}
