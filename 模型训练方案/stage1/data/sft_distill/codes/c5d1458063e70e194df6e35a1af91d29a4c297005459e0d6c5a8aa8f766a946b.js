class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0;
    this.isInvincible = false;
  }

  preload() {
    // 创建青色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建青色玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 0);
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.onHit, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onHit(player, enemy) {
    // 如果处于无敌状态，不触发效果
    if (this.isInvincible) {
      return;
    }

    // 增加受击次数
    this.hitCount++;
    this.isInvincible = true;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 击退距离与速度160相关（速度160对应击退距离80）
    const knockbackDistance = 80;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画（0.3秒完成击退）
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 闪烁效果：4秒内持续闪烁
    const blinkDuration = 4000; // 4秒
    const blinkInterval = 100; // 每100ms切换一次
    let blinkCount = 0;
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换可见性
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 4秒后停止闪烁
        if (blinkCount >= maxBlinks) {
          player.alpha = 1;
          this.isInvincible = false;
          blinkTimer.destroy();
          this.updateStatusText();
        }
      },
      loop: true
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? 'YES (闪烁中)' : 'NO';
    this.statusText.setText(
      `受击次数: ${this.hitCount}\n` +
      `无敌状态: ${invincibleStatus}\n` +
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `使用方向键移动角色`
    );
  }

  update(time, delta) {
    // 只有非无敌状态或击退动画完成后才能移动
    if (!this.isInvincible || this.player.alpha === 1) {
      const speed = 200;

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      } else {
        this.player.setVelocityY(0);
      }
    }

    // 更新状态显示
    if (time % 100 < delta) {
      this.updateStatusText();
    }
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