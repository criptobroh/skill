"""Parser de archivos .skill (ZIP con SKILL.md adentro)"""

import zipfile
import yaml
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Skill:
    """Representa un skill parseado"""
    name: str
    description: str
    content: str
    file_path: str
    frontmatter: dict = field(default_factory=dict)
    sections: list = field(default_factory=list)
    tables: list = field(default_factory=list)
    line_count: int = 0

    @property
    def full_text(self) -> str:
        """Texto completo para embeddings"""
        return f"{self.name}\n{self.description}\n{self.content}"


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Extrae frontmatter YAML del markdown"""
    if not content.startswith('---'):
        return {}, content

    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content

    try:
        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()
        return frontmatter or {}, body
    except yaml.YAMLError:
        return {}, content


def extract_sections(content: str) -> list[dict]:
    """Extrae secciones con sus headers"""
    sections = []
    current_section = None
    current_content = []

    for line in content.split('\n'):
        if line.startswith('#'):
            if current_section:
                sections.append({
                    'header': current_section,
                    'level': current_section.count('#'),
                    'content': '\n'.join(current_content).strip()
                })
            current_section = line
            current_content = []
        else:
            current_content.append(line)

    if current_section:
        sections.append({
            'header': current_section,
            'level': current_section.count('#'),
            'content': '\n'.join(current_content).strip()
        })

    return sections


def extract_tables(content: str) -> list[dict]:
    """Extrae tablas markdown"""
    tables = []
    lines = content.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i]
        if '|' in line and i + 1 < len(lines) and '---' in lines[i + 1]:
            table_lines = [line]
            i += 1
            while i < len(lines) and '|' in lines[i]:
                table_lines.append(lines[i])
                i += 1

            if len(table_lines) >= 2:
                headers = [h.strip() for h in table_lines[0].split('|') if h.strip()]
                rows = []
                for row_line in table_lines[2:]:
                    row = [c.strip() for c in row_line.split('|') if c.strip()]
                    if row:
                        rows.append(dict(zip(headers, row)))
                tables.append({'headers': headers, 'rows': rows})
        else:
            i += 1

    return tables


def parse_skill_file(file_path: str) -> Optional[Skill]:
    """Parsea un archivo .skill (ZIP) o .md directo"""
    path = Path(file_path)

    if not path.exists():
        return None

    content = None

    if path.suffix == '.skill':
        try:
            with zipfile.ZipFile(path, 'r') as zf:
                for name in zf.namelist():
                    if name.endswith('SKILL.md'):
                        content = zf.read(name).decode('utf-8')
                        break
        except zipfile.BadZipFile:
            return None
    elif path.suffix == '.md':
        content = path.read_text(encoding='utf-8')
    else:
        return None

    if not content:
        return None

    frontmatter, body = parse_frontmatter(content)
    sections = extract_sections(body)
    tables = extract_tables(body)

    name = frontmatter.get('name', path.stem)
    description = frontmatter.get('description', '')
    if isinstance(description, str):
        description = description.strip()

    return Skill(
        name=name,
        description=description,
        content=body,
        file_path=str(path),
        frontmatter=frontmatter,
        sections=sections,
        tables=tables,
        line_count=len(content.split('\n'))
    )


def parse_skill_directory(directory: str) -> list[Skill]:
    """Parsea todos los skills de un directorio"""
    path = Path(directory)
    skills = []

    for file_path in path.rglob('*.skill'):
        skill = parse_skill_file(str(file_path))
        if skill:
            skills.append(skill)

    for file_path in path.rglob('SKILL.md'):
        skill = parse_skill_file(str(file_path))
        if skill:
            skills.append(skill)

    return skills
