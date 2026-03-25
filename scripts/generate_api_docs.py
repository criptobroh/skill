"""Genera documentacion PDF de la API de SkillOps con estilo NoCoda"""

from fpdf import FPDF
from pathlib import Path
from datetime import datetime


class NoCodaPDF(FPDF):
    """PDF con estilo visual NoCoda - fondo oscuro, acentos teal/verde"""

    # Colores NoCoda
    BG_DARK = (15, 23, 32)
    BG_CARD = (26, 38, 52)
    TEAL = (79, 209, 197)
    GREEN = (52, 211, 153)
    WHITE = (255, 255, 255)
    GRAY = (156, 163, 175)
    ORANGE = (251, 146, 60)
    BLUE = (59, 130, 246)

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        self.set_fill_color(*self.BG_DARK)
        self.rect(0, 0, 210, 297, 'F')

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self.GRAY)
        self.cell(0, 10, 'NoCoda | nocoda.ai', align='L')
        self.cell(0, 10, f'{self.page_no()}', align='R')

    def draw_card(self, x, y, w, h, border_color=None):
        self.set_fill_color(*self.BG_CARD)
        self.rect(x, y, w, h, 'F')
        if border_color:
            self.set_draw_color(*border_color)
            self.set_line_width(0.8)
            self.line(x, y, x, y + h)

    def add_title_page(self):
        self.add_page()

        self.set_xy(20, 20)
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(*self.BLUE)
        self.cell(0, 10, 'NoCoda')

        self.set_xy(20, 70)
        self.set_font('Helvetica', 'B', 36)
        self.set_text_color(*self.TEAL)
        self.cell(0, 15, 'SkillOps API')

        self.set_xy(20, 90)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(*self.WHITE)
        self.cell(0, 12, 'Documentation')

        self.set_xy(20, 115)
        self.set_font('Helvetica', 'I', 14)
        self.set_text_color(*self.GRAY)
        self.multi_cell(120, 7, 'API REST para auditoria automatizada\nde ecosistemas de skills en Claude.')

        self.draw_card(130, 60, 65, 100, self.TEAL)
        self.set_xy(135, 65)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self.TEAL)
        self.cell(55, 6, 'ENDPOINTS', align='C')

        endpoints = [
            'Autenticacion',
            'Upload de Skills',
            'Analisis con IA',
            'Gestion Auditorias',
            'Exportacion PDF',
            'Historial'
        ]

        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.WHITE)
        y = 78
        for ep in endpoints:
            self.set_xy(140, y)
            self.cell(0, 6, f'> {ep}')
            y += 9

        self.set_xy(20, 250)
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self.GRAY)
        self.cell(0, 8, f'Generado: {datetime.now().strftime("%d/%m/%Y")}')

    def add_section_page(self, title, subtitle=""):
        self.add_page()

        self.set_xy(20, 30)
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(*self.WHITE)
        self.cell(0, 12, title)

        if subtitle:
            self.set_xy(20, 45)
            self.set_font('Helvetica', '', 12)
            self.set_text_color(*self.GRAY)
            self.multi_cell(170, 6, subtitle)
            return 60
        return 50

    def add_endpoint_card(self, y, method, path, description, auth=True):
        method_colors = {
            'GET': self.GREEN,
            'POST': self.BLUE,
            'DELETE': (239, 68, 68),
            'PATCH': self.ORANGE,
            'PUT': self.ORANGE
        }

        color = method_colors.get(method, self.GRAY)
        self.draw_card(20, y, 170, 28, color)

        self.set_fill_color(*color)
        self.rect(25, y + 5, 18, 8, 'F')
        self.set_xy(25, y + 5)
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*self.BG_DARK)
        self.cell(18, 8, method, align='C')

        self.set_xy(48, y + 5)
        self.set_font('Courier', 'B', 10)
        self.set_text_color(*self.WHITE)
        self.cell(0, 8, path)

        if auth:
            self.set_xy(165, y + 5)
            self.set_font('Helvetica', '', 6)
            self.set_text_color(*self.ORANGE)
            self.cell(20, 8, 'AUTH')

        self.set_xy(25, y + 16)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.GRAY)
        self.cell(0, 6, description)

        return y + 35

    def add_code_block(self, y, code, title=""):
        lines = code.strip().split('\n')
        height = len(lines) * 5 + 12

        self.set_fill_color(20, 28, 38)
        self.rect(20, y, 170, height, 'F')

        if title:
            self.set_xy(25, y + 3)
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(*self.TEAL)
            self.cell(0, 5, title)
            y += 8

        self.set_font('Courier', '', 8)
        self.set_text_color(*self.GREEN)

        for i, line in enumerate(lines):
            self.set_xy(25, y + 5 + i * 5)
            if len(line) > 80:
                line = line[:77] + '...'
            self.cell(0, 5, line)

        return y + height + 5


def generate_docs():
    pdf = NoCodaPDF()

    # Pagina 1: Titulo
    pdf.add_title_page()

    # Pagina 2: URLs Base
    y = pdf.add_section_page(
        'URLs de Produccion',
        'SkillOps esta deployado en dos instancias independientes para diferentes clientes.'
    )

    pdf.draw_card(20, y, 170, 35, pdf.GREEN)
    pdf.set_xy(25, y + 5)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*pdf.WHITE)
    pdf.cell(0, 8, 'Grupo IEB')
    pdf.set_xy(25, y + 15)
    pdf.set_font('Courier', '', 10)
    pdf.set_text_color(*pdf.TEAL)
    pdf.cell(0, 6, 'Frontend: https://iebskills.xyz')
    pdf.set_xy(25, y + 23)
    pdf.cell(0, 6, 'API:      https://iebskills.xyz/api')

    y += 45
    pdf.draw_card(20, y, 170, 35, pdf.BLUE)
    pdf.set_xy(25, y + 5)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*pdf.WHITE)
    pdf.cell(0, 8, 'PSI Mammoliti')
    pdf.set_xy(25, y + 15)
    pdf.set_font('Courier', '', 10)
    pdf.set_text_color(*pdf.TEAL)
    pdf.cell(0, 6, 'Frontend: https://skills.psima.xyz')
    pdf.set_xy(25, y + 23)
    pdf.cell(0, 6, 'API:      https://skillops-api.psima.xyz/api')

    # Pagina 3: Autenticacion
    y = pdf.add_section_page(
        'Autenticacion',
        'La API usa JWT tokens. Obten un token via login y usalo en el header Authorization.'
    )

    y = pdf.add_endpoint_card(y, 'POST', '/api/auth/login', 'Obtiene token JWT para autenticacion', auth=False)

    y = pdf.add_code_block(y, '''curl -X POST https://iebskills.xyz/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"tu-password"}'

# Response:
{"access_token": "eyJ...", "token_type": "bearer"}''', 'Ejemplo de Login')

    y += 10
    pdf.draw_card(20, y, 170, 25, pdf.ORANGE)
    pdf.set_xy(25, y + 5)
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*pdf.ORANGE)
    pdf.cell(0, 6, 'Uso del Token')
    pdf.set_xy(25, y + 13)
    pdf.set_font('Courier', '', 9)
    pdf.set_text_color(*pdf.WHITE)
    pdf.cell(0, 6, 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...')

    # Pagina 4: Flujo de Auditoria
    y = pdf.add_section_page(
        'Flujo de Auditoria',
        'El proceso de auditoria tiene 3 pasos: Upload -> Analyze -> Get Results'
    )

    pdf.draw_card(20, y, 170, 20, pdf.TEAL)
    pdf.set_xy(25, y + 3)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*pdf.TEAL)
    pdf.cell(0, 7, '01  Upload de Archivos .skill')
    pdf.set_xy(25, y + 11)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*pdf.GRAY)
    pdf.cell(0, 6, 'Sube los archivos .skill o .md para auditar')
    y += 25

    y = pdf.add_endpoint_card(y, 'POST', '/api/audit/upload', 'Sube archivos .skill para auditar')

    y = pdf.add_code_block(y, '''curl -X POST https://iebskills.xyz/api/audit/upload \\
  -H "Authorization: Bearer TOKEN" \\
  -F "files=@skill1.skill" \\
  -F "files=@skill2.skill"

# Response: {"temp_dir": "/tmp/xxx", "skills_count": 2}''', 'Upload')

    y += 5
    pdf.draw_card(20, y, 170, 20, pdf.TEAL)
    pdf.set_xy(25, y + 3)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*pdf.TEAL)
    pdf.cell(0, 7, '02  Iniciar Analisis')
    pdf.set_xy(25, y + 11)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*pdf.GRAY)
    pdf.cell(0, 6, 'Inicia el analisis con IA usando el temp_dir del paso anterior')
    y += 25

    y = pdf.add_endpoint_card(y, 'POST', '/api/audit/analyze-uploaded', 'Inicia analisis de skills subidos')

    # Pagina 5: Mas endpoints
    y = pdf.add_section_page(
        'Gestion de Auditorias',
        'Endpoints para consultar estado, obtener resultados y gestionar auditorias.'
    )

    y = pdf.add_endpoint_card(y, 'GET', '/api/audit/{audit_id}/status', 'Consulta el estado de una auditoria')
    y = pdf.add_endpoint_card(y, 'GET', '/api/audit/{audit_id}/result', 'Obtiene el resultado completo')
    y = pdf.add_endpoint_card(y, 'GET', '/api/audits', 'Lista todas las auditorias')
    y = pdf.add_endpoint_card(y, 'DELETE', '/api/audit/{audit_id}', 'Elimina una auditoria')
    y = pdf.add_endpoint_card(y, 'PATCH', '/api/audit/{audit_id}', 'Actualiza nombre de auditoria')

    # Pagina 6: Exportacion
    y = pdf.add_section_page(
        'Exportacion',
        'Genera reportes PDF profesionales de las auditorias.'
    )

    y = pdf.add_endpoint_card(y, 'GET', '/api/audit/{audit_id}/pdf', 'Descarga PDF de auditoria guardada')
    y = pdf.add_endpoint_card(y, 'POST', '/api/export/pdf', 'Genera PDF desde JSON de resultado')

    y = pdf.add_code_block(y, '''curl -X POST https://iebskills.xyz/api/export/pdf \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Mi Auditoria","brand":"IEB",...}' \\
  --output auditoria.pdf''', 'Exportar PDF')

    # Pagina 7: Demo y Testing
    y = pdf.add_section_page(
        'Demo y Testing',
        'Endpoints utiles para desarrollo y demos.'
    )

    y = pdf.add_endpoint_card(y, 'GET', '/api/demo', 'Devuelve datos mock para testing', auth=False)
    y = pdf.add_endpoint_card(y, 'GET', '/health', 'Health check del servidor', auth=False)
    y = pdf.add_endpoint_card(y, 'GET', '/api/test-openai', 'Verifica conexion con OpenAI')

    y += 10
    pdf.draw_card(20, y, 170, 45, pdf.GREEN)
    pdf.set_xy(25, y + 5)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*pdf.GREEN)
    pdf.cell(0, 7, 'Credenciales de Demo')

    pdf.set_font('Courier', '', 10)
    pdf.set_text_color(*pdf.WHITE)
    pdf.set_xy(25, y + 18)
    pdf.cell(50, 6, 'IEB:')
    pdf.cell(0, 6, 'admin / sk1llmngmnt2025')
    pdf.set_xy(25, y + 28)
    pdf.cell(50, 6, 'PSI:')
    pdf.cell(0, 6, 'admin / psim@sk1llz2620')

    # Guardar
    output_path = Path(__file__).parent.parent.parent / 'SkillOps_API_Documentation.pdf'
    pdf.output(str(output_path))
    print(f'PDF generado: {output_path}')
    return output_path


if __name__ == '__main__':
    generate_docs()
