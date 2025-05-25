import { groupBy, sortBy } from '../utils/helpers.js';
import { formatDate, getDifference, isWithinRange } from '../utils/dateUtils.js';
import { ANALYTICS } from '../utils/constants.js';

/**
 * Analytics Service
 * Handles form analytics, statistics, and reporting
 */
class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ============================================================================
  // FORM ANALYTICS
  // ============================================================================

  /**
   * Calculate comprehensive form analytics
   * @param {object} form - Form configuration
   * @param {array} submissions - Form submissions
   * @param {object} options - Analytics options
   * @returns {object} Analytics data
   */
  calculateFormAnalytics(form, submissions, options = {}) {
    const {
      timeRange = ANALYTICS.TIME_RANGES.LAST_30_DAYS,
      includeFieldAnalysis = true,
      includeConversionFunnel = true,
      includeUserBehavior = false
    } = options;

    const cacheKey = `form_analytics_${form.id}_${timeRange}_${submissions.length}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Filter submissions by time range
    const filteredSubmissions = this._filterSubmissionsByTimeRange(submissions, timeRange);

    const analytics = {
      formId: form.id,
      formTitle: form.title,
      timeRange,
      generatedAt: new Date().toISOString(),
      
      // Overview metrics
      overview: this._calculateOverviewMetrics(form, filteredSubmissions),
      
      // Submission trends
      trends: this._calculateSubmissionTrends(filteredSubmissions, timeRange),
      
      // Field analysis
      fieldAnalysis: includeFieldAnalysis 
        ? this._calculateFieldAnalytics(form.fields, filteredSubmissions)
        : null,
        
      // Conversion funnel
      conversionFunnel: includeConversionFunnel 
        ? this._calculateConversionFunnel(form.fields, filteredSubmissions)
        : null,
        
      // User behavior
      userBehavior: includeUserBehavior 
        ? this._calculateUserBehavior(filteredSubmissions)
        : null,
        
      // Performance metrics
      performance: this._calculatePerformanceMetrics(filteredSubmissions)
    };

    // Cache results
    this.cache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now()
    });

    return analytics;
  }

  /**
   * Calculate field-specific analytics
   * @param {object} field - Field configuration
   * @param {array} submissions - Form submissions
   * @returns {object} Field analytics
   */
  calculateFieldAnalytics(field, submissions) {
    const fieldData = submissions.map(submission => ({
      value: submission.data?.[field.id],
      submittedAt: submission.submittedAt || submission.metadata?.submittedAt,
      metadata: submission.metadata
    })).filter(item => item.value !== undefined && item.value !== null);

    const analytics = {
      fieldId: field.id,
      fieldLabel: field.label,
      fieldType: field.type,
      totalResponses: fieldData.length,
      completionRate: (fieldData.length / submissions.length) * 100,
      
      // Value analysis
      valueAnalysis: this._analyzeFieldValues(field, fieldData),
      
      // Response patterns
      responsePatterns: this._analyzeResponsePatterns(fieldData),
      
      // Quality metrics
      qualityMetrics: this._calculateFieldQuality(field, fieldData)
    };

    return analytics;
  }

  /**
   * Get dashboard analytics summary
   * @param {array} forms - All forms
   * @param {array} allSubmissions - All submissions
   * @param {object} options - Options
   * @returns {object} Dashboard analytics
   */
  getDashboardAnalytics(forms, allSubmissions, options = {}) {
    const { timeRange = ANALYTICS.TIME_RANGES.LAST_30_DAYS } = options;

    const filteredSubmissions = this._filterSubmissionsByTimeRange(allSubmissions, timeRange);

    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      
      // Overall metrics
      totalForms: forms.length,
      activeForms: forms.filter(f => f.settings?.isActive).length,
      totalSubmissions: filteredSubmissions.length,
      
      // Top performing forms
      topForms: this._getTopPerformingForms(forms, filteredSubmissions),
      
      // Submission trends
      submissionTrends: this._calculateSubmissionTrends(filteredSubmissions, timeRange),
      
      // Form type breakdown
      formTypeBreakdown: this._calculateFormTypeBreakdown(forms),
      
      // Recent activity
      recentActivity: this._getRecentActivity(forms, filteredSubmissions)
    };
  }

  // ============================================================================
  // COMPARISON ANALYTICS
  // ============================================================================

  /**
   * Compare form performance
   * @param {array} formIds - Form IDs to compare
   * @param {object} submissionData - Submissions grouped by form ID
   * @param {object} options - Comparison options
   * @returns {object} Comparison analytics
   */
  compareFormPerformance(formIds, submissionData, options = {}) {
    const { 
      timeRange = ANALYTICS.TIME_RANGES.LAST_30_DAYS,
      metrics = ['submissions', 'completion_rate', 'avg_time']
    } = options;

    const comparison = {
      formIds,
      timeRange,
      metrics,
      generatedAt: new Date().toISOString(),
      comparisons: {}
    };

    formIds.forEach(formId => {
      const submissions = submissionData[formId] || [];
      const filteredSubmissions = this._filterSubmissionsByTimeRange(submissions, timeRange);
      
      comparison.comparisons[formId] = {
        totalSubmissions: filteredSubmissions.length,
        averageCompletionTime: this._calculateAverageCompletionTime(filteredSubmissions),
        completionRate: this._calculateCompletionRate(filteredSubmissions),
        bounceRate: this._calculateBounceRate(filteredSubmissions),
        trendsData: this._calculateSubmissionTrends(filteredSubmissions, timeRange)
      };
    });

    // Add rankings
    comparison.rankings = this._calculateRankings(comparison.comparisons, metrics);

    return comparison;
  }

  /**
   * A/B test analysis
   * @param {object} testConfig - A/B test configuration
   * @param {object} variantData - Data for each variant
   * @returns {object} A/B test results
   */
  analyzeABTest(testConfig, variantData) {
    const analysis = {
      testId: testConfig.id,
      testName: testConfig.name,
      startDate: testConfig.startDate,
      endDate: testConfig.endDate,
      variants: {},
      winner: null,
      confidence: 0,
      significance: false
    };

    // Analyze each variant
    Object.entries(variantData).forEach(([variantId, submissions]) => {
      const variantAnalysis = {
        id: variantId,
        name: testConfig.variants[variantId]?.name || variantId,
        totalSubmissions: submissions.length,
        conversionRate: this._calculateConversionRate(submissions, testConfig.goalMetric),
        averageTime: this._calculateAverageCompletionTime(submissions),
        bounceRate: this._calculateBounceRate(submissions)
      };

      analysis.variants[variantId] = variantAnalysis;
    });

    // Statistical significance testing
    if (Object.keys(analysis.variants).length === 2) {
      const [variantA, variantB] = Object.values(analysis.variants);
      const significance = this._calculateStatisticalSignificance(variantA, variantB);
      
      analysis.significance = significance.isSignificant;
      analysis.confidence = significance.confidence;
      analysis.winner = significance.winner;
    }

    return analysis;
  }

  // ============================================================================
  // REAL-TIME ANALYTICS
  // ============================================================================

  /**
   * Get real-time form analytics
   * @param {string} formId - Form ID
   * @param {array} recentSubmissions - Recent submissions
   * @returns {object} Real-time analytics
   */
  getRealTimeAnalytics(formId, recentSubmissions) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const last24HourSubmissions = recentSubmissions.filter(sub => 
      new Date(sub.submittedAt || sub.metadata?.submittedAt) >= last24Hours
    );

    const lastHourSubmissions = recentSubmissions.filter(sub => 
      new Date(sub.submittedAt || sub.metadata?.submittedAt) >= lastHour
    );

    return {
      formId,
      timestamp: now.toISOString(),
      
      // Current metrics
      submissionsLast24Hours: last24HourSubmissions.length,
      submissionsLastHour: lastHourSubmissions.length,
      currentRate: this._calculateSubmissionRate(lastHourSubmissions, 'hour'),
      
      // Hourly breakdown for last 24 hours
      hourlyBreakdown: this._getHourlyBreakdown(last24HourSubmissions),
      
      // Active users (estimated)
      estimatedActiveUsers: this._estimateActiveUsers(recentSubmissions),
      
      // Recent submissions
      recentSubmissions: recentSubmissions.slice(0, 10).map(sub => ({
        id: sub.id,
        submittedAt: sub.submittedAt || sub.metadata?.submittedAt,
        userAgent: sub.metadata?.userAgent,
        completionTime: sub.metadata?.completionTime
      }))
    };
  }

  // ============================================================================
  // EXPORT AND REPORTING
  // ============================================================================

  /**
   * Generate analytics report
   * @param {object} analyticsData - Analytics data
   * @param {object} options - Report options
   * @returns {object} Formatted report
   */
  generateAnalyticsReport(analyticsData, options = {}) {
    const {
      format = 'summary',
      includeCharts = false,
      includeRecommendations = true
    } = options;

    const report = {
      title: `Analytics Report - ${analyticsData.formTitle}`,
      generatedAt: new Date().toISOString(),
      timeRange: analyticsData.timeRange,
      
      // Executive summary
      executiveSummary: this._generateExecutiveSummary(analyticsData),
      
      // Key metrics
      keyMetrics: this._extractKeyMetrics(analyticsData),
      
      // Insights
      insights: this._generateInsights(analyticsData),
      
      // Recommendations
      recommendations: includeRecommendations 
        ? this._generateRecommendations(analyticsData)
        : null,
        
      // Chart data
      chartData: includeCharts 
        ? this._prepareChartData(analyticsData)
        : null
    };

    return format === 'detailed' 
      ? { ...report, rawData: analyticsData }
      : report;
  }

  // ============================================================================
  // PRIVATE METHODS - CALCULATIONS
  // ============================================================================

  /**
   * Calculate overview metrics
   * @param {object} form - Form configuration
   * @param {array} submissions - Submissions
   * @returns {object} Overview metrics
   */
  _calculateOverviewMetrics(form, submissions) {
    const totalViews = form.viewCount || submissions.length * 1.5; // Estimated
    const completionRate = submissions.length > 0 ? 100 : 0;
    
    return {
      totalSubmissions: submissions.length,
      totalViews: Math.round(totalViews),
      conversionRate: totalViews > 0 ? (submissions.length / totalViews) * 100 : 0,
      completionRate,
      averageCompletionTime: this._calculateAverageCompletionTime(submissions),
      bounceRate: this._calculateBounceRate(submissions),
      lastSubmission: submissions.length > 0 
        ? submissions[submissions.length - 1].submittedAt || submissions[submissions.length - 1].metadata?.submittedAt
        : null
    };
  }

  /**
   * Calculate submission trends
   * @param {array} submissions - Submissions
   * @param {string} timeRange - Time range
   * @returns {object} Trends data
   */
  _calculateSubmissionTrends(submissions, timeRange) {
    const groupedByDate = groupBy(submissions, submission => {
      const date = new Date(submission.submittedAt || submission.metadata?.submittedAt);
      return formatDate(date, 'YYYY-MM-DD');
    });

    const sortedDates = Object.keys(groupedByDate).sort();
    const trendsData = sortedDates.map(date => ({
      date,
      submissions: groupedByDate[date].length,
      cumulativeSubmissions: sortedDates
        .slice(0, sortedDates.indexOf(date) + 1)
        .reduce((sum, d) => sum + groupedByDate[d].length, 0)
    }));

    // Calculate growth rate
    const growthRate = this._calculateGrowthRate(trendsData);

    return {
      daily: trendsData,
      growthRate,
      peakDay: this._findPeakDay(trendsData),
      averageDaily: trendsData.length > 0 
        ? trendsData.reduce((sum, day) => sum + day.submissions, 0) / trendsData.length
        : 0
    };
  }

  /**
   * Calculate field analytics
   * @param {array} fields - Form fields
   * @param {array} submissions - Submissions
   * @returns {object} Field analytics
   */
  _calculateFieldAnalytics(fields, submissions) {
    const fieldAnalytics = {};

    fields.forEach(field => {
      const fieldResponses = submissions.map(sub => sub.data?.[field.id])
        .filter(value => value !== undefined && value !== null && value !== '');

      fieldAnalytics[field.id] = {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        responses: fieldResponses.length,
        completionRate: (fieldResponses.length / submissions.length) * 100,
        uniqueValues: [...new Set(fieldResponses)].length,
        mostCommonValue: this._getMostCommonValue(fieldResponses),
        averageLength: this._getAverageLength(fieldResponses),
        qualityScore: this._calculateFieldQualityScore(field, fieldResponses)
      };
    });

    return fieldAnalytics;
  }

  /**
   * Calculate conversion funnel
   * @param {array} fields - Form fields
   * @param {array} submissions - Submissions
   * @returns {object} Conversion funnel
   */
  _calculateConversionFunnel(fields, submissions) {
    const funnel = fields.map((field, index) => {
      const completedField = submissions.filter(sub => {
        const value = sub.data?.[field.id];
        return value !== undefined && value !== null && value !== '';
      }).length;

      const dropoffRate = index > 0 
        ? ((funnel[index - 1].completed - completedField) / funnel[index - 1].completed) * 100
        : 0;

      return {
        step: index + 1,
        fieldId: field.id,
        fieldLabel: field.label,
        completed: completedField,
        completionRate: (completedField / submissions.length) * 100,
        dropoffRate
      };
    });

    return {
      steps: funnel,
      overallCompletionRate: submissions.length > 0 
        ? (funnel[funnel.length - 1]?.completed / submissions.length) * 100
        : 0,
      biggestDropoff: funnel.reduce((max, step) => 
        step.dropoffRate > max.dropoffRate ? step : max, { dropoffRate: 0 })
    };
  }

  /**
   * Calculate user behavior analytics
   * @param {array} submissions - Submissions
   * @returns {object} User behavior data
   */
  _calculateUserBehavior(submissions) {
    const devices = groupBy(submissions, sub => this._getDeviceType(sub.metadata?.userAgent));
    const browsers = groupBy(submissions, sub => this._getBrowser(sub.metadata?.userAgent));
    const timePatterns = this._analyzeSubmissionTimePatterns(submissions);

    return {
      deviceBreakdown: Object.entries(devices).map(([device, subs]) => ({
        device,
        count: subs.length,
        percentage: (subs.length / submissions.length) * 100
      })),
      
      browserBreakdown: Object.entries(browsers).map(([browser, subs]) => ({
        browser,
        count: subs.length,
        percentage: (subs.length / submissions.length) * 100
      })),
      
      timePatterns,
      
      returningUsers: this._calculateReturningUsers(submissions),
      
      averageSessionTime: this._calculateAverageSessionTime(submissions)
    };
  }

  /**
   * Calculate performance metrics
   * @param {array} submissions - Submissions
   * @returns {object} Performance metrics
   */
  _calculatePerformanceMetrics(submissions) {
    const completionTimes = submissions
      .map(sub => sub.metadata?.completionTime)
      .filter(time => time && time > 0);

    return {
      averageCompletionTime: completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0,
        
      medianCompletionTime: this._calculateMedian(completionTimes),
      
      fastestCompletion: Math.min(...completionTimes) || 0,
      
      slowestCompletion: Math.max(...completionTimes) || 0,
      
      abandonmentRate: this._calculateAbandonmentRate(submissions),
      
      errorRate: this._calculateErrorRate(submissions)
    };
  }

  /**
   * Filter submissions by time range
   * @param {array} submissions - All submissions
   * @param {string} timeRange - Time range identifier
   * @returns {array} Filtered submissions
   */
  _filterSubmissionsByTimeRange(submissions, timeRange) {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case ANALYTICS.TIME_RANGES.LAST_7_DAYS:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case ANALYTICS.TIME_RANGES.LAST_30_DAYS:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case ANALYTICS.TIME_RANGES.LAST_90_DAYS:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case ANALYTICS.TIME_RANGES.LAST_YEAR:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case ANALYTICS.TIME_RANGES.ALL_TIME:
      default:
        return submissions;
    }

    return submissions.filter(submission => {
      const submissionDate = new Date(submission.submittedAt || submission.metadata?.submittedAt);
      return submissionDate >= startDate;
    });
  }

  /**
   * Calculate average completion time
   * @param {array} submissions - Submissions
   * @returns {number} Average completion time in milliseconds
   */
  _calculateAverageCompletionTime(submissions) {
    const times = submissions
      .map(sub => sub.metadata?.completionTime)
      .filter(time => time && time > 0);

    return times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length
      : 0;
  }

  /**
   * Calculate completion rate
   * @param {array} submissions - Submissions
   * @returns {number} Completion rate percentage
   */
  _calculateCompletionRate(submissions) {
    const completed = submissions.filter(sub => 
      sub.metadata?.completionPercentage >= 100
    ).length;

    return submissions.length > 0 ? (completed / submissions.length) * 100 : 0;
  }

  /**
   * Calculate bounce rate
   * @param {array} submissions - Submissions
   * @returns {number} Bounce rate percentage
   */
  _calculateBounceRate(submissions) {
    const bounced = submissions.filter(sub => 
      (sub.metadata?.completionPercentage || 0) < 25
    ).length;

    return submissions.length > 0 ? (bounced / submissions.length) * 100 : 0;
  }

  /**
   * Calculate statistical significance
   * @param {object} variantA - Variant A data
   * @param {object} variantB - Variant B data
   * @returns {object} Significance test result
   */
  _calculateStatisticalSignificance(variantA, variantB) {
    // Simplified chi-square test
    const n1 = variantA.totalSubmissions;
    const n2 = variantB.totalSubmissions;
    const p1 = variantA.conversionRate / 100;
    const p2 = variantB.conversionRate / 100;

    if (n1 < 30 || n2 < 30) {
      return {
        isSignificant: false,
        confidence: 0,
        winner: null,
        message: 'Insufficient sample size for significance testing'
      };
    }

    const pooledP = ((n1 * p1) + (n2 * p2)) / (n1 + n2);
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * ((1 / n1) + (1 / n2)));
    const zScore = Math.abs(p1 - p2) / standardError;
    
    // Convert z-score to confidence level (simplified)
    const confidence = Math.min(99.9, (1 - (2 * (1 - this._normalCDF(Math.abs(zScore))))) * 100);
    const isSignificant = confidence >= 95;

    return {
      isSignificant,
      confidence: Math.round(confidence * 10) / 10,
      winner: p1 > p2 ? variantA.id : variantB.id,
      zScore,
      message: isSignificant 
        ? `${p1 > p2 ? variantA.name : variantB.name} wins with ${confidence.toFixed(1)}% confidence`
        : 'No statistically significant difference found'
    };
  }

  /**
   * Normal cumulative distribution function (approximation)
   * @param {number} x - Input value
   * @returns {number} CDF value
   */
  _normalCDF(x) {
    return 0.5 * (1 + this._erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   * @param {number} x - Input value
   * @returns {number} Error function value
   */
  _erf(x) {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Get most common value in array
   * @param {array} values - Array of values
   * @returns {any} Most common value
   */
  _getMostCommonValue(values) {
    if (values.length === 0) return null;
    
    const frequency = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  /**
   * Calculate median of array
   * @param {array} numbers - Array of numbers
   * @returns {number} Median value
   */
  _calculateMedian(numbers) {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  /**
   * Get device type from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} Device type
   */
  _getDeviceType(userAgent) {
    if (!userAgent) return 'unknown';
    
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      return /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get browser from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} Browser name
   */
  _getBrowser(userAgent) {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'other';
  }

  /**
   * Generate executive summary
   * @param {object} analyticsData - Analytics data
   * @returns {object} Executive summary
   */
  _generateExecutiveSummary(analyticsData) {
    const { overview, trends } = analyticsData;
    
    return {
      headline: `${overview.totalSubmissions} total submissions with ${overview.conversionRate.toFixed(1)}% conversion rate`,
      keyInsights: [
        `Form completed by ${overview.completionRate.toFixed(1)}% of respondents`,
        `Average completion time: ${(overview.averageCompletionTime / 1000 / 60).toFixed(1)} minutes`,
        `${trends.growthRate > 0 ? 'Growing' : 'Declining'} trend with ${Math.abs(trends.growthRate).toFixed(1)}% change`
      ],
      status: this._determineFormStatus(overview, trends)
    };
  }

  /**
   * Determine form status based on metrics
   * @param {object} overview - Overview metrics
   * @param {object} trends - Trends data
   * @returns {string} Status
   */
  _determineFormStatus(overview, trends) {
    if (overview.conversionRate > 20 && trends.growthRate > 10) return 'excellent';
    if (overview.conversionRate > 10 && trends.growthRate > 0) return 'good';
    if (overview.conversionRate > 5) return 'average';
    return 'needs_improvement';
  }

  /**
   * Clear analytics cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;