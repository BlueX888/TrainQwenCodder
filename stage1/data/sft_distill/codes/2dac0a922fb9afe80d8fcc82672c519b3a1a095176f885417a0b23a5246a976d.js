class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态变量
    this.survivalTime = 0;
    this.isGameOver = false;

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
    this.player.setMaxVelocity(300);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，分散在不同位置
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, 'Use arrow keys to move', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 游戏说明
    this.add.text(400, 16, 'Avoid the red enemies!', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5, 0);
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.timeText.setText('Time: ' + Math.floor(this.survivalTime / 1000) + 's');

    // 玩家控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 敌人追踪玩家
    this.enemies.getChildren().forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 200);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;
    
    // 停止所有物理运动
    this.physics.pause();

    // 玩家变红表示被击中
    player.setTint(0xff0000);

    // 显示游戏结束信息
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fontSize: '32px', fill: '#ff0000' });

    const finalTime = Math.floor(this.survivalTime / 1000);
    this.add.text(400, 300, `You survived ${finalTime} seconds!\n\nClick to restart`, {
      fontSize: '28px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

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