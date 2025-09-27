

import React from 'react';
import { PhoneIcon } from '../constants';

const emergencyServices = [
    { name: 'General Emergency', number: '911', color: 'bg-red-500' },
    { name: 'Police', number: '912', color: 'bg-blue-500' },
    { name: 'Fire Service', number: '913', color: 'bg-orange-500' },
    { name: 'Ambulance', number: '914', color: 'bg-green-500' },
];

const EmergencyCard: React.FC<{ service: typeof emergencyServices[0] }> = ({ service }) => (
    <a href={`tel:${service.number}`} className={`${service.color} text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg hover:opacity-90 transition-opacity`}>
        <PhoneIcon className="w-10 h-10 mb-2" />
        <h3 className="font-bold text-xl">{service.name}</h3>
        <p className="text-2xl font-mono mt-1">{service.number}</p>
    </a>
);


const EmergencyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-300 text-center">Tap a service to call immediately.</p>
      
      <div className="grid grid-cols-2 gap-4">
          {emergencyServices.map(service => (
              <EmergencyCard key={service.name} service={service} />
          ))}
      </div>

      <div className="pt-4">
        <h3 className="font-bold text-xl text-dark dark:text-white mb-3">Local Contacts</h3>
        <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-sm dark:border dark:border-gray-700">
                <div>
                    <p className="font-semibold text-dark dark:text-white">Georgetown Public Hospital</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">592-227-8200</p>
                </div>
                <a href="tel:592-227-8200" className="p-3 bg-light dark:bg-primary/20 rounded-full text-primary"><PhoneIcon className="w-5 h-5"/></a>
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-sm dark:border dark:border-gray-700">
                <div>
                    <p className="font-semibold text-dark dark:text-white">My Personal Contact</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">John Smith</p>
                </div>
                <a href="tel:592-123-4567" className="p-3 bg-light dark:bg-primary/20 rounded-full text-primary"><PhoneIcon className="w-5 h-5"/></a>
            </div>
        </div>
         <button className="mt-4 w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-secondary transition-colors">
          Add Personal Contact
        </button>
      </div>
    </div>
  );
};

export default EmergencyPage;