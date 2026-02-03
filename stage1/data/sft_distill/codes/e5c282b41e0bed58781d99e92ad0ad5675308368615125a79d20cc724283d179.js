class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.hitCount = 0;
    this.isInvulnerable = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色玩家角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xFF8800, 1); // 橙色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xFF0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建多个敌人用于测试
    this.enemies = this.physics.add.group();
    
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加说明文本
    this.add.text(10, 550, '使用方向键移动，碰撞敌人测试受伤效果', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 设置无敌状态
    this.isInvulnerable = true;

    // 更新状态
    this.health -= 10;
    this.hitCount++;
    this.updateStatusText();

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度160计算（0.3秒内移动的距离）
    const knockbackSpeed = 160;
    const knockbackTime = 300; // 毫秒
    const knockbackDistance = (knockbackSpeed * knockbackTime) / 1000;

    // 计算击退目标位置
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 创建击退动画
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackTime,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 击退完成后恢复控制
      }
    });

    // 开始闪烁效果（1.5秒）
    const blinkDuration = 1500;
    const blinkInterval = 100; // 每100ms切换一次
    let blinkCount = 0;
    const maxBlinks = blinkDuration / blinkInterval;

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 切换透明度（闪烁效果）
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          player.alpha = 1;
          this.isInvulnerable = false;
          blinkTimer.remove();
        }
      },
      loop: true
    });

    // 播放受伤音效的替代效果（屏幕震动）
    this.cameras.main.shake(200, 0.005);
  }

  update(time, delta) {
    // 玩家移动控制（只有非无敌状态或无敌但没有击退动画时才能控制）
    if (!this.isInvulnerable || !this.tweens.isTweening(this.player)) {
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

    // 游戏结束条件
    if (this.health <= 0) {
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      
      this.physics.pause();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Health: ${this.health} | Hit Count: ${this.hitCount} | Invulnerable: ${this.isInvulnerable}`
    );
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