class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.collisionCount = 0;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.collisionText = this.add.text(16, 46, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 76, 'Status: Active', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 添加说明文本
    this.add.text(400, 16, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5, 0);

    this.add.text(400, 36, 'Player Speed: 192 | Enemy Speed: 160', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5, 0);
  }

  update(time, delta) {
    if (!this.isGameOver) {
      // 更新存活时间
      this.survivalTime += delta / 1000;
      this.timeText.setText('Time: ' + this.survivalTime.toFixed(1) + 's');

      // 玩家移动控制
      this.player.setVelocity(0);

      const playerSpeed = 160 * 1.2; // 192

      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.player.setVelocityX(-playerSpeed);
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.player.setVelocityX(playerSpeed);
      }

      if (this.cursors.up.isDown || this.wasd.up.isDown) {
        this.player.setVelocityY(-playerSpeed);
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        this.player.setVelocityY(playerSpeed);
      }

      // 归一化对角线速度
      if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
        this.player.body.velocity.normalize().scale(playerSpeed);
      }

      // 敌人追踪玩家
      const enemySpeed = 160;
      this.physics.moveToObject(this.enemy, this.player, enemySpeed);
    } else {
      // 游戏结束，停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);
    }
  }

  handleCollision(player, enemy) {
    // 增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);

    // 更新状态
    this.statusText.setText('Status: Caught!');
    this.statusText.setColor('#ff0000');

    // 短暂停止游戏
    this.isGameOver = true;

    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        player.alpha = 1;
        // 重置位置
        player.setPosition(
          Phaser.Math.Between(100, 700),
          Phaser.Math.Between(100, 500)
        );
        enemy.setPosition(
          Phaser.Math.Between(100, 700),
          Phaser.Math.Between(100, 500)
        );
        
        // 恢复游戏
        this.isGameOver = false;
        this.statusText.setText('Status: Active');
        this.statusText.setColor('#00ff00');
      }
    });
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