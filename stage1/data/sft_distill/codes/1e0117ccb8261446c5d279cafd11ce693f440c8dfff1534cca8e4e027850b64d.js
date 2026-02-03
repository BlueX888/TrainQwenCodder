class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.distance = 0;
    this.survivalTime = 0;
    this.isCaught = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9900ff, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerSpeed = 160 * 1.2; // 192

    // 创建敌人
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemySpeed = 160;

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.catchPlayer, null, this);

    // 创建UI文本
    this.distanceText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 40, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 64, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys to Move - Escape the Purple Enemy!', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新UI
    this.distanceText.setText(`Distance: ${Math.floor(this.distance)}px`);
    this.statusText.setText(`Status: ${this.isCaught ? 'CAUGHT!' : 'Escaping...'}`);
    this.timeText.setText(`Survival Time: ${(this.survivalTime / 1000).toFixed(1)}s`);
  }

  catchPlayer() {
    if (!this.gameOver) {
      this.gameOver = true;
      this.isCaught = true;

      // 停止所有移动
      this.player.setVelocity(0);
      this.enemy.setVelocity(0);

      // 显示游戏结束信息
      const gameOverText = this.add.text(400, 300, 'GAME OVER\nYou were caught!', {
        fontSize: '48px',
        fill: '#ff0000',
        align: 'center'
      }).setOrigin(0.5);

      const statsText = this.add.text(400, 400, 
        `Survival Time: ${(this.survivalTime / 1000).toFixed(1)}s\nClick to Restart`, {
        fontSize: '24px',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // 点击重启
      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
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