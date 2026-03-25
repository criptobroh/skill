"""Genera documentacion PDF premium de SkillOps - una por empresa"""

from fpdf import FPDF
from pathlib import Path
from datetime import datetime


class PremiumPDF(FPDF):
    """PDF premium con estilo NoCoda - dark theme profesional"""

    # Paleta NoCoda
    BG_DARK = (15, 20, 30)
    BG_GRADIENT_END = (20, 35, 45)
    BG_CARD = (25, 35, 50)
    BG_CARD_LIGHT = (30, 45, 60)
    TEAL = (79, 209, 197)
    GREEN = (52, 211, 153)
    WHITE = (255, 255, 255)
    GRAY_LIGHT = (180, 190, 200)
    GRAY = (120, 130, 145)
    ORANGE = (251, 146, 60)
    RED = (239, 68, 68)
    BLUE_NOCODA = (59, 130, 246)

    def __init__(self, company_name, company_short):
        super().__init__()
        self.company_name = company_name
        self.company_short = company_short
        self.set_auto_page_break(auto=True, margin=25)

    def gradient_bg(self):
        """Fondo con gradiente vertical simulado"""
        for i in range(297):
            ratio = i / 297
            r = int(self.BG_DARK[0] + (self.BG_GRADIENT_END[0] - self.BG_DARK[0]) * ratio)
            g = int(self.BG_DARK[1] + (self.BG_GRADIENT_END[1] - self.BG_DARK[1]) * ratio)
            b = int(self.BG_DARK[2] + (self.BG_GRADIENT_END[2] - self.BG_DARK[2]) * ratio)
            self.set_fill_color(r, g, b)
            self.rect(0, i, 210, 1, 'F')

    def header(self):
        self.gradient_bg()

    def footer(self):
        self.set_y(-18)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.GRAY)
        self.cell(0, 10, 'NoCoda | nocoda.ai', align='L')
        self.set_text_color(*self.TEAL)
        self.cell(0, 10, f'{self.page_no()}', align='R')

    def draw_rounded_card(self, x, y, w, h, fill_color=None, border_color=None, border_side='left'):
        """Card con borde lateral de color"""
        if fill_color:
            self.set_fill_color(*fill_color)
        else:
            self.set_fill_color(*self.BG_CARD)
        self.rect(x, y, w, h, 'F')

        if border_color:
            self.set_fill_color(*border_color)
            if border_side == 'left':
                self.rect(x, y, 3, h, 'F')
            elif border_side == 'top':
                self.rect(x, y, w, 3, 'F')
            elif border_side == 'bottom':
                self.rect(x, y + h - 3, w, 3, 'F')

    def draw_badge(self, x, y, text, color):
        """Badge/pill con texto"""
        self.set_fill_color(*color)
        w = len(text) * 2.5 + 8
        self.rect(x, y, w, 7, 'F')
        self.set_xy(x, y)
        self.set_font('Helvetica', 'B', 7)
        self.set_text_color(*self.BG_DARK)
        self.cell(w, 7, text, align='C')
        return w

    def draw_icon_circle(self, x, y, color):
        """Circulo decorativo como icono"""
        self.set_fill_color(*color)
        self.ellipse(x, y, 8, 8, 'F')
        # Inner circle
        self.set_fill_color(*(c + 30 for c in color[:3]))
        self.ellipse(x + 2, y + 2, 4, 4, 'F')

    def cover_page(self, frontend_url, api_url, credentials):
        """Pagina de portada premium"""
        self.add_page()

        # Logo NoCoda text
        self.set_xy(25, 25)
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(*self.BLUE_NOCODA)
        self.cell(0, 10, 'NoCoda')

        # Subtitulo
        self.set_xy(25, 38)
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self.GRAY)
        self.cell(0, 6, 'AI Architecture')

        # Titulo principal
        self.set_xy(25, 75)
        self.set_font('Helvetica', 'B', 42)
        self.set_text_color(*self.TEAL)
        self.cell(0, 18, 'SkillOps')

        # Subtitulo grande
        self.set_xy(25, 98)
        self.set_font('Helvetica', 'B', 32)
        self.set_text_color(*self.WHITE)
        self.cell(0, 14, 'API Documentation')

        # Para empresa
        self.set_xy(25, 120)
        self.set_font('Helvetica', '', 16)
        self.set_text_color(*self.GRAY_LIGHT)
        self.cell(0, 8, f'para {self.company_name}')

        # Descripcion
        self.set_xy(25, 145)
        self.set_font('Helvetica', 'I', 12)
        self.set_text_color(*self.GRAY)
        self.multi_cell(130, 6, 'Plataforma de auditoria automatizada\npara ecosistemas de skills en Claude.')

        # Card de acceso
        self.draw_rounded_card(25, 175, 160, 75, border_color=self.TEAL, border_side='top')

        self.set_xy(35, 185)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*self.TEAL)
        self.cell(0, 6, 'ACCESO A LA PLATAFORMA')

        # URLs
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.GRAY_LIGHT)
        self.set_xy(35, 198)
        self.cell(35, 6, 'Frontend:')
        self.set_text_color(*self.WHITE)
        self.cell(0, 6, frontend_url)

        self.set_text_color(*self.GRAY_LIGHT)
        self.set_xy(35, 208)
        self.cell(35, 6, 'API:')
        self.set_text_color(*self.WHITE)
        self.cell(0, 6, api_url)

        # Credenciales
        self.set_text_color(*self.GRAY_LIGHT)
        self.set_xy(35, 222)
        self.cell(35, 6, 'Usuario:')
        self.set_font('Courier', '', 10)
        self.set_text_color(*self.GREEN)
        self.cell(30, 6, credentials['user'])

        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.GRAY_LIGHT)
        self.cell(25, 6, 'Password:')
        self.set_font('Courier', '', 10)
        self.set_text_color(*self.GREEN)
        self.cell(0, 6, credentials['pass'])

        # Fecha
        self.set_xy(25, 265)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self.GRAY)
        self.cell(0, 6, f'Generado: {datetime.now().strftime("%B %Y")}')

    def section_header(self, number, title, subtitle=""):
        """Header de seccion con numero grande"""
        self.add_page()

        # Numero grande decorativo
        self.set_xy(25, 30)
        self.set_font('Helvetica', 'B', 60)
        self.set_text_color(40, 55, 70)
        self.cell(0, 25, f'0{number}')

        # Titulo
        self.set_xy(25, 55)
        self.set_font('Helvetica', 'B', 26)
        self.set_text_color(*self.WHITE)
        self.cell(0, 12, title)

        # Subtitulo
        if subtitle:
            self.set_xy(25, 72)
            self.set_font('Helvetica', '', 11)
            self.set_text_color(*self.GRAY_LIGHT)
            self.multi_cell(160, 6, subtitle)
            return 92
        return 80

    def endpoint_row(self, y, method, path, description, auth=True):
        """Fila de endpoint elegante"""
        method_colors = {
            'GET': self.GREEN,
            'POST': self.BLUE_NOCODA,
            'DELETE': self.RED,
            'PATCH': self.ORANGE,
            'PUT': self.ORANGE
        }
        color = method_colors.get(method, self.GRAY)

        # Card
        self.draw_rounded_card(25, y, 160, 32, border_color=color)

        # Method badge
        badge_w = self.draw_badge(32, y + 6, method, color)

        # Auth indicator
        if auth:
            self.set_xy(155, y + 6)
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*self.ORANGE)
            self.cell(25, 7, 'REQUIERE AUTH', align='R')

        # Path
        self.set_xy(32 + badge_w + 8, y + 5)
        self.set_font('Courier', 'B', 10)
        self.set_text_color(*self.WHITE)
        self.cell(0, 8, path)

        # Description
        self.set_xy(35, y + 18)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.GRAY_LIGHT)
        self.cell(0, 6, description)

        return y + 40

    def code_example(self, y, title, code):
        """Bloque de codigo con estilo terminal"""
        lines = code.strip().split('\n')
        h = len(lines) * 5 + 18

        # Header del bloque
        self.set_fill_color(20, 28, 38)
        self.rect(25, y, 160, h, 'F')

        # Barra superior estilo terminal
        self.set_fill_color(35, 45, 55)
        self.rect(25, y, 160, 12, 'F')

        # Dots decorativos
        self.set_fill_color(*self.RED)
        self.ellipse(30, y + 4, 4, 4, 'F')
        self.set_fill_color(*self.ORANGE)
        self.ellipse(37, y + 4, 4, 4, 'F')
        self.set_fill_color(*self.GREEN)
        self.ellipse(44, y + 4, 4, 4, 'F')

        # Titulo
        self.set_xy(55, y + 2)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self.GRAY)
        self.cell(0, 8, title)

        # Codigo
        self.set_font('Courier', '', 8)
        self.set_text_color(*self.GREEN)

        for i, line in enumerate(lines):
            self.set_xy(32, y + 15 + i * 5)
            if len(line) > 75:
                line = line[:72] + '...'
            # Colorear comentarios
            if line.strip().startswith('#'):
                self.set_text_color(*self.GRAY)
            else:
                self.set_text_color(*self.GREEN)
            self.cell(0, 5, line)

        return y + h + 8

    def info_card(self, y, title, items, color):
        """Card informativa con lista de items"""
        h = len(items) * 12 + 25
        self.draw_rounded_card(25, y, 160, h, border_color=color)

        # Titulo
        self.set_xy(35, y + 8)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*color)
        self.cell(0, 6, title)

        # Items
        self.set_font('Helvetica', '', 10)
        for i, item in enumerate(items):
            self.set_xy(35, y + 22 + i * 12)
            self.set_text_color(*self.TEAL)
            self.cell(5, 6, '>')
            self.set_text_color(*self.WHITE)
            self.cell(0, 6, item)

        return y + h + 10

    def step_card(self, y, number, title, description):
        """Card de paso numerado"""
        self.draw_rounded_card(25, y, 160, 28, border_color=self.TEAL)

        # Numero
        self.set_fill_color(*self.TEAL)
        self.rect(25, y, 35, 28, 'F')
        self.set_xy(25, y + 8)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self.BG_DARK)
        self.cell(35, 12, f'0{number}', align='C')

        # Titulo
        self.set_xy(68, y + 5)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*self.WHITE)
        self.cell(0, 6, title)

        # Descripcion
        self.set_xy(68, y + 15)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self.GRAY_LIGHT)
        self.cell(0, 6, description)

        return y + 35


def generate_company_docs(company, short, frontend, api, creds, filename):
    """Genera documentacion para una empresa especifica"""
    pdf = PremiumPDF(company, short)

    # Portada
    pdf.cover_page(frontend, api, creds)

    # Seccion 1: Autenticacion
    y = pdf.section_header(1, 'Autenticacion',
        'La API utiliza tokens JWT para autenticacion. Obtene tu token via el endpoint de login.')

    y = pdf.endpoint_row(y, 'POST', '/api/auth/login', 'Obtiene token JWT para acceder a la API', auth=False)

    y = pdf.code_example(y, 'Ejemplo de Login', f'''curl -X POST {api}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{{"username":"{creds['user']}","password":"***"}}'

# Response:
{{"access_token": "eyJhbG...", "token_type": "bearer"}}''')

    y = pdf.info_card(y, 'Uso del Token', [
        'Incluir en header: Authorization: Bearer <token>',
        'Los tokens expiran en 24 horas',
        'Renovar via nuevo login cuando expire'
    ], pdf.ORANGE)

    # Seccion 2: Flujo de Auditoria
    y = pdf.section_header(2, 'Flujo de Auditoria',
        'El proceso de auditoria consta de tres pasos principales.')

    y = pdf.step_card(y, 1, 'Subir Archivos', 'Sube los archivos .skill o .md que quieras auditar')
    y = pdf.endpoint_row(y, 'POST', '/api/audit/upload', 'Sube archivos .skill para auditar')

    y = pdf.code_example(y, 'Upload de Skills', f'''curl -X POST {api}/audit/upload \\
  -H "Authorization: Bearer TOKEN" \\
  -F "files=@skill1.skill" \\
  -F "files=@skill2.skill"

# Response: {{"temp_dir": "/tmp/xxx", "skills_count": 2}}''')

    y = pdf.step_card(y, 2, 'Iniciar Analisis', 'Inicia el analisis con IA usando el directorio temporal')
    y = pdf.endpoint_row(y, 'POST', '/api/audit/analyze-uploaded', 'Inicia analisis de skills subidos')

    # Seccion 3: Gestion
    y = pdf.section_header(3, 'Gestion de Auditorias',
        'Endpoints para consultar, modificar y eliminar auditorias.')

    y = pdf.step_card(y, 3, 'Obtener Resultados', 'Consulta el estado y descarga los resultados')

    y = pdf.endpoint_row(y, 'GET', '/api/audit/{id}/status', 'Consulta estado de la auditoria')
    y = pdf.endpoint_row(y, 'GET', '/api/audit/{id}/result', 'Obtiene resultado completo en JSON')
    y = pdf.endpoint_row(y, 'GET', '/api/audits', 'Lista todas las auditorias realizadas')
    y = pdf.endpoint_row(y, 'DELETE', '/api/audit/{id}', 'Elimina una auditoria del historial')
    y = pdf.endpoint_row(y, 'PATCH', '/api/audit/{id}', 'Actualiza el nombre de una auditoria')

    # Seccion 4: Exportacion
    y = pdf.section_header(4, 'Exportacion PDF',
        'Genera reportes profesionales en formato PDF.')

    y = pdf.endpoint_row(y, 'GET', '/api/audit/{id}/pdf', 'Descarga PDF de auditoria guardada')
    y = pdf.endpoint_row(y, 'POST', '/api/export/pdf', 'Genera PDF desde JSON de resultado')

    y = pdf.code_example(y, 'Exportar a PDF', f'''curl -X POST {api}/export/pdf \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{{"name":"Auditoria {short}","brand":"{short}",...}}' \\
  --output auditoria.pdf''')

    y = pdf.info_card(y, 'Contenido del PDF', [
        'Resumen ejecutivo con metricas',
        'Lista de skills analizados',
        'Detalle de solapamientos detectados',
        'Issues de calidad identificados',
        'Recomendaciones de mejora'
    ], pdf.GREEN)

    # Seccion 5: Testing
    y = pdf.section_header(5, 'Testing y Demo',
        'Endpoints utiles para desarrollo y pruebas.')

    y = pdf.endpoint_row(y, 'GET', '/api/demo', 'Devuelve datos mock para testing UI', auth=False)
    y = pdf.endpoint_row(y, 'GET', '/health', 'Health check del servidor', auth=False)
    y = pdf.endpoint_row(y, 'GET', '/api/test-openai', 'Verifica conexion con OpenAI')

    y = pdf.info_card(y, 'Datos de Demo', [
        f'El endpoint /api/demo no requiere autenticacion',
        'Devuelve 7 skills de ejemplo con solapamientos',
        'Util para probar la UI sin subir archivos reales'
    ], pdf.BLUE_NOCODA)

    # Guardar
    output_path = Path(__file__).parent.parent.parent / filename
    pdf.output(str(output_path))
    print(f'PDF generado: {output_path}')
    return output_path


def main():
    # IEB
    generate_company_docs(
        company='Grupo IEB',
        short='IEB',
        frontend='https://iebskills.xyz',
        api='https://iebskills.xyz/api',
        creds={'user': 'admin', 'pass': 'sk1llmngmnt2025'},
        filename='SkillOps_IEB_Documentation.pdf'
    )

    # PSI
    generate_company_docs(
        company='PSI Mammoliti',
        short='PSI',
        frontend='https://skills.psima.xyz',
        api='https://skillops-api.psima.xyz/api',
        creds={'user': 'admin', 'pass': 'psim@sk1llz2620'},
        filename='SkillOps_PSI_Documentation.pdf'
    )


if __name__ == '__main__':
    main()
