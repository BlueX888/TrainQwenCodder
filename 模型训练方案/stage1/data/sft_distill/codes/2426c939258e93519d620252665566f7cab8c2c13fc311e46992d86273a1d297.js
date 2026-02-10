// 成就系统完整实现
class AchievementSystem {
  constructor() {
    this.achievements = [
      { id: 'first_click', name: '初次尝试', desc: '点击屏幕1次', target: 1, current: 0, unlocked: false },
      { id: 'click_master', name: '点击大师', desc: '点击屏幕50次', target: 50, current: 0, unlocked: false },
      { id: 'circle_collector', name: '圆形收集者', desc: '收集10个圆形', target: 10, current: 0, unlocked: false },
      { id: 'square_hunter', name: '方块猎人', desc: '收集10个方块', target: 10, current: 0, unlocked: false },
      { id: 'combo_starter', name: '连击新手', desc: '达成5连击', target: 5, current: 0, unlocked: false },
      { id: 'combo_expert', name: '连击专家', desc: '达成20连击', target: 20, current: 0, unlocked: false },
      { id: 'score_100', name: '百分达人', desc: '分数达到100', target: 100, current: 0, unlocked: false },
      { id: 'score_500', name: '五百强者', desc: '分数达到500', target: 500, current: 0, unlocked: false },
      { id: 'time_survivor', name: '时间生存者', desc: '游戏时长达到60秒', target: 60, current: 0, unlocked: false },
      { id: 'speed_demon', name: '速度恶魔', desc: '10秒内收集15个物体', target: 15, current: 0, unlocked: false },
      { id: 'perfectionist', name: '完美主义者', desc: '连续收集30个不失误', target: 30, current: 0, unlocked: false },
      { id: 'achievement_hunter', name: '成就猎人', desc: '解锁10个成就', target: 10, current: 0, unlocked: false }
    ];
    
    this.loadFromStorage();
  }
  
  loadFromStorage() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.achievements.forEach((ach, index) => {
          if (data[index]) {
            ach.current = data[index].current || 0;
            ach.unlocked = data[index].unlocked || false;
          }
        });
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }
  
  saveToStorage() {
    const data = this.achievements.map(ach => ({
      id: ach.id,
      current: ach.current,
      unlocked: ach.unlocked
    }));
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }
  
  updateProgress(id, value) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.current = value;
      if (ach.current >= ach.target) {
        return this.unlock(id);
      }
    }
    return null;
  }
  
  unlock(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.current = ach.target;
      this.saveToStorage();
      
      // 检查成就猎人成就
      const unlockedCount = this.achievements.filter(a => a.unlocked).length;
      if (unlockedCount >= 10) {
        const hunterAch = this.achievements.find(a => a.id === 'achievement_hunter');
        if (hunterAch && !hunterAch.unlocked) {
          hunterAch.unlocked = true;
          this.saveToStorage();
        }
      }
      
      return ach;
    }
    return null;
  }
  
  getProgress(id) {
    const ach = this.achievements.find(a => a.id === id);
    return ach ? ach.current : 0;
  }
  
  getUnlockedCount() {
    return this.achievements.filter(a => a.unlocked).length;
  }
  
  reset() {
    this.achievements.forEach(ach => {
      ach.current = 0;
      ach.unlocked = false;
    });
    this.saveToStorage();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.achievementSystem = new AchievementSystem();
    
    // 游戏状态
    this.score = 0;
    this.clickCount = 0;
    this.circleCount = 0;
    this.squareCount = 0;
    this.combo = 0;
    this.perfectStreak = 0;
    this.gameTime = 0;
    this.speedChallengeCount = 0;
    this.speedChallengeStartTime = 0;
    
    // UI状态
    this.showingAchievementPanel = false;
  }
  
  preload() {
    // 创建纹理
    this.createTextures();
  }
  
  createTextures() {
    // 圆形纹理
    const circleGraphics = this.add.graphics();
    circleGraphics.fillStyle(0x00ff00, 1);
    circleGraphics.fillCircle(16, 16, 16);
    circleGraphics.generateTexture('circle', 32, 32);
    circleGraphics.destroy();
    
    // 方块纹理
    const squareGraphics = this.add.graphics();
    squareGraphics.fillStyle(0xff0000, 1);
    squareGraphics.fillRect(0, 0, 32, 32);
    squareGraphics.generateTexture('square', 32, 32);
    squareGraphics.destroy();
  }
  
  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // UI文本
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });
    
    this.comboText = this.add.text(10, 40, 'Combo: 0', {
      fontSize: '18px',
      color: '#ffff00'
    });
    
    this.timeText = this.add.text(10, 70, 'Time: 0s', {
      fontSize: '18px',
      color: '#00ffff'
    });
    
    this.achievementCountText = this.add.text(10, 100, `Achievements: ${this.achievementSystem.getUnlockedCount()}/12`, {
      fontSize: '18px',
      color: '#ff00ff'
    });
    
    // 按钮
    this.createButton(650, 20, 'Show Achievements', () => this.toggleAchievementPanel());
    this.createButton(650, 70, 'Reset Progress', () => this.resetProgress());
    
    // 提示文本
    this.add.text(400, 550, 'Click to collect shapes and unlock achievements!', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // 输入事件
    this.input.on('pointerdown', (pointer) => this.handleClick(pointer));
    
    // 生成收集物
    this.time.addEvent({
      delay: 1000,
      callback: () => this.spawnCollectible(),
      loop: true
    });
    
    // 游戏时间计时器
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime++;
        this.timeText.setText(`Time: ${this.gameTime}s`);
        this.checkAchievement('time_survivor', this.gameTime);
      },
      loop: true
    });
    
    // Combo衰减
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.combo > 0) {
          this.combo = Math.max(0, this.combo - 1);
          this.updateComboText();
        }
      },
      loop: true
    });
    
    // 收集物数组
    this.collectibles = [];
    
    // 初始生成几个收集物
    for (let i = 0; i < 5; i++) {
      this.spawnCollectible();
    }
  }
  
  createButton(x, y, text, callback) {
    const bg = this.add.graphics();
    bg.fillStyle(0x4a4a6a, 1);
    bg.fillRoundedRect(x, y, 140, 35, 5);
    
    const buttonText = this.add.text(x + 70, y + 17, text, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(x + 70, y + 17, 140, 35);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', callback);
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6a6a8a, 1);
      bg.fillRoundedRect(x, y, 140, 35, 5);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a4a6a, 1);
      bg.fillRoundedRect(x, y, 140, 35, 5);
    });
  }
  
  spawnCollectible() {
    const type = Math.random() > 0.5 ? 'circle' : 'square';
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(150, 500);
    
    const sprite = this.add.sprite(x, y, type);
    sprite.setData('type', type);
    sprite.setInteractive();
    sprite.setScale(0);
    
    // 出现动画
    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.collectibles.push(sprite);
    
    // 自动消失
    this.time.delayedCall(5000, () => {
      if (sprite.active) {
        this.removeCollectible(sprite, false);
      }
    });
  }
  
  handleClick(pointer) {
    this.clickCount++;
    this.checkAchievement('first_click', this.clickCount);
    this.checkAchievement('click_master', this.clickCount);
    
    // 检查是否点击到收集物
    let collected = false;
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      if (collectible.active) {
        const bounds = collectible.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          this.collectCollectible(collectible);
          collected = true;
          break;
        }
      }
    }
    
    if (!collected) {
      // 未命中，重置连击和完美连击
      this.combo = 0;
      this.perfectStreak = 0;
      this.updateComboText();
    }
  }
  
  collectCollectible(sprite) {
    const type = sprite.getData('type');
    
    // 更新分数和连击
    this.score += 10;
    this.combo++;
    this.perfectStreak++;
    this.scoreText.setText(`Score: ${this.score}`);
    this.updateComboText();
    
    // 速度挑战计数
    const currentTime = this.gameTime;
    if (currentTime - this.speedChallengeStartTime > 10) {
      this.speedChallengeStartTime = currentTime;
      this.speedChallengeCount = 0;
    }
    this.speedChallengeCount++;
    
    // 收集物计数
    if (type === 'circle') {
      this.circleCount++;
      this.checkAchievement('circle_collector', this.circleCount);
    } else {
      this.squareCount++;
      this.checkAchievement('square_hunter', this.squareCount);
    }
    
    // 检查成就
    this.checkAchievement('combo_starter', this.combo);
    this.checkAchievement('combo_expert', this.combo);
    this.checkAchievement('score_100', this.score);
    this.checkAchievement('score_500', this.score);
    this.checkAchievement('speed_demon', this.speedChallengeCount);
    this.checkAchievement('perfectionist', this.perfectStreak);
    
    // 收集动画
    this.tweens.add({
      targets: sprite,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.removeCollectible(sprite, true);
      }
    });
  }
  
  removeCollectible(sprite, collected) {
    const index = this.collectibles.indexOf(sprite);
    if (index > -1) {
      this.collectibles.splice(index, 1);
    }
    sprite.destroy();
    
    if (!collected) {
      // 物体消失未收集，重置完美连击
      this.perfectStreak = 0;
    }
  }
  
  updateComboText() {
    this.