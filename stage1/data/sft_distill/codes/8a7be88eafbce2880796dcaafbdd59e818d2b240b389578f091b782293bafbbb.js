class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    
    // 状态变量
    this.skillCooldown = 0; // 当前冷却剩余时间（毫秒）
    this.maxCooldown = 3000; // 最大冷却时间 3 秒
    this.isSkillReady = true; // 技能是否可用
    this.skillUseCount = 0; // 技能使用次数（可验证状态）
    
    // 技能图标位置和大小
    this.skillIconX = 400;
    this.skillIconY = 300;
    this.skillIconRadius = 60;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能图标（底层）
    this.skillIconBase = this.add.graphics();
    this.drawSkillIcon(this.skillIconBase, 0x4a90e2, 1);

    // 创建冷却遮罩层
    this.cooldownMask = this.add.graphics();
    
    // 创建技能边框
    this.skillBorder = this.add.graphics();
    this.skillBorder.lineStyle(4, 0xffffff, 1);
    this.skillBorder.strokeCircle(this.skillIconX, this.skillIconY, this.skillIconRadius);

    // 冷却文本
    this.cooldownText = this.add.text(this.skillIconX, this.skillIconY, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    this.cooldownText.setOrigin(0.5);
    this.cooldownText.setVisible(false);

    // 状态显示文本
    this.statusText = this.add.text(400, 100, 'Click the skill icon to use skill', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 使用次数显示
    this.useCountText = this.add.text(400, 500, 'Skills used: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    });
    this.useCountText.setOrigin(0.5);

    // 提示文本
    this.add.text(400, 550, 'Cooldown: 3 seconds', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标点击
    this.input.on('pointerdown', (pointer) => {
      this.handleSkillClick(pointer.x, pointer.y);
    });

    // 鼠标悬停效果
    this.input.on('pointermove', (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        pointer.x, pointer.y,
        this.skillIconX, this.skillIconY
      );
      
      if (distance <= this.skillIconRadius) {
        this.input.setDefaultCursor('pointer');
      } else {
        this.input.setDefaultCursor('default');
      }
    });
  }

  drawSkillIcon(graphics, color, alpha) {
    graphics.clear();
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(this.skillIconX, this.skillIconY, this.skillIconRadius);
    
    // 绘制技能图标内部图案（闪电符号）
    graphics.fillStyle(0xffffff, alpha);
    graphics.fillTriangle(
      this.skillIconX - 10, this.skillIconY - 30,
      this.skillIconX - 10, this.skillIconY,
      this.skillIconX + 15, this.skillIconY - 15
    );
    graphics.fillTriangle(
      this.skillIconX + 10, this.skillIconY + 30,
      this.skillIconX + 10, this.skillIconY,
      this.skillIconX - 15, this.skillIconY + 15
    );
  }

  handleSkillClick(x, y) {
    // 检查点击是否在技能图标范围内
    const distance = Phaser.Math.Distance.Between(
      x, y,
      this.skillIconX, this.skillIconY
    );

    if (distance <= this.skillIconRadius && this.isSkillReady) {
      this.useSkill();
    }
  }

  useSkill() {
    // 释放技能
    this.isSkillReady = false;
    this.skillCooldown = this.maxCooldown;
    this.skillUseCount++;

    // 更新状态文本
    this.statusText.setText('Skill activated! Cooling down...');
    this.statusText.setColor('#ff6b6b');
    this.useCountText.setText(`Skills used: ${this.skillUseCount}`);

    // 显示冷却文本
    this.cooldownText.setVisible(true);

    // 创建技能效果动画（可选）
    this.createSkillEffect();

    // 启动冷却计时器
    this.time.addEvent({
      delay: this.maxCooldown,
      callback: this.onCooldownComplete,
      callbackScope: this
    });
  }

  createSkillEffect() {
    // 创建技能释放特效（扩散圆环）
    const effectCircle = this.add.graphics();
    effectCircle.lineStyle(3, 0xffff00, 1);
    effectCircle.strokeCircle(this.skillIconX, this.skillIconY, this.skillIconRadius);

    this.tweens.add({
      targets: effectCircle,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onUpdate: (tween) => {
        const progress = tween.progress;
        const radius = this.skillIconRadius + progress * 100;
        effectCircle.clear();
        effectCircle.lineStyle(3, 0xffff00, 1 - progress);
        effectCircle.strokeCircle(this.skillIconX, this.skillIconY, radius);
      },
      onComplete: () => {
        effectCircle.destroy();
      }
    });
  }

  onCooldownComplete() {
    // 冷却完成
    this.isSkillReady = true;
    this.skillCooldown = 0;
    this.cooldownText.setVisible(false);
    this.statusText.setText('Skill ready! Click to use');
    this.statusText.setColor('#00ff00');

    // 播放就绪动画
    this.tweens.add({
      targets: this.skillBorder,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    if (!this.isSkillReady) {
      // 更新冷却时间
      this.skillCooldown = Math.max(0, this.skillCooldown - delta);
      
      // 计算冷却进度 (0-1)
      const progress = 1 - (this.skillCooldown / this.maxCooldown);
      
      // 更新冷却文本
      const secondsLeft = Math.ceil(this.skillCooldown / 1000);
      this.cooldownText.setText(secondsLeft.toString());

      // 绘制冷却遮罩（灰色扇形）
      this.drawCooldownMask(progress);
    }
  }

  drawCooldownMask(progress) {
    this.cooldownMask.clear();
    
    // 绘制灰色遮罩（从上方开始顺时针扫过）
    if (progress < 1) {
      this.cooldownMask.fillStyle(0x000000, 0.6);
      
      // 计算扇形角度（从 -90 度开始，顺时针）
      const startAngle = -Math.PI / 2; // -90度（12点方向）
      const endAngle = startAngle + (1 - progress) * Math.PI * 2;
      
      // 绘制扇形遮罩
      this.cooldownMask.beginPath();
      this.cooldownMask.moveTo(this.skillIconX, this.skillIconY);
      this.cooldownMask.arc(
        this.skillIconX,
        this.skillIconY,
        this.skillIconRadius,
        startAngle,
        endAngle,
        false
      );
      this.cooldownMask.closePath();
      this.cooldownMask.fillPath();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SkillCooldownScene,
  parent: 'game-container'
};

new Phaser.Game(config);