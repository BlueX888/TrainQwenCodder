class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.isGameOver = false;
    this.gameOverText = null;
    this.timerText = null;
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

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建5个敌人
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间
    this.timerText = this.add.text(16, 16, 'Survival Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.timerText.setText('Survival Time: ' + (this.survivalTime / 1000).toFixed(1) + 's');

    // 玩家移动控制
    const playerSpeed = 300;
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

    // 敌人追踪玩家
    const enemySpeed = 360;
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有物体
    this.player.setVelocity(0);
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0);
    });

    // 显示游戏结束文字
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);

    const finalTime = this.add.text(400, 370, 'You survived: ' + (this.survivalTime / 1000).toFixed(1) + 's', {
      fontSize: '32px',
      fill: '#ffffff'
    });
    finalTime.setOrigin(0.5);

    const restartText = this.add.text(400, 420, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
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