class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 记录受伤次数
    this.isInvulnerable = false; // 无敌状态
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59b6, 1); // 紫色
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（可移动）
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 50);
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.handleHit, null, this);

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

    // 添加说明文字
    this.add.text(16, 550, '使用方向键移动紫色角色，碰到红色方块会受伤', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 增加受伤计数
    this.hitCount++;
    this.isInvulnerable = true;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 击退距离基于速度200计算（200像素的击退）
    const knockbackDistance = 200;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 创建击退动画
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后确保玩家在边界内
        player.x = Phaser.Math.Clamp(player.x, 20, 780);
        player.y = Phaser.Math.Clamp(player.y, 20, 580);
      }
    });

    // 实现闪烁效果（2.5秒）
    let blinkCount = 0;
    const maxBlinks = 10; // 2.5秒内闪烁10次
    const blinkInterval = 250; // 每次闪烁间隔250ms

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        // 在alpha 0.3和1之间切换
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        if (blinkCount >= maxBlinks) {
          // 闪烁结束，恢复正常
          player.alpha = 1;
          this.isInvulnerable = false;
          blinkTimer.remove();
          this.updateStatusText();
        }
      },
      loop: true
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const invulnerableStatus = this.isInvulnerable ? '无敌中' : '正常';
    this.statusText.setText(
      `受伤次数: ${this.hitCount}\n状态: ${invulnerableStatus}`
    );
  }

  update(time, delta) {
    // 只有在非无敌状态下才能移动
    if (!this.isInvulnerable) {
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
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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