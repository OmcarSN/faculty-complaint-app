import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import api from '../utils/api';

export default function AlertPopup() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/admin/faculty-alerts');
        if (response.data && response.data.length > 0) {
          setAlerts(response.data);
          setVisible(true);
        }
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">⚠ High Complaint Alert</h2>
          <p className="text-sm text-gray-500">
            The following faculty members have received 5 or more complaints
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="space-y-0">
            {alerts.map((faculty, index) => (
              <React.Fragment key={faculty._id || index}>
                <div className="py-6 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{faculty.faculty_name}</h3>
                      <div className="text-red-600 font-bold text-sm mt-0.5">
                        {faculty.total_complaints} Total Complaints
                      </div>
                    </div>
                    
                    {faculty.faculty_phone && (
                      <a 
                        href={`tel:${faculty.faculty_phone}`}
                        className="flex items-center gap-1.5 text-sm bg-gray-100 text-gray-800 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors border border-gray-300 font-medium"
                      >
                        <PhoneCall size={14} />
                        Call
                      </a>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {(faculty.complaints || []).map((c, i) => (
                        <li key={i} className="text-sm text-gray-600">
                          <span className="font-medium text-gray-800">{c.category}</span> — {c.subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {index < alerts.length - 1 && <hr className="border-gray-200" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="w-full py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-black transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
        
      </div>
    </div>
  );
}
