// 成就系统完整实现
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlocked();
  }

  initAchievements() {
    return [
      { id: 'first_click', name: '初次点击', desc: '点击屏幕1次', target: 1, stat: 'clicks' },
      { id: 'click_master', name: '点击大师', desc: '点击屏幕100次', target: 100, stat: 'clicks' },
      { id: 'speed_clicker', name: '极速点击', desc: '1秒内点击10次', target: 10, stat: 'clicksPerSecond' },
      { id: 'survivor_10', name: '生存者', desc: '存活10秒', target: 10, stat: 'survivalTime' },
      { id: 'survivor_60', name: '持久战士', desc: '存活60秒', target: 60, stat: 'survivalTime' },
      { id: 'combo_5', name: '连击新手', desc: '达成5连击', target: 5, stat: 'maxCombo' },
      { id: 'combo_20', name: '连击大师', desc: '达成20连击', target: 20, stat: 'maxCombo' },
      { id: 'space_press', name: '空格探索者', desc: '按下空格键1次', target: 1, stat: 'spacePress' },
      { id: 'space_master', name: '空格狂魔', desc: '按下空格键50次', target: 50, stat: 'spacePress' },
      { id: 'arrow_explorer', name: '方向探索', desc: '使用所有方向键', target: 4, stat: 'arrowKeys' },
      { id: 'left_clicker', name: '左侧点击', desc: '点击屏幕左半部分20次', target: 20, stat: 'leftClicks' },
      { id: 'right_clicker', name: '右侧点击', desc: '点击屏幕右半部分20次', target: 20, stat: 'rightClicks' },
      { id: 'corner_hunter', name: '角落猎人', desc: '点击四个角落', target: 4, stat: 'corners' },
      { id: 'center_lover', name: '中心爱好者', desc: '点击中心区域30次', target: 30, stat: 'centerClicks' },
      { id: 'rapid_fire', name: '速射手', desc: '0.5秒内点击5次', target: 5, stat: 'rapidClicks' },
      { id: 'patient', name: '耐心玩家', desc: '5秒不点击', target: 5, stat: 'idleTime' },
      { id: 'keyboard_warrior', name: '键盘战士', desc: '按下任意键100次', target: 100, stat: 'keyPresses' },
      { id: 'mouse_marathon', name: '鼠标马拉松', desc: '移动鼠标超过10000像素', target: 10000, stat: 'mouseDistance' },
      { id: 'achievement_hunter', name: '成就猎人', desc: '解锁10个成就', target: 10, stat: 'achievementsUnlocked' },
      { id: 'completionist', name: '完美主义者', desc: '解锁所有成就', target: 19, stat: 'achievementsUnlocked' }
    ];
  }

  loadStats() {
    const saved = localStorage.getItem('phaser_achievement_stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      clicks: 0,
      clicksPerSecond: 0,
      survivalTime: 0,
      maxCombo: 0,
      currentCombo: 0,
      lastClickTime: 0,
      spacePress: 0,
      arrowKeys: 0,
      arrowKeysPressed: new Set(),
      leftClicks: 0,
      rightClicks: 0,
      corners: 0,
      cornersVisited: new Set(),
      centerClicks: 0,
      rapidClicks: 0,
      rapidClickTimes: [],
      idleTime: 0,
      lastActionTime: Date.now(),
      keyPresses: 0,
      mouseDistance: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      achievementsUnlocked: 0,
      clickTimesLastSecond: []
    };
  }

  loadUnlocked() {
    const saved = localStorage.getItem('phaser_achievements_unlocked');
    if (saved) {
      return new Set(JSON.parse(saved));
    }
    return new Set();
  }

  saveStats() {
    const statsToSave = { ...this.stats };
    delete statsToSave.arrowKeysPressed;
    delete statsToSave.cornersVisited;
    delete statsToSave.clickTimesLastSecond;
    delete statsToSave.rapidClickTimes;
    localStorage.setItem('phaser_achievement_stats', JSON.stringify(statsToSave));
  }

  saveUnlocked() {
    localStorage.setItem('phaser_achievements_unlocked', JSON.stringify([...this.unlockedAchievements]));
  }

  updateStat(stat, value) {
    this.stats[stat] = value;
    this.checkAchievements();
    this.saveStats();
  }

  incrementStat(stat, amount = 1) {
    this.stats[stat] = (this.stats[stat] || 0) + amount;
    this.checkAchievements();
    this.saveStats();
  }

  checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!this.unlockedAchievements.has(achievement.id)) {
        const currentValue = this.stats[achievement.stat] || 0;
        if (currentValue >= achievement.target) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }

  unlockAchievement(achievement) {
    this.unlockedAchievements.add(achievement.id);
    this.stats.achievementsUnlocked = this.unlockedAchievements.size;
    this.saveUnlocked();
    this.saveStats();
    this.scene.showAchievementPopup(achievement);
    this.checkAchievements(); // 递归检查成就猎人等成就
  }

  getProgress(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    const current = this.stats[achievement.stat] || 0;
    return Math.min(current / achievement.target, 1);
  }

  isUnlocked(achievementId) {
    return this.unlockedAchievements.has(achievementId);
  }

  reset() {
    localStorage.removeItem('phaser_achievement_stats');
    localStorage.removeItem('phaser_achievements_unlocked');
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlocked();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.achievementManager = null;
    this.popupQueue = [];
    this.currentPopup = null;
    this.showingList = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化成就管理器
    this.achievementManager = new AchievementManager(this);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建游戏区域
    this.createGameArea();

    // 创建UI
    this.createUI();

    // 设置输入监听
    this.setupInput();

    // 启动计时器
    this.startTime = Date.now();
    this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });

    // 检查空闲时间
    this.time.addEvent({
      delay: 100,
      callback: this.checkIdleTime,
      callbackScope: this,
      loop: true
    });
  }

  createGameArea() {
    // 创建可点击区域
    const area = this.add.graphics();
    area.fillStyle(0x16213e, 1);
    area.fillRect(50, 50, 700, 450);

    // 添加提示文字
    const title = this.add.text(400, 100, '成就系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hint = this.add.text(400, 150, '点击屏幕、按键盘、移动鼠标来解锁成就！', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 显示统计信息
    this.statsText = this.add.text(400, 250, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatsDisplay();
  }

  createUI() {
    // 创建成就列表按钮
    const listBtn = this.add.graphics();
    listBtn.fillStyle(0x0f3460, 1);
    listBtn.fillRoundedRect(10, 520, 150, 40, 5);
    listBtn.setInteractive(new Phaser.Geom.Rectangle(10, 520, 150, 40), Phaser.Geom.Rectangle.Contains);
    listBtn.on('pointerdown', () => this.toggleAchievementList());

    const listBtnText = this.add.text(85, 540, '成就列表', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建重置按钮
    const resetBtn = this.add.graphics();
    resetBtn.fillStyle(0x533483, 1);
    resetBtn.fillRoundedRect(640, 520, 150, 40, 5);
    resetBtn.setInteractive(new Phaser.Geom.Rectangle(640, 520, 150, 40), Phaser.Geom.Rectangle.Contains);
    resetBtn.on('pointerdown', () => this.resetProgress());

    const resetBtnText = this.add.text(715, 540, '重置进度', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 成就计数显示
    this.achievementCountText = this.add.text(400, 540, '', {
      fontSize: '18px',
      color: '#e94560',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.updateAchievementCount();
  }

  setupInput() {
    // 鼠标点击
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer.x, pointer.y);
    });

    // 鼠标移动
    this.input.on('pointermove', (pointer) => {
      this.handleMouseMove(pointer.x, pointer.y);
    });

    // 键盘输入
    this.input.keyboard.on('keydown', (event) => {
      this.handleKeyPress(event.key);
    });

    // 方向键
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleClick(x, y) {
    const stats = this.achievementManager.stats;
    const now = Date.now();

    // 更新基础点击统计
    this.achievementManager.incrementStat('clicks');
    stats.lastActionTime = now;

    // 检查连击
    if (now - stats.lastClickTime < 1000) {
      stats.currentCombo++;
      stats.maxCombo = Math.max(stats.maxCombo, stats.currentCombo);
    } else {
      stats.currentCombo = 1;
    }
    stats.lastClickTime = now;

    // 每秒点击次数
    stats.clickTimesLastSecond = stats.clickTimesLastSecond || [];
    stats.clickTimesLastSecond.push(now);
    stats.clickTimesLastSecond = stats.clickTimesLastSecond.filter(t => now - t < 1000);
    stats.clicksPerSecond = Math.max(stats.clicksPerSecond || 0, stats.clickTimesLastSecond.length);

    // 快速点击检测
    stats.rapidClickTimes = stats.rapidClickTimes || [];
    stats.rapidClickTimes.push(now);
    stats.rapidClickTimes = stats.rapidClickTimes.filter(t => now - t < 500);
    stats.rapidClicks = Math.max(stats.rapidClicks || 0, stats.rapidClickTimes.length);

    // 左右点击
    if (x < 400) {
      this.achievementManager.incrementStat('leftClicks');
    } else {
      this.achievementManager.incrementStat('rightClicks');
    }

    // 中心点击
    if (Math.abs(x - 400) < 100 && Math.abs(y - 300) < 100) {
      this.achievementManager.incrementStat('centerClicks');
    }

    // 角落点击
    stats.cornersVis