class SkillCooldownScene extends Phaser.Scene {
  constructor() {
    super('SkillCooldownScene');
    this.skillOnCooldown = false;
    this.cooldownProgress = 0;
    this.cooldownDuration = 2000; // 2秒冷却
    this.skillUseCount = 0; // 可验证的状态信号
    this.lastSkillTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建玩家（中心位置）
    this.player = this.add.graphics();
    this.player.fillStyle(0x0000ff, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = width / 2;
    this.player.y = height / 2;

    // 创建技能容器（用于存储飞出的技能特效）
    this.skills = [];

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(width / 2 - 100, 50, 200, 20);

    // 创建冷却进度条前景
    this.cooldownBar = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(width / 2, 90, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建使用次数文本
    this.countText = this.add.text(width / 2, 120, 'Skills Used: 0', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    });
    this.countText.setOrigin(0.5);

    // 创建说明文本
    this.instructionText = this.add.text(width / 2, height - 30, 
      'Press Arrow Keys to Release Green Skills', {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化冷却计时器引用
    this.cooldownTimer = null;

    // 更新初始状态
    this.updateStatus();
  }

  update(time, delta) {
    // 检测方向键按下并释放技能
    if (!this.skillOnCooldown) {
      let direction = null;
      let velocityX = 0;
      let velocityY = 0;

      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        direction = 'UP';
        velocityY = -300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        direction = 'DOWN';
        velocityY = 300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        direction = 'LEFT';
        velocityX = -300;
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        direction = 'RIGHT';
        velocityX = 300;
      }

      if (direction) {
        this.releaseSkill(velocityX, velocityY);
      }
    }

    // 更新技能位置
    for (let i = this.skills.length - 1; i >= 0; i--) {
      const skill = this.skills[i];
      skill.x += skill.velocityX * delta / 1000;
      skill.y += skill.velocityY * delta / 1000;

      // 移除超出屏幕的技能
      if (skill.x < -50 || skill.x > this.cameras.main.width + 50 ||
          skill.y < -50 || skill.y > this.cameras.main.height + 50) {
        skill.destroy();
        this.skills.splice(i, 1);
      }
    }

    // 更新冷却进度条
    if (this.skillOnCooldown) {
      const elapsed = time - this.lastSkillTime;
      this.cooldownProgress = Math.min(elapsed / this.cooldownDuration, 1);
      this.updateCooldownBar();
    }
  }

  releaseSkill(velocityX, velocityY) {
    // 创建绿色技能特效
    const skill = this.add.graphics();
    skill.fillStyle(0x00ff00, 1);
    skill.fillCircle(0, 0, 15);
    skill.x = this.player.x;
    skill.y = this.player.y;
    skill.velocityX = velocityX;
    skill.velocityY = velocityY;

    // 添加发光效果
    skill.lineStyle(3, 0x00ff00, 0.5);
    skill.strokeCircle(0, 0, 18);

    this.skills.push(skill);

    // 增加使用次数
    this.skillUseCount++;
    this.countText.setText(`Skills Used: ${this.skillUseCount}`);

    // 启动冷却
    this.startCooldown();
  }

  startCooldown() {
    this.skillOnCooldown = true;
    this.lastSkillTime = this.time.now;
    this.cooldownProgress = 0;

    // 清除之前的计时器（如果存在）
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownDuration,
      callback: () => {
        this.skillOnCooldown = false;
        this.cooldownProgress = 1;
        this.updateCooldownBar();
        this.updateStatus();
      },
      callbackScope: this
    });

    this.updateStatus();
  }

  updateCooldownBar() {
    this.cooldownBar.clear();
    
    if (this.skillOnCooldown) {
      // 显示剩余冷却时间（红色到绿色渐变）
      const remaining = 1 - this.cooldownProgress;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        100,
        this.cooldownProgress * 100
      );
      
      this.cooldownBar.fillStyle(
        Phaser.Display.Color.GetColor(color.r, color.g, color.b),
        1
      );
      this.cooldownBar.fillRect(
        this.cameras.main.width / 2 - 100,
        50,
        200 * this.cooldownProgress,
        20
      );
    } else {
      // 完全冷却完成，显示绿色
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(
        this.cameras.main.width / 2 - 100,
        50,
        200,
        20
      );
    }
  }

  updateStatus() {
    if (this.skillOnCooldown) {
      const remaining = (this.cooldownDuration - (this.time.now - this.lastSkillTime)) / 1000;
      this.statusText.setText(`Cooldown: ${remaining.toFixed(1)}s`);
      this.statusText.setColor('#ff0000');
    } else {
      this.statusText.setText('Skill Ready!');
      this.statusText.setColor('#00ff00');
    }
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