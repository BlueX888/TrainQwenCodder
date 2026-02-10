// 成就系统完整实现
class AchievementScene extends Phaser.Scene {
  constructor() {
    super('AchievementScene');
    this.achievements = null;
    this.stats = null;
    this.achievementPopup = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化成就系统
    this.initAchievements();
    
    // 初始化玩家统计数据
    this.initStats();
    
    // 创建UI
    this.createUI();
    
    // 创建交互按钮
    this.createActionButtons();
    
    // 创建成就列表显示
    this.createAchievementList();
    
    // 添加重置按钮
    this.createResetButton();
  }

  initAchievements() {
    // 定义5个不同类型的成就
    const defaultAchievements = {
      'first_click': {
        id: 'first_click',
        name: '初次尝试',
        description: '点击按钮1次',
        target: 1,
        progress: 0,
        unlocked: false,
        icon: '🎯'
      },
      'click_master': {
        id: 'click_master',
        name: '点击大师',
        description: '累计点击10次',
        target: 10,
        progress: 0,
        unlocked: false,
        icon: '👆'
      },
      'score_hunter': {
        id: 'score_hunter',
        name: '分数猎人',
        description: '获得100分',
        target: 100,
        progress: 0,
        unlocked: false,
        icon: '⭐'
      },
      'combo_expert': {
        id: 'combo_expert',
        name: '连击专家',
        description: '达到5连击',
        target: 5,
        progress: 0,
        unlocked: false,
        icon: '🔥'
      },
      'time_survivor': {
        id: 'time_survivor',
        name: '时间幸存者',
        description: '游戏时长达到30秒',
        target: 30,
        progress: 0,
        unlocked: false,
        icon: '⏰'
      }
    };

    // 从localStorage加载成就数据
    const savedData = localStorage.getItem('phaser_achievements');
    if (savedData) {
      try {
        this.achievements = JSON.parse(savedData);
        // 确保所有成就都存在（处理新增成就的情况）
        Object.keys(defaultAchievements).forEach(key => {
          if (!this.achievements[key]) {
            this.achievements[key] = defaultAchievements[key];
          }
        });
      } catch (e) {
        this.achievements = defaultAchievements;
      }
    } else {
      this.achievements = defaultAchievements;
    }
  }

  initStats() {
    // 初始化玩家统计数据
    this.stats = {
      clicks: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      playTime: 0,
      lastClickTime: 0
    };

    // 从localStorage加载统计数据
    const savedStats = localStorage.getItem('phaser_stats');
    if (savedStats) {
      try {
        const loaded = JSON.parse(savedStats);
        this.stats = { ...this.stats, ...loaded };
      } catch (e) {
        console.log('Failed to load stats');
      }
    }

    // 开始计时
    this.time.addEvent({
      delay: 1000,
      callback: this.updatePlayTime,
      callbackScope: this,
      loop: true
    });

    // Combo重置计时器
    this.comboTimer = null;
  }

  updatePlayTime() {
    this.stats.playTime++;
    this.updateAchievementProgress('time_survivor', this.stats.playTime);
    this.updateStatsDisplay();
  }

  createUI() {
    // 标题
    const title = this.add.text(400, 30, '🏆 成就系统', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 统计信息面板
    this.statsText = this.add.text(400, 80, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(this.achievements).length;
    
    this.statsText.setText(
      `点击: ${this.stats.clicks} | 分数: ${this.stats.score} | 连击: ${this.stats.combo} (最高: ${this.stats.maxCombo})\n` +
      `游戏时长: ${this.stats.playTime}秒 | 成就: ${unlockedCount}/${totalCount}`
    );
  }

  createActionButtons() {
    const buttonY = 150;
    const buttonWidth = 150;
    const buttonHeight = 50;
    const spacing = 20;

    // 按钮1：增加点击和分数
    this.createButton(150, buttonY, buttonWidth, buttonHeight, '点击得分\n(+10分)', () => {
      this.handleClick();
    }, 0x4CAF50);

    // 按钮2：增加连击
    this.createButton(320, buttonY, buttonWidth, buttonHeight, '连击按钮\n(1秒内)', () => {
      this.handleComboClick();
    }, 0xFF9800);

    // 按钮3：快速得分
    this.createButton(490, buttonY, buttonWidth, buttonHeight, '快速得分\n(+20分)', () => {
      this.addScore(20);
    }, 0x2196F3);

    // 说明文字
    this.add.text(400, 220, '提示：点击按钮完成不同的成就目标', {
      fontSize: '14px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
  }

  createButton(x, y, width, height, text, callback, color) {
    // 按钮背景
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);

    // 按钮文字
    const btnText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 交互区域
    const zone = this.add.zone(x, y, width, height).setInteractive();
    
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
      bg.lineStyle(3, 0xffff00, 1);
      bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
    });

    zone.on('pointerdown', callback);

    return { bg, text: btnText, zone };
  }

  handleClick() {
    this.stats.clicks++;
    this.addScore(10);
    
    // 更新点击相关成就
    this.updateAchievementProgress('first_click', this.stats.clicks);
    this.updateAchievementProgress('click_master', this.stats.clicks);
    
    this.updateStatsDisplay();
  }

  handleComboClick() {
    const currentTime = this.time.now;
    const timeSinceLastClick = currentTime - this.stats.lastClickTime;

    // 1秒内点击算连击
    if (timeSinceLastClick < 1000 && timeSinceLastClick > 0) {
      this.stats.combo++;
      if (this.stats.combo > this.stats.maxCombo) {
        this.stats.maxCombo = this.stats.combo;
      }
      this.addScore(5 * this.stats.combo); // 连击加成
    } else {
      this.stats.combo = 1;
    }

    this.stats.lastClickTime = currentTime;
    this.stats.clicks++;

    // 更新连击成就
    this.updateAchievementProgress('combo_expert', this.stats.maxCombo);
    this.updateAchievementProgress('first_click', this.stats.clicks);
    this.updateAchievementProgress('click_master', this.stats.clicks);

    // 重置combo计时器
    if (this.comboTimer) {
      this.comboTimer.remove();
    }
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.stats.combo = 0;
      this.updateStatsDisplay();
    });

    this.updateStatsDisplay();
  }

  addScore(points) {
    this.stats.score += points;
    this.updateAchievementProgress('score_hunter', this.stats.score);
    this.updateStatsDisplay();
  }

  updateAchievementProgress(achievementId, newProgress) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.progress = newProgress;

    // 检查是否达成
    if (achievement.progress >= achievement.target) {
      this.unlockAchievement(achievementId);
    }

    this.saveData();
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.progress = achievement.target;

    // 显示成就弹窗
    this.showAchievementPopup(achievement);

    // 保存数据
    this.saveData();

    // 更新成就列表显示
    this.refreshAchievementList();
  }

  showAchievementPopup(achievement) {
    // 如果已有弹窗，先移除
    if (this.achievementPopup) {
      this.achievementPopup.destroy();
    }

    const popupWidth = 350;
    const popupHeight = 150;
    const popupX = 400;
    const popupY = 300;

    const container = this.add.container(popupX, popupY);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 0.95);
    bg.fillRoundedRect(-popupWidth/2, -popupHeight/2, popupWidth, popupHeight, 12);
    bg.lineStyle(4, 0xFFD700, 1);
    bg.strokeRoundedRect(-popupWidth/2, -popupHeight/2, popupWidth, popupHeight, 12);

    // 成就图标
    const icon = this.add.text(-popupWidth/2 + 40, 0, achievement.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // 成就解锁文字
    const unlockText = this.add.text(0, -40, '🎉 成就解锁！', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFD700'
    }).setOrigin(0.5);

    // 成就名称
    const nameText = this.add.text(0, -10, achievement.name, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 成就描述
    const descText = this.add.text(0, 15, achievement.description, {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 进度文字
    const progressText = this.add.text(0, 40, `${achievement.progress}/${achievement.target}`, {
      fontSize: '14px',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, icon, unlockText, nameText, descText, progressText]);

    // 动画效果
    container.setScale(0);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 3秒后自动关闭
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        scale: 0.8,
        duration: 200,
        onComplete: () => {
          container.destroy();
          this.achievementPopup = null;
        }
      });
    });

    this.achievementPopup = container;
  }

  createAchievementList() {
    const startY = 270;
    const itemHeight = 60;
    const listWidth = 700;

    this.add.