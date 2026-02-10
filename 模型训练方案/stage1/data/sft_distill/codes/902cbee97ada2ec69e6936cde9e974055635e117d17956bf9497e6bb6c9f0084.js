class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证状态
    this.isHurt = false; // 无敌状态标记
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 使用Graphics生成纹理，不依赖外部资源
  }

  create() {
    // 创建粉色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff69b4, 1); // 粉色
    playerGraphics.fillCircle(25, 25, 25);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setVelocity(100, 50);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

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
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 提示信息
    this.add.text(400, 550, '使用方向键移动粉色角色，碰撞红色敌人触发受伤效果', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  handleHit(player, enemy) {
    // 如果正在受伤状态（无敌时间），忽略碰撞
    if (this.isHurt) {
      return;
    }

    // 标记受伤状态
    this.isHurt = true;
    this.health -= 10;
    this.hitCount += 1;
    this.updateStatusText();

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 基于速度160计算击退距离
    const knockbackSpeed = 160;
    const knockbackDuration = 300; // 击退持续时间（毫秒）
    const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;

    // 计算击退目标位置
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackDuration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退结束后可以继续移动
      }
    });

    // 闪烁效果 - 2.5秒内闪烁
    const blinkDuration = 2500; // 2.5秒
    const blinkInterval = 100; // 每100ms切换一次
    let blinkCount = 0;
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换透明度（闪烁效果）
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 2.5秒后结束闪烁
        if (blinkCount >= maxBlinks) {
          player.alpha = 1;
          this.isHurt = false; // 解除无敌状态
          blinkTimer.destroy();
        }
      },
      loop: true
    });

    console.log(`受伤！剩余血量: ${this.health}, 受击次数: ${this.hitCount}`);
  }

  updateStatusText() {
    this.statusText.setText(
      `血量: ${this.health} | 受击次数: ${this.hitCount} | 无敌: ${this.isHurt ? '是' : '否'}`
    );
  }

  update(time, delta) {
    // 只有在非受伤状态下才能移动
    if (!this.isHurt) {
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
    this.updateStatusText();
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