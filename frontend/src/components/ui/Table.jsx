import React from 'react';
import './Table.css';

export default function Table({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  className = '',
  sticky = false,
  maxHeight,
  mobileCards = true,
}) {
  const wrapperStyle = sticky && maxHeight ? { maxHeight, overflowY: 'auto' } : {};

  return (
    <div className={`table-wrapper ${sticky ? 'table-sticky' : ''} ${className}`} style={wrapperStyle}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                  ...col.headerStyle,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'table-row-clickable' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || colIndex}
                    style={{
                      textAlign: col.align || 'left',
                      ...col.cellStyle,
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '-'
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {mobileCards && (
        <div className="table-cards">
          {loading ? (
            <div className="table-cards-empty">Loading...</div>
          ) : data.length === 0 ? (
            <div className="table-cards-empty">{emptyMessage}</div>
          ) : (
            data.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                className={`table-card ${onRowClick ? 'table-card-clickable' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.filter(col => col.label).map((col, colIndex) => {
                  const value = col.render ? col.render(row[col.key], row) : row[col.key] ?? '-';
                  return (
                    <div className="table-card-field" key={col.key || colIndex}>
                      <span className="table-card-label">{col.label}</span>
                      <span className="table-card-value">{value}</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
