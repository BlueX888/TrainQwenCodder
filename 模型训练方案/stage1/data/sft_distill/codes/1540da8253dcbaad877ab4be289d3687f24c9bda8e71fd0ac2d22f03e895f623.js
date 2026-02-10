class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 状态信号变量（可验证）
    this.skillUsedCount = 0; // 技能使用次数
    this.currentCooldown = 0; // 当前冷却时间（毫秒）
    this.isSkillReady = true; // 技能是否就绪
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家（使用 Graphics）
    this.createPlayer(width / 2, height / 2);
    
    // 创建冷却UI
    this.createCooldownUI();
    
    // 创建状态显示文本
    this.createStatusText();
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 技能冷却配置
    this.COOLDOWN_DURATION = 3000; // 3秒冷却
    this.cooldownTimer = null;
    this.skillEffects = []; // 存储技能特效
    
    // 添加说明文本
    this.add.text(10, 10, 'Press Arrow Keys to Use Green Skill', {
      fontSize: '18px',
      color: '#ffffff'
    });
  }

  createPlayer(x, y) {
    // 创建玩家图形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4444ff, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
    
    this.player = this.add.sprite(x, y, 'player');
  }

  createCooldownUI() {
    const uiX = 400;
    const uiY = 500;
    
    // 冷却进度条背景
    this.cooldownBg = this.add.graphics();
    this.cooldownBg.fillStyle(0x333333, 1);
    this.cooldownBg.fillRect(uiX - 150, uiY, 300, 30);
    
    // 冷却进度条（绿色）
    this.cooldownBar = this.add.graphics();
    
    // 冷却文本
    this.cooldownText = this.add.text(uiX, uiY + 15, 'READY', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  createStatusText() {
    // 状态信号显示
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '16px',
      color: '#ffff00'
    });
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Skills Used: ${this.skillUsedCount}`,
      `Cooldown: ${(this.currentCooldown / 1000).toFixed(2)}s`,
      `Ready: ${this.isSkillReady}`
    ]);
  }

  update(time, delta) {
    // 检测方向键输入
    if (this.isSkillReady) {
      if (this.cursors.up.isDown) {
        this.useSkill('up');
      } else if (this.cursors.down.isDown) {
        this.useSkill('down');
      } else if (this.cursors.left.isDown) {
        this.useSkill('left');
      } else if (this.cursors.right.isDown) {
        this.useSkill('right');
      }
    }
    
    // 更新冷却进度条
    if (this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      this.updateCooldownBar(progress);
      
      // 更新当前冷却时间
      this.currentCooldown = this.cooldownTimer.getRemaining();
      this.updateStatusText();
    }
    
    // 更新技能特效
    this.updateSkillEffects(delta);
  }

  useSkill(direction) {
    if (!this.isSkillReady) return;
    
    // 标记技能进入冷却
    this.isSkillReady = false;
    this.skillUsedCount++;
    
    // 创建技能特效
    this.createSkillEffect(direction);
    
    // 启动冷却计时器
    this.startCooldown();
    
    // 更新状态
    this.updateStatusText();
  }

  createSkillEffect(direction) {
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // 根据方向设置技能移动向量
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    
    const dir = directions[direction];
    
    // 创建绿色技能特效
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 15);
    graphics.generateTexture(`skill_${Date.now()}`, 30, 30);
    
    const skill = this.add.sprite(playerX, playerY, `skill_${Date.now()}`);
    skill.setAlpha(0.8);
    
    // 添加发光效果
    skill.setBlendMode(Phaser.BlendModes.ADD);
    
    graphics.destroy();
    
    // 存储技能数据
    this.skillEffects.push({
      sprite: skill,
      vx: dir.x * 300,
      vy: dir.y * 300,
      lifetime: 2000, // 2秒生命周期
      elapsed: 0
    });
  }

  updateSkillEffects(delta) {
    for (let i = this.skillEffects.length - 1; i >= 0; i--) {
      const effect = this.skillEffects[i];
      
      // 更新位置
      effect.sprite.x += effect.vx * delta / 1000;
      effect.sprite.y += effect.vy * delta / 1000;
      
      // 更新生命周期
      effect.elapsed += delta;
      
      // 淡出效果
      const fadeProgress = effect.elapsed / effect.lifetime;
      effect.sprite.setAlpha(0.8 * (1 - fadeProgress));
      
      // 移除过期特效
      if (effect.elapsed >= effect.lifetime) {
        effect.sprite.destroy();
        this.skillEffects.splice(i, 1);
      }
    }
  }

  startCooldown() {
    // 移除旧的计时器（如果存在）
    if (this.cooldownTimer) {
      this.cooldownTimer.remove();
    }
    
    // 创建新的冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.COOLDOWN_DURATION,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
    
    // 初始化冷却时间
    this.currentCooldown = this.COOLDOWN_DURATION;
  }

  onCooldownComplete() {
    // 技能冷却完成
    this.isSkillReady = true;
    this.currentCooldown = 0;
    this.cooldownTimer = null;
    
    // 更新UI
    this.cooldownText.setText('READY');
    this.cooldownText.setColor('#00ff00');
    this.cooldownBar.clear();
    
    // 更新状态
    this.updateStatusText();
    
    // 播放就绪提示动画
    this.tweens.add({
      targets: this.cooldownText,
      scale: { from: 1.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  updateCooldownBar(progress) {
    const barX = 250;
    const barY = 500;
    const barWidth = 300;
    const barHeight = 30;
    
    // 清除之前的进度条
    this.cooldownBar.clear();
    
    // 绘制当前进度（从满到空）
    const currentWidth = barWidth * (1 - progress);
    
    // 根据进度改变颜色（红->黄->绿）
    let color;
    if (progress < 0.33) {
      color = 0xff0000; // 红色
    } else if (progress < 0.66) {
      color = 0xffaa00; // 橙色
    } else {
      color = 0x00ff00; // 绿色
    }
    
    this.cooldownBar.fillStyle(color, 0.8);
    this.cooldownBar.fillRect(barX, barY, currentWidth, barHeight);
    
    // 更新冷却文本
    const remainingTime = (this.COOLDOWN_DURATION * (1 - progress) / 1000).toFixed(1);
    this.cooldownText.setText(`${remainingTime}s`);
    this.cooldownText.setColor('#ffffff');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);