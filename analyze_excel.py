"""
Análise rápida da estrutura do Excel
"""
import pandas as pd

print("Analisando estrutura do Excel...")
df = pd.read_excel("DadosReais/dados_acidentes.xlsx")

print(f"\n📊 Total de registros: {len(df):,}")
print(f"\n📋 Colunas ({len(df.columns)}):")
for i, col in enumerate(df.columns, 1):
    print(f"  {i:2d}. {col}")

print(f"\n🔍 Primeiras 3 linhas:")
print(df.head(3))

print(f"\n📈 Info das colunas:")
print(df.info())

print(f"\n🎯 Sample de dados importantes:")
if 'horario' in df.columns:
    print(f"  horario type: {df['horario'].dtype}")
    print(f"  horario sample: {df['horario'].head(5).tolist()}")
if 'condicao_metereologica' in df.columns:
    print(f"  condicao_metereologica unique: {df['condicao_metereologica'].nunique()}")
    print(f"  condicao_metereologica values: {df['condicao_metereologica'].value_counts().head(10)}")
if 'fase_dia' in df.columns:
    print(f"  fase_dia values: {df['fase_dia'].value_counts()}")

