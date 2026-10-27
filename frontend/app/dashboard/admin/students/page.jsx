"use client";

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { StudentHeader } from '@/components/admin/students/StudentHeader';
import { StudentFilters } from '@/components/admin/students/StudentFilter';
import { StudentTable } from '@/components/admin/students/StudentTable';
import { AddStudentModal } from '@/components/admin/students/StudentModel';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    classGrade: '10th Grade',
    section: 'A',
    password: 'Student@123',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      if (response.data?.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([
        { _id: '1', name: 'Ali Ahmed', email: 'ali@school.com', phone: '+92 300 1234567', classGrade: '10th Grade', section: 'A', isActive: true },
        { _id: '2', name: 'Fatima Noor', email: 'fatima@school.com', phone: '+92 301 7654321', classGrade: '9th Grade', section: 'B', isActive: true },
        { _id: '3', name: 'Usman Khan', email: 'usman@school.com', phone: '+92 302 9876543', classGrade: '10th Grade', section: 'A', isActive: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await api.post('/students', formData);
      if (response.data?.success) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', classGrade: '10th Grade', section: 'A', password: 'Student@123' });
        fetchStudents();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to add student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || student.classGrade === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 bg-white min-h-screen p-6 rounded-2xl"> {/* 👈 bg-white aur padding add kar di gayi hai */}
      <StudentHeader onOpenModal={() => setIsModalOpen(true)} />
      
      <StudentFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        selectedClass={selectedClass} 
        setSelectedClass={setSelectedClass} 
      />

      <StudentTable students={filteredStudents} loading={loading} />

      <AddStudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleAddStudent}
        submitting={submitting}
        errorMsg={errorMsg}
      />
    </div>
  );
}