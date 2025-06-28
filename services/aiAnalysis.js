const axios = require('axios');
const logger = require('../utils/logger');

class AIAnalysisService {
  constructor() {
    this.endpoint = process.env.AI_MODEL_ENDPOINT || 'http://localhost:8000/predict';
    this.batchSize = parseInt(process.env.AI_BATCH_SIZE) || 10;
  }

  // Analyze video for work quality and activity detection
  async analyzeVideo(videoPath, sessionId) {
    try {
      logger.info(`Starting AI analysis for session: ${sessionId}`);

      // For now, we'll simulate AI analysis
      // In production, this would call your actual AI model endpoint
      const analysisResult = await this.callAIModel(videoPath);

      // Process and structure the results
      const processedResult = this.processAnalysisResult(analysisResult, sessionId);

      logger.info(`AI analysis completed for session: ${sessionId}`);

      return processedResult;
    } catch (error) {
      logger.error(`AI analysis failed for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Call AI model endpoint
  async callAIModel(videoPath) {
    try {
      // This is a placeholder for the actual AI model call
      // In production, you would send the video to your AI service
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI analysis result
      return {
        workQuality: this.getRandomQuality(),
        activities: this.getRandomActivities(),
        idleTime: Math.floor(Math.random() * 3600), // 0-3600 seconds
        activeTime: Math.floor(Math.random() * 28800), // 0-8 hours
        confidenceScore: 0.7 + Math.random() * 0.3, // 0.7-1.0
        detailedAnalysis: {
          motionDetection: {
            totalFrames: 86400, // 8 hours at 30fps
            motionFrames: Math.floor(Math.random() * 86400),
            averageMotion: Math.random() * 100
          },
          activityClassification: {
            plastering: Math.random() * 100,
            drilling: Math.random() * 100,
            painting: Math.random() * 100,
            idle: Math.random() * 100
          },
          qualityMetrics: {
            consistency: Math.random() * 100,
            speed: Math.random() * 100,
            accuracy: Math.random() * 100
          }
        }
      };
    } catch (error) {
      logger.error('Error calling AI model:', error);
      throw error;
    }
  }

  // Process AI analysis results
  processAnalysisResult(aiResult, sessionId) {
    const {
      workQuality,
      activities,
      idleTime,
      activeTime,
      confidenceScore,
      detailedAnalysis
    } = aiResult;

    // Calculate efficiency score
    const totalTime = idleTime + activeTime;
    const efficiencyScore = totalTime > 0 ? (activeTime / totalTime) * 100 : 0;

    // Calculate quality score based on detailed metrics
    const qualityScore = (
      detailedAnalysis.qualityMetrics.consistency * 0.4 +
      detailedAnalysis.qualityMetrics.speed * 0.3 +
      detailedAnalysis.qualityMetrics.accuracy * 0.3
    );

    return {
      sessionId,
      workQuality,
      activityDetected: activities,
      idleTime,
      activeTime,
      totalTime,
      qualityScore: Math.round(qualityScore * 100) / 100,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      confidenceScore: Math.round(confidenceScore * 10000) / 10000,
      analysisData: detailedAnalysis,
      processedAt: new Date().toISOString()
    };
  }

  // Batch process multiple videos
  async batchAnalyze(videos) {
    try {
      logger.info(`Starting batch analysis for ${videos.length} videos`);

      const results = [];
      const batches = this.chunkArray(videos, this.batchSize);

      for (const batch of batches) {
        const batchPromises = batch.map(video => 
          this.analyzeVideo(video.path, video.sessionId)
        );

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            logger.error(`Batch analysis failed for video ${batch[index].sessionId}:`, result.reason);
          }
        });

        // Add delay between batches to prevent overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info(`Batch analysis completed. Processed ${results.length} videos successfully`);
      return results;
    } catch (error) {
      logger.error('Batch analysis failed:', error);
      throw error;
    }
  }

  // Helper methods
  getRandomQuality() {
    const qualities = ['excellent', 'good', 'average', 'below_average', 'poor'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }

  getRandomActivities() {
    const allActivities = ['plastering', 'drilling', 'painting', 'welding', 'lifting', 'walking', 'idle'];
    const numActivities = Math.floor(Math.random() * 4) + 1;
    const activities = [];
    
    for (let i = 0; i < numActivities; i++) {
      const activity = allActivities[Math.floor(Math.random() * allActivities.length)];
      if (!activities.includes(activity)) {
        activities.push(activity);
      }
    }
    
    return activities;
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Get performance insights from analysis
  getPerformanceInsights(analysisResult) {
    const insights = [];

    if (analysisResult.idleTime > analysisResult.activeTime * 0.3) {
      insights.push('High idle time detected - consider task reassignment');
    }

    if (analysisResult.qualityScore < 70) {
      insights.push('Work quality below standard - training may be needed');
    }

    if (analysisResult.efficiencyScore < 60) {
      insights.push('Low efficiency detected - review work methods');
    }

    if (analysisResult.confidenceScore < 0.8) {
      insights.push('Low confidence in analysis - manual review recommended');
    }

    return insights;
  }

  // Generate recommendations based on analysis
  generateRecommendations(analysisResult) {
    const recommendations = [];

    if (analysisResult.workQuality === 'poor' || analysisResult.workQuality === 'below_average') {
      recommendations.push('Schedule additional training sessions');
      recommendations.push('Provide more detailed work instructions');
    }

    if (analysisResult.idleTime > 1800) { // More than 30 minutes idle
      recommendations.push('Review task allocation and workflow');
      recommendations.push('Consider providing additional tools or materials');
    }

    if (analysisResult.efficiencyScore > 85) {
      recommendations.push('Worker performing excellently - consider recognition');
      recommendations.push('Use as example for training other workers');
    }

    return recommendations;
  }
}

module.exports = new AIAnalysisService(); 