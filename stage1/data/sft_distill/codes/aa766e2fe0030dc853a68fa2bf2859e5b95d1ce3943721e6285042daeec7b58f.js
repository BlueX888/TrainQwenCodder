// 成就系统完整实现
class AchievementSystem {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    return [
      { id: 'first_click', name: '初次点击', desc: '点击任意位置', unlocked: false, icon: '👆' },
      { id: 'click_master', name: '点击大师', desc: '累计点击100次', unlocked: false, icon: '🖱️', progress: 0, target: 100 },
      { id: 'time_traveler', name: '时间旅行者', desc: '游戏运行30秒', unlocked: false, icon: '⏰', progress: 0, target: 30000 },
      { id: 'speed_clicker', name: '闪电手', desc: '1秒内点击5次', unlocked: false, icon: '⚡', progress: 0, target: 5 },
      { id: 'collector', name: '收集家', desc: '收集10个方块', unlocked: false, icon: '📦', progress: 0, target: 10 },
      { id: 'rainbow', name: '彩虹猎人', desc: '点击7种不同颜色', unlocked: false, icon: '🌈', progress: 0, target: 7 },
      { id: 'combo_starter', name: '连击新手', desc: '达成5连击', unlocked: false, icon: '🔥', progress: 0, target: 5 },
      { id: 'combo_master', name: '连击大师', desc: '达成20连击', unlocked: false, icon: '💥', progress: 0, target: 20 },
      { id: 'persistent', name: '坚持不懈', desc: '游戏运行2分钟', unlocked: false, icon: '💪', progress: 0, target: 120000 },
      { id: 'explorer', name: '探索者', desc: '点击所有四个角落', unlocked: false, icon: '🧭', progress: 0, target: 4 },
      { id: 'centurion', name: '百夫长', desc: '累计点击500次', unlocked: false, icon: '💯', progress: 0, target: 500 },
      { id: 'lucky_seven', name: '幸运七', desc: '点击7次后暂停7秒', unlocked: false, icon: '🍀' },
      { id: 'night_owl', name: '夜猫子', desc: '连续游戏5分钟', unlocked: false, icon: '🦉', progress: 0, target: 300000 },
      { id: 'completionist', name: '完美主义者', desc: '解锁所有其他成就', unlocked: false, icon: '👑' },
      { id: 'quick_start', name: '快速开始', desc: '开始游戏后5秒内点击10次', unlocked: false, icon: '🚀', progress: 0, target: 10 }
    ];
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach(ach => {
        const savedAch = data.find(s => s.id === ach.id);
        if (savedAch) {
          ach.unlocked = savedAch.unlocked;
          ach.progress = savedAch.progress || 0;
        }
      });
    }
  }

  saveProgress() {
    const data = this.achievements.map(ach => ({
      id: ach.id,
      unlocked: ach.unlocked,
      progress: ach.progress || 0
    }));
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  unlock(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.saveProgress();
      this.scene.showAchievementPopup(ach);
      this.checkCompletionist();
      return true;
    }
    return false;
  }

  updateProgress(id, value) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && ach.target) {
      ach.progress = value;
      if (ach.progress >= ach.target) {
        this.unlock(id);
      }
      this.saveProgress();
    }
  }

  checkCompletionist() {
    const otherAchs = this.achievements.filter(a => a.id !== 'completionist');
    const allUnlocked = otherAchs.every(a => a.unlocked);
    if (allUnlocked) {
      this.unlock('completionist');
    }
  }

  getUnlockedCount() {
    return this.achievements.filter(a => a.unlocked).length;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.startTime = 0;
    this.lastClickTime = 0;
    this.clicksInSecond = [];
    this.collectedBoxes = 0;
    this.clickedColors = new Set();
    this.combo = 0;
    this.lastComboTime = 0;
    this.cornersClicked = new Set();
    this.clickTimes = [];
    this.pauseStartTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.startTime = this.time.now;
    
    // 初始化成就系统
    this.achievementSystem = new AchievementSystem(this);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 30, '🏆 成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建状态显示
    this.statusText = this.add.text(20, 70, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });

    // 创建可收集的方块
    this.boxes = [];
    this.spawnBoxes();

    // 创建成就按钮
    this.createAchievementButton();

    // 输入处理
    this.input.on('pointerdown', this.handleClick, this);

    // 更新计时器
    this.time.addEvent({
      delay: 100,
      callback: this.updateStatus,
      callbackScope: this,
      loop: true
    });

    // 检查快速开始成就
    this.quickStartTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.quickStartExpired = true;
      }
    });
  }

  spawnBoxes() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];
    for (let i = 0; i < 15; i++) {
      const x = 100 + (i % 5) * 140;
      const y = 150 + Math.floor(i / 5) * 100;
      const color = colors[i % colors.length];
      
      const box = this.add.graphics();
      box.fillStyle(color, 1);
      box.fillRect(0, 0, 60, 60);
      box.setPosition(x, y);
      box.setInteractive(new Phaser.Geom.Rectangle(0, 0, 60, 60), Phaser.Geom.Rectangle.Contains);
      box.color = color;
      box.collected = false;
      
      this.boxes.push(box);
    }
  }

  handleClick(pointer) {
    const now = this.time.now;
    this.clickCount++;
    this.clickTimes.push(now);

    // 首次点击成就
    if (this.clickCount === 1) {
      this.achievementSystem.unlock('first_click');
    }

    // 点击大师
    this.achievementSystem.updateProgress('click_master', this.clickCount);

    // 百夫长
    this.achievementSystem.updateProgress('centurion', this.clickCount);

    // 快速开始
    if (!this.quickStartExpired) {
      this.achievementSystem.updateProgress('quick_start', this.clickCount);
    }

    // 闪电手 - 1秒内5次点击
    this.clicksInSecond = this.clicksInSecond.filter(t => now - t < 1000);
    this.clicksInSecond.push(now);
    if (this.clicksInSecond.length >= 5) {
      this.achievementSystem.unlock('speed_clicker');
    }

    // 连击系统
    if (now - this.lastComboTime < 1000) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastComboTime = now;

    this.achievementSystem.updateProgress('combo_starter', this.combo);
    this.achievementSystem.updateProgress('combo_master', this.combo);

    // 检查角落点击
    this.checkCornerClick(pointer);

    // 检查方块收集
    this.checkBoxCollection(pointer);

    // 幸运七检查
    if (this.clickCount === 7) {
      this.pauseStartTime = now;
    }
    if (this.pauseStartTime > 0 && now - this.lastClickTime > 7000 && this.clickCount === 7) {
      this.achievementSystem.unlock('lucky_seven');
      this.pauseStartTime = 0;
    }

    this.lastClickTime = now;
  }

  checkCornerClick(pointer) {
    const cornerSize = 100;
    const corners = [
      { x: 0, y: 0, id: 'tl' },
      { x: 800 - cornerSize, y: 0, id: 'tr' },
      { x: 0, y: 600 - cornerSize, id: 'bl' },
      { x: 800 - cornerSize, y: 600 - cornerSize, id: 'br' }
    ];

    corners.forEach(corner => {
      if (pointer.x >= corner.x && pointer.x < corner.x + cornerSize &&
          pointer.y >= corner.y && pointer.y < corner.y + cornerSize) {
        this.cornersClicked.add(corner.id);
      }
    });

    this.achievementSystem.updateProgress('explorer', this.cornersClicked.size);
  }

  checkBoxCollection(pointer) {
    this.boxes.forEach(box => {
      if (!box.collected && box.getBounds().contains(pointer.x, pointer.y)) {
        box.collected = true;
        box.setAlpha(0.3);
        this.collectedBoxes++;
        this.clickedColors.add(box.color);
        
        this.achievementSystem.updateProgress('collector', this.collectedBoxes);
        this.achievementSystem.updateProgress('rainbow', this.clickedColors.size);
      }
    });
  }

  updateStatus() {
    const elapsed = this.time.now - this.startTime;
    
    // 时间相关成就
    this.achievementSystem.updateProgress('time_traveler', elapsed);
    this.achievementSystem.updateProgress('persistent', elapsed);
    this.achievementSystem.updateProgress('night_owl', elapsed);

    // 更新状态文本
    const unlockedCount = this.achievementSystem.getUnlockedCount();
    this.statusText.setText([
      `点击次数: ${this.clickCount}`,
      `连击: ${this.combo}`,
      `收集方块: ${this.collectedBoxes}/10`,
      `颜色种类: ${this.clickedColors.size}/7`,
      `角落探索: ${this.cornersClicked.size}/4`,
      `游戏时长: ${Math.floor(elapsed / 1000)}秒`,
      `成就解锁: ${unlockedCount}/15`
    ]);
  }

  createAchievementButton() {
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x4a4a4a, 1);
    btnBg.fillRoundedRect(650, 70, 130, 40, 8);
    btnBg.setInteractive(new Phaser.Geom.Rectangle(650, 70, 130, 40), Phaser.Geom.Rectangle.Contains);
    
    const btnText = this.add.text(715, 90, '查看成就', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.showAchievementPanel();
    });

    btnBg.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x5a5a5a, 1);
      btnBg.fillRoundedRect(650, 70, 130, 40, 8);
    });

    btnBg.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x4a4a4a, 1);
      btnBg.fillRoundedRect(650, 70, 130, 40, 8);
    });
  }

  showAchievementPanel() {
    // 创建面板容器
    const panel = this.add.container(0, 0);
    
    // 半透明