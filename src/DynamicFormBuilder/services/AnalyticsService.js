// services/AnalyticsService.js
import formService from './FormService';
import submissionService from './SubmissionService';
import { groupBy, sortBy } from '../utils';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive form analytics
   */
  async getFormAnalytics(formId) {
    try {
      // Check cache first
      const cacheKey = `form_analytics_${formId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const submissions = await submissionService.getFormSubmissions(formId);

      const analytics = {
        basic: this.getBasicMetrics(form, submissions),
        temporal: this.getTemporalAnalytics(submissions),
        fields: this.getFieldAnalytics(submissions, form.fields),
        conversion: this.getConversionMetrics(form, submissions),
        completion: this.getCompletionAnalytics(submissions, form.fields)
      };

      // Cache results
      this.setCache(cacheKey, analytics);

      return analytics;
    } catch (error) {
      console.error('Error getting form analytics:', error);
      throw error;
    }
  }

  /**
   * Get basic form metrics
   */
  getBasicMetrics(form, submissions) {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSubmissions = submissions.filter(s => 
      new Date(s.submittedAt) >= last30Days
    );

    const weeklySubmissions = submissions.filter(s => 
      new Date(s.submittedAt) >= last7Days
    );

    return {
      totalSubmissions: submissions.length,
      submissionsLast30Days: recentSubmissions.length,
      submissionsLast7Days: weeklySubmissions.length,
      averagePerDay: submissions.length > 0 
        ? (submissions.length / this.getDaysSinceCreation(form.createdAt)).toFixed(2)
        : 0,
      conversionRate: form.views > 0 
        ? ((submissions.length / form.views) * 100).toFixed(2)
        : 0,
      lastSubmission: submissions.length > 0 ? submissions[0].submittedAt : null
    };
  }

  /**
   * Get temporal analytics (submissions over time)
   */
  getTemporalAnalytics(submissions) {
    const submissionsByDay = this.groupByDay(submissions);
    const submissionsByHour = this.groupByHour(submissions);
    const submissionsByWeek = this.groupByWeek(submissions);

    return {
      daily: submissionsByDay,
      hourly: submissionsByHour,
      weekly: submissionsByWeek,
      peakDay: this.getPeakPeriod(submissionsByDay),
      peakHour: this.getPeakPeriod(submissionsByHour)
    };
  }

  /**
   * Get field-level analytics
   */
  getFieldAnalytics(submissions, fields) {
    const fieldAnalytics = {};

    fields.forEach(field => {
      const fieldData = submissions.map(s => s.data[field.name]).filter(v => v !== undefined);
      
      fieldAnalytics[field.name] = {
        label: field.label,
        type: field.type,
        completionRate: ((fieldData.length / submissions.length) * 100).toFixed(2),
        totalResponses: fieldData.length,
        uniqueValues: this.getUniqueValueCount(fieldData, field.type),
        mostCommonValue: this.getMostCommonValue(fieldData, field.type),
        averageLength: this.getAverageLength(fieldData, field.type)
      };
    });

    return fieldAnalytics;
  }

  /**
   * Get conversion metrics
   */
  getConversionMetrics(form, submissions) {
    const totalViews = form.views || 0;
    const totalSubmissions = submissions.length;
    
    return {
      views: totalViews,
      submissions: totalSubmissions,
      conversionRate: totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(2) : 0,
      dropoffRate: totalViews > 0 ? (((totalViews - totalSubmissions) / totalViews) * 100).toFixed(2) : 0,
      viewsToSubmissionRatio: totalSubmissions > 0 ? (totalViews / totalSubmissions).toFixed(2) : 0
    };
  }

  /**
   * Get completion analytics
   */
  getCompletionAnalytics(submissions, fields) {
    if (submissions.length === 0) {
      return {
        averageCompletionRate: 0,
        fieldDropoffRates: {},
        completionFunnel: []
      };
    }

    const fieldDropoffRates = {};
    const completionFunnel = [];

    fields.forEach((field, index) => {
      const completedCount = submissions.filter(s => {
        const value = s.data[field.name];
        return value !== undefined && value !== null && value !== '';
      }).length;

      const completionRate = (completedCount / submissions.length) * 100;
      const dropoffRate = 100 - completionRate;

      fieldDropoffRates[field.name] = {
        label: field.label,
        position: index + 1,
        completionRate: completionRate.toFixed(2),
        dropoffRate: dropoffRate.toFixed(2),
        completedCount
      };

      completionFunnel.push({
        step: index + 1,
        fieldName: field.name,
        fieldLabel: field.label,
        completionRate: completionRate.toFixed(2),
        retainedUsers: completedCount
      });
    });

    const averageCompletionRate = fields.length > 0
      ? (Object.values(fieldDropoffRates).reduce((sum, field) => 
          sum + parseFloat(field.completionRate), 0) / fields.length).toFixed(2)
      : 0;

    return {
      averageCompletionRate,
      fieldDropoffRates,
      completionFunnel
    };
  }

  /**
   * Get user analytics (if user data available)
   */
  async getUserAnalytics(userId) {
    try {
      const forms = await formService.getUserForms(userId);
      const totalSubmissions = forms.reduce((sum, form) => sum + (form.submissionCount || 0), 0);
      const totalViews = forms.reduce((sum, form) => sum + (form.views || 0), 0);

      return {
        totalForms: forms.length,
        publishedForms: forms.filter(f => f.status === 'published').length,
        draftForms: forms.filter(f => f.status === 'draft').length,
        totalSubmissions,
        totalViews,
        averageSubmissionsPerForm: forms.length > 0 ? (totalSubmissions / forms.length).toFixed(2) : 0,
        overallConversionRate: totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(2) : 0,
        topPerformingForms: forms
          .sort((a, b) => (b.submissionCount || 0) - (a.submissionCount || 0))
          .slice(0, 5)
          .map(f => ({
            id: f.id,
            title: f.title,
            submissions: f.submissionCount || 0,
            views: f.views || 0
          }))
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Group submissions by day
   */
  groupByDay(submissions) {
    const grouped = {};
    submissions.forEach(submission => {
      const date = new Date(submission.submittedAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Group submissions by hour
   */
  groupByHour(submissions) {
    const grouped = {};
    submissions.forEach(submission => {
      const hour = new Date(submission.submittedAt).getHours();
      grouped[hour] = (grouped[hour] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Group submissions by week
   */
  groupByWeek(submissions) {
    const grouped = {};
    submissions.forEach(submission => {
      const date = new Date(submission.submittedAt);
      const week = this.getWeekNumber(date);
      const year = date.getFullYear();
      const key = `${year}-W${week}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Get peak period from grouped data
   */
  getPeakPeriod(groupedData) {
    const entries = Object.entries(groupedData);
    if (entries.length === 0) return null;
    
    return entries.reduce((peak, current) => 
      current[1] > peak[1] ? current : peak
    );
  }

  /**
   * Get unique value count for field
   */
  getUniqueValueCount(values, fieldType) {
    if (fieldType === 'checkbox') {
      const allValues = values.flat();
      return new Set(allValues).size;
    }
    return new Set(values).size;
  }

  /**
   * Get most common value for field
   */
  getMostCommonValue(values, fieldType) {
    if (values.length === 0) return null;

    const valueCounts = {};
    
    if (fieldType === 'checkbox') {
      values.flat().forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
    } else {
      values.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
    }

    return Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  /**
   * Get average length for text fields
   */
  getAverageLength(values, fieldType) {
    if (!['text', 'textarea', 'email'].includes(fieldType)) return null;
    
    const lengths = values.filter(v => typeof v === 'string').map(v => v.length);
    return lengths.length > 0 ? (lengths.reduce((sum, len) => sum + len, 0) / lengths.length).toFixed(2) : 0;
  }

  /**
   * Get days since form creation
   */
  getDaysSinceCreation(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get week number
   */
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(formId, format = 'summary') {
    try {
      const analytics = await this.getFormAnalytics(formId);
      const form = await formService.getForm(formId);

      if (format === 'detailed') {
        return {
          formInfo: {
            id: form.id,
            title: form.title,
            createdAt: form.createdAt,
            status: form.status
          },
          ...analytics,
          generatedAt: new Date().toISOString()
        };
      }

      // Summary format
      return {
        formTitle: form.title,
        totalSubmissions: analytics.basic.totalSubmissions,
        conversionRate: analytics.basic.conversionRate,
        averagePerDay: analytics.basic.averagePerDay,
        topPerformingFields: Object.entries(analytics.fields)
          .sort((a, b) => parseFloat(b[1].completionRate) - parseFloat(a[1].completionRate))
          .slice(0, 3)
          .map(([name, data]) => ({
            name: data.label,
            completionRate: data.completionRate
          })),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;