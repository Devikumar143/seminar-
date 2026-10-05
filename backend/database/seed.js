const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const { generateRegistrationId, generateRegistrationToken, generateCertificateId } = require('../src/services/qrService');

async function seed() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // 1. Clean existing data
    await db.query('TRUNCATE notifications, certificates, attendance, waitlist, registrations, seminars, users RESTART IDENTITY CASCADE;');

    // Password hashes
    const adminPassHash = await bcrypt.hash('Admin@123', 10);
    const studentPassHash = await bcrypt.hash('Student@123', 10);

    // 2. Insert Super Admin and Event Admin
    const adminRes = await db.query(
      `INSERT INTO users (name, email, student_id, phone, department, year, password_hash, role, profile_photo)
       VALUES 
       ('Dr. Alexander Wright', 'admin@college.edu', 'ADM-001', '+1 (555) 019-2831', 'Administration', 'Faculty', $1, 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
       ('Prof. Katherine Hall', 'eventadmin@college.edu', 'ADM-002', '+1 (555) 019-2832', 'Academic Events', 'Faculty', $1, 'event_admin', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250')
       RETURNING id, name, email, role;`,
      [adminPassHash]
    );
    const superAdmin = adminRes.rows[0];

    // 3. Insert Rahul Sharma (Sole Demo Student)
    const studentsData = [
      ['Rahul Sharma', 'rahul.sharma@college.edu', 'CS2023-0101', '+91 98765 43210', 'Computer Science', '3rd Year', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250']
    ];

    const studentIds = [];
    for (const s of studentsData) {
      const res = await db.query(
        `INSERT INTO users (name, email, student_id, phone, department, year, password_hash, role, profile_photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', $8)
         RETURNING id, name, email;`,
        [s[0], s[1], s[2], s[3], s[4], s[5], studentPassHash, s[6]]
      );
      studentIds.push(res.rows[0]);
    }
    const rahul = studentIds[0];

    // 4. Insert 5 Realistic Seminars
    const today = new Date();
    const plusDays = (d) => {
      const target = new Date(today);
      target.setDate(target.getDate() + d);
      return target.toISOString().split('T')[0];
    };
    const minusDays = (d) => {
      const target = new Date(today);
      target.setDate(target.getDate() - d);
      return target.toISOString().split('T')[0];
    };

    const seminarsData = [
      {
        title: 'Next-Gen Artificial Intelligence & LLMs in Production',
        description: 'Discover how modern Large Language Models, Retrieval-Augmented Generation (RAG), and agentic workflows are engineered for enterprise scale. Learn direct architectural patterns from industry leaders.',
        category: 'Artificial Intelligence',
        speaker: 'Dr. Samantha Vance',
        speaker_designation: 'Chief AI Scientist, DeepMatrix Labs',
        speaker_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        banner_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
        date: plusDays(5),
        start_time: '10:00:00',
        end_time: '13:00:00',
        venue: 'Newton Auditorium, Block A, Joy Campus',
        capacity: 60,
        registration_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: 'Basic understanding of Python and neural network foundations. Laptops optional.',
        topics: ['LLM Architecture & Scaling Laws', 'RAG Pipelines with Vector DBs', 'Fine-Tuning vs Context Stuffing', 'Autonomous Multi-Agent Systems'],
        organizer_info: 'Department of Computer Science & Artificial Intelligence Club',
        status: 'published',
      },
      {
        title: 'Cybersecurity Defense: Zero-Trust Architectures & Threat Intel',
        description: 'An immersive seminar on offensive tactics and defensive strategies. Explore modern zero-trust network architectures, memory-safe exploitation mitigations, and automated threat hunting.',
        category: 'Cybersecurity',
        speaker: 'Marcus Sterling, CISSP',
        speaker_designation: 'VP of Cybersecurity, CyberShield Global',
        speaker_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        banner_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
        date: plusDays(10),
        start_time: '14:00:00',
        end_time: '17:00:00',
        venue: 'Alan Turing Hall, Cyber Complex',
        capacity: 50,
        registration_deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: 'Familiarity with computer networks (TCP/IP) and Linux command line.',
        topics: ['Zero Trust Identity Frameworks', 'Cloud Security Posture Management', 'Live Red Team Scenario Walkthrough', 'Incident Response Automation'],
        organizer_info: 'Information Security Student Chapter (ISSC)',
        status: 'published',
      },
      {
        title: 'Sustainable Cloud Systems & Green Data Center Engineering',
        description: 'Learn how hyperscale cloud providers optimize energy efficiency, reduce carbon footprint, and design carbon-aware software architectures for cloud-native microservices.',
        category: 'Cloud Computing',
        speaker: 'Elena Rostova',
        speaker_designation: 'Director of Infrastructure, EcoCloud Foundation',
        speaker_image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=400',
        banner_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
        date: plusDays(15),
        start_time: '11:00:00',
        end_time: '13:30:00',
        venue: 'Conference Hall B, Engineering Quad',
        capacity: 45,
        registration_deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: 'Knowledge of containerization (Docker/K8s) is helpful.',
        topics: ['Carbon-Aware Workload Scheduling', 'Liquid Cooling & Server Density', 'Renewable Energy Grid Integration', 'Green Software Metrics'],
        organizer_info: 'Center for Clean Energy & Department of Software Engineering',
        status: 'published',
      },
      {
        title: 'Quantum Computing Fundamentals & Superconducting Qubits',
        description: 'A hands-on deep dive into quantum algorithms, superposition, entanglement, and real-world quantum programming with Qiskit. Highly limited capacity seminar for interactive lab experience.',
        category: 'Quantum Computing',
        speaker: 'Prof. Hiroshi Tanaka',
        speaker_designation: 'Director of Quantum Research, Q-Institute',
        speaker_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
        banner_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
        date: plusDays(3),
        start_time: '09:30:00',
        end_time: '12:30:00',
        venue: 'Quantum Simulation Lab 4, Physics Block',
        capacity: 4, // Intentionally small so 4 registrations fill it and next student enters waitlist!
        registration_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: 'Linear algebra basics and Python 3.9+ installed.',
        topics: ['Bloch Sphere & Quantum Gates', 'Deutsch-Jozsa & Grover Algorithms', 'Quantum Error Correction', 'Simulating on Real Cloud Quantum Processors'],
        organizer_info: 'Joy Quantum Initiative & IEEE Student Branch',
        status: 'published',
      },
      {
        title: 'Blockchain & Decentralized Autonomous Systems in Modern Finance',
        description: 'Comprehensive analysis of smart contract engineering, Ethereum EVM execution, decentralized consensus protocols, and verifiable zero-knowledge proofs.',
        category: 'Blockchain',
        speaker: 'Dr. David Chen',
        speaker_designation: 'Lead Architect, OpenLedger Capital',
        speaker_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        banner_image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200',
        date: minusDays(4), // Completed seminar!
        start_time: '14:00:00',
        end_time: '17:30:00',
        venue: 'Main University Auditorium',
        capacity: 50,
        registration_deadline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: 'Foundations of cryptography and distributed systems.',
        topics: ['EVM Internals & Gas Optimization', 'Zero-Knowledge Proofs (ZK-SNARKs)', 'DeFi Lending Protocols', 'Smart Contract Auditing & Security'],
        organizer_info: 'FinTech Center of Excellence',
        status: 'completed',
      }
    ];

    const seminarRows = [];
    for (const sem of seminarsData) {
      const res = await db.query(
        `INSERT INTO seminars (
           title, description, category, speaker, speaker_designation,
           speaker_image, banner_image, date, start_time, end_time,
           venue, capacity, registration_deadline, requirements,
           topics, organizer_info, status, created_by
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         RETURNING *;`,
        [
          sem.title, sem.description, sem.category, sem.speaker, sem.speaker_designation,
          sem.speaker_image, sem.banner_image, sem.date, sem.start_time, sem.end_time,
          sem.venue, sem.capacity, sem.registration_deadline, sem.requirements,
          sem.topics, sem.organizer_info, sem.status, superAdmin.id
        ]
      );
      seminarRows.push(res.rows[0]);
    }

    const [semAI, semCyber, semCloud, semQuantum, semBlockchain] = seminarRows;

    // 5. Seed Registrations for Rahul Sharma

    // A) Quantum seminar: Confirmed pass
    const regQuantumId = generateRegistrationId();
    const qrQuantumToken = generateRegistrationToken();
    await db.query(
      `INSERT INTO registrations (registration_id, user_id, seminar_id, qr_code_token, status)
       VALUES ($1, $2, $3, $4, 'confirmed');`,
      [regQuantumId, rahul.id, semQuantum.id, qrQuantumToken]
    );

    // B) AI Seminar: Confirmed pass & marked present
    const regAiId = generateRegistrationId();
    const qrAiToken = generateRegistrationToken();
    const regAiRes = await db.query(
      `INSERT INTO registrations (registration_id, user_id, seminar_id, qr_code_token, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id;`,
      [regAiId, rahul.id, semAI.id, qrAiToken]
    );
    await db.query(
      `INSERT INTO attendance (registration_id, check_in_time, status, marked_by)
       VALUES ($1, CURRENT_TIMESTAMP, 'present', $2);`,
      [regAiRes.rows[0].id, superAdmin.id]
    );

    // C) Completed Blockchain Seminar: Attended & verified certificate issued
    const regBlockId = generateRegistrationId();
    const qrBlockToken = generateRegistrationToken();
    const regBlockRes = await db.query(
      `INSERT INTO registrations (registration_id, user_id, seminar_id, qr_code_token, status, registered_at)
       VALUES ($1, $2, $3, $4, 'confirmed', CURRENT_TIMESTAMP - INTERVAL '6 days')
       RETURNING id;`,
      [regBlockId, rahul.id, semBlockchain.id, qrBlockToken]
    );
    const regRecordId = regBlockRes.rows[0].id;

    // Attendance
    await db.query(
      `INSERT INTO attendance (registration_id, check_in_time, status, marked_by)
       VALUES ($1, CURRENT_TIMESTAMP - INTERVAL '4 days', 'present', $2);`,
      [regRecordId, superAdmin.id]
    );

    // Certificate
    const certId = generateCertificateId();
    const qrVerifyCode = `VERIFY-${certId}`;
    await db.query(
      `INSERT INTO certificates (certificate_id, registration_id, qr_verification_code, issued_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '3 days');`,
      [certId, regRecordId, qrVerifyCode]
    );

    // Certificate Notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'success');`,
      [
        rahul.id,
        'Certificate of Participation Issued 🎓',
        `Your official certificate for "${semBlockchain.title}" has been issued! Certificate ID: ${certId}. You can download it now.`,
      ]
    );

    console.log('\n======================================================');
    console.log('✅ Database Seeded Successfully!');
    console.log('------------------------------------------------------');
    console.log('🔑 SUPER ADMIN:');
    console.log('   Email:    admin@college.edu');
    console.log('   Password: Admin@123');
    console.log('------------------------------------------------------');
    console.log('🔑 EVENT ADMIN:');
    console.log('   Email:    eventadmin@college.edu');
    console.log('   Password: Admin@123');
    console.log('------------------------------------------------------');
    console.log('🔑 DEMO STUDENT:');
    console.log('   Name:     Rahul Sharma');
    console.log('   Email:    rahul.sharma@college.edu (active passes & certificate)');
    console.log('   Password: Student@123');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

seed();
