"""Generador de PDFs para reportes de auditoría de SkillOps"""

from fpdf import FPDF
from pathlib import Path
from datetime import datetime
from typing import Optional
import io


class AuditPDF(FPDF):
    """PDF personalizado con branding configurable"""

    # Colores corporativos
    DARK = (45, 55, 72)      # #2d3748
    TEAL = (79, 209, 197)    # #4fd1c5
    WHITE = (255, 255, 255)
    GRAY = (100, 116, 139)
    LIGHT_GRAY = (241, 245, 249)

    def __init__(self, report_name: Optional[str] = None, brand_name: Optional[str] = None):
        super().__init__()
        self.report_name = report_name or "Auditoría de Skills"
        self.brand_name = brand_name or "SkillOps"
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        # Fondo del header
        self.set_fill_color(*self.DARK)
        self.rect(0, 0, 210, 25, 'F')

        # Título
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self.WHITE)
        self.set_xy(10, 8)
        self.cell(0, 10, 'SkillOps', new_x="LMARGIN", new_y="NEXT")

        # Línea teal
        self.set_fill_color(*self.TEAL)
        self.rect(0, 25, 210, 2, 'F')

        self.set_y(35)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*self.GRAY)
        self.cell(0, 10, f'{self.brand_name} · {self.report_name} · Página {self.page_no()}', align='C')

    def add_title_page(self, data: dict, report_name: Optional[str] = None):
        """Página de título"""
        self.add_page()

        # Título principal
        self.set_y(60)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(*self.DARK)
        self.cell(0, 15, 'AUDITORÍA DE SKILLS', align='C', new_x="LMARGIN", new_y="NEXT")

        # Nombre del reporte
        self.set_font('Helvetica', '', 16)
        self.set_text_color(*self.TEAL)
        name = report_name or self.report_name
        self.cell(0, 10, name, align='C', new_x="LMARGIN", new_y="NEXT")

        # Fecha
        self.set_y(100)
        self.set_font('Helvetica', '', 12)
        self.set_text_color(*self.GRAY)
        timestamp = data.get('timestamp', datetime.now().isoformat())
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            fecha = dt.strftime('%d de %B de %Y')
        except:
            fecha = timestamp[:10]
        self.cell(0, 10, fecha, align='C', new_x="LMARGIN", new_y="NEXT")

        # Stats boxes
        self.set_y(130)
        resumen = data.get('resumen', {})

        stats = [
            (str(resumen.get('total_skills', 0)), 'Skills'),
            (str(resumen.get('solapamientos', {}).get('total', 0)), 'Solapamientos'),
            (str(resumen.get('issues_calidad', 0)), 'Issues'),
        ]

        box_width = 50
        start_x = (210 - (box_width * 3 + 20)) / 2

        for i, (value, label) in enumerate(stats):
            x = start_x + i * (box_width + 10)

            # Box
            self.set_fill_color(*self.LIGHT_GRAY)
            self.rect(x, 130, box_width, 35, 'F')

            # Valor
            self.set_xy(x, 135)
            self.set_font('Helvetica', 'B', 24)
            self.set_text_color(*self.DARK)
            self.cell(box_width, 12, value, align='C')

            # Label
            self.set_xy(x, 150)
            self.set_font('Helvetica', '', 10)
            self.set_text_color(*self.GRAY)
            self.cell(box_width, 8, label, align='C')

    def add_section_title(self, title: str, number: int):
        """Título de sección"""
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*self.DARK)
        self.cell(0, 12, f'{number}. {title}', new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

    def add_summary_section(self, data: dict):
        """Sección de resumen ejecutivo"""
        self.add_page()
        self.add_section_title('Resumen Ejecutivo', 1)

        resumen = data.get('resumen', {})
        solapamientos = resumen.get('solapamientos', {})

        # Texto introductorio
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self.GRAY)
        total = resumen.get('total_skills', 0)
        self.multi_cell(0, 6, f'Se auditaron {total} skills para detectar solapamientos, issues de calidad y oportunidades de mejora.')
        self.ln(5)

        # Tabla de solapamientos por severidad
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*self.DARK)
        self.cell(0, 8, 'Solapamientos por Severidad', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        severidades = [
            ('Críticos', solapamientos.get('criticos', 0), (220, 38, 38)),
            ('Altos', solapamientos.get('altos', 0), (245, 158, 11)),
            ('Medios', solapamientos.get('medios', 0), (59, 130, 246)),
            ('Bajos', solapamientos.get('bajos', 0), (34, 197, 94)),
        ]

        for label, count, color in severidades:
            self.set_fill_color(*color)
            self.rect(self.get_x(), self.get_y() + 1, 4, 4, 'F')
            self.set_x(self.get_x() + 8)
            self.set_font('Helvetica', '', 10)
            self.set_text_color(*self.DARK)
            self.cell(30, 6, label)
            self.set_font('Helvetica', 'B', 10)
            self.cell(20, 6, str(count), new_x="LMARGIN", new_y="NEXT")

        self.ln(5)

        # Otros stats
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*self.DARK)
        self.cell(0, 8, 'Otros Indicadores', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        otros = [
            ('Issues de calidad', resumen.get('issues_calidad', 0)),
            ('Referencias rotas', resumen.get('referencias_rotas', 0)),
            ('Duplicados detectados', resumen.get('duplicados', 0)),
        ]

        for label, count in otros:
            self.set_font('Helvetica', '', 10)
            self.set_text_color(*self.GRAY)
            self.cell(60, 6, label)
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self.DARK)
            self.cell(20, 6, str(count), new_x="LMARGIN", new_y="NEXT")

    def add_skills_section(self, skills: list):
        """Sección de skills analizados"""
        self.add_page()
        self.add_section_title('Skills Analizados', 2)

        if not skills:
            self.set_font('Helvetica', 'I', 10)
            self.set_text_color(*self.GRAY)
            self.cell(0, 8, 'No se encontraron skills para analizar.')
            return

        # Header de tabla
        self.set_fill_color(*self.DARK)
        self.set_text_color(*self.WHITE)
        self.set_font('Helvetica', 'B', 9)

        col_widths = [55, 40, 25, 30, 40]
        headers = ['Nombre', 'Dominio', 'Líneas', 'Calidad', 'Propósito']

        for i, (header, width) in enumerate(zip(headers, col_widths)):
            self.cell(width, 8, header, border=1, align='C', fill=True)
        self.ln()

        # Filas
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self.DARK)

        fill = False
        for skill in skills:
            if self.get_y() > 250:
                self.add_page()
                self.set_y(40)

            if fill:
                self.set_fill_color(*self.LIGHT_GRAY)
            else:
                self.set_fill_color(*self.WHITE)

            nombre = skill.get('nombre', '-')[:25]
            dominio = skill.get('dominio', '-')[:18]
            lineas = str(skill.get('lineas', 0))
            calidad = skill.get('calidad_descripcion', '-')[:12]
            proposito = skill.get('proposito', '-')[:18]

            self.cell(col_widths[0], 7, nombre, border=1, fill=True)
            self.cell(col_widths[1], 7, dominio, border=1, fill=True)
            self.cell(col_widths[2], 7, lineas, border=1, align='C', fill=True)
            self.cell(col_widths[3], 7, calidad, border=1, align='C', fill=True)
            self.cell(col_widths[4], 7, proposito, border=1, fill=True)
            self.ln()
            fill = not fill

    def add_overlaps_section(self, overlaps: list):
        """Seccion de solapamientos"""
        self.add_page()
        self.add_section_title('Solapamientos Detectados', 3)

        if not overlaps:
            self.set_font('Helvetica', 'I', 10)
            self.set_text_color(*self.GRAY)
            self.cell(0, 8, 'No se detectaron solapamientos significativos.')
            return

        severity_colors = {
            'critica': (220, 38, 38),
            'alta': (245, 158, 11),
            'media': (59, 130, 246),
            'baja': (34, 197, 94),
        }

        for i, overlap in enumerate(overlaps):
            # Verificar si necesitamos nueva pagina (espacio minimo 60mm)
            if self.get_y() > 220:
                self.add_page()
                self.set_y(40)

            sev = overlap.get('severidad', 'media').lower()
            color = severity_colors.get(sev, self.GRAY)
            s1 = overlap.get('skill1', '-')
            s2 = overlap.get('skill2', '-')
            sim = overlap.get('similitud', 0)
            tipo = overlap.get('tipo', '-')
            explicacion = overlap.get('explicacion', '-')
            recomendacion = overlap.get('recomendacion', '')

            # Header: Skills + similitud
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self.DARK)
            self.cell(0, 6, f'{s1}  <->  {s2}', new_x="LMARGIN", new_y="NEXT")

            # Meta: tipo, severidad, porcentaje
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*self.GRAY)
            self.cell(60, 5, f'Tipo: {tipo}')
            self.set_text_color(*color)
            self.set_font('Helvetica', 'B', 8)
            self.cell(40, 5, f'Severidad: {sev.upper()}')
            self.set_font('Helvetica', 'B', 10)
            self.cell(0, 5, f'{sim:.0f}%', new_x="LMARGIN", new_y="NEXT")

            # Explicacion completa
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*self.DARK)
            self.multi_cell(0, 5, explicacion)

            # Recomendacion completa (si existe)
            if recomendacion:
                self.set_font('Helvetica', 'I', 8)
                self.set_text_color(*self.TEAL)
                self.cell(5, 5, '>')
                self.multi_cell(0, 5, recomendacion)

            # Separador
            self.ln(3)
            self.set_draw_color(*self.LIGHT_GRAY)
            self.line(10, self.get_y(), 200, self.get_y())
            self.ln(5)

    def add_issues_section(self, issues: list):
        """Sección de issues de calidad"""
        self.add_page()
        self.add_section_title('Issues de Calidad', 4)

        if not issues:
            self.set_font('Helvetica', 'I', 10)
            self.set_text_color(*self.GRAY)
            self.cell(0, 8, 'No se detectaron issues de calidad.')
            return

        severity_colors = {
            'critica': (220, 38, 38),
            'alta': (245, 158, 11),
            'media': (59, 130, 246),
            'baja': (34, 197, 94),
        }

        for issue in issues:
            if self.get_y() > 250:
                self.add_page()
                self.set_y(40)

            sev = issue.get('severidad', 'media').lower()
            color = severity_colors.get(sev, self.GRAY)

            # Bullet con color de severidad
            self.set_fill_color(*color)
            self.rect(self.get_x(), self.get_y() + 2, 4, 4, 'F')
            self.set_x(self.get_x() + 8)

            # Skill + tipo
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self.DARK)
            skill = issue.get('skill', '-')
            tipo = issue.get('tipo', '-')
            self.cell(0, 6, f'{skill}: {tipo}', new_x="LMARGIN", new_y="NEXT")

            # Descripción
            self.set_x(18)
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*self.GRAY)
            desc = issue.get('descripcion', '-')
            self.multi_cell(180, 5, desc)

            # Sugerencia
            self.set_x(18)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(*self.TEAL)
            sug = issue.get('sugerencia', '-')
            self.cell(0, 5, f'> {sug}', new_x="LMARGIN", new_y="NEXT")
            self.ln(3)

    def add_recommendations_section(self, data: dict):
        """Sección de recomendaciones finales"""
        self.add_page()
        self.add_section_title('Recomendaciones', 5)

        resumen = data.get('resumen', {})
        solapamientos = resumen.get('solapamientos', {})
        overlaps = data.get('solapamientos', [])
        issues = data.get('issues_calidad', [])

        recommendations = []

        # Generar recomendaciones basadas en los datos
        criticos = solapamientos.get('criticos', 0)
        altos = solapamientos.get('altos', 0)

        if criticos > 0:
            recommendations.append(
                f'URGENTE: Resolver los {criticos} solapamiento(s) crítico(s) identificados. '
                'Estos representan duplicación significativa que afecta la eficiencia de Claude.'
            )

        if altos > 0:
            recommendations.append(
                f'IMPORTANTE: Revisar los {altos} solapamiento(s) de severidad alta. '
                'Considerar unificar o clarificar los límites entre skills afectados.'
            )

        # Analizar issues por tipo
        tipos_issues = {}
        for issue in issues:
            tipo = issue.get('tipo', 'otro')
            tipos_issues[tipo] = tipos_issues.get(tipo, 0) + 1

        if 'skill_sobredimensionado' in tipos_issues:
            recommendations.append(
                f'ESTRUCTURA: {tipos_issues["skill_sobredimensionado"]} skill(s) exceden el tamaño recomendado. '
                'Considerar dividirlos por área funcional para mejorar el routing.'
            )

        # Skills con baja calidad
        skills = data.get('skills', [])
        baja_calidad = [s for s in skills if s.get('calidad_descripcion', '').lower() in ['mala', 'regular']]
        if baja_calidad:
            nombres = ', '.join(s.get('nombre', '-') for s in baja_calidad[:3])
            recommendations.append(
                f'CALIDAD: Mejorar las descripciones de: {nombres}. '
                'Una buena descripción ayuda al orquestador a elegir el skill correcto.'
            )

        if not recommendations:
            recommendations.append(
                'El ecosistema de skills está en buen estado. '
                'Continuar monitoreando periódicamente para detectar nuevos solapamientos.'
            )

        # Renderizar recomendaciones
        for i, rec in enumerate(recommendations, 1):
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self.DARK)
            self.cell(8, 6, f'{i}.')

            self.set_font('Helvetica', '', 10)
            self.multi_cell(180, 6, rec)
            self.ln(3)

        # Próximos pasos
        self.ln(10)
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*self.DARK)
        self.cell(0, 8, 'Próximos Pasos', new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        pasos = [
            'Revisar cada solapamiento crítico/alto y decidir: unificar, separar o clarificar límites.',
            'Actualizar las descripciones de skills con baja calidad.',
            'Re-ejecutar la auditoría después de los cambios para verificar mejoras.',
            'Programar auditorías periódicas (mensual recomendado).',
        ]

        for paso in pasos:
            self.set_fill_color(*self.TEAL)
            self.rect(self.get_x(), self.get_y() + 2, 3, 3, 'F')
            self.set_x(self.get_x() + 8)
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*self.GRAY)
            self.cell(0, 6, paso, new_x="LMARGIN", new_y="NEXT")


def generate_audit_pdf(data: dict, report_name: Optional[str] = None, brand_name: Optional[str] = None) -> bytes:
    """Genera el PDF de auditoría y retorna los bytes"""
    pdf = AuditPDF(report_name, brand_name)

    # Agregar secciones
    pdf.add_title_page(data, report_name)
    pdf.add_summary_section(data)
    pdf.add_skills_section(data.get('skills', []))
    pdf.add_overlaps_section(data.get('solapamientos', []))
    pdf.add_issues_section(data.get('issues_calidad', []))
    pdf.add_recommendations_section(data)

    # Generar bytes
    return bytes(pdf.output())
