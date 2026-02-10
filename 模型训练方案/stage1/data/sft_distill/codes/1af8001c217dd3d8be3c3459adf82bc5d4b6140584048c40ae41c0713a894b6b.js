class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证状态：存活时间
    this.gameOver = false; // 可验证状态：游戏是否结束
    this.score = 0; // 可验证状态：分数
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.score = Math.floor(this.survivalTime / 1000);

    // 玩家移动控制（速度 120 * 1.2 = 144）
    const playerSpeed = 144;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家（速度120）
    const enemySpeed = 120;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 更新状态显示
    this.updateStatusText();
  }

  handleCollision(player, enemy) {
    // 游戏结束
    this.gameOver = true;
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 改变敌人颜色表示碰撞
    this.enemy.setTint(0xff0000);

    // 更新状态显示
    this.updateStatusText();

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 'GAME OVER!\nPress R to Restart', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    gameOverText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  updateStatusText() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    this.statusText.setText([
      `Score: ${this.score}s`,
      `Survival Time: ${(this.survivalTime / 1000).toFixed(1)}s`,
      `Distance to Enemy: ${Math.floor(distance)}`,
      `Game Over: ${this.gameOver}`,
      `Player Speed: 144 | Enemy Speed: 120`,
      `\nControls: Arrow Keys to Move`
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