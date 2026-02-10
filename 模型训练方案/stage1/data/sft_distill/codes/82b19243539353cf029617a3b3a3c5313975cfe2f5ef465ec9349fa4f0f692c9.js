class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.skillCooldown = 2000; // 2秒冷却时间
    this.isSkillReady = true;
    this.cooldownTimer = null;
    this.skillUsedCount = 0; // 可验证的状态信号
    this.projectiles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家（绿色方块）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = width / 2;
    this.player.y = height / 2;

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(width / 2 - 100, 50, 200, 20);

    // 创建冷却进度条
    this.cooldownBar = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(width / 2, 20, '技能就绪 | 使用次数: 0', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建冷却百分比文本
    this.cooldownText = this.add.text(width / 2, 60, '', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    });
    this.cooldownText.setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(width / 2, height - 30, '按方向键释放技能', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 创建弹丸容器
    this.projectilesGroup = this.add.group();
  }

  update(time, delta) {
    // 检测方向键输入并释放技能
    if (this.isSkillReady) {
      let direction = null;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.up.isDown) {
        direction = 'up';
        velocityY = -300;
      } else if (this.cursors.down.isDown) {
        direction = 'down';
        velocityY = 300;
      } else if (this.cursors.left.isDown) {
        direction = 'left';
        velocityX = -300;
      } else if (this.cursors.right.isDown) {
        direction = 'right';
        velocityX = 300;
      }

      if (direction) {
        this.releaseSkill(velocityX, velocityY);
      }
    }

    // 更新冷却进度条
    if (!this.isSkillReady && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      const remainingTime = this.cooldownTimer.getRemaining();
      
      this.updateCooldownBar(progress);
      this.cooldownText.setText(`冷却中: ${(remainingTime / 1000).toFixed(1)}s`);
    }

    // 更新弹丸位置
    this.updateProjectiles(delta);
  }

  releaseSkill(velocityX, velocityY) {
    // 创建绿色弹丸
    const projectile = this.add.graphics();
    projectile.fillStyle(0x00ff00, 1);
    projectile.fillCircle(0, 0, 10);
    projectile.x = this.player.x;
    projectile.y = this.player.y;
    projectile.velocityX = velocityX;
    projectile.velocityY = velocityY;
    projectile.lifeTime = 0;
    projectile.maxLifeTime = 2000; // 弹丸存活2秒

    this.projectiles.push(projectile);
    this.projectilesGroup.add(projectile);

    // 增加使用次数
    this.skillUsedCount++;

    // 开始冷却
    this.startCooldown();

    // 更新状态文本
    this.statusText.setText(`冷却中 | 使用次数: ${this.skillUsedCount}`);
    this.statusText.setColor('#ff0000');
  }

  startCooldown() {
    this.isSkillReady = false;

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.skillCooldown,
      callback: this.onCooldownComplete,
      callbackScope: this,
      loop: false
    });
  }

  onCooldownComplete() {
    this.isSkillReady = true;
    this.cooldownTimer = null;

    // 清空进度条
    this.cooldownBar.clear();
    this.cooldownText.setText('');

    // 更新状态文本
    this.statusText.setText(`技能就绪 | 使用次数: ${this.skillUsedCount}`);
    this.statusText.setColor('#00ff00');
  }

  updateCooldownBar(progress) {
    const { width } = this.cameras.main;
    const barWidth = 200;
    const barHeight = 20;
    const barX = width / 2 - 100;
    const barY = 50;

    this.cooldownBar.clear();
    
    // 绘制进度（从满到空）
    const currentWidth = barWidth * (1 - progress);
    this.cooldownBar.fillStyle(0x00ff00, 0.8);
    this.cooldownBar.fillRect(barX, barY, currentWidth, barHeight);
  }

  updateProjectiles(delta) {
    // 更新所有弹丸
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // 更新位置
      projectile.x += projectile.velocityX * delta / 1000;
      projectile.y += projectile.velocityY * delta / 1000;

      // 更新生命时间
      projectile.lifeTime += delta;

      // 检查是否超出屏幕或生命时间结束
      const { width, height } = this.cameras.main;
      if (projectile.x < -20 || projectile.x > width + 20 ||
          projectile.y < -20 || projectile.y > height + 20 ||
          projectile.lifeTime >= projectile.maxLifeTime) {
        
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);