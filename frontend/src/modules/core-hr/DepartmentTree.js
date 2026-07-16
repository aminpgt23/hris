import React from 'react';
import { Card, Badge, Button } from '../../components/ui';
import './CoreHR.css';

const departments = [
  { id: 1, name: 'Corporate', code: 'CORP', headcount: 45, manager: 'Jane Smith', isActive: true },
  { id: 2, name: 'Engineering', code: 'ENG', parent: 'Corporate', headcount: 120, manager: 'Mike Johnson', isActive: true },
  { id: 3, name: 'Marketing', code: 'MKT', parent: 'Corporate', headcount: 30, manager: 'Sarah Lee', isActive: true },
  { id: 4, name: 'Finance', code: 'FIN', parent: 'Corporate', headcount: 25, manager: 'Tom Brown', isActive: true },
  { id: 5, name: 'Human Resources', code: 'HR', parent: 'Corporate', headcount: 15, manager: 'Emily Davis', isActive: true },
];

export default function DepartmentTree() {
  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Departments</h1>
          <p>Organizational structure</p>
        </div>
        <Button variant="primary" size="md">+ Add Department</Button>
      </div>

      <Card>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Code</th>
                <th>Parent</th>
                <th>Headcount</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td><strong>{dept.name}</strong></td>
                  <td><code>{dept.code}</code></td>
                  <td>{dept.parent || '-'}</td>
                  <td>{dept.headcount}</td>
                  <td>{dept.manager}</td>
                  <td>
                    <Badge variant={dept.isActive ? 'success' : 'neutral'}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
