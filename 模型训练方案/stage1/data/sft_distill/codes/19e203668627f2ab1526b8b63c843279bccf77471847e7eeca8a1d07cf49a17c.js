class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillAvailable = true;
    this.cooldownDuration = 1000; // 1秒冷却
    this.skillUseCount = 0; // 可验证的状态信号
    this.cooldownTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建技能按钮（红色圆形）
    this.skillButton = this.add.graphics();
    this.drawSkillButton();

    // 创建冷却遮罩
    this.cooldownMask = this.add.graphics();
    
    // 创建冷却进度条背景
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x444444, 1);
    progressBg.fillRect(300, 450, 200, 20);

    // 创建冷却进度条
    this.progressBar = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(400, 350, '技能就绪 - 点击鼠标左键释放', {
      fontSize: '20px',
      color: '#00ff00',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建冷却时间文本
    this.cooldownText = this.add.text(400, 480, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    });
    this.cooldownText.setOrigin(0.5);

    // 创建使用次数文本
    this.countText = this.add.text(400, 520, '技能使用次数: 0', {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    });
    this.countText.setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 50, '红色技能冷却系统', {
      fontSize: '28px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 100, '点击鼠标左键释放技能（1秒冷却）', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryUseSkill();
      }
    });

    // 添加键盘空格键作为备选触发方式
    this.input.keyboard.on('keydown-SPACE', () => {
      this.tryUseSkill();
    });
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    // 绘制技能按钮（红色圆形）
    if (this.skillAvailable) {
      this.skillButton.fillStyle(0xff0000, 1);
    } else {
      this.skillButton.fillStyle(0x660000, 0.5);
    }
    this.skillButton.fillCircle(400, 250, 60);

    // 绘制技能图标（闪电形状）
    this.skillButton.fillStyle(0xffff00, 1);
    this.skillButton.fillTriangle(
      400, 220,
      420, 250,
      410, 250
    );
    this.skillButton.fillTriangle(
      410, 250,
      380, 280,
      400, 260
    );

    // 绘制边框
    this.skillButton.lineStyle(3, this.skillAvailable ? 0xffffff : 0x444444, 1);
    this.skillButton.strokeCircle(400, 250, 60);
  }

  tryUseSkill() {
    if (!this.skillAvailable) {
      // 技能冷却中，显示提示
      this.statusText.setText('技能冷却中...');
      this.statusText.setColor('#ff0000');
      return;
    }

    // 释放技能
    this.useSkill();
  }

  useSkill() {
    // 增加使用次数
    this.skillUseCount++;
    this.countText.setText(`技能使用次数: ${this.skillUseCount}`);

    // 设置技能不可用
    this.skillAvailable = false;
    this.drawSkillButton();

    // 更新状态文本
    this.statusText.setText('技能释放！');
    this.statusText.setColor('#ffff00');

    // 创建技能释放特效
    this.createSkillEffect();

    // 启动冷却计时器
    this.startCooldown();
  }

  createSkillEffect() {
    // 创建技能释放的视觉特效（红色波纹扩散）
    const effect = this.add.graphics();
    let radius = 60;
    let alpha = 1;

    const effectTimer = this.time.addEvent({
      delay: 16,
      repeat: 30,
      callback: () => {
        effect.clear();
        effect.lineStyle(4, 0xff0000, alpha);
        effect.strokeCircle(400, 250, radius);
        
        radius += 5;
        alpha -= 0.033;
        
        if (alpha <= 0) {
          effect.destroy();
        }
      }
    });
  }

  startCooldown() {
    const startTime = this.time.now;

    // 清除之前的计时器（如果存在）
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 16, // 每帧更新
      repeat: Math.ceil(this.cooldownDuration / 16),
      callback: () => {
        const elapsed = this.time.now - startTime;
        const progress = Math.min(elapsed / this.cooldownDuration, 1);
        
        // 更新冷却遮罩
        this.updateCooldownMask(progress);
        
        // 更新进度条
        this.updateProgressBar(progress);
        
        // 更新冷却时间文本
        const remaining = Math.max(0, this.cooldownDuration - elapsed);
        this.cooldownText.setText(`冷却剩余: ${(remaining / 1000).toFixed(2)}秒`);
        
        // 冷却完成
        if (progress >= 1) {
          this.onCooldownComplete();
        }
      }
    });
  }

  updateCooldownMask(progress) {
    this.cooldownMask.clear();
    
    if (progress < 1) {
      // 绘制扇形遮罩（从上方顺时针减少）
      const angle = (1 - progress) * 360;
      this.cooldownMask.fillStyle(0x000000, 0.6);
      this.cooldownMask.slice(400, 250, 60, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + angle), false);
      this.cooldownMask.fillPath();
    }
  }

  updateProgressBar(progress) {
    this.progressBar.clear();
    
    // 根据进度改变颜色
    let color;
    if (progress < 0.5) {
      color = 0xff0000; // 红色
    } else if (progress < 0.8) {
      color = 0xff8800; // 橙色
    } else {
      color = 0x00ff00; // 绿色
    }
    
    this.progressBar.fillStyle(color, 1);
    this.progressBar.fillRect(300, 450, 200 * progress, 20);
  }

  onCooldownComplete() {
    // 重置技能状态
    this.skillAvailable = true;
    this.drawSkillButton();
    
    // 清除遮罩和进度条
    this.cooldownMask.clear();
    this.progressBar.clear();
    
    // 更新状态文本
    this.statusText.setText('技能就绪 - 点击鼠标左键释放');
    this.statusText.setColor('#00ff00');
    this.cooldownText.setText('');
    
    // 播放就绪提示动画
    this.tweens.add({
      targets: this.skillButton,
      alpha: { from: 0.5, to: 1 },
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 创建游戏实例
const game = new Phaser.Game(config);