class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 状态信号：生命值
    this.isInvincible = false; // 无敌状态
    this.hitCount = 0; // 受击次数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setDrag(500); // 添加阻力使移动更平滑

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(-100, 0); // 敌人向左移动
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1); // 碰到边界反弹

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 提示信息
    this.add.text(400, 550, '使用方向键移动玩家，碰到敌人会受伤并击退', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新状态文本
    this.updateStatusText();
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.hitCount++;
    this.health = Math.max(0, this.health - 10);

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退速度为160，计算击退距离（假设击退时间0.3秒）
    const knockbackSpeed = 160;
    const knockbackTime = 300; // 毫秒
    const knockbackDistance = (knockbackSpeed * knockbackTime) / 1000;

    // 计算击退终点
    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackTime,
      ease: 'Cubic.easeOut'
    });

    // 白色闪烁效果（1秒内闪烁5次）
    const flashDuration = 1000;
    const flashCount = 5;
    const flashInterval = flashDuration / (flashCount * 2);

    // 创建闪烁时间轴
    const timeline = this.tweens.createTimeline();

    for (let i = 0; i < flashCount; i++) {
      // 变白
      timeline.add({
        targets: player,
        tint: 0xffffff,
        duration: flashInterval,
        ease: 'Linear'
      });
      // 恢复原色
      timeline.add({
        targets: player,
        tint: 0x00ff00,
        duration: flashInterval,
        ease: 'Linear'
      });
    }

    timeline.play();

    // 1秒后恢复正常状态
    this.time.delayedCall(flashDuration, () => {
      this.isInvincible = false;
      player.setTint(0x00ff00); // 确保颜色恢复
    });

    // 控制台输出状态
    console.log(`Hit! Health: ${this.health}, Hit Count: ${this.hitCount}`);
  }

  updateStatusText() {
    this.statusText.setText([
      `Health: ${this.health}`,
      `Hit Count: ${this.hitCount}`,
      `Invincible: ${this.isInvincible ? 'YES' : 'NO'}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);