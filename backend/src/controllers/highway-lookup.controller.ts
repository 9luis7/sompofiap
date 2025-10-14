import { Request, Response } from 'express';
import { highwayLookupService } from '../services/highway-lookup.service';

/**
 * Controller para lookup de rodovias por UF
 */
export const highwayLookupController = {
  /**
   * GET /api/v1/highways/by-uf/:uf
   * Retorna todas as rodovias de uma UF específica
   */
  getHighwaysByUF: (req: Request, res: Response) => {
    try {
      const { uf } = req.params;
      
      if (!uf) {
        return res.status(400).json({
          success: false,
          error: 'UF é obrigatório'
        });
      }

      const highways = highwayLookupService.getHighwaysByUF(uf);
      
      res.json({
        success: true,
        data: {
          uf: uf.toUpperCase(),
          highways,
          total: highways.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/v1/highways/validate
   * Valida se um quilômetro está dentro dos limites de uma rodovia
   */
  validateKilometer: (req: Request, res: Response) => {
    try {
      const { uf, br, km } = req.query;
      
      if (!uf || !br || !km) {
        return res.status(400).json({
          success: false,
          error: 'UF, BR e KM são obrigatórios'
        });
      }

      const kmNumber = parseFloat(km as string);
      if (isNaN(kmNumber)) {
        return res.status(400).json({
          success: false,
          error: 'KM deve ser um número válido'
        });
      }

      const validation = highwayLookupService.validateKilometer(
        uf as string,
        br as string,
        kmNumber
      );
      
      res.json({
        success: true,
        data: {
          uf,
          br,
          km: kmNumber,
          ...validation
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/v1/highways/search
   * Busca rodovias por nome ou número
   */
  searchHighways: (req: Request, res: Response) => {
    try {
      const { q, uf, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro de busca (q) é obrigatório'
        });
      }

      const results = highwayLookupService.searchHighways(
        q as string,
        uf as string
      );
      
      const limitedResults = results.slice(0, parseInt(limit as string));
      
      res.json({
        success: true,
        data: {
          query: q,
          uf: uf || 'todos',
          results: limitedResults,
          total: results.length,
          showing: limitedResults.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/v1/highways/dropdown/:uf
   * Retorna opções formatadas para dropdown
   */
  getDropdownOptions: (req: Request, res: Response) => {
    try {
      const { uf } = req.params;
      
      if (!uf) {
        return res.status(400).json({
          success: false,
          error: 'UF é obrigatório'
        });
      }

      const options = highwayLookupService.getDropdownOptions(uf);
      
      res.json({
        success: true,
        data: {
          uf: uf.toUpperCase(),
          options,
          total: options.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/v1/highways/statistics
   * Retorna estatísticas gerais
   */
  getStatistics: (req: Request, res: Response) => {
    try {
      const stats = highwayLookupService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/v1/highways/ufs
   * Retorna todas as UFs disponíveis
   */
  getAvailableUFs: (req: Request, res: Response) => {
    try {
      const ufs = highwayLookupService.getAvailableUFs();
      
      res.json({
        success: true,
        data: {
          ufs,
          total: ufs.length
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
