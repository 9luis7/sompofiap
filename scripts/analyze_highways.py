#!/usr/bin/env python3
"""
Script para analisar dados do DATATRAN e extrair informações sobre rodovias por UF
com nomes conhecidos e limites de quilometragem
"""

import pandas as pd
import json
from collections import defaultdict

def analyze_highways():
    print("Analisando dados do DATATRAN para extrair informacoes de rodovias...")
    
    # Carregar dados do CSV
    df = pd.read_csv('../datatran2025/datatran2025.csv', sep=';', encoding='latin-1')
    
    print(f"Total de registros: {len(df):,}")
    
    # Nomes conhecidos das rodovias (baseado em conhecimento público)
    highway_names = {
        '101': 'BR-101 (Rio-Santos)',
        '116': 'BR-116 (Régis Bittencourt)',
        '153': 'BR-153 (Transbrasiliana)',
        '163': 'BR-163 (Santarém-Cuiabá)',
        '230': 'BR-230 (Transamazônica)',
        '251': 'BR-251 (Conectividade Regional)',
        '262': 'BR-262 (Litoral Sudeste)',
        '277': 'BR-277 (Paraná)',
        '282': 'BR-282 (Santa Catarina)',
        '287': 'BR-287 (Rio Grande do Sul)',
        '290': 'BR-290 (Transbrasiliana Sul)',
        '364': 'BR-364 (Cuiabá-Porto Velho)',
        '365': 'BR-365 (Minas Gerais)',
        '369': 'BR-369 (Paraná Interior)',
        '376': 'BR-376 (Paraná)',
        '381': 'BR-381 (Fernão Dias)',
        '386': 'BR-386 (Rio Grande do Sul)',
        '393': 'BR-393 (Rio de Janeiro)',
        '405': 'BR-405 (Paraíba)',
        '407': 'BR-407 (Pernambuco)',
        '429': 'BR-429 (Rondônia)',
        '040': 'BR-040 (Rio-Brasília)',
        '020': 'BR-020 (Brasília-Fortaleza)',
        '010': 'BR-010 (Belém-Brasília)',
        '070': 'BR-070 (Mato Grosso)',
        '135': 'BR-135 (Maranhão)',
        '222': 'BR-222 (Maranhão-Piauí)',
        '232': 'BR-232 (Pernambuco)',
        '356': 'BR-356 (Rio de Janeiro)'
    }
    
    # Analisar rodovias por UF
    highways_by_uf = defaultdict(lambda: defaultdict(lambda: {'min_km': float('inf'), 'max_km': 0, 'accidents': 0}))
    
    for _, row in df.iterrows():
        uf = row['uf']
        br = str(row['br']) if pd.notna(row['br']) else '0'
        # Converter vírgula para ponto e depois para float
        km_str = str(row['km']) if pd.notna(row['km']) else '0'
        km_str = km_str.replace(',', '.')
        try:
            km = float(km_str)
        except ValueError:
            km = 0
        
        if uf and br != '0' and km > 0:
            highways_by_uf[uf][br]['min_km'] = min(highways_by_uf[uf][br]['min_km'], km)
            highways_by_uf[uf][br]['max_km'] = max(highways_by_uf[uf][br]['max_km'], km)
            highways_by_uf[uf][br]['accidents'] += 1
    
    # Criar estrutura final
    result = {}
    
    for uf, highways in highways_by_uf.items():
        result[uf] = []
        
        for br, data in highways.items():
            if data['accidents'] >= 5:  # Apenas rodovias com pelo menos 5 acidentes
                highway_info = {
                    'br': br,
                    'name': highway_names.get(br, f'BR-{br}'),
                    'min_km': round(data['min_km'], 1),
                    'max_km': round(data['max_km'], 1),
                    'accidents': data['accidents'],
                    'length_km': round(data['max_km'] - data['min_km'], 1)
                }
                result[uf].append(highway_info)
        
        # Ordenar por número de acidentes (mais perigosas primeiro)
        result[uf].sort(key=lambda x: x['accidents'], reverse=True)
    
    # Criar diretório se não existir
    import os
    os.makedirs('../backend/data', exist_ok=True)
    
    # Salvar resultado
    with open('../backend/data/highways_by_uf.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print("Dados salvos em backend/data/highways_by_uf.json")
    
    # Estatísticas
    total_ufs = len(result)
    total_highways = sum(len(highways) for highways in result.values())
    
    print(f"\nEstatisticas:")
    print(f"  - UFs com dados: {total_ufs}")
    print(f"  - Total de rodovias: {total_highways}")
    
    # Top 10 UFs com mais rodovias
    top_ufs = sorted(result.items(), key=lambda x: len(x[1]), reverse=True)[:10]
    print(f"\nTop 10 UFs com mais rodovias:")
    for uf, highways in top_ufs:
        print(f"  {uf}: {len(highways)} rodovias")
    
    # Top 10 rodovias mais perigosas
    all_highways = []
    for uf, highways in result.items():
        for hw in highways:
            all_highways.append((uf, hw))
    
    top_dangerous = sorted(all_highways, key=lambda x: x[1]['accidents'], reverse=True)[:10]
    print(f"\nTop 10 rodovias mais perigosas:")
    for uf, hw in top_dangerous:
        print(f"  {hw['name']} ({uf}): {hw['accidents']} acidentes (KM {hw['min_km']}-{hw['max_km']})")
    
    return result

if __name__ == "__main__":
    analyze_highways()
