import type { AuditResult } from './types';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: AuditResult) {
  downloadFile(JSON.stringify(data, null, 2), `skillops-audit-${Date.now()}.json`, 'application/json');
}

export function exportToCSV(data: AuditResult) {
  const lines: string[] = [];

  // Skills
  lines.push('=== SKILLS ===');
  lines.push('Nombre,Dominio,Líneas,Calidad,Propósito');
  data.skills.forEach(s => {
    lines.push(`"${s.nombre}","${s.dominio}",${s.lineas},"${s.calidad_descripcion}","${s.proposito}"`);
  });

  lines.push('');
  lines.push('=== SOLAPAMIENTOS ===');
  lines.push('Skill 1,Skill 2,Similitud,Severidad,Tipo,Explicación,Recomendación');
  data.solapamientos.forEach(o => {
    lines.push(`"${o.skill1}","${o.skill2}",${o.similitud},"${o.severidad}","${o.tipo}","${o.explicacion}","${o.recomendacion}"`);
  });

  lines.push('');
  lines.push('=== ISSUES DE CALIDAD ===');
  lines.push('Skill,Tipo,Severidad,Descripción,Sugerencia');
  data.issues_calidad.forEach(q => {
    lines.push(`"${q.skill}","${q.tipo}","${q.severidad}","${q.descripcion}","${q.sugerencia}"`);
  });

  downloadFile(lines.join('\n'), `skillops-audit-${Date.now()}.csv`, 'text/csv');
}

export function exportToMarkdown(data: AuditResult) {
  const lines: string[] = [];
  const ts = new Date(data.timestamp).toLocaleString('es-AR');

  lines.push(`# Reporte de Auditoría SkillOps`);
  lines.push(`> Generado: ${ts}`);
  lines.push('');

  // Resumen
  lines.push('## Resumen Ejecutivo');
  lines.push(`- **Skills analizados:** ${data.resumen.total_skills}`);
  lines.push(`- **Solapamientos:** ${data.resumen.solapamientos.total} (${data.resumen.solapamientos.criticos} críticos, ${data.resumen.solapamientos.altos} altos)`);
  lines.push(`- **Issues de calidad:** ${data.resumen.issues_calidad}`);
  lines.push(`- **Duplicados:** ${data.resumen.duplicados}`);
  lines.push('');

  // Skills
  lines.push('## Inventario de Skills');
  lines.push('| Skill | Dominio | Líneas | Calidad |');
  lines.push('|-------|---------|--------|---------|');
  data.skills.forEach(s => {
    lines.push(`| ${s.nombre} | ${s.dominio} | ${s.lineas} | ${s.calidad_descripcion} |`);
  });
  lines.push('');

  // Solapamientos
  if (data.solapamientos.length > 0) {
    lines.push('## Solapamientos Detectados');
    data.solapamientos.forEach((o, i) => {
      lines.push(`### ${i + 1}. ${o.skill1} ↔ ${o.skill2} (${o.similitud}%)`);
      lines.push(`- **Severidad:** ${o.severidad}`);
      lines.push(`- **Tipo:** ${o.tipo}`);
      lines.push(`- **Explicación:** ${o.explicacion}`);
      lines.push(`- **Recomendación:** ${o.recomendacion}`);
      lines.push('');
    });
  }

  // Issues
  if (data.issues_calidad.length > 0) {
    lines.push('## Issues de Calidad');
    data.issues_calidad.forEach(q => {
      lines.push(`- **${q.skill}** (${q.severidad}): ${q.descripcion}`);
      if (q.sugerencia) lines.push(`  - Sugerencia: ${q.sugerencia}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generado por SkillOps - Grupo IEB*');

  downloadFile(lines.join('\n'), `skillops-audit-${Date.now()}.md`, 'text/markdown');
}
