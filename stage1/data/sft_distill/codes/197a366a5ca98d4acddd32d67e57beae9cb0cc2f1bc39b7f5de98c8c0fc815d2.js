// 成就系统游戏
class AchievementScene extends Phaser.Scene {
  constructor() {
    super('AchievementScene');
    
    // 成就定义
    this.achievements = [
      { id: 'first_click', name: '初次尝试', desc: '点击屏幕1次', target: 1, current: 0, unlocked: false },
      { id: 'click_master', name: '点击大师', desc: '点击屏幕50次', target: 50, current: 0, unlocked: false },
      { id: 'time_traveler', name: '时间旅行者', desc: '游戏运行30秒', target: 30, current: 0, unlocked: false },
      { id: 'key_warrior', name: '键盘战士', desc: '按下20次空格键', target: 20, current: 0, unlocked: false },
      { id: 'explorer', name: '探索者', desc: '移动总距离超过5000像素', target: 5000, current: 0, unlocked: false },
      { id: 'collector', name: '收藏家', desc: '收集10个星星', target: 10, current: 0, unlocked: false },
      { id: 'combo_king', name: '连击之王', desc: '达成5连击', target: 5, current: 0, unlocked: false },
      { id: 'persistent', name: '坚持不懈', desc: '重置进度3次', target: 3, current: 0, unlocked: false }
    ];
    
    this.stats = {
      clicks: 0,
      spacePressed: 0,
      totalDistance: 0,
      starsCollected: 0,
      combo: 0,
      resetCount: 0,
      startTime: 0
    };
    
    this.playerX = 400;
    this.playerY = 300;
    this.lastX = 400;
    this.lastY = 300;
    
    this.stars = [];
    this.comboTimer = 0;
    this.comboTimeout = 2000; // 2秒内连击有效
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 加载成就进度
    this.loadAchievements();
    
    // 创建纹理
    this.createTextures();
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 创建玩家（可移动的方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff88, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 创建星星
    this.createStars();
    
    // 创建UI
    this.createUI();
    
    // 输入设置
    this.input.on('pointerdown', this.handleClick, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 记录开始时间
    this.stats.startTime = Date.now();
    
    // 创建成就弹窗容器（初始隐藏）
    this.achievementPopup = null;
  }

  createTextures() {
    // 创建星星纹理
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    starGraphics.fillStar(16, 16, 5, 8, 16);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();
  }

  createStars() {
    // 随机生成星星位置
    const positions = [
      { x: 100, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 500 },
      { x: 700, y: 500 }, { x: 400, y: 100 }, { x: 400, y: 500 },
      { x: 100, y: 300 }, { x: 700, y: 300 }, { x: 200, y: 200 },
      { x: 600, y: 400 }
    ];
    
    positions.forEach(pos => {
      const star = this.add.sprite(pos.x, pos.y, 'star');
      star.active = true;
      this.stars.push(star);
    });
  }

  createUI() {
    // 标题
    this.add.text(400, 20, '成就系统演示', {
      fontSize: '28px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 操作提示
    const instructions = [
      '操作说明：',
      '• 方向键移动玩家',
      '• 点击屏幕增加点击数',
      '• 按空格键增加按键数',
      '• 收集黄色星星',
      '• 快速连续点击达成连击',
      '• 按R键重置进度'
    ];
    
    this.add.text(20, 50, instructions.join('\n'), {
      fontSize: '14px',
      fill: '#aaa'
    });
    
    // 成就进度显示
    this.achievementTexts = [];
    this.achievements.forEach((ach, index) => {
      const y = 200 + index * 45;
      const text = this.add.text(20, y, '', {
        fontSize: '12px',
        fill: '#fff'
      });
      this.achievementTexts.push(text);
    });
    
    // 统计信息
    this.statsText = this.add.text(20, 550, '', {
      fontSize: '14px',
      fill: '#0ff'
    });
  }

  handleClick(pointer) {
    this.stats.clicks++;
    this.updateAchievement('first_click', this.stats.clicks);
    this.updateAchievement('click_master', this.stats.clicks);
    
    // 连击检测
    const now = Date.now();
    if (now - this.comboTimer < this.comboTimeout) {
      this.stats.combo++;
      this.updateAchievement('combo_king', this.stats.combo);
    } else {
      this.stats.combo = 1;
    }
    this.comboTimer = now;
    
    // 视觉反馈
    const circle = this.add.graphics();
    circle.lineStyle(2, 0x00ffff, 1);
    circle.strokeCircle(pointer.x, pointer.y, 20);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      scale: 2,
      duration: 500,
      onComplete: () => circle.destroy()
    });
  }

  update(time, delta) {
    // 键盘移动
    const speed = 3;
    this.lastX = this.playerX;
    this.lastY = this.playerY;
    
    if (this.cursors.left.isDown) {
      this.playerX -= speed;
    } else if (this.cursors.right.isDown) {
      this.playerX += speed;
    }
    
    if (this.cursors.up.isDown) {
      this.playerY -= speed;
    } else if (this.cursors.down.isDown) {
      this.playerY += speed;
    }
    
    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 580);
    
    // 计算移动距离
    const distance = Phaser.Math.Distance.Between(
      this.lastX, this.lastY, this.playerX, this.playerY
    );
    this.stats.totalDistance += distance;
    this.updateAchievement('explorer', Math.floor(this.stats.totalDistance));
    
    this.player.x = this.playerX;
    this.player.y = this.playerY;
    
    // 空格键检测
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.stats.spacePressed++;
      this.updateAchievement('key_warrior', this.stats.spacePressed);
    }
    
    // 重置键检测
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.resetProgress();
    }
    
    // 星星收集检测
    this.stars.forEach(star => {
      if (star.active) {
        const dist = Phaser.Math.Distance.Between(
          this.playerX, this.playerY, star.x, star.y
        );
        if (dist < 30) {
          star.active = false;
          star.setAlpha(0.3);
          this.stats.starsCollected++;
          this.updateAchievement('collector', this.stats.starsCollected);
        }
      }
    });
    
    // 时间成就检测
    const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000);
    this.updateAchievement('time_traveler', elapsed);
    
    // 更新UI
    this.updateUI();
    
    // 连击超时重置
    if (Date.now() - this.comboTimer > this.comboTimeout && this.stats.combo > 0) {
      this.stats.combo = 0;
    }
  }

  updateAchievement(id, currentValue) {
    const ach = this.achievements.find(a => a.id === id);
    if (!ach || ach.unlocked) return;
    
    ach.current = currentValue;
    
    if (ach.current >= ach.target && !ach.unlocked) {
      ach.unlocked = true;
      this.showAchievementPopup(ach);
      this.saveAchievements();
    }
  }

  showAchievementPopup(achievement) {
    // 如果已有弹窗，先销毁
    if (this.achievementPopup) {
      this.achievementPopup.destroy();
    }
    
    // 创建弹窗容器
    this.achievementPopup = this.add.container(400, -100);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d4a2b, 1);
    bg.fillRoundedRect(-180, -50, 360, 100, 10);
    bg.lineStyle(3, 0x4ecca3, 1);
    bg.strokeRoundedRect(-180, -50, 360, 100, 10);
    
    // 图标（奖杯）
    const icon = this.add.graphics();
    icon.fillStyle(0xffd700, 1);
    icon.fillCircle(-140, 0, 20);
    icon.fillRect(-145, 0, 10, 20);
    icon.fillRect(-155, 18, 30, 8);
    
    // 文字
    const title = this.add.text(0, -20, '🏆 成就解锁！', {
      fontSize: '20px',
      fill: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const name = this.add.text(0, 5, achievement.name, {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const desc = this.add.text(0, 25, achievement.desc, {
      fontSize: '14px',
      fill: '#aaa'
    }).setOrigin(0.5);
    
    this.achievementPopup.add([bg, icon, title, name, desc]);
    
    // 动画：滑入 -> 停留 -> 滑出
    this.tweens.add({
      targets: this.achievementPopup,
      y: 80,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: this.achievementPopup,
            y: -100,
            alpha: 0,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
              if (this.achievementPopup) {
                this.achievementPopup.destroy();
                this.achievementPopup = null;
              }
            }
          });
        });
      }
    });
  }

  updateUI() {
    // 更新成就列表
    this.achievements.forEach((ach, index) => {
      const progress = Math.min(ach.current, ach.target);
      const percent = Math.floor((progress / ach.target) * 100);
      const status = ach.unlocked ? '✓ ' : '';
      const color = ach.unlocked ? '#4ecca3' : '#fff';
      
      this.achievementTexts[index].setText(
        `${status}${ach.name}: ${progress}/${ach.target} (${percent}%)`
      );
      this.achievementTexts[index].setColor(color);
    });