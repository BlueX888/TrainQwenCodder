class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillAvailable = true;
    this.cooldownProgress = 0; // 0-1 表示冷却进度
    this.cooldownTimer = null;
    this.skillUseCount = 0; // 可验证状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 标题
    this.add.text(400, 50, 'Skill Cooldown System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 说明文字
    this.add.text(400, 100, 'Click Left Mouse Button to Use Skill', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建技能按钮（青色圆形）
    this.skillButton = this.add.graphics();
    this.drawSkillButton();

    // 技能按钮文字
    this.skillButtonText = this.add.text(400, 300, 'SKILL', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(250, 400, 300, 30);

    // 冷却进度条
    this.cooldownBar = this.add.graphics();

    // 冷却文本
    this.cooldownText = this.add.text(400, 450, 'Ready', {
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5);

    // 状态信息
    this.statusText = this.add.text(400, 500, 'Skills Used: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 提示信息
    this.hintText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#ff6b6b'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.useSkill();
      }
    });

    // 设置技能按钮交互区域
    const buttonZone = this.add.zone(400, 300, 120, 120).setInteractive();
    buttonZone.on('pointerover', () => {
      if (this.skillAvailable) {
        this.skillButtonText.setScale(1.1);
      }
    });
    buttonZone.on('pointerout', () => {
      this.skillButtonText.setScale(1);
    });
  }

  drawSkillButton() {
    this.skillButton.clear();
    
    if (this.skillAvailable) {
      // 可用状态 - 青色
      this.skillButton.fillStyle(0x00ffff, 1);
      this.skillButton.lineStyle(4, 0x00cccc, 1);
    } else {
      // 冷却状态 - 灰色
      this.skillButton.fillStyle(0x666666, 0.5);
      this.skillButton.lineStyle(4, 0x444444, 1);
    }
    
    this.skillButton.fillCircle(400, 300, 60);
    this.skillButton.strokeCircle(400, 300, 60);

    // 添加技能图标（简单的闪电形状）
    if (this.skillAvailable) {
      this.skillButton.fillStyle(0xffffff, 1);
    } else {
      this.skillButton.fillStyle(0x888888, 1);
    }
    this.skillButton.fillTriangle(
      400, 270,
      410, 290,
      395, 290
    );
    this.skillButton.fillTriangle(
      400, 330,
      390, 310,
      405, 310
    );
  }

  useSkill() {
    if (!this.skillAvailable) {
      this.hintText.setText('Skill on cooldown!');
      this.time.delayedCall(1000, () => {
        this.hintText.setText('');
      });
      return;
    }

    // 释放技能
    this.skillAvailable = false;
    this.cooldownProgress = 0;
    this.skillUseCount++;

    // 更新状态显示
    this.statusText.setText(`Skills Used: ${this.skillUseCount}`);
    this.hintText.setText('Skill Activated!');
    this.hintText.setColor('#00ff00');

    // 技能特效（青色闪光）
    this.createSkillEffect();

    // 更新按钮外观
    this.drawSkillButton();

    // 清除提示
    this.time.delayedCall(500, () => {
      this.hintText.setText('');
    });

    // 启动冷却计时器
    this.startCooldown();
  }

  createSkillEffect() {
    // 创建扩散的青色圆环特效
    const effect = this.add.graphics();
    let radius = 60;
    let alpha = 1;

    const effectTimer = this.time.addEvent({
      delay: 16,
      repeat: 30,
      callback: () => {
        effect.clear();
        effect.lineStyle(3, 0x00ffff, alpha);
        effect.strokeCircle(400, 300, radius);
        
        radius += 5;
        alpha -= 0.033;
        
        if (alpha <= 0) {
          effect.destroy();
        }
      }
    });
  }

  startCooldown() {
    const cooldownDuration = 3000; // 3秒
    const startTime = this.time.now;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: cooldownDuration,
      callback: () => {
        this.skillAvailable = true;
        this.cooldownProgress = 1;
        this.drawSkillButton();
        this.cooldownText.setText('Ready');
        this.cooldownText.setColor('#00ffff');
        
        // 恢复提示
        this.hintText.setText('Skill Ready!');
        this.hintText.setColor('#00ff00');
        this.time.delayedCall(1000, () => {
          this.hintText.setText('');
        });
      }
    });

    // 在 update 中更新进度
    this.cooldownStartTime = startTime;
    this.cooldownDuration = cooldownDuration;
  }

  update(time, delta) {
    // 更新冷却进度
    if (!this.skillAvailable && this.cooldownStartTime) {
      const elapsed = time - this.cooldownStartTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);

      // 更新进度条
      this.cooldownBar.clear();
      this.cooldownBar.fillStyle(0x00ffff, 0.8);
      this.cooldownBar.fillRect(250, 400, 300 * this.cooldownProgress, 30);

      // 更新冷却文本
      const remaining = Math.ceil((this.cooldownDuration - elapsed) / 1000);
      if (remaining > 0) {
        this.cooldownText.setText(`Cooldown: ${remaining}s`);
        this.cooldownText.setColor('#ff6b6b');
      }

      // 添加进度百分比
      const percentage = Math.floor(this.cooldownProgress * 100);
      if (percentage < 100) {
        this.cooldownText.setText(`Cooldown: ${remaining}s (${percentage}%)`);
      }
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