import { useState, useCallback } from 'react';

export const useProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: null,
    participantNames: ['']
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date
    }));
  }, []);

  const handleParticipantChange = useCallback((idx, value) => {
    setFormData(prev => ({
      ...prev,
      participantNames: prev.participantNames.map((name, i) => 
        i === idx ? value : name
      )
    }));
  }, []);

  const handleAddParticipant = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      participantNames: [...prev.participantNames, '']
    }));
  }, []);

  const handleRemoveParticipant = useCallback((idx) => {
    if (formData.participantNames.length === 1) return;
    setFormData(prev => ({
      ...prev,
      participantNames: prev.participantNames.filter((_, i) => i !== idx)
    }));
  }, [formData.participantNames.length]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '프로젝트 이름을 입력하세요.';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜를 선택하세요.';
    }
    
    if (formData.participantNames.filter(n => n.trim()).length === 0) {
      newErrors.participants = '최소 한 명의 참석자를 입력하세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        startDate: formData.startDate.toISOString().slice(0, 10),
        participants: formData.participantNames.filter(n => n.trim()).length,
        participantNames: formData.participantNames.filter(n => n.trim())
      });
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        form: '프로젝트 생성 중 오류가 발생했습니다.'
      }));
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, validateForm]);

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleDateChange,
    handleParticipantChange,
    handleAddParticipant,
    handleRemoveParticipant,
    handleSubmit
  };
}; 