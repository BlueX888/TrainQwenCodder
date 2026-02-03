class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillCooldown = 0; // 冷却剩余时间（毫秒）
    this.maxCooldown = 3000; // 最大冷却时间 3秒
    this.isSkillReady = true; // 技能是否就绪
    this.skillCount = 0; // 已释放技能次数（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家（蓝色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillRect(-25, -25, 50, 50);
    this.player.x = width / 2;
    this.player.y = height / 2;

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(width / 2 - 150, 50, 300, 30);

    // 创建冷却进度条前景
    this.cooldownBarFg = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(width / 2, 100, '', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(width / 2, height - 50, 
      '按方向键释放绿色技能 | 冷却时间: 3秒', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 技能计数显示
    this.countText = this.add.text(20, 20, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 技能特效容器
    this.skillEffects = [];

    this.updateStatusDisplay();
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.skillCooldown > 0) {
      this.skillCooldown = Math.max(0, this.skillCooldown - delta);
      
      if (this.skillCooldown === 0) {
        this.isSkillReady = true;
      }
      
      this.updateCooldownBar();
      this.updateStatusDisplay();
    }

    // 检测方向键输入
    if (this.isSkillReady) {
      let skillDirection = null;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        skillDirection = { x: 0, y: -1, name: '上' };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        skillDirection = { x: 0, y: 1, name: '下' };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        skillDirection = { x: -1, y: 0, name: '左' };
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        skillDirection = { x: 1, y: 0, name: '右' };
      }

      if (skillDirection) {
        this.castSkill(skillDirection);
      }
    }

    // 更新技能特效
    this.updateSkillEffects(delta);
  }

  castSkill(direction) {
    // 释放技能
    this.isSkillReady = false;
    this.skillCooldown = this.maxCooldown;
    this.skillCount++;

    // 创建技能特效（绿色圆形）
    const skillEffect = {
      graphics: this.add.graphics(),
      x: this.player.x,
      y: this.player.y,
      vx: direction.x * 300, // 速度
      vy: direction.y * 300,
      lifetime: 2000, // 存活时间
      elapsed: 0,
      radius: 20
    };

    // 绘制绿色圆形
    skillEffect.graphics.fillStyle(0x00ff00, 0.8);
    skillEffect.graphics.fillCircle(0, 0, skillEffect.radius);
    skillEffect.graphics.setPosition(skillEffect.x, skillEffect.y);

    this.skillEffects.push(skillEffect);

    // 显示释放信息
    const releaseText = this.add.text(this.player.x, this.player.y - 50, 
      `技能释放: ${direction.name}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 文本淡出效果
    this.tweens.add({
      targets: releaseText,
      alpha: 0,
      y: releaseText.y - 30,
      duration: 1000,
      onComplete: () => releaseText.destroy()
    });

    this.updateStatusDisplay();
    this.updateCooldownBar();
  }

  updateSkillEffects(delta) {
    for (let i = this.skillEffects.length - 1; i >= 0; i--) {
      const effect = this.skillEffects[i];
      effect.elapsed += delta;

      if (effect.elapsed >= effect.lifetime) {
        // 移除过期特效
        effect.graphics.destroy();
        this.skillEffects.splice(i, 1);
      } else {
        // 更新位置
        effect.x += effect.vx * (delta / 1000);
        effect.y += effect.vy * (delta / 1000);
        effect.graphics.setPosition(effect.x, effect.y);

        // 淡出效果
        const alpha = 1 - (effect.elapsed / effect.lifetime);
        effect.graphics.setAlpha(alpha);
      }
    }
  }

  updateCooldownBar() {
    this.cooldownBarFg.clear();

    if (this.skillCooldown > 0) {
      const progress = this.skillCooldown / this.maxCooldown;
      const barWidth = 300 * (1 - progress);

      // 绿色进度条表示冷却恢复
      this.cooldownBarFg.fillStyle(0x00ff00, 0.8);
      this.cooldownBarFg.fillRect(
        this.cameras.main.width / 2 - 150, 
        50, 
        barWidth, 
        30
      );
    } else {
      // 满状态显示完整绿色
      this.cooldownBarFg.fillStyle(0x00ff00, 1);
      this.cooldownBarFg.fillRect(
        this.cameras.main.width / 2 - 150, 
        50, 
        300, 
        30
      );
    }
  }

  updateStatusDisplay() {
    if (this.isSkillReady) {
      this.statusText.setText('技能就绪！按方向键释放');
      this.statusText.setColor('#00ff00');
    } else {
      const remainingSeconds = (this.skillCooldown / 1000).toFixed(1);
      this.statusText.setText(`冷却中... ${remainingSeconds}秒`);
      this.statusText.setColor('#ff0000');
    }

    this.countText.setText(`已释放技能: ${this.skillCount} 次`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SkillCooldownScene
};

new Phaser.Game(config);