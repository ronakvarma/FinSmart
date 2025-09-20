/**
 * Risk Analysis Routes
 * Handles risk metrics and analysis endpoints
 */

const express = require('express');
const { requireAuth, getUserFromAuth } = require('../config/clerk');
const { validate, validateId, querySchemas } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /risk/metrics:
 *   get:
 *     summary: Get risk metrics for portfolios
 *     tags: [Risk Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolio_id
 *         schema:
 *           type: string
 *         description: Filter by specific portfolio
 *       - in: query
 *         name: time_range
 *         schema:
 *           type: string
 *           enum: [1d, 5d, 1m, 3m, 6m, 1y]
 *           default: 1d
 *         description: Time range for metrics
 *     responses:
 *       200:
 *         description: Risk metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       portfolio_id:
 *                         type: string
 *                       var_1d:
 *                         type: number
 *                       var_5d:
 *                         type: number
 *                       expected_shortfall:
 *                         type: number
 *                       beta:
 *                         type: number
 *                       sharpe_ratio:
 *                         type: number
 *                       max_drawdown:
 *                         type: number
 */
router.get('/metrics', 
  requireAuth,
  asyncHandler(async (req, res) => {
    const { portfolio_id, time_range = '1d' } = req.query;

    let query = supabase
      .from('risk_metrics')
      .select(`
        *,
        portfolios:portfolio_id (
          name,
          client_name
        )
      `);

    if (portfolio_id) {
      query = query.eq('portfolio_id', portfolio_id);
    }

    // Filter by time range (assuming we have a timestamp field)
    const now = new Date();
    let startDate;
    
    switch (time_range) {
      case '5d':
        startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 1d
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    query = query
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    const { data: metrics, error } = await query;

    if (error) {
      logger.error('Error fetching risk metrics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch risk metrics'
      });
    }

    res.json({
      success: true,
      data: metrics
    });
  })
);

/**
 * @swagger
 * /risk/concentration:
 *   get:
 *     summary: Get concentration risk analysis
 *     tags: [Risk Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolio_id
 *         schema:
 *           type: string
 *         description: Specific portfolio to analyze
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           default: 0.3
 *         description: Concentration threshold (0.3 = 30%)
 *     responses:
 *       200:
 *         description: Concentration analysis retrieved successfully
 */
router.get('/concentration', 
  requireAuth,
  asyncHandler(async (req, res) => {
    const { portfolio_id, threshold = 0.3 } = req.query;

    try {
      let portfoliosToAnalyze = [];

      if (portfolio_id) {
        // Analyze specific portfolio
        const { data: portfolio, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', portfolio_id)
          .single();

        if (error) {
          return res.status(404).json({
            success: false,
            message: 'Portfolio not found'
          });
        }

        portfoliosToAnalyze = [portfolio];
      } else {
        // Analyze all portfolios
        const { data: portfolios, error } = await supabase
          .from('portfolios')
          .select('*');

        if (error) {
          throw error;
        }

        portfoliosToAnalyze = portfolios;
      }

      const concentrationAnalysis = [];

      for (const portfolio of portfoliosToAnalyze) {
        // Get holdings for this portfolio
        const { data: holdings, error: holdingsError } = await supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', portfolio.id);

        if (holdingsError) {
          logger.error('Error fetching holdings:', holdingsError);
          continue;
        }

        // Calculate sector concentration
        const sectorConcentration = {};
        const regionConcentration = {};
        const assetClassConcentration = {};

        holdings.forEach(holding => {
          const weight = holding.weight_percent / 100;
          
          // Sector concentration
          sectorConcentration[holding.sector] = 
            (sectorConcentration[holding.sector] || 0) + weight;
          
          // Region concentration
          regionConcentration[holding.region] = 
            (regionConcentration[holding.region] || 0) + weight;
          
          // Asset class concentration
          assetClassConcentration[holding.asset_class] = 
            (assetClassConcentration[holding.asset_class] || 0) + weight;
        });

        // Find concentrations above threshold
        const risks = [];

        Object.entries(sectorConcentration).forEach(([sector, concentration]) => {
          if (concentration > threshold) {
            risks.push({
              type: 'sector',
              name: sector,
              concentration: concentration,
              threshold: threshold,
              severity: concentration > 0.5 ? 'high' : concentration > 0.4 ? 'medium' : 'low'
            });
          }
        });

        Object.entries(regionConcentration).forEach(([region, concentration]) => {
          if (concentration > 0.75) { // Higher threshold for geographic
            risks.push({
              type: 'geographic',
              name: region,
              concentration: concentration,
              threshold: 0.75,
              severity: concentration > 0.9 ? 'high' : concentration > 0.85 ? 'medium' : 'low'
            });
          }
        });

        concentrationAnalysis.push({
          portfolio_id: portfolio.id,
          portfolio_name: portfolio.name,
          client_name: portfolio.client_name,
          sector_concentration: sectorConcentration,
          region_concentration: regionConcentration,
          asset_class_concentration: assetClassConcentration,
          concentration_risks: risks,
          risk_score: risks.length > 0 ? 
            risks.reduce((sum, risk) => sum + (risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1), 0) : 0
        });
      }

      res.json({
        success: true,
        data: concentrationAnalysis
      });
    } catch (error) {
      logger.error('Error performing concentration analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform concentration analysis'
      });
    }
  })
);

/**
 * @swagger
 * /risk/var-analysis:
 *   get:
 *     summary: Get Value at Risk analysis
 *     tags: [Risk Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolio_id
 *         schema:
 *           type: string
 *         description: Specific portfolio to analyze
 *       - in: query
 *         name: confidence_level
 *         schema:
 *           type: number
 *           default: 0.95
 *         description: Confidence level for VaR calculation
 *     responses:
 *       200:
 *         description: VaR analysis retrieved successfully
 */
router.get('/var-analysis', 
  requireAuth,
  asyncHandler(async (req, res) => {
    const { portfolio_id, confidence_level = 0.95 } = req.query;

    let query = supabase
      .from('portfolios')
      .select('*');

    if (portfolio_id) {
      query = query.eq('id', portfolio_id);
    }

    const { data: portfolios, error } = await query;

    if (error) {
      logger.error('Error fetching portfolios for VaR analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolios'
      });
    }

    const varAnalysis = portfolios.map(portfolio => {
      const var1d = Math.abs(portfolio.var_1d);
      const portfolioValue = portfolio.total_value;
      const varPercentage = (var1d / portfolioValue) * 100;
      
      // Calculate risk level based on VaR percentage
      let riskLevel = 'low';
      if (varPercentage > 5) riskLevel = 'high';
      else if (varPercentage > 2) riskLevel = 'medium';

      // Estimate VaR for different time horizons (simplified calculation)
      const var5d = var1d * Math.sqrt(5);
      const var1m = var1d * Math.sqrt(22); // ~22 trading days in a month
      
      return {
        portfolio_id: portfolio.id,
        portfolio_name: portfolio.name,
        client_name: portfolio.client_name,
        total_value: portfolioValue,
        var_1d: -var1d,
        var_5d: -var5d,
        var_1m: -var1m,
        var_percentage: varPercentage,
        risk_level: riskLevel,
        confidence_level: confidence_level,
        margin_utilization: portfolio.margin_utilization,
        risk_score: varPercentage * (portfolio.margin_utilization + 0.5) // Combined risk score
      };
    });

    // Sort by risk score descending
    varAnalysis.sort((a, b) => b.risk_score - a.risk_score);

    res.json({
      success: true,
      data: varAnalysis
    });
  })
);

/**
 * @swagger
 * /risk/stress-test:
 *   post:
 *     summary: Perform stress test on portfolios
 *     tags: [Risk Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolio_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               scenarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     market_shock:
 *                       type: number
 *                     sector_shocks:
 *                       type: object
 *     responses:
 *       200:
 *         description: Stress test completed successfully
 */
router.post('/stress-test', 
  requireAuth,
  asyncHandler(async (req, res) => {
    const { portfolio_ids, scenarios } = req.body;

    if (!scenarios || scenarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one stress test scenario is required'
      });
    }

    try {
      let query = supabase
        .from('portfolios')
        .select('*');

      if (portfolio_ids && portfolio_ids.length > 0) {
        query = query.in('id', portfolio_ids);
      }

      const { data: portfolios, error } = await query;

      if (error) {
        throw error;
      }

      const stressTestResults = [];

      for (const portfolio of portfolios) {
        // Get holdings for this portfolio
        const { data: holdings, error: holdingsError } = await supabase
          .from('holdings')
          .select('*')
          .eq('portfolio_id', portfolio.id);

        if (holdingsError) {
          logger.error('Error fetching holdings for stress test:', holdingsError);
          continue;
        }

        const portfolioResults = {
          portfolio_id: portfolio.id,
          portfolio_name: portfolio.name,
          client_name: portfolio.client_name,
          current_value: portfolio.total_value,
          scenarios: []
        };

        for (const scenario of scenarios) {
          let stressedValue = portfolio.total_value;
          const holdingImpacts = [];

          for (const holding of holdings) {
            let holdingShock = scenario.market_shock || -0.1; // Default 10% market decline
            
            // Apply sector-specific shocks if provided
            if (scenario.sector_shocks && scenario.sector_shocks[holding.sector]) {
              holdingShock = scenario.sector_shocks[holding.sector];
            }

            const holdingImpact = holding.value * holdingShock;
            stressedValue += holdingImpact;

            holdingImpacts.push({
              symbol: holding.symbol,
              current_value: holding.value,
              shock: holdingShock,
              impact: holdingImpact,
              stressed_value: holding.value + holdingImpact
            });
          }

          const totalImpact = portfolio.total_value - stressedValue;
          const impactPercentage = (totalImpact / portfolio.total_value) * 100;

          portfolioResults.scenarios.push({
            name: scenario.name,
            stressed_value: stressedValue,
            total_impact: totalImpact,
            impact_percentage: impactPercentage,
            holding_impacts: holdingImpacts,
            risk_level: impactPercentage > 20 ? 'high' : impactPercentage > 10 ? 'medium' : 'low'
          });
        }

        stressTestResults.push(portfolioResults);
      }

      logger.info('Stress test completed', { 
        portfolioCount: portfolios.length, 
        scenarioCount: scenarios.length 
      });

      res.json({
        success: true,
        message: 'Stress test completed successfully',
        data: stressTestResults
      });
    } catch (error) {
      logger.error('Error performing stress test:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform stress test'
      });
    }
  })
);

/**
 * @swagger
 * /risk/dashboard:
 *   get:
 *     summary: Get risk dashboard summary
 *     tags: [Risk Analysis]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Risk dashboard data retrieved successfully
 */
router.get('/dashboard', 
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      // Get portfolio summary
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*');

      if (portfolioError) {
        throw portfolioError;
      }

      // Calculate aggregate metrics
      const totalValue = portfolios.reduce((sum, p) => sum + p.total_value, 0);
      const totalVaR = portfolios.reduce((sum, p) => sum + Math.abs(p.var_1d), 0);
      const totalPnL = portfolios.reduce((sum, p) => sum + p.pnl_today, 0);
      const avgMarginUtilization = portfolios.reduce((sum, p) => sum + p.margin_utilization, 0) / portfolios.length;

      // Risk level distribution
      const riskDistribution = portfolios.reduce((acc, p) => {
        acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
        return acc;
      }, {});

      // Get active alerts count
      const { count: activeAlerts } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get suspicious trades count
      const { count: suspiciousTrades } = await supabase
        .from('suspicious_trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      // Top risk portfolios
      const topRiskPortfolios = portfolios
        .sort((a, b) => Math.abs(b.var_1d) - Math.abs(a.var_1d))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          client_name: p.client_name,
          var_1d: p.var_1d,
          risk_level: p.risk_level,
          margin_utilization: p.margin_utilization
        }));

      res.json({
        success: true,
        data: {
          summary: {
            total_portfolios: portfolios.length,
            total_value: totalValue,
            total_var: -totalVaR,
            total_pnl: totalPnL,
            avg_margin_utilization: avgMarginUtilization,
            active_alerts: activeAlerts || 0,
            suspicious_trades: suspiciousTrades || 0
          },
          risk_distribution: riskDistribution,
          top_risk_portfolios: topRiskPortfolios,
          var_utilization_ratio: totalVaR / totalValue,
          risk_score: (totalVaR / totalValue) * 100 + (avgMarginUtilization * 50)
        }
      });
    } catch (error) {
      logger.error('Error fetching risk dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch risk dashboard'
      });
    }
  })
);

module.exports = router;